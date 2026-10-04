import { toast } from "sonner";
import type { jsPDF as JsPDF } from "jspdf";
import { PDF_EXPORT_CONFIG } from "@/config";
import {
  ensureFontLoaded,
  getFontFaceCss,
  getRemoteFontFaceCss,
  normalizeFontFamily
} from "@/utils/fonts";
import { cloneResumeForExport } from "@/utils/resumeLayout";
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

const A4_WIDTH_MM = 210;
const PX_PER_MM = 96 / 25.4;
const LONG_PAGE_HEIGHT_BUFFER_MM = 2;
const LONG_PAGE_CAPTURE_BUFFER_PX = 8;
const LONG_PAGE_BOTTOM_SAFE_AREA_PX = 8;

const keepOnlyFirstPage = (pdf: JsPDF) => {
  const pdfWithPageControl = pdf as JsPDF & {
    getNumberOfPages?: () => number;
    deletePage?: (pageNumber: number) => void;
  };

  const totalPages = pdfWithPageControl.getNumberOfPages?.() ?? 1;
  if (totalPages <= 1 || !pdfWithPageControl.deletePage) {
    return;
  }

  for (let pageNumber = totalPages; pageNumber > 1; pageNumber -= 1) {
    pdfWithPageControl.deletePage(pageNumber);
  }
};

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

const hidePageBreakLines = (element: HTMLElement) => {
  const pageBreakLines = element.querySelectorAll<HTMLElement>(".page-break-line");
  pageBreakLines.forEach((line) => {
    line.remove();
  });
};

const removeLongPageHeightConstraints = (element: HTMLElement) => {
  // 保留内层的最终宽度和缩放，不在长图导出时重新排版。
  element.style.setProperty("width", "100%", "important");

  const constrainedElements = element.querySelectorAll<HTMLElement>(".min-h-screen, .min-h-full, .editorial-print-container");
  constrainedElements.forEach((node) => {
    node.style.setProperty("height", "auto", "important");
    node.style.setProperty("min-height", "0", "important");
  });
};

const waitForImages = async (element: HTMLElement) => {
  const images = Array.from(element.getElementsByTagName("img"));
  await Promise.all(
    images
      .filter((img) => !img.complete)
      .map(
        (img) =>
          new Promise<void>((resolve) => {
            img.onload = () => resolve();
            img.onerror = () => resolve();
          })
      )
  );
};

const bakeObjectFitCoverImages = async (element: HTMLElement) => {
  const images = Array.from(element.getElementsByTagName("img"));

  await Promise.all(images.map(async (image) => {
    const style = window.getComputedStyle(image);
    if (style.objectFit !== "cover" || !image.naturalWidth || !image.naturalHeight) {
      return;
    }

    const rect = image.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const targetAspectRatio = rect.width / rect.height;
    const sourceAspectRatio = image.naturalWidth / image.naturalHeight;
    let sourceX = 0;
    let sourceY = 0;
    let sourceWidth = image.naturalWidth;
    let sourceHeight = image.naturalHeight;

    if (sourceAspectRatio > targetAspectRatio) {
      sourceWidth = image.naturalHeight * targetAspectRatio;
      sourceX = (image.naturalWidth - sourceWidth) / 2;
    } else if (sourceAspectRatio < targetAspectRatio) {
      sourceHeight = image.naturalWidth / targetAspectRatio;
      sourceY = (image.naturalHeight - sourceHeight) / 2;
    }

    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(sourceWidth));
    canvas.height = Math.max(1, Math.round(sourceHeight));
    const context = canvas.getContext("2d");
    if (!context) return;

    context.drawImage(
      image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const bakedSource = canvas.toDataURL("image/png");
    await new Promise<void>((resolve) => {
      image.onload = () => resolve();
      image.onerror = () => resolve();
      image.src = bakedSource;
      image.style.setProperty("object-fit", "fill", "important");
      if (image.complete) resolve();
    });

    canvas.width = 0;
    canvas.height = 0;
  }));
};

interface LongPageCapture {
  container: HTMLDivElement;
  clonedElement: HTMLElement;
  contentWidthPx: number;
  contentHeightPx: number;
  pageHeightMm: number;
}

const prepareLongPageCapture = async ({
  elementId,
  pagePadding,
  fontFamily
}: Pick<ExportToPdfOptions, "elementId" | "pagePadding" | "fontFamily">): Promise<LongPageCapture> => {
  let container: HTMLDivElement | null = null;

  try {
    const pdfElement = document.querySelector<HTMLElement>(`#${elementId}`);
    if (!pdfElement) {
      throw new Error(`PDF element #${elementId} not found`);
    }

    const selectedFontFamily = normalizeFontFamily(fontFamily);
    const clonedElement = cloneResumeForExport(pdfElement);
    hidePageBreakLines(clonedElement);
    removeLongPageHeightConstraints(clonedElement);
    await optimizeImages(clonedElement);

    clonedElement.style.setProperty("padding", `${pagePadding}px`, "important");
    clonedElement.style.setProperty("box-sizing", "border-box", "important");
    clonedElement.style.setProperty("background", "white", "important");
    clonedElement.style.setProperty("font-family", selectedFontFamily, "important");

    const bottomSpacer = document.createElement("div");
    bottomSpacer.setAttribute("aria-hidden", "true");
    bottomSpacer.style.width = "100%";
    bottomSpacer.style.height = `${LONG_PAGE_BOTTOM_SAFE_AREA_PX}px`;
    bottomSpacer.style.pointerEvents = "none";
    clonedElement.appendChild(bottomSpacer);

    container = document.createElement("div");
    container.style.position = "fixed";
    container.style.left = "-10000px";
    container.style.top = "0";
    container.style.width = `${A4_WIDTH_MM}mm`;
    container.style.background = "white";
    container.style.pointerEvents = "none";
    container.style.zIndex = "-1";

    const fontStyles = document.createElement("style");
    fontStyles.textContent = await getFontFaceCss(selectedFontFamily);
    container.appendChild(fontStyles);
    container.appendChild(clonedElement);
    document.body.appendChild(container);

    await waitForImages(clonedElement);
    await bakeObjectFitCoverImages(clonedElement);
    if (document.fonts?.ready) {
      await document.fonts.ready;
    }
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });

    const renderedRect = clonedElement.getBoundingClientRect();
    const contentWidthPx =
      renderedRect.width || clonedElement.scrollWidth || A4_WIDTH_MM * PX_PER_MM;
    const contentHeightPx = Math.max(
      renderedRect.height,
      clonedElement.scrollHeight,
      1
    );
    const pageHeightMm = Math.max(
      contentHeightPx * (A4_WIDTH_MM / contentWidthPx) + LONG_PAGE_HEIGHT_BUFFER_MM,
      1
    );

    return {
      container,
      clonedElement,
      contentWidthPx,
      contentHeightPx,
      pageHeightMm
    };
  } catch (error) {
    if (container?.parentNode) {
      container.parentNode.removeChild(container);
    }
    throw error;
  }
};

const renderLongPageCanvas = async ({
  clonedElement,
  contentWidthPx,
  contentHeightPx
}: Pick<LongPageCapture, "clonedElement" | "contentWidthPx" | "contentHeightPx">) => {
  const { default: html2canvas } = await import("html2canvas");

  return html2canvas(clonedElement, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: "#ffffff",
    scrollX: 0,
    scrollY: 0,
    windowWidth: Math.ceil(contentWidthPx),
    windowHeight: Math.ceil(contentHeightPx + LONG_PAGE_CAPTURE_BUFFER_PX)
  });
};

const getCanvasPngBlob = (canvas: HTMLCanvasElement) =>
  new Promise<Blob>((resolve, reject) => {
    try {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("PNG conversion failed"));
          return;
        }

        resolve(blob);
      }, "image/png");
    } catch (error) {
      reject(error);
    }
  });

export const exportToLongPagePdf = async ({
  elementId,
  title,
  pagePadding,
  fontFamily,
  onStart,
  onEnd,
  successMessage,
  errorMessage
}: ExportToPdfOptions) => {
  const exportStartTime = performance.now();
  onStart?.();

  let capture: LongPageCapture | null = null;
  let canvas: HTMLCanvasElement | null = null;

  try {
    capture = await prepareLongPageCapture({
      elementId,
      pagePadding,
      fontFamily
    });

    const fileName = `${getSafeFileName(title)}.pdf`;
    const [{ jsPDF }, renderedCanvas] = await Promise.all([
      import("jspdf"),
      renderLongPageCanvas(capture)
    ]);
    canvas = renderedCanvas;

    const imageHeightMm = canvas.height * (A4_WIDTH_MM / canvas.width);
    const canvasPageHeightMm = Math.max(
      imageHeightMm + LONG_PAGE_HEIGHT_BUFFER_MM,
      capture.pageHeightMm
    );
    const pdf = new jsPDF({
      unit: "mm",
      format: [A4_WIDTH_MM, canvasPageHeightMm],
      orientation: "portrait",
      compress: true
    });
    const imageData = canvas.toDataURL("image/png");
    pdf.addImage(imageData, "PNG", 0, 0, A4_WIDTH_MM, imageHeightMm);
    keepOnlyFirstPage(pdf);
    pdf.save(fileName);

    if (successMessage) toast.success(successMessage);
    console.log(`Total long page export took ${performance.now() - exportStartTime}ms`);
  } catch (error) {
    console.error("Long page export error:", error);
    if (errorMessage) toast.error(errorMessage);
  } finally {
    if (canvas) {
      canvas.width = 0;
      canvas.height = 0;
    }
    if (capture?.container.parentNode) {
      capture.container.parentNode.removeChild(capture.container);
    }
    onEnd?.();
  }
};

export const exportToLongPageImage = async ({
  elementId,
  title,
  pagePadding,
  fontFamily,
  onStart,
  onEnd,
  successMessage,
  errorMessage
}: ExportToPdfOptions) => {
  const exportStartTime = performance.now();
  onStart?.();

  let capture: LongPageCapture | null = null;
  let canvas: HTMLCanvasElement | null = null;

  try {
    capture = await prepareLongPageCapture({
      elementId,
      pagePadding,
      fontFamily
    });

    canvas = await renderLongPageCanvas(capture);
    const blob = await getCanvasPngBlob(canvas);
    const fileName = `${getSafeFileName(title)}.png`;
    downloadBlob(blob, fileName);

    if (successMessage) toast.success(successMessage);
    console.log(`Total long page image export took ${performance.now() - exportStartTime}ms`);
  } catch (error) {
    console.error("Long page image export error:", error);
    if (errorMessage) toast.error(errorMessage);
  } finally {
    if (canvas) {
      canvas.width = 0;
      canvas.height = 0;
    }
    if (capture?.container.parentNode) {
      capture.container.parentNode.removeChild(capture.container);
    }
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
    // Wait for the preview font before copying its layout and inner zoom.
    await ensureFontLoaded(selectedFontFamily);
    const clonedElement = cloneResumeForExport(pdfElement, true);
    const pageBackground = backgroundColor || "#ffffff";
    const safeVerticalPageMarginShift = Math.max(
      -pagePadding,
      Math.min(pagePadding, verticalPageMarginShift)
    );
    const pageMarginTop = pagePadding + safeVerticalPageMarginShift;
    const pageMarginBottom = pagePadding - safeVerticalPageMarginShift;
    const hasAsymmetricPageMargins = safeVerticalPageMarginShift !== 0;
    clonedElement.style.setProperty("box-sizing", "border-box");
    clonedElement.style.setProperty("font-family", selectedFontFamily, "important");
    clonedElement.style.setProperty("background", pageBackground, "important");
    clonedElement.style.setProperty("background-color", pageBackground, "important");

    hidePageBreakLines(clonedElement);

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
