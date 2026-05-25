---
name: auto-eda-design
description: Use this skill to generate well-branded interfaces and assets for Auto EDA, a Korean-language CSV→AI EDA web app, either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## Quick context

Auto EDA is a single-page, 3-step Korean-language tool: **Upload → Analyzing → Report**. White background, single indigo accent, 800px max width, system fonts (Pretendard preferred). No emoji, no gradients, no glass. Calm, procedural tone — `Claude가 데이터를 분석하고 있습니다…`.

## Files

- `README.md` — full brand, content, visual foundations, iconography.
- `colors_and_type.css` — every CSS variable. Drop into a `<link>` and you have the entire token system.
- `ui_kits/web/` — the single product surface. Three screens (Upload, Analyzing, Report) as JSX components, with an interactive `index.html`.
- `preview/` — design-system spec cards. Reference for visual concepts.
- `assets/` — wordmark and a small set of SVGs.

## Defaults when in doubt

- Korean first; English only for proper nouns, file extensions, and code.
- Indigo `#4f46e5` is the only accent. Use it for one CTA per screen.
- Cards: white + hairline `#e5e7eb` + 12px radius + `shadow-sm`.
- No exclamation marks. No emoji.
- Type badges follow the semantic palette: numeric=blue, categorical=green, datetime=violet.
