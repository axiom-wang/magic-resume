import { ResumeTemplate } from "@/types/template";
import { KAMI } from "./tokens";

export const kamiConfig: ResumeTemplate = {
  id: "kami",
  name: "紙 · Kami",
  description: "暖羊皮纸底与墨蓝点缀的编辑风衬线排版，安静克制、适合正式投递",
  thumbnail: "kami",
  layout: "kami",
  colorScheme: {
    primary: KAMI.brand,
    secondary: KAMI.olive,
    background: KAMI.parchment,
    text: KAMI.nearBlack,
  },
  // 与经典模板保持一致的版面节奏（板块间距 / 条目间距 / 页边距）
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
  defaultFontFamily: KAMI.serif,
};
