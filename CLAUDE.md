# Auto EDA — CLAUDE.md

## 프로젝트 개요

CSV 파일을 업로드하면 Claude API가 자동으로 EDA를 수행하고 한국어 인사이트 리포트를 생성하는 웹앱.

## 기술 스택

- **런타임:** Python 3.11+
- **웹 서버:** FastAPI + Uvicorn
- **프론트엔드:** HTML/CSS/JS (프레임워크 없음)
- **AI:** Anthropic Claude API (`claude-sonnet-4-5`)
- **데이터 처리:** pandas, numpy
- **패키지 관리:** uv

## 디렉토리 구조

```
auto-eda/
├── main.py              # FastAPI 앱 진입점, 라우터 정의
├── analyzer.py          # pandas 기반 통계 계산
├── claude_client.py     # Claude API 호출 및 프롬프트 관리
├── static/
│   ├── index.html
│   ├── style.css
│   └── app.js
├── pyproject.toml
├── .env                 # ANTHROPIC_API_KEY (커밋 금지)
└── .env.example         # 환경변수 템플릿
```

## 개발 명령어

```bash
# 의존성 설치
uv sync

# 개발 서버 실행
uv run uvicorn main:app --reload

# 패키지 추가
uv add <package>
```

## API 엔드포인트

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/` | 웹 UI 서빙 |
| POST | `/upload` | CSV 업로드 및 기초 통계 반환 |
| POST | `/analyze` | Claude API 호출 → EDA 리포트 반환 |
| GET | `/download/report` | 마크다운 리포트 다운로드 |

## 주요 규칙

- 응답 언어: **한국어**
- CSV 업로드 파일은 `uploads/` 디렉토리에 임시 저장 (gitignore 처리됨)
- 생성된 리포트는 `reports/` 디렉토리에 저장 (gitignore 처리됨)
- `.env`는 절대 커밋하지 않음

## MVP 범위

- CSV 업로드 및 파싱 (UTF-8, EUC-KR 자동 감지, 최대 50MB)
- 컬럼 타입 자동 분류 (수치형 / 범주형 / 날짜형)
- 기초 통계 자동 계산
- Claude API → 한국어 EDA 리포트 생성
- 리포트 화면 표시 및 마크다운 다운로드


# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.