/**
 * 验证脚本：核对「顶栏 ↔ 下方第一个模块」的间距是否恒定、且与 sectionSpacing 解耦。
 * 用法：node scripts/check-header-spacing.mjs [templateId ...]（默认跑全部 10 个模板）
 *
 * 期望值来源：src/components/templates/shared/headerSpacing.ts 的 HEADER_BOTTOM_SPACE，
 * 改动那个常量后请同步下面的 EXPECTED_HEADER_SPACE。
 */
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import process from "node:process";

const require = createRequire(import.meta.url);
const cwd = process.cwd();
const PORT = 5199;
const BASE = `http://127.0.0.1:${PORT}`;
/** 与 HEADER_BOTTOM_SPACE 保持一致 */
const EXPECTED_HEADER_SPACE = 25;
const ALL = [
  "classic",
  "modern",
  "left-right",
  "timeline",
  "minimalist",
  "elegant",
  "creative",
  "editorial",
  "swiss",
  "kami",
];
const ids = process.argv.slice(2).length ? process.argv.slice(2) : ALL;

const { chromium } = require(path.join(cwd, "node_modules", "playwright"));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const waitForServer = async (timeoutMs = 30000) => {
  const t0 = Date.now();
  while (Date.now() - t0 < timeoutMs) {
    try {
      if ((await fetch(BASE)).ok) return;
    } catch {}
    await sleep(400);
  }
  throw new Error(`等待 ${BASE} 超时`);
};

const server = spawn(
  process.execPath,
  [path.join(cwd, "node_modules/vite/bin/vite.js"), "dev", "--host", "127.0.0.1", "--port", String(PORT), "--strictPort"],
  { cwd, stdio: "ignore" }
);

const rows = [];

try {
  await waitForServer();
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 794, height: 1123 },
    deviceScaleFactor: 1,
    colorScheme: "light",
  });

  for (const id of ids) {
    await page.goto(`${BASE}/app/preview-template/${id}?locale=zh&snapshot=1`, {
      waitUntil: "networkidle",
    });
    await page.waitForSelector("[data-template-snapshot-root]", { timeout: 20000 });
    await page.evaluate(async () => {
      if (document.fonts?.ready) await document.fonts.ready;
    });
    await page.waitForTimeout(500);

    const r = await page.evaluate((templateId) => {
      const round = (n) => Math.round(n * 10) / 10;
      const basic = document.querySelector('[data-resume-section-id="basic"]');
      const basicRect = basic.getBoundingClientRect();
      const basicPadding = parseFloat(getComputedStyle(basic).paddingBottom) || 0;
      // 头部可视内容底边（padding 不算内容）
      const contentBottom = basicRect.bottom - basicPadding;

      // 顶栏下方第一个「可见模块」的顶部：
      // 默认取第一个 top 在头部内容底边之下、且是 SectionWrapper 的板块；
      // timeline 的板块内容被包在时间线条目里，用第一个 .timeline-section（其顶部即条目标题顶部）作锚点
      const sections = Array.from(document.querySelectorAll("[data-resume-section-id]"))
        .filter((el) => el.getBoundingClientRect().height > 0)
        .map((el) => ({
          id: el.getAttribute("data-resume-section-id"),
          top: el.getBoundingClientRect().top,
          rect: el.getBoundingClientRect(),
        }))
        .filter((s) => s.id !== "basic")
        .sort((a, b) => a.top - b.top);

      const timelineTitle = document.querySelector(".timeline-section");
      const anchor = timelineTitle
        ? { id: "timeline-section", top: timelineTitle.getBoundingClientRect().top }
        : (sections.find((s) => s.top > contentBottom - 1) ?? sections[0]);

      // creative 特例：顶栏是带背景色的独立色块，固定留白落在色块**外面**，
      // 所以参照底边取色块自身的下边缘（basic → .relative.z-10 → 色块）
      const isCreative = templateId === "creative";
      const bandBottom =
        isCreative && basic.parentElement?.parentElement
          ? basic.parentElement.parentElement.getBoundingClientRect().bottom
          : null;
      const refBottom = bandBottom ?? contentBottom;

      // 其余板块间距（仅同列可比：按视觉 order 取相邻 SectionWrapper 的间隙）
      const otherGaps = [];
      for (let i = 1; i < sections.length; i++) {
        otherGaps.push(round(sections[i].top - sections[i - 1].rect.bottom));
      }

      return {
        basicPadding,
        anchorId: anchor?.id ?? null,
        ref: bandBottom === null ? "content" : "band",
        headerGap: anchor ? round(anchor.top - refBottom) : null,
        otherGaps,
      };
    }, id);

    const ok =
      // creative 的固定留白由 index.tsx 的固定 marginTop 提供（BaseInfo 不再加 padding）
      (r.basicPadding === EXPECTED_HEADER_SPACE || id === "creative") &&
      r.headerGap !== null &&
      Math.abs(r.headerGap - EXPECTED_HEADER_SPACE) <= 0.5;
    rows.push({ id, ...r, ok });
    console.log(
      `${ok ? "PASS" : "FAIL"}  ${id.padEnd(11)} basicPadding=${r.basicPadding}px  ` +
        `anchor=${String(r.anchorId).padEnd(11)} 参照=${r.ref}  headerGap=${r.headerGap}  otherGaps=[${r.otherGaps.join(", ")}]`
    );

    await page.screenshot({
      path: `/tmp/header-spacing-${id}.png`,
      clip: { x: 0, y: 0, width: 794, height: 360 },
    });
  }

  await browser.close();
} finally {
  server.kill("SIGTERM");
}

const bad = rows.filter((r) => !r.ok);
console.log(`\n结果：${rows.length - bad.length}/${rows.length} 通过`);
if (bad.length) {
  console.log("未通过：", bad.map((b) => b.id).join(", "));
  process.exitCode = 1;
}
