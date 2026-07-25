# magic-resume JSON schema (for resume-gen)

Output must be a single JSON object that the app can import via「导入 JSON」(`...initialResumeState, ...config` shallow merge). Write **full content** — do not rely on demo defaults.

`templateId` and page/language/photo knobs come from [intake.md](intake.md) (Intake lock), not from silent defaults — unless the user explicitly accepted defaults.

Types live in `src/types/resume.ts`. Shape below is the practical contract for agents.

## Top-level fields

| Field | Required | Notes |
|-------|----------|-------|
| `title` | yes | Display name, e.g. `DeepWisdom-AI产品实习-王炎` |
| `templateId` | yes | From intake Card 1；must match registry id (`kami`, `classic`, …) |
| `basic` | yes | Contacts + name + target title |
| `education` | yes | Array; usually 1 item |
| `experience` | yes | Internships / jobs |
| `projects` | yes | Array |
| `skillContent` | yes | HTML string |
| `selfEvaluationContent` | optional | HTML or `""` |
| `menuSections` | yes | Controls section order / visibility |
| `globalSettings` | yes | Theme, spacing, font |
| `certificates` | yes | Usually `[]` |
| `customData` | yes | Usually `{}` |
| `activeSection` | yes | e.g. `"basic"` |
| `draggingProjectId` | yes | `null` |
| `id` / `createdAt` / `updatedAt` | optional | UI regenerates on import |

## Kami defaults (`templateId: "kami"`)

```json
{
  "templateId": "kami",
  "basic": { "layout": "left" },
  "globalSettings": {
    "themeColor": "#1B365D",
    "fontFamily": "\"TsangerJinKai02\", \"Source Han Serif SC\", \"Noto Serif SC\", \"Songti SC\", \"STSong\", Georgia, serif",
    "baseFontSize": 13,
    "pagePadding": 40,
    "paragraphSpacing": 14,
    "lineHeight": 1.5,
    "sectionSpacing": 22,
    "headerSize": 17,
    "subheaderSize": 15,
    "useIconMode": false,
    "centerSubtitle": false,
    "autoOnePage": true
  }
}
```

## `basic`

- Set `photo` to `""` and `photoConfig.visible` to `false` unless a real photo path exists.
- Keep `fieldOrder` / `icons` consistent with the sample; hide unused keys with `visible: false` (e.g. birthDate).
- `title` = target role line for this JD (not a fixed personal brand slogan unless in the library).

## Rich text

`experience[].details`, `projects[].description`, `education[].description`, `skillContent` → HTML `<ul><li>…</li></ul>` only. See [writing.md](writing.md).

## Dates

- Experience / project: `"2024.07 - 2024.12"` or `"2024.07 - 至今"`
- Education: `startDate` / `endDate` as `"YYYY-MM"`

## `menuSections` (1-page recommended order)

Prefer experience before skills:

1. `basic` (order 0)
2. `experience` (1)
3. `projects` (2)
4. `education` (3)
5. `skills` (4)

Omit unused sections with `enabled: false`, or leave them out of the array if unused.

## Import pitfalls

- Shallow merge: missing `basic` keeps demo「宋哈娜」— always overwrite `basic` fully.
- Same for `education` / `experience` / `projects` / `skillContent` / `menuSections`.
- Do not invent IDs collisions across arrays; use stable short strings (`"edu1"`, `"exp1"`, `"p1"`).

## Example

See [examples/kami-resume.sample.json](examples/kami-resume.sample.json).
