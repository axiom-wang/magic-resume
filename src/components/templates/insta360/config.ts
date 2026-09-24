import { ResumeTemplate } from "@/types/template";
import { INSTA } from "./tokens";

export const insta360Config: ResumeTemplate = {
  id: "insta360",
  name: "影石 · Insta360",
  description: "影石品牌视觉：浅灰侧栏 + 白色圆角主卡双栏，影石黄序号徽章，适合科技 / 硬件 / 影像行业投递",
  thumbnail: "insta360",
  layout: "insta360",
  colorScheme: {
    primary: INSTA.ink,
    secondary: INSTA.graphite,
    background: INSTA.mist,
    text: INSTA.ink,
  },
  // 双栏版式后 spacing 含义：sectionGap → 主栏板块间距 / 侧栏块间距，itemGap → 条目间距，contentPadding → 页边距
  spacing: {
    sectionGap: 16,
    itemGap: 12,
    contentPadding: 32,
  },
  basic: {
    layout: "left",
  },
  availableSections: [
    "skills",
    "experience",
    "projects",
    "education",
    "selfEvaluation",
    "certificates",
  ],
  /**
   * 影石模板的品牌字体：MiSans（几何感更强的中性无衬线，贴近品牌正文字感）。
   * 必须是 `src/utils/fonts.ts` 中 FONT_DEFINITIONS 的原字符串，否则导出时不内联 @font-face。
   */
  defaultFontFamily: INSTA.sans,
};
