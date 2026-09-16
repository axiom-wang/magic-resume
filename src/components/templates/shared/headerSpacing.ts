import type { CSSProperties } from "react";

/**
 * 顶栏（basic 板块）与其下方第一个板块之间的固定留白。
 *
 * 设计意图：这段留白属于「信息带」与「正文模块」之间的视觉分隔，不应该跟着编辑器里的
 * 「模块间距」一起变化。实现方式：
 *   1. 顶栏自己用 paddingBottom 提供这段留白（挂在 basic 的 SectionWrapper 上，
 *      这样编辑器 hover 高亮能一起盖住它）；
 *   2. 紧随其后的那个板块用负 marginTop 抵消它自身的 `marginTop: sectionSpacing`，
 *      于是该板块不再贡献间距，最终间距恒为 HEADER_BOTTOM_SPACE。
 */
export const HEADER_BOTTOM_SPACE = 25;

/** 与各 section 内部 `globalSettings?.sectionSpacing || <fallback>` 的默认值保持一致（editorial 是 32） */
export const DEFAULT_SECTION_SPACING = 24;

/** 挂在 basic 的 SectionWrapper 上：固定留白 */
export const getHeaderSpaceStyle = (): CSSProperties => ({
  paddingBottom: `${HEADER_BOTTOM_SPACE}px`,
});

/**
 * 挂在「紧随 basic 之后的那个板块」的外层 wrapper 上，抵消它自身的 marginTop。
 *
 * 注意：`fallback` 必须与目标板块内部 `marginTop: sectionSpacing || fallback` 的 fallback 一致，
 * 否则抵消不干净（多/少几 px）。当前 10 个模板里只有 editorial 用 32，其余都用 24。
 */
export const getHeaderNextSectionStyle = (
  sectionSpacing: number | undefined,
  fallback: number = DEFAULT_SECTION_SPACING
): CSSProperties => ({
  marginTop: `${-Math.max(sectionSpacing || fallback, 0)}px`,
});
