# Resume writing (magic-resume)

Use when rewriting bullets into JSON rich-text fields (`experience[].details`, `projects[].description`, `education[].description`, `skillContent`).

## Bullet shape

Every bullet should carry **Action + Scope + Result** (add **Business Outcome** when the library has it):

| Part | Meaning | Example fragment |
|------|---------|------------------|
| Action | Verb-led what you did | 搭建 / 主导 / 优化 |
| Scope | Where / for whom / with what | 面向销售的线索库 · 覆盖 XX 市场 |
| Result | Measurable or concrete change | CVR +X% · 缩短周期 · 支撑决策 |
| Outcome | Why it mattered (optional) | 支撑本季度 pipeline |

Prefer library numbers over adjectives. Never invent metrics.

## HTML format (required)

magic-resume stores rich text as HTML, not Markdown:

```html
<ul>
  <li>主导独立站转化漏斗改版，覆盖注册到下单全链路，CVR 从 x% 提升至 y%</li>
  <li>搭建海外线索库与 EDM 触达流程，单季曝光达 N，支撑销售跟进</li>
</ul>
```

Rules:

- One idea per `<li>`; keep each line scannable on one page.
- Do not wrap the whole section in extra `<div>` unless needed for skills.
- `projects[].role` is plain text (shown as a role tag); put narrative in `description`.
- `skillContent` may be a short `<ul>` of 3–5 JD-aligned lines.

## Section emphasis

- **Internships / experience**: 2–3 bullets each on a 1-page resume.
- **Projects**: role + 2–3 impact bullets; drop weak demo detail.
- **Education**: one block; awards as a short line inside `description` or a single bullet.
- **Skills**: JD keywords only; no laundry lists.

## Anti-patterns

- Restating the job title as a bullet
- Keyword stuffing without evidence
- Padding with soft claims ("积极沟通", "保障稳定运行") when no fact exists
- Mixing Markdown (`**bold**`, `- item`) into rich-text fields
