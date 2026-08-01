---
name: resume-gen
description: Generate a job-targeted resume for 王炎 by matching a role/JD against the local experience library, then writing a magic-resume importable JSON and exporting PDF via the project script. Always clarify template and quality knobs via question cards first. Use when the user asks to 投递、定制简历、针对岗位生成简历、按 JD 改简历, or to tailor a CV for a company or internship.
---

# Resume Gen · 针对岗位生成简历

从岗位信息出发，对照经历库筛选改写，写出 **magic-resume 可导入 JSON**，再用项目脚本导出 PDF。

**先发提问卡片（见 [intake.md](intake.md)），再生成。** 用户已在本轮说清的项可跳过；**模板未指定时必须问。**

## Defaults (only if user picks「默认」or skips an optional knob)

| Item | Default |
|------|---------|
| Language | 中文 (`zh`) |
| Pages | 1 |
| Template | `kami`（仅当用户选默认 / 卡片预选项） |
| Experience source | `~/Library/Mobile Documents/com~apple~CloudDocs/简历/王炎-经历总览.md` |
| Output dir | `output/<公司或角色>-<岗位>-王炎/` |
| Deliverables | `resume.json` + `resume.pdf` |
| Photo | 不放 |
| Profile | `auto`（按 JD/标题） |
| Emphasis | `balanced` |

## Input contract

- Prefer: company + job title + JD (or bullets).
- **Do not** start matching/writing until intake is done for all *unanswered* required knobs (template always required unless already named).
- Use the host agent's **question card** tool (Cursor `AskQuestion` / WorkBuddy `AskUserQuestion`), not a long prose questionnaire. Full question list: [intake.md](intake.md).

## Workflow

Copy and track:

```
Resume Gen Progress:
- [ ] 0. Intake via question cards (intake.md)
- [ ] 1. Load experience library
- [ ] 2. Match & trim (matching.md + intake emphasis/profile)
- [ ] 3. Rewrite bullets (facts only; writing.md)
- [ ] 4. Emit match summary (non-blocking)
- [ ] 5. Write magic-resume JSON (json-schema.md)
- [ ] 6. Export PDF if deliverables include PDF + hand off
```

### 0. Intake via question cards

1. Read [intake.md](intake.md).
2. Emit Card 1（排版与交付）and Card 2（内容策略）per that doc — skip questions already answered in the user message.
3. Wait for answers. Print the **Intake lock** block, then continue.
4. If the user refuses cards and only gives a job title: ask **template** once more via a minimal card; if still no answer, use default `kami` and state that explicitly in the lock.

### 1. Load experience library

Read the experience source in full (path above, unless overridden). Treat it as the only fact base unless the user adds facts in this turn.

Do **not** edit the experience library. Write new resumes only under the output directory.

### 2. Match & trim

Follow [matching.md](matching.md):

- Resolve profile from intake (`auto` → infer from JD/title; else use the locked profile).
- Honor `emphasis` and `must_keep` when cutting for page count.
- Under the 1-page default: prefer **2 internships + 1–2 projects + compact skills**; drop weak fits instead of padding.

### 3. Rewrite (facts only)

- Reorder and re-emphasize existing facts for the target role; **never invent metrics, titles, or tools**.
- Align bullets with [writing.md](writing.md) (Action + Scope + Result / Impact).
- Rich text fields must be HTML `<ul><li>...</li></ul>` (magic-resume format).
- Weave JD keywords naturally; no keyword stuffing.
- Contact info and education come from the experience library.
- `basic.title` ← intake `role_title` (or best-effort from JD).

### 4. Match summary (non-blocking)

Before writing JSON, print ~5 lines:

- Target narrative (one sentence)
- Kept experiences（含 must_keep）
- De-emphasized / omitted items
- Intake contract: language · pages · template · deliverables

Continue immediately; do not wait for approval unless the user interrupts.

### 5. Write magic-resume JSON

1. Read [json-schema.md](json-schema.md) and mirror [examples/kami-resume.sample.json](examples/kami-resume.sample.json) for structure.
2. Write **complete** content fields. Import shallow-merges with demo defaults — omitting keys leaves fake sample data.
3. Set `templateId` and `globalSettings` / `basic.layout` from the **locked template** (Kami defaults in json-schema when `kami`; otherwise match that template’s config primary/spacing and any `defaultFontFamily`).
4. Apply photo decision from intake.
5. Save as `resume.json` under the output directory.
6. Self-check: no leftover placeholders; HTML lists well-formed.

### 6. Export PDF + hand off

If deliverables are `json_only`, skip PDF and hand off the JSON path only.

Otherwise, from the **magic-resume project root**:

```bash
pnpm export:resume-pdf -- --input <output-dir>/resume.json --output <output-dir>/resume.pdf
```

Ship both paths. Confirm: JSON imports cleanly in「导入 JSON」, PDF has no placeholders, density matches the page contract.

Manual fallback (if the script fails): tell the user to import `resume.json` and export PDF from the workbench.

## Hard rules

- Facts only from the experience library or user additions in this conversation.
- Never modify `王炎-经历总览.md`.
- Do **not** call the kami skill, WeasyPrint, or hand-roll a parallel HTML/CSS resume system — use magic-resume JSON + `export:resume-pdf`.
- Do **not** skip intake when template (or other unanswered quality knobs) are unclear.
- If a needed metric is missing, mark `[DATA NEEDED: ...]` or omit the claim — do not guess.

## When not to use

- User only wants to edit the experience library itself → edit that file, do not generate a resume.
- User wants a visual system outside project templates → point them at in-app `templateId` options via the intake card.
