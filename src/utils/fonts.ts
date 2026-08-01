type FontSource = {
  family: string;
  url: string;
  format: "truetype" | "opentype" | "woff" | "woff2";
  weight: string;
  style: "normal" | "italic";
};

type FontDefinition = {
  labelKey: string;
  value: string;
  aliases: string[];
  sources: FontSource[];
};

export const DEFAULT_FONT_FAMILY = "\"Alibaba PuHuiTi\", sans-serif";

/**
 * 远端 PDF 服务无法访问 localhost，也不适合把 18MB 级中文字体内联进请求体。
 * 默认使用当前仓库固定提交中的公共字体资源；部署环境可通过变量切换到自有 CDN。
 */
const PDF_FONT_ASSET_BASE_URL = (
  import.meta.env.VITE_PDF_FONT_ASSET_BASE_URL ||
  "https://cdn.jsdelivr.net/gh/axiom-wang/magic-resume@ca40a344494653820b938d9b728be4109708cf1f/public"
).replace(/\/$/, "");

const FONT_DEFINITIONS: FontDefinition[] = [
  {
    labelKey: "alibaba",
    value: DEFAULT_FONT_FAMILY,
    aliases: [
      "Alibaba PuHuiTi, sans-serif",
      "\"Alibaba PuHuiTi\", sans-serif"
    ],
    sources: [
      {
        family: "Alibaba PuHuiTi",
        url: "/fonts/AlibabaPuHuiTi-3-55-Regular.ttf",
        format: "truetype",
        weight: "400",
        style: "normal"
      },
      {
        family: "Alibaba PuHuiTi",
        url: "/fonts/AlibabaPuHuiTi-3-85-Bold.ttf",
        format: "truetype",
        weight: "700",
        style: "normal"
      }
    ]
  },
  {
    labelKey: "misans",
    value: "\"MiSans\", sans-serif",
    aliases: [
      "\"MiSans\", \"Microsoft YaHei\", \"微软雅黑\", sans-serif",
      "\"Microsoft YaHei\", \"微软雅黑\", sans-serif",
      "\"Microsoft YaHei Local\", \"Microsoft YaHei\", \"微软雅黑\", sans-serif",
      "\"MiSans\", sans-serif",
      "MiSans, sans-serif",
      "Microsoft YaHei, sans-serif"
    ],
    sources: [
      {
        family: "MiSans",
        url: "/fonts/MiSans-Normal.ttf",
        format: "truetype",
        weight: "400",
        style: "normal"
      },
      {
        family: "MiSans",
        url: "/fonts/MiSans-Medium.ttf",
        format: "truetype",
        weight: "700",
        style: "normal"
      }
    ]
  },
  {
    labelKey: "notosanssc",
    value: "\"Noto Sans SC\", \"Noto Sans CJK SC\", sans-serif",
    aliases: [
      "\"Noto Sans SC\", \"Noto Sans CJK SC\", sans-serif",
      "Noto Sans SC, sans-serif"
    ],
    sources: [
      {
        family: "Noto Sans SC",
        url: "/fonts/NotoSansSC-Regular.otf",
        format: "opentype",
        weight: "400",
        style: "normal"
      },
      {
        family: "Noto Sans SC",
        url: "/fonts/NotoSansSC-Medium.otf",
        format: "opentype",
        weight: "500",
        style: "normal"
      },
      {
        family: "Noto Sans SC",
        url: "/fonts/NotoSansSC-Bold.otf",
        format: "opentype",
        weight: "700",
        style: "normal"
      }
    ]
  },
  {
    labelKey: "sourcehanserifsc",
    value: "\"Source Han Serif SC\", \"Noto Serif SC\", serif",
    aliases: [
      "\"Source Han Serif SC\", \"Noto Serif SC\", serif",
      "\"Noto Serif SC\", \"Source Han Serif SC\", serif",
      "Source Han Serif SC, serif",
      "Noto Serif SC, serif"
    ],
    sources: [
      {
        family: "Source Han Serif SC",
        url: "/fonts/SourceHanSerifSC-Regular.otf",
        format: "opentype",
        weight: "400",
        style: "normal"
      },
      {
        family: "Source Han Serif SC",
        url: "/fonts/SourceHanSerifSC-Medium.otf",
        format: "opentype",
        weight: "500",
        style: "normal"
      },
      {
        family: "Source Han Serif SC",
        url: "/fonts/SourceHanSerifSC-Bold.otf",
        format: "opentype",
        weight: "700",
        style: "normal"
      }
    ]
  },
  {
    labelKey: "tsangerjinkai",
    value:
      '"TsangerJinKai02", "Source Han Serif SC", "Noto Serif SC", "Songti SC", "STSong", Georgia, serif',
    aliases: [
      '"TsangerJinKai02", "Source Han Serif SC", "Noto Serif SC", "Songti SC", "STSong", Georgia, serif',
      '"TsangerJinKai02", "Source Han Serif SC", "Noto Serif SC", serif',
      "TsangerJinKai02, serif",
      "TsangerJinKai02"
    ],
    sources: [
      {
        family: "TsangerJinKai02",
        url: "/fonts/TsangerJinKai02-W04.ttf",
        format: "truetype",
        weight: "400",
        style: "normal"
      },
      {
        family: "TsangerJinKai02",
        url: "/fonts/TsangerJinKai02-W05.ttf",
        format: "truetype",
        weight: "500",
        style: "normal"
      }
    ]
  }
];

const fontDataUrlCache = new Map<string, Promise<string>>();

const toDataUrl = async (url: string) => {
  if (!fontDataUrlCache.has(url)) {
    fontDataUrlCache.set(
      url,
      fetch(url)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to load font: ${url}`);
          }
          return response.blob();
        })
        .then(
          (blob) =>
            new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.onerror = () => reject(new Error(`Failed to read font: ${url}`));
              reader.readAsDataURL(blob);
            })
        )
    );
  }

  return fontDataUrlCache.get(url)!;
};

const findFontDefinition = (fontFamily?: string) => {
  const normalizedValue = fontFamily?.trim();
  if (!normalizedValue) {
    return FONT_DEFINITIONS[0];
  }

  return (
    FONT_DEFINITIONS.find(
      (definition) =>
        definition.value === normalizedValue ||
        definition.aliases.includes(normalizedValue) ||
        definition.aliases.some((alias) =>
          normalizedValue.includes(alias.replace(/"/g, ""))
        )
    ) || FONT_DEFINITIONS[0]
  );
};

const buildFontFaceRule = (source: FontSource, resolvedUrl: string) => `@font-face {
  font-family: "${source.family}";
  src: url("${resolvedUrl}") format("${source.format}");
  font-weight: ${source.weight};
  font-style: ${source.style};
  font-display: swap;
}`;

export const normalizeFontFamily = (fontFamily?: string) =>
  findFontDefinition(fontFamily).value;

export const getFontOptions = (t: (key: string) => string) =>
  FONT_DEFINITIONS.map((definition) => ({
    value: definition.value,
    label: t(definition.labelKey)
  }));

export const getFontFaceCss = async (
  fontFamily?: string,
  inline = false
) => {
  const definition = findFontDefinition(fontFamily);

  const rules = await Promise.all(
    definition.sources.map(async (source) => {
      const resolvedUrl = inline ? await toDataUrl(source.url) : source.url;
      return buildFontFaceRule(source, resolvedUrl);
    })
  );

  return rules.join("\n");
};

/**
 * 生成用于服务端 PDF 渲染的 @font-face 规则。
 *
 * 服务端（puppeteer）与前端不同源，相对路径 `/fonts/*.ttf` 无法解析；
 * 而中文字体单个文件可达 18MB，base64 内联会让请求体突破体积上限。
 * 因此这里统一改写为远端可访问的绝对 URL，由服务端按需回源下载。
 */
export const getRemoteFontFaceCss = (fontFamily?: string) => {
  const definition = findFontDefinition(fontFamily);

  return definition.sources
    .map((source) => {
      const absoluteUrl = source.url.startsWith("http")
        ? source.url
        : `${PDF_FONT_ASSET_BASE_URL}${
            source.url.startsWith("/") ? source.url : `/${source.url}`
          }`;
      return buildFontFaceRule(source, absoluteUrl);
    })
    .join("\n");
};

/**
 * 等待指定字体真正加载完成。
 * 导出前必须确保字体已就绪，否则克隆出的 DOM 会按回退字体的字宽/行高排版，
 * 与预览产生偏差（实测标题行高相差 6px，逐段累积会造成分页错位）。
 */
export const ensureFontLoaded = async (fontFamily?: string) => {
  if (typeof document === "undefined" || !document.fonts) return;

  const definition = findFontDefinition(fontFamily);

  await Promise.all(
    definition.sources.map((source) =>
      document.fonts
        .load(`${source.weight} 16px "${source.family}"`)
        .catch(() => undefined)
    )
  );

  await document.fonts.ready.catch(() => undefined);
};
