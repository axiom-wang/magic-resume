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
  spacing: {
    sectionGap: 22,
    itemGap: 14,
    contentPadding: 40,
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
