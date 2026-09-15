// Run check-resume-links.ts first to generate the shared fixture, then run this file with node.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { chromium } from 'playwright';
const baseUrl = process.env.RESUME_TEST_URL || 'http://localhost:4317';
const output = process.env.RESUME_TEST_OUTPUT || '/tmp/magic-resume-link-check';
const data = JSON.parse(await fs.readFile(`${output}/fixture.json`, 'utf8'));
data.activeSection = 'selfEvaluation';
const browser = await chromium.launch();
try {
 const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
 await page.addInitScript(d => {
  if (!localStorage.getItem('resume-storage')) localStorage.setItem('resume-storage', JSON.stringify({ state: { resumes: { [d.id]: d }, activeResumeId: d.id }, version: 0 }));
 }, data);
 await page.goto(`${baseUrl}/app/workbench/${data.id}`, {waitUntil:'networkidle'});
 const panel = page.locator('#edit-panel');
 const editor = panel.locator('.tiptap');
 await editor.locator('a').click({position:{x:5,y:5}});
 await panel.getByRole('button', {name:'链接', exact:true}).click();
 const popover = page.locator('[data-radix-popper-content-wrapper]');
 await popover.locator('option[value="superscript"]:checked').waitFor({state:'attached'});
 await popover.locator('input').fill('example.com/hobbies-updated');
 await popover.locator('select').selectOption('text');
 await popover.getByRole('button').last().click();
 assert.equal(await editor.locator('a[data-link-display]').count(), 0);
 await editor.locator('a').click({position:{x:5,y:5}});
 await panel.getByRole('button', {name:'链接', exact:true}).click();
 await popover.locator('select').selectOption('superscript');
 await popover.getByRole('button').last().click();
 assert.equal(await editor.locator('a[data-link-display="superscript"]').count(), 1);
 await panel.getByLabel('标题链接', {exact:true}).fill('example.com/evaluation');
 const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('resume-storage')).state.resumes['link-regression']);
 assert(saved.selfEvaluationContent.includes('data-link-display="superscript"'));
 assert(saved.selfEvaluationContent.includes('https://example.com/hobbies-updated'));
 assert.equal(saved.menuSections.find(s=>s.id==='selfEvaluation').link, 'example.com/evaluation');
 await page.reload({waitUntil:'networkidle'});
 assert.equal(await editor.locator('a[data-link-display="superscript"]').count(), 1);
 await panel.getByLabel('标题链接', {exact:true}).fill('javascript:alert(1)');
 assert(await page.getByRole('alert').count() > 0);
 await panel.getByLabel('标题链接', {exact:true}).fill('');
 const copied = await page.evaluate(async () => {
   const {useResumeStore} = await import('/src/store/useResumeStore.ts');
   const state = useResumeStore.getState(); const id = state.duplicateResume('link-regression');
   return useResumeStore.getState().resumes[id];
 });
 assert.deepEqual(copied.projects, saved.projects);
 assert.equal(copied.selfEvaluationContent, saved.selfEvaluationContent);
 // JSON round trip through the same store entry point as imported resumes.
 const imported = await page.evaluate(async copy => {
   const {useResumeStore} = await import('/src/store/useResumeStore.ts');
   const roundTrip = JSON.parse(JSON.stringify({...copy,id:'import-regression'}));
   useResumeStore.getState().addResume(roundTrip);
   return useResumeStore.getState().resumes['import-regression'];
 }, copied);
 assert.deepEqual(imported.projects, copied.projects);
 assert.deepEqual(imported.menuSections, copied.menuSections);
 assert.equal(imported.selfEvaluationContent, copied.selfEvaluationContent);
 await editor.locator('a').click({position:{x:5,y:5}});
 await panel.getByRole('button', {name:'链接', exact:true}).click();
 await popover.getByRole('button').first().click();
 assert.equal(await editor.locator('a').count(), 0);
 assert.equal(await editor.locator('strong').innerText(), '兴趣爱好');
 await page.evaluate(async () => {
  const {useResumeStore} = await import('/src/store/useResumeStore.ts');
  useResumeStore.getState().setActiveSection('projects');
 });
 await panel.getByRole('heading',{name:'个人网站',exact:true}).click();
 await panel.getByLabel('链接样式',{exact:true}).selectOption('text');
 await panel.getByLabel('显示文字',{exact:true}).fill('访问个人网站');
 await panel.getByLabel('链接样式',{exact:true}).selectOption('superscript');
 const project = await page.evaluate(async () => {
   const {useResumeStore} = await import('/src/store/useResumeStore.ts');
   return useResumeStore.getState().activeResume.projects[0];
 });
 assert.equal(project.linkDisplay,'superscript');
 assert.equal(project.linkLabel,'访问个人网站');
 console.log('Editor link styles, removal, validation, reload, duplication, JSON round trip and project controls passed');
} finally { await browser.close(); }
