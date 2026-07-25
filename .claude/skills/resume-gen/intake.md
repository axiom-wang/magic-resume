# Intake · 提问卡片

在加载经历库、匹配改写、写 JSON **之前**完成。用 Cursor **提问卡片**（`AskQuestion`）收集选项；不要改成一大段自由聊天问答。

## When to ask

| Situation | Action |
|-----------|--------|
| User already stated a knob in this turn (e.g. 「用经典模板」「英文」「只要 JSON」) | Skip that question; lock the stated value |
| Template not stated | **Always** include template on Card 1 (required) |
| Job title / company / JD missing and role profile cannot be inferred | Include job fields on Card 2 |
| Everything else already clear | Still send Card 1 if template unset; skip Card 2 questions that are filled |

**Hard stop:** do not load the experience library for writing, and do not emit JSON/PDF, until Card 1 (at least template) is answered — unless the user already named a `templateId` in the prompt.

Prefer **one combined AskQuestion with multiple questions** when the tool allows; otherwise send **Card 1 then Card 2** in the same turn if possible, or Card 1 first and Card 2 immediately after answers.

---

## Card 1 · 排版与交付

| id | Prompt (CN) | Type | Options (`id` = value to store) |
|----|-------------|------|----------------------------------|
| `template` | 选择简历模板 | single | see Template options below |
| `language` | 简历语言 | single | `zh` 中文（默认）· `en` 英文 |
| `pages` | 页数目标 | single | `1` 一页（默认）· `2` 一点五到两页 |
| `deliverables` | 交付物 | single | `json_pdf` JSON + PDF（默认）· `json_only` 仅 JSON |

### Template options

Option `id` **must** equal magic-resume `templateId`:

| id | Label |
|----|--------|
| `kami` | 紙 · Kami（羊皮纸 + 仓耳今楷，推荐正式投递） |
| `classic` | 经典模板 |
| `modern` | 两栏布局 |
| `left-right` | 模块标题背景色 |
| `timeline` | 时间轴布局 |
| `minimalist` | 极简模板 |
| `elegant` | 优雅模板 |
| `creative` | 创意模板 |
| `editorial` | 画报风模板 |
| `swiss` | 瑞士美学 |

Default highlight / preselect: `kami` when the UI supports a default.

---

## Card 2 · 内容策略

| id | Prompt (CN) | Type | Options / notes |
|----|-------------|------|-----------------|
| `profile` | 岗位侧重点（影响经历取舍） | single | `auto` 按 JD/标题自动（默认）· `ai_pm` AI 产品 · `growth` 出海/增长运营 · `campus` 校园大使/校招运营 · `web3` Web3 · `consulting` 咨询/商业分析 · `general` 通用互联网产品/运营 |
| `emphasis` | 一页时更想突出 | single | `balanced` 均衡（默认）· `internships` 偏实习 · `projects` 偏项目 |
| `photo` | 是否放证件照/形象照 | single | `no` 不放（默认）· `yes` 要放（需在下一项或消息里给路径） |
| `must_keep` | 必须保留的亮点（可选） | text | e.g. 京东神鲜杯、腾讯校园大使；无则填「无」 |
| `company` | 公司名（可选） | text | 用于输出目录与文件名 |
| `role_title` | 岗位名称 | text | 必填除非用户首条消息已有；写入 `basic.title` |
| `jd_notes` | JD 要点或粘贴（可选） | text | 无则按岗位名 best-effort |

Skip any row already answered in the user message.

---

## After answers · lock contract

Print a short **Intake lock** (non-blocking, then continue):

```
Intake lock:
- template: kami
- language: zh · pages: 1 · deliverables: json_pdf
- profile: auto → (will resolve after JD read)
- emphasis: balanced · photo: no
- company / role: …
- must_keep: …
```

Map into generation:

| Intake | Effect |
|--------|--------|
| `template` | `templateId`; apply that template’s spacing/theme from registry / [json-schema.md](json-schema.md)（kami 用文档中的 Kami defaults；其他模板用其 `config.ts` 的 primary + spacing，字体用用户未指定时的模板 `defaultFontFamily` 或项目默认） |
| `language` | CN vs EN copy + `menuSections` titles |
| `pages` | `1` → matching 1-page trim；`2` → multi-page override in matching.md |
| `deliverables` | skip `export:resume-pdf` when `json_only` |
| `profile` | if not `auto`, force that matching profile |
| `emphasis` | when trimming: drop projects first if `internships`, drop a second internship first if `projects` |
| `photo` | `no` → `photo: ""`, `photoConfig.visible: false`；`yes` → need path or mark `[DATA NEEDED: photo]` |
| `must_keep` | never omit those named items when trimming |
| `company` / `role_title` | output dir `output/<公司或角色>-<岗位>-王炎/`；`basic.title` ← role |

Then proceed to load the experience library.
