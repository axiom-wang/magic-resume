import assert from "node:assert/strict";
import path from "node:path";
import { chromium } from "playwright";

const baseUrl = process.env.RESUME_TEST_URL || "http://localhost:3000";
const photoPath = path.resolve("public/avatar.png");
const browser = await chromium.launch({ channel: process.env.RESUME_TEST_BROWSER });

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.goto(baseUrl);
  const id = await page.evaluate(async () => {
    const { useResumeStore } = await import("/src/store/useResumeStore.ts");
    const id = useResumeStore.getState().createResume("classic", true);
    useResumeStore.getState().updateBasicInfo({
      name: "头像回归检查",
      photo: "",
      photoConfig: {
        width: 90, height: 120, aspectRatio: "3:4",
        borderRadius: "none", customBorderRadius: 0, visible: false,
      },
    });
    return id;
  });

  const readBasic = () => page.evaluate(() => {
    const state = JSON.parse(localStorage.getItem("resume-storage")).state;
    return state.resumes[state.activeResumeId].basic;
  });
  const openDrawer = async () => {
    await page.locator("#edit-panel").getByText("头像", { exact: true })
      .locator("../..").getByRole("button").first().click();
    await page.getByRole("dialog").waitFor();
  };
  const expectUploaded = async () => {
    await page.waitForFunction(() => {
      const state = JSON.parse(localStorage.getItem("resume-storage")).state;
      return state.resumes[state.activeResumeId].basic.photo.startsWith("data:image/");
    });
    const basic = await readBasic();
    assert.equal(basic.photoConfig.visible, true);
    assert.equal(basic.name, "头像回归检查");
    const photo = page.locator("#resume-preview img");
    await photo.waitFor({ state: "visible" });
    await page.waitForFunction(() => {
      const img = document.querySelector("#resume-preview img");
      return img?.complete && img.naturalWidth > 0;
    });
    assert.equal(await photo.getAttribute("src"), basic.photo);
    return basic.photo;
  };

  await page.goto(`${baseUrl}/app/workbench/${id}`);
  await openDrawer();
  await page.getByRole("dialog").locator('input[type="file"]').setInputFiles(photoPath);
  const uploaded = await expectUploaded();
  await page.getByRole("dialog").getByRole("button", { name: "圆形", exact: true }).click();
  assert.equal((await readBasic()).photo, uploaded);
  assert.equal((await readBasic()).photoConfig.borderRadius, "full");
  await page.getByRole("button", { name: "关闭", exact: true }).click();
  await page.reload();
  await expectUploaded();

  // A second upload must replace an existing photo and enable a hidden photo.
  await page.evaluate(async () => {
    const { useResumeStore } = await import("/src/store/useResumeStore.ts");
    const { photoConfig } = useResumeStore.getState().activeResume.basic;
    useResumeStore.getState().updateBasicInfo({
      photo: "/avatar.png", photoConfig: { ...photoConfig, visible: false },
    });
  });
  await openDrawer();
  await page.getByRole("dialog").locator('input[type="file"]').setInputFiles(photoPath);
  await expectUploaded();

  // Removing a photo must persist, including after reload.
  await page.getByRole("dialog").locator('button:has(svg.lucide-x)').click();
  assert.equal((await readBasic()).photo, "");
  await page.getByRole("button", { name: "关闭", exact: true }).click();
  await page.reload();
  await page.locator("#resume-preview").waitFor();
  assert.equal((await readBasic()).photo, "");
  assert.equal(await page.locator("#resume-preview img").count(), 0);

  console.log("Photo upload, replacement, visibility, styling, removal and reload checks passed.");
} finally {
  await browser.close();
}
