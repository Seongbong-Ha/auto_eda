# Auto EDA — Web UI Kit

The single product surface for Auto EDA. Three screens, one page.

## Screens

1. **Upload** (`idle` / `ready`) — `Dropzone.jsx` + `Header.jsx`. The user drags in a CSV (or picks one). A `file-card` preview appears with name + size. A centered `분석 시작` button kicks off the flow.
2. **Analyzing** — `StepIndicator.jsx`. A large indigo spinner sits above the text `Claude가 데이터를 분석하고 있습니다…`. A three-pill step indicator walks `업로드 → 통계 계산 → AI 분석` on a timer, simulating the backend.
3. **Report** — `Report.jsx`. Sticky header gets `MD 다운로드` + `새 파일 분석`. Body has four overview stat cards, a column-summary table with type badges, and an AI-written insights block rendered from HTML (Markdown in the real product).

## Components

| File | What it ships |
|---|---|
| `App.jsx` | Top-level screen state machine. Owns `screen`, `file`, `stepId`. |
| `Header.jsx` | Sticky page header with wordmark + conditional report actions. Exports `Button`. |
| `Dropzone.jsx` | Drag-and-drop with two states (idle, dragover) + click-to-pick. Exports `formatBytes`. |
| `StepIndicator.jsx` | Three-step pill component + the full `Analyzing` screen. |
| `Report.jsx` | `TypeBadge`, `StatCard`, `OverviewGrid`, `ColumnTable`. |
| `Icons.jsx` | Inline Lucide-style icons (`UploadCloud`, `FileText`, `X`, `Check`, `Download`, `RefreshCw`). **Substitution flagged** — these are hand-traced from Lucide. Swap for the real Lucide CDN if preferred. |
| `sampleReport.jsx` | Fixture: a realistic Korean sales-data report so the click-thru shows real content. |
| `styles.css` | Layout-only — tokens come from `colors_and_type.css`. |

## Interactions in the clickthrough

- Drop or pick a CSV → file preview appears, `분석 시작` button enables.
- Or click a sample chip (`sales_2025.csv` / `users_q1.csv` / `traffic.csv`) to skip the picker.
- `분석 시작` → 3.6s simulated analysis with stepped progress.
- Report renders. `MD 다운로드` actually generates a Markdown file from the fixture and triggers a real download. `새 파일 분석` resets to the upload screen.

## What's not implemented (intentionally)

- Real CSV parsing or upload — this is a UI kit, not the backend. `analyzer.py` in the source repo does the real work.
- Error states beyond the design tokens for `--color-danger`. The product's only canonical error (`지원하지 않는 인코딩이거나 올바른 CSV 파일이 아닙니다.`) is documented in `README.md` but not surfaced in the click-thru.
- Auth, settings, history. The product has none of these.

## Substitutions flagged

- **Pretendard** font is CDN-loaded from jsDelivr. Self-host if you ship to production.
- **Icons** are Lucide-style hand-traces, not the canonical Lucide package. Swap for `lucide@latest` via npm or CDN if the team wants pixel-identity with Lucide.
