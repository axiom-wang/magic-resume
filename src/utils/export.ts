import { toast } from "sonner";
import { PDF_EXPORT_CONFIG } from "@/config";
import {
  ensureFontLoaded,
  getRemoteFontFaceCss,
  normalizeFontFamily
} from "@/utils/fonts";
import { ResumeData } from "@/types/resume";
import { generateResumeMarkdown, ResumeMarkdownOptions } from "@/utils/markdown";

const INVALID_FILE_NAME_CHAR_REGEX = /[\\/:*?"<>|]/g;

const getSafeFileName = (title?: string) => {
  const normalized = (title || "resume")
    .trim()
    .replace(INVALID_FILE_NAME_CHAR_REGEX, "_")
    .replace(/\s+/g, " ");

  return normalized || "resume";
};

const downloadBlob = (blob: Blob, fileName: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  window.URL.revokeObjectURL(url);
};

const downloadTextFile = (content: string, fileName: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  downloadBlob(blob, fileName);
};

export const getOptimizedStyles = () => {
  const styleCache = new Map();
  const startTime = performance.now();

  const styles = Array.from(document.styleSheets)
    .map((sheet) => {
      try {
        return Array.from(sheet.cssRules)
          .filter((rule) => {
            const ruleText = rule.cssText;
            const normalizedRuleText = ruleText.toLowerCase();
            if (styleCache.has(ruleText)) return false;
            styleCache.set(ruleText, true);

            // 本地 @font-face 会在导出时按绝对 URL 重新注入，这里先剔除避免重复；
            // 但远程字体表（Google Fonts 等）无法被服务端解析，需要直接丢弃。
            if (rule instanceof CSSFontFaceRule) return false;
            if (rule instanceof CSSImportRule) return false;
            if (normalizedRuleText.includes("fonts.googleapis.com")) return false;
            if (normalizedRuleText.includes("fonts.gstatic.com")) return false;
            // 动画/过渡在静态 PDF 中无意义，且可能残留中间态
            if (normalizedRuleText.includes("@keyframes")) return false;
            if (normalizedRuleText.includes("animation")) return false;
            if (normalizedRuleText.includes("transition")) return false;
            if (normalizedRuleText.includes(":hover")) return false;
            return true;
          })
          .map((rule) => rule.cssText)
          .join("\n");
      } catch (e) {
        console.warn("Style processing error:", e);
        return "";
      }
    })
    .join("\n");

  console.log(`Style processing took ${performance.now() - startTime}ms`);
  return styles;
};

export const optimizeImages = async (element: HTMLElement) => {
  const startTime = performance.now();
  const images = element.getElementsByTagName("img");

  const imagePromises = Array.from(images)
    .filter((img) => !img.src.startsWith("data:"))
    .map(async (img) => {
      try {
        const response = await fetch(img.src);
        const blob = await response.blob();
        return new Promise<void>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            img.src = reader.result as string;
            resolve();
          };
          reader.readAsDataURL(blob);
        });
      } catch (error) {
        console.error("Image conversion error:", error);
        return Promise.resolve();
      }
    });

  await Promise.all(imagePromises);
  console.log(`Image processing took ${performance.now() - startTime}ms`);
};

export interface ExportToPdfOptions {
  elementId: string;
  title: string;
  pagePadding: number;
  verticalPageMarginShift?: number;
  fontFamily?: string;
  backgroundColor?: string;
  onStart?: () => void;
  onEnd?: () => void;
  successMessage?: string;
  errorMessage?: string;
}

interface ExportResumeFileOptions {
  resume?: ResumeData | null;
  title?: string;
  onStart?: () => void;
  onEnd?: () => void;
  successMessage?: string;
  errorMessage?: string;
}

interface ExportResumeMarkdownOptions extends ExportResumeFileOptions {
  markdownOptions?: ResumeMarkdownOptions;
}

export const exportResumeAsJson = ({
  resume,
  title,
  onStart,
  onEnd,
  successMessage,
  errorMessage
}: ExportResumeFileOptions) => {
  onStart?.();

  try {
    if (!resume) {
      throw new Error("No active resume");
    }

    const json = JSON.stringify(resume, null, 2);
    const fileName = `${getSafeFileName(title || resume.title)}.json`;
    downloadTextFile(json, fileName, "application/json;charset=utf-8");
    if (successMessage) toast.success(successMessage);
  } catch (error) {
    console.error("JSON export error:", error);
    if (errorMessage) toast.error(errorMessage);
  } finally {
    onEnd?.();
  }
};

export const exportResumeAsMarkdown = ({
  resume,
  title,
  onStart,
  onEnd,
  successMessage,
  errorMessage,
  markdownOptions
}: ExportResumeMarkdownOptions) => {
  onStart?.();

  try {
    if (!resume) {
      throw new Error("No active resume");
    }

    const markdown = generateResumeMarkdown(resume, markdownOptions);
    const fileName = `${getSafeFileName(title || resume.title)}.md`;
    downloadTextFile(markdown, fileName, "text/markdown;charset=utf-8");
    if (successMessage) toast.success(successMessage);
  } catch (error) {
    console.error("Markdown export error:", error);
    if (errorMessage) toast.error(errorMessage);
  } finally {
    onEnd?.();
  }
};

export const exportToPdf = async ({
  elementId,
  title,
  pagePadding,
  verticalPageMarginShift = 0,
  fontFamily,
  backgroundColor = "#ffffff",
  onStart,
  onEnd,
  successMessage,
  errorMessage
}: ExportToPdfOptions) => {
  const exportStartTime = performance.now();
  onStart?.();

  try {
    const pdfElement = document.querySelector<HTMLElement>(`#${elementId}`);
    if (!pdfElement) {
      throw new Error(`PDF element #${elementId} not found`);
    }

    const selectedFontFamily = normalizeFontFamily(fontFamily);

    // 必须先等字体就绪再克隆：否则克隆时的布局仍按回退字体计算，
    // 会与预览产生字宽/行高偏差，进而导致分页错位。
    await ensureFontLoaded(selectedFontFamily);

    const clonedElement = pdfElement.cloneNode(true) as HTMLElement;
    const pageBackground = backgroundColor || "#ffffff";
    const safeVerticalPageMarginShift = Math.max(
      -pagePadding,
      Math.min(pagePadding, verticalPageMarginShift)
    );
    const pageMarginTop = pagePadding + safeVerticalPageMarginShift;
    const pageMarginBottom = pagePadding - safeVerticalPageMarginShift;
    const hasAsymmetricPageMargins = safeVerticalPageMarginShift !== 0;
    const transformValue = clonedElement.style.transform || "";
    const scaleMatch = transformValue.match(/scale\(([\d.]+)\)/);
    
    if (scaleMatch) {
      const scale = Number(scaleMatch[1]);
      if (Number.isFinite(scale) && scale > 0 && scale < 1) {
        // 服务端导出前将 transform 缩放转为 zoom，避免分页计算偏差
        clonedElement.style.removeProperty("transform");
        clonedElement.style.removeProperty("transform-origin");
        clonedElement.style.setProperty("width", "100%", "important");
        clonedElement.style.setProperty("zoom", String(scale));
      }
    }

    // 采用 PdfExport.tsx 中的逻辑，统一宽度和 padding 处理
    clonedElement.style.setProperty("width", "100%", "important");
    clonedElement.style.setProperty("padding", "0", "important");
    clonedElement.style.setProperty("box-sizing", "border-box");
    clonedElement.style.setProperty("font-family", selectedFontFamily, "important");
    clonedElement.style.setProperty("background", pageBackground, "important");
    clonedElement.style.setProperty("background-color", pageBackground, "important");

    const pageBreakLines = clonedElement.querySelectorAll<HTMLElement>(".page-break-line");
    pageBreakLines.forEach((line) => {
      line.style.display = "none";
    });

    const [capturedStyles] = await Promise.all([
      getOptimizedStyles(),
      optimizeImages(clonedElement)
    ]);

    // 服务端无法解析相对路径，改用绝对 URL 让 puppeteer 回源拉取字体
    const fontFaceStyles = getRemoteFontFaceCss(selectedFontFamily);

    // 注入 PdfExport.tsx 中的样式增强
    const styles = `
      ${fontFaceStyles}
      ${capturedStyles}
      /* Puppeteer 的 PDF margin 位于 html/body 画布之外，需给页面盒本身着色；
         否则 Kami 的羊皮纸底会在四周露出白边。 */
      @page {
        ${
          hasAsymmetricPageMargins
            ? `margin: ${pageMarginTop}px ${pagePadding}px ${pageMarginBottom}px;`
            : ""
        }
        background: ${pageBackground};
      }
      html, body { background: ${pageBackground} !important; background-color: ${pageBackground} !important; }
      html, body, #${elementId} {
        background: ${pageBackground} !important;
        background-color: ${pageBackground} !important;
        font-family: ${selectedFontFamily} !important;
      }
      /* 保留模板底色与主题色，避免 PDF 渲染时被优化成纯白 */
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      /* 预览用的整页最小高度会在 PDF 中撑出多余空白页，需中和 */
      #${elementId} .min-h-screen,
      #${elementId} .min-h-full,
      #${elementId} [class*="min-h-["],
      #${elementId} [style*="min-height"] {
        min-height: 0 !important;
      }
      /* 预览态的交互反馈不应出现在成品 PDF 中 */
      #${elementId} * {
        box-shadow: none !important;
      }
      .page-break-line { display: none !important; }
    `;

    const response = await fetch(PDF_EXPORT_CONFIG.SERVER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        content: clonedElement.outerHTML,
        styles,
        // 自定义上下边距由 @page 精确控制；其他模板继续使用服务端原有边距逻辑。
        margin: hasAsymmetricPageMargins ? 0 : pagePadding
      }),
      mode: "cors",
      signal: AbortSignal.timeout(PDF_EXPORT_CONFIG.TIMEOUT)
    });

    if (!response.ok) {
      throw new Error(`PDF generation failed: ${response.status}`);
    }

    const blob = await response.blob();
    const fileName = `${getSafeFileName(title)}.pdf`;
    downloadBlob(blob, fileName);

    if (successMessage) toast.success(successMessage);
    console.log(`Total export took ${performance.now() - exportStartTime}ms`);
  } catch (error) {
    console.error("Export error:", error);
    if (errorMessage) toast.error(errorMessage);
  } finally {
    onEnd?.();
  }
};
