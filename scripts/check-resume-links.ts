// Run against a local dev server: pnpm exec tsx scripts/check-resume-links.ts
import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { chromium } from "playwright";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { initialResumeState } from "../src/config/initialResumeData";
import { normalizeLinkHref } from "../src/lib/richText";
import { getProjectLinkHref } from "../src/lib/projectLink";

const baseUrl = process.env.RESUME_TEST_URL || "http://localhost:4317";
const output = process.env.RESUME_TEST_OUTPUT || "/tmp/magic-resume-link-check";
await mkdir(output, { recursive: true });
assert.equal(getProjectLinkHref("example.com/projects"), "https://example.com/projects");
for (const url of ["javascript:alert(1)", "https://", "hello world", "data:text/html,test"]) assert.equal(getProjectLinkHref(url), null);
assert.equal(normalizeLinkHref("https://"), null);
assert.equal(normalizeLinkHref("example.com/hobbies"), "https://example.com/hobbies");
assert.equal(normalizeLinkHref("mailto:hello@example.com"), "mailto:hello@example.com");
const data = {
  ...initialResumeState, id: "link-regression", templateId: "kami", createdAt: "", updatedAt: "",
  education: [], experience: [], skillContent: "", certificates: [],
  globalSettings: { ...initialResumeState.globalSettings, baseFontSize: 13, subheaderSize: 15 },
  projects: ["个人网站", "会议实时辅助 AI 助手", "目标网络"].map((name, i) => ({ id: `p${i}`, name, role: "独立设计与开发", date: "2026.04", description: "<p>项目简介</p>", visible: true, link: `https://example.com/project-${i}`, linkDisplay: "superscript" })),
  selfEvaluationContent: '<p><strong><a href="https://example.com/hobbies" data-link-display="superscript" target="_blank">兴趣爱好</a></strong>：骑行、摄影、吉他</p>',
  customData: { "custom-a": [{ id: "a", title: "摄影", subtitle: "", dateRange: "", description: "作品集", visible: true }], "custom-b": [{ id: "b", title: "音乐", subtitle: "", dateRange: "", description: "作品集", visible: true }] },
  menuSections: [
    { id: "basic", title: "基本信息", enabled: true, order: 0 },
    { id: "projects", title: "项目经历", link: "https://example.com/projects", enabled: true, order: 1 },
    { id: "selfEvaluation", title: "自我评价", enabled: true, order: 2 },
    { id: "custom-a", title: "同名栏目", link: "https://example.com/a", enabled: true, order: 3 },
    { id: "custom-b", title: "同名栏目", link: "https://example.com/b", enabled: true, order: 4 },
  ].map(s => ({ ...s, icon: "" })),
};
await writeFile(`${output}/fixture.json`, JSON.stringify(data));
const browser = await chromium.launch();
try {
  for (const templateId of ["kami", "classic", "modern", "creative", "elegant", "swiss", "minimalist", "editorial", "left-right", "timeline"]) {
    const page = await browser.newPage({ viewport: { width: 900, height: 1200 } });
    await page.addInitScript(d => { (window as any).__MAGIC_RESUME_DATA__ = d; }, { ...data, templateId });
    await page.goto(`${baseUrl}/app/preview-resume?snapshot=1`, { waitUntil: "networkidle" });
    await page.waitForSelector("[data-resume-export-root]");
    assert.equal(await page.locator("a.resume-title-link").count(), 6, templateId);
    assert.equal(await page.locator('a[data-link-display="superscript"]').count(), 1, templateId);
    assert.equal(await page.locator('a[href="https://example.com/a"]').count(), 1);
    assert.equal(await page.locator('a[href="https://example.com/b"]').count(), 1);
    // Click the beginning of the title text, away from the superscript icon.
    await page.context().route("https://example.com/**", route => route.fulfill({ body: "Link target" }));
    for (const [suffix, label] of [["projects", "项目经历"], ["project-0", "个人网站"]]) {
      const anchor = page.locator(`a.resume-title-link[href="https://example.com/${suffix}"]`);
      assert((await anchor.innerText()).includes(label), `${templateId}: title must be inside anchor`);
      const popupPromise = page.waitForEvent("popup");
      await anchor.click({ position: { x: 4, y: 6 } });
      const popup = await popupPromise;
      await popup.waitForURL(`https://example.com/${suffix}`);
      await popup.close();
    }
    await page.evaluate(() => document.fonts.ready);
    const path = `${output}/${templateId}.pdf`;
    await page.pdf({ path, format: "A4", printBackground: true });
    const pdf = await getDocument({ data: new Uint8Array(await readFile(path)) }).promise;
    const links: string[] = [];
    for (let i = 1; i <= pdf.numPages; i++) links.push(...(await (await pdf.getPage(i)).getAnnotations()).map(a => a.url).filter(Boolean));
    for (const suffix of ["projects", "project-0", "project-1", "project-2", "hobbies", "a", "b"]) assert(links.includes(`https://example.com/${suffix}`), `${templateId}: missing PDF link ${suffix}`);
    await pdf.destroy();
    await page.screenshot({ path: `${output}/${templateId}.png`, fullPage: true });
    await page.close();
    console.log(`${templateId}: preview and PDF links passed`);
  }
} finally { await browser.close(); }
