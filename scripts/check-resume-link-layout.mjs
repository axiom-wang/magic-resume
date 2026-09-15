// Run check-resume-links.ts first to generate the shared fixture, then run this file with node.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
const baseUrl=process.env.RESUME_TEST_URL || 'http://localhost:4317';
const output=process.env.RESUME_TEST_OUTPUT || '/tmp/magic-resume-link-check';
const fixture=JSON.parse(await fs.readFile(`${output}/fixture.json`,'utf8'));
const browser=await chromium.launch();
try {
 for(const templateId of ['kami','classic','modern','creative','elegant','swiss','minimalist','editorial','left-right','timeline']) {
  for(const mode of ['long','legacy']) {
   const data=structuredClone(fixture);data.templateId=templateId;
   data.globalSettings.centerSubtitle=false;
   if(mode==='long') {
    data.projects[0].name='非常长的项目名称用于检查换行与右上角图标LongProjectNameWithoutAnySpaces'.repeat(2);
    data.projects[1].visible=false;
    data.menuSections.find(s=>s.id==='custom-b').enabled=false;
   } else {
    data.projects.forEach(p=>{delete p.linkDisplay;p.linkLabel='访问项目';});
    data.menuSections.forEach(s=>delete s.link);
    data.selfEvaluationContent=data.selfEvaluationContent.replace(' data-link-display="superscript"','');
   }
   const page=await browser.newPage({viewport:{width:900,height:1200}});
   await page.addInitScript(d=>window.__MAGIC_RESUME_DATA__=d,data);
   await page.goto(`${baseUrl}/app/preview-resume?snapshot=1`,{waitUntil:'networkidle'});
   await page.waitForSelector('[data-resume-export-root]');
   if(mode==='legacy') {
    assert.equal(await page.locator('.resume-title-link').count(),0);
    assert.equal(await page.getByRole('link',{name:'访问项目',exact:true}).count(),3);
   } else {
    assert.equal(await page.locator('a[href="https://example.com/project-1"]').count(),0);
    assert.equal(await page.locator('a[href="https://example.com/b"]').count(),0);
    const issues=await page.locator('[data-project-title-link]').evaluateAll(titles=>titles.flatMap(t=>{
      const r=t.getBoundingClientRect();const a=t.querySelector('a').getBoundingClientRect();
      return a.right>r.right+1 || a.left<r.left-1 || t.scrollWidth>t.clientWidth+1 ? [t.textContent] : [];
    }));
    assert.deepEqual(issues,[],`${templateId}: clipped long title`);
    await page.screenshot({path:`${output}/${templateId}-long.png`,fullPage:true});
   }
   await page.close();
  }
  console.log(`${templateId}: long names, hidden links and legacy display passed`);
 }
} finally {await browser.close();}
