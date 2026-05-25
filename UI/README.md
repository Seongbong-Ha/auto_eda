# Auto EDA — Design System

A focused design system for **Auto EDA**, a Korean-language web app that turns a CSV upload into an AI-generated exploratory-data-analysis report. The product is built by [Seongbong-Ha/auto_eda](https://github.com/Seongbong-Ha/auto_eda) — a FastAPI + Claude API backend with a vanilla HTML/CSS/JS frontend, no framework.

## What this product is

> 업로드 하나로 끝나는 분석 — 단계가 눈에 보이고, 결과가 읽기 쉬운 단일 페이지.

Auto EDA is a **single-page, three-step flow**:

1. **Upload** — drag a CSV into a dashed dropzone, or pick a file.
2. **Analyzing** — a loading state with stepwise progress ("업로드 → 통계 계산 → AI 분석").
3. **Report** — overview cards (rows / columns / missing rate / size), a per-column summary table with type badges, and an AI-written insights body in Markdown. Download as `.md` or re-run.

It is **MVP-grade and desktop-first**. Mobile is intentionally out of scope. The target user is a Korean-speaking analyst or PM who wants a 60-second pulse on a dataset before they touch a notebook.

## Sources used to build this system

| Source | What it gave us |
|---|---|
| **GitHub — [Seongbong-Ha/auto_eda](https://github.com/Seongbong-Ha/auto_eda)** | Product definition, API surface, column-classification logic (`analyzer.py`), tech-stack constraints, Korean copy conventions in `project.md` and `CLAUDE.md`. |
| **User-supplied UI/UX brief** | Visual direction: white BG + indigo accent, type-badge color rule (numeric=blue, categorical=green, datetime=purple), 800px max width, system fonts with Korean priority. |

The repository has **no existing frontend code** — the `static/` directory in the planned tree was never built. Everything visual in this system is established here, grounded in the product semantics defined by the backend.

> **For future contributors:** clone the repo above and read `project.md` + `analyzer.py` to understand exactly what data the UI is rendering. The column-type values (`"numeric" | "categorical" | "datetime"`) and the `overview` keys (`rows`, `columns`, `missing_rate`, `memory_mb`) come straight from the API contract.

## Index

| File / folder | Purpose |
|---|---|
| `README.md` | This file. Brand, content, visual foundations. |
| `colors_and_type.css` | Design tokens — CSS variables for color, type, spacing, radius, shadow, motion. |
| `SKILL.md` | Agent-skill manifest. Use this with Claude Code or any agent that consumes Skills. |
| `assets/` | Logo, favicon, illustrative SVGs. |
| `preview/` | Self-contained design-system spec cards (one per concept) that render in the Design System tab. |
| `ui_kits/web/` | The single product surface — recreations of the three screens (Upload, Analyzing, Report) as JSX components, plus an interactive `index.html` clickthrough. |

---

## CONTENT FUNDAMENTALS

**Language.** Korean-first. Every user-facing string in the product is Korean. English is reserved for proper nouns (Claude, CSV, AI, EDA), file extensions, and code/identifiers shown in tables (column names, type labels).

**Tone.** Calm and procedural. The product describes what is happening, not how the user should feel about it. No exclamation marks. No emojis. No marketing voice.

- ✅ `Claude가 데이터를 분석하고 있습니다…` — declarative, present continuous, with a trailing ellipsis to suggest patience.
- ✅ `분석 시작` — verb phrase, no period, fits on a button.
- ❌ `분석 시작하기! 🚀` — exclamation, emoji, both off-brand.

**Person.** Third-person reference to the system (`Claude가…`). Direct address (`당신의 데이터를…`) is avoided. The user is not addressed; the system narrates itself.

**Casing.** Sentence case in Korean (which has no case anyway). For Latin tokens shown to users: lowercase for file extensions and units (`.csv`, `MB`), capitalized acronyms (`AI`, `CSV`, `EDA`), product nouns capitalized (`Claude`, `Auto EDA`).

**Numbers and units.** Tabular numerals (`font-variant-numeric: tabular-nums`) anywhere a number sits next to another number — overview cards, the column table. Korean number suffixes use a thin space: `1,234 행`, `12 열`, `2.4 MB`. Percentages compact: `3.2%`. Round aggressively in summary views (`mean: 12.4`, not `12.4382`).

**Microcopy examples** (from the brief and product semantics):

| Context | Copy |
|---|---|
| Dropzone idle | `CSV 파일을 여기로 끌어다 놓으세요` |
| Dropzone secondary | `또는 파일 선택` |
| File preview | `sales_2025.csv · 2.4 MB` |
| Primary CTA | `분석 시작` |
| Analyzing | `Claude가 데이터를 분석하고 있습니다…` |
| Step labels | `업로드` → `통계 계산` → `AI 분석` |
| Overview card | `행 수`, `열 수`, `결측률`, `용량` |
| Type badges | `수치형`, `범주형`, `날짜형` |
| Report actions | `MD 다운로드`, `새 파일 분석` |
| Error | `지원하지 않는 인코딩이거나 올바른 CSV 파일이 아닙니다.` *(verbatim from `analyzer.py`)* |

**Emoji.** Not used. The brand has no emoji vocabulary. If a visual hint is needed, lean on the indigo accent or a sparse icon, never an emoji.

**Vibe.** A clean lab notebook. Quiet whitespace, hairline borders, one moment of color (indigo) when a thing is actionable. The page should feel like a tool an analyst keeps open in a tab, not a SaaS landing page.

---

## VISUAL FOUNDATIONS

### Palette
- **Background**: pure `#ffffff` everywhere. No off-white page, no gradient page background.
- **Surfaces**: cards live on white with a hairline border (`--color-border` `#e5e7eb`). A second surface tone (`--color-surface-sunk` `#f5f5f7`) is used **only** for the idle dropzone fill and inline code.
- **Accent**: a single indigo — `--color-brand` `#4f46e5`. This is the *only* saturated color in the chrome. It appears on the primary CTA, focus rings, the active step indicator, and links. Indigo never tints surfaces; indigo-50 (`--color-brand-soft`) is reserved for the active-step pill and selection states.
- **Type-badge palette** (semantic, narrow application — only on column-type badges in the report):
  - 수치형 / numeric → blue-700 on blue-100
  - 범주형 / categorical → green-700 on green-100
  - 날짜형 / datetime → violet-600 on violet-100
- **No gradients.** Anywhere. The brand is a flat-paint brand.

### Typography
- **Family**: system stack led by **Pretendard** (`Pretendard Variable` if available), falling back to Apple SD Gothic Neo, Noto Sans KR, Malgun Gothic, then Latin system fonts. Korean glyph quality is the deciding factor.
- **Monospace**: JetBrains Mono → SF Mono → D2Coding (Korean-aware monospace) → Menlo.
- **Scale**: a tight 8-step scale, `12 / 13 / 15 / 16 / 18 / 22 / 28 / 34px`. The body sits at 15px — slightly smaller than Western convention because Korean glyphs are denser; line-height compensates.
- **Line-height**: Korean reading benefits from looser leading. Body copy uses `1.6`; long-form report prose uses `1.75`.
- **Letter-spacing**: tighten display sizes (`-0.02em` at 34px) for compact headlines; leave body at default; widen captions slightly (`+0.02em`) when uppercased.
- **Weight**: 400 body, 500 emphasis in tables, 600 headings, 700 only at display size.

### Spacing
4px base. Component padding lives at `12/16/20/24`. Section gaps at `32/48/64`. The 800px content column is centered with 24px page gutters.

### Backgrounds and imagery
- **Backgrounds**: white only. No textures, no patterns, no full-bleed photography. The product is a tool, not a marketing site.
- **Imagery**: none, intentionally. If we ever need to break the rule, the substitute is data — a small inline chart, never a photo.
- **Illustration**: avoided. The empty state of the dropzone is *typographic*, not illustrative.

### Animation
Restrained. All transitions use `cubic-bezier(0.16, 1, 0.3, 1)` (a soft ease-out) at 180ms. No bounces, no parallax, no stagger.
- **Loading**: a single-color spinner (indigo, 1.5px stroke) at 1s linear rotation. No skeletons, no shimmer.
- **Step transition**: 320ms cross-fade between screens; the previous screen's content opacity goes to 0 just before the next mounts.
- **Hover**: 120ms color shift only — no scale.

### Hover, press, focus
- **Buttons (primary)**: hover darkens indigo-600 → indigo-700. Press darkens to indigo-800 *and* depresses Y by 1px. Focus shows a 3px `var(--color-brand-ring)` halo, no inner border change.
- **Buttons (secondary / ghost)**: hover fills with `--color-surface-alt`; press darkens to `--color-border`. Focus same indigo ring.
- **Links**: hover underlines (was no underline), no color change.
- **Rows in the column table**: hover sets background to `--color-surface-alt`. No row affordance for click — the table is read-only.

### Borders, radii, shadows
- **Borders**: 1px hairlines. `--color-border` for default surfaces; `--color-border-strong` only where a control needs to read as "input". Dropzone uses a 2px **dashed** border in `--color-border-dashed`, which becomes solid indigo on dragover.
- **Radii**: `4` (badges, tags), `8` (buttons, inputs, table cells), `12` (cards), `16` (the dropzone). `999px` pills are used **only** for type badges and the active-step pill.
- **Shadows**: kept low-key because the background is white and we don't want UI to feel floaty. Cards use `shadow-sm` at rest, `shadow-md` when interactive (the file-preview card after pick). The full `shadow-lg` is reserved for the focus-trap modal pattern — currently unused in MVP.
- **No protection gradients.** Text always sits on a solid white card; we never need to fade content under an overlay.

### Transparency, blur
- Not used. The white surface is opaque. No `backdrop-filter`, no glass effects. The brand is *not* glassmorphic.

### Cards
A card is `background: white` + `1px solid var(--color-border)` + `border-radius: 12px` + `padding: 16–24px` + optional `shadow-sm`. The card is the **only** way we group content; we never use background tinting for grouping.

### Layout rules
- Single 800px content column, centered. Page gutters 24px.
- The report header is sticky (`position: sticky; top: 0`) with a 1px bottom border that appears only when scrolled past zero.
- No fixed sidebars. No fixed footer. No nav chrome — there is exactly one screen at a time.

### Iconography
Sparse to none. See the **ICONOGRAPHY** section below.

---

## ICONOGRAPHY

**Default stance: don't use icons.** Auto EDA is dense, short, and Korean-first; labels do the work. Where a glyph is genuinely useful, we use **Lucide** at a 1.5px stroke, currentColor stroke, no fill — picked because its visual weight matches Pretendard's medium grade.

The repo ships no icons of its own, so every icon below is a CDN reference, not an asset we host. **This is a flagged substitution** — if Auto EDA later commissions a custom set, replace the Lucide imports and update this section.

**Where icons appear in the product:**

| Place | Icon | Notes |
|---|---|---|
| Dropzone primary glyph (idle) | `upload-cloud` | Centered above the dropzone copy. The single decorative glyph in the product. |
| Step indicator (analyzing) | `circle` (idle) / `check` (done) / a pure-CSS spinner (active) | The "active" state is the spinner, not an icon. |
| Type badges | none | Korean labels (`수치형` etc.) are short enough — icons would steal weight from the color signal. |
| Primary button (`분석 시작`) | none | Text-only. |
| Secondary buttons (`MD 다운로드`, `새 파일 분석`) | `download`, `refresh-cw` | 16px, left of label, 8px gap. |
| Errors | `alert-circle` | Inline, red, only on the upload screen. |

**Emoji**: never.
**Unicode pseudo-icons** (e.g. `→`, `·`): used sparingly as separators in microcopy (`sales_2025.csv · 2.4 MB`).
**Brand mark**: a wordmark, not a logotype — `Auto EDA` set in Pretendard 600. The wordmark sits in the top-left at 15px and is the only branding on the page. See `assets/wordmark.svg` for the SVG version.

**Substitution flag:** Lucide is the closest off-the-shelf match to the brand's understated, hairline character. If you have a different opinion, swap it — the contract is just "1.5px stroke, currentColor, no fill, ~16px optical size."

---

## Font substitution note

The brand stack prefers **Pretendard**. Pretendard is open-source (OFL) but is not bundled into this design system because it's large (~3MB across weights) and CDN-served versions are stable. The product loads it from [cdn.jsdelivr.net/gh/orioncactus/pretendard](https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css) in the UI kit `index.html`. If you need a self-hosted version, drop the woff2 files into `fonts/` and adjust `--font-sans`. The fallback chain (`Apple SD Gothic Neo`, `Noto Sans KR`, `Malgun Gothic`) covers every major Korean OS — the system degrades gracefully if Pretendard fails to load.

> **Ask for the user:** if Auto EDA has a preferred type house or licensed Korean type face (e.g. SsangYong Bold, Sandoll Gothic, etc.), point us at it and we'll swap the stack.

---

## SKILL.md

See `SKILL.md` for the agent-skill manifest. Drop the whole folder into a Skills directory to consume it from Claude Code.
