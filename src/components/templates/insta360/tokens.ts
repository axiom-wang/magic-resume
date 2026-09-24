/**
 * 影石 Insta360 · 品牌视觉 tokens
 *
 * 取色依据（公开品牌资产，非官方规范文件，hex 视为近似值）：
 *   - 品牌主强调色是唯一的「影石黄」，官方 logo 锁版即为 Black on Yellow；
 *   - 正文/标题用中性墨黑，不用带蓝调的近黑，保证黑白高对比；
 *   - 只用单一强调色 + 两级中性灰，是本模板「只换皮肤」的全部色彩预算。
 *
 * 版面（间距 / 页边距 / 字号 / 结构）一律沿用经典模板，本文件只描述视觉。
 */
export const INSTA = {
  /** Insta Yellow —— 整页唯一的强调色（序号徽章、品牌字标高亮、引言引号） */
  yellow: "#FFC400",
  /** Ink Black —— 标题与正文 */
  ink: "#1A1A1A",
  /** Graphite —— 次级信息：职位 / 角色 / 日期 / 顶栏字段 */
  graphite: "#5C5C61",
  /** White —— 纸张（主栏卡片底色） */
  paper: "#FFFFFF",
  /** Mist —— 页面与侧栏的浅灰底（白色主卡浮在其上） */
  mist: "#F4F4F5",
  /** Hairline —— 主栏板块标题下方的浅灰细分隔线 */
  hairline: "#E4E4E7",
  /**
   * 与 `src/utils/fonts.ts` 中 MiSans 的 value 字符串**完全一致**，
   * 否则 `normalizeFontFamily` 匹配不到定义，导出时不会内联 @font-face。
   */
  sans: '"MiSans", sans-serif',
} as const;

/**
 * 侧栏顶部的品牌装饰字标（固定文案，不进 i18n——中英混排本身是设计的一部分）。
 * 本模板是「求职影石专用」简历，保留品牌字标属刻意为之。
 */
export const INSTA_BRAND = {
  wordmarkA: "Insta",
  wordmarkB: "360",
  wordmarkZh: "影石",
  sloganZh: "影像，拓展生活的边界",
  sloganEn: "CHASING A WIDER WORLD",
} as const;
