# EDA Copilot — Agent 업그레이드 기획서

**작성일** 2026-05-25 | **버전** v0.3 | **이전** auto_eda v0.2

---

## 0. 변경 요약

**v0.2 (현재)** — CSV 업로드 → 단발 EDA 리포트 생성기
**v0.3 (목표)** — CSV 업로드 → **대화형 데이터 분석 에이전트**

핵심 전환: "한 번 분석하고 끝나는 도구" → "분석가처럼 대화하며 함께 데이터를 파고드는 에이전트"

---

## 1. 프로젝트 포지셔닝

| 항목 | 내용 |
|------|------|
| 한 줄 정의 | 데이터를 업로드하면 함께 탐색해주는 AI 분석 파트너 |
| 차별점 | 단발 리포트가 아니라 **multi-turn 대화 + 도구 실행** |
| 타겟 어필 | 게임/IT 기업의 DA, DE, AX 직군 |
| 키워드 | AI Agent, Function Calling, AX, Data Analysis |

> 리네이밍 후보: `EDA Copilot` / `Data Analyst Agent` / `Insight Agent`

---

## 2. 기술 스택 (변경분)

| 항목 | v0.2 | v0.3 |
|------|------|------|
| 런타임 | Python 3.11+ | 동일 |
| 웹 서버 | FastAPI | 동일 |
| AI | Gemini 단발 호출 | **Gemini + Function Calling** |
| 세션 관리 | 없음 | **인메모리 세션** (Phase 1) → SQLite (Phase 2) |
| 시각화 | 없음 | **matplotlib → base64 PNG** |
| 프론트엔드 | 정적 HTML/JS | 동일 (채팅 UI 추가) |

---

## 3. Agent 아키텍처

```
[User]
  ↓ chat message
[FastAPI /chat endpoint]
  ↓
[Agent Loop]
  ├─ Gemini API (with tool definitions)
  ├─ Tool 호출 판단
  └─ Tool 실행 → 결과를 다시 Gemini에 전달 → 최종 응답
       │
       ├─ compute_basic_stats()
       ├─ detect_outliers()
       ├─ compute_correlation()
       ├─ generate_chart()
       ├─ filter_data()
       └─ get_column_distribution()
```

---

## 4. Agent 도구 정의 (Function Calling)

| 함수 | 설명 | 반환 |
|------|------|------|
| `compute_basic_stats(columns)` | 지정 컬럼의 기초 통계 | JSON (min/max/mean/std) |
| `detect_outliers(column, method)` | IQR/Z-score 이상값 탐지 | 인덱스 + 값 리스트 |
| `compute_correlation(columns)` | 컬럼 간 상관관계 | 상관계수 매트릭스 |
| `generate_chart(type, x, y)` | 히스토그램/산점도/박스플롯/라인 | base64 PNG |
| `filter_data(condition)` | 조건 필터링 후 통계 | 필터된 통계 |
| `get_column_distribution(col)` | 범주형 분포, 수치형 히스토그램 | JSON + 차트 |

**핵심 원칙**
- 함수는 **결정적(deterministic)** 이고 작게 — AI가 조합해서 사용
- 모든 함수는 세션의 DataFrame을 참조
- 에러는 자연어로 반환 (AI가 다음 행동 결정)

---

## 5. API 엔드포인트 (변경)

| Method | Endpoint | 설명 | 변경 |
|--------|----------|------|------|
| GET | `/` | 웹 UI | 유지 |
| POST | `/upload` | CSV 업로드 + 세션 생성 | 세션 ID 반환 추가 |
| POST | `/chat` | **대화 메시지 전송, 도구 실행** | **신규** |
| GET | `/session/{id}/history` | 대화 히스토리 | **신규** |
| POST | `/analyze` | (deprecated, 호환용 유지) | 유지 |

---

## 6. 디렉토리 구조 (변경)

```
auto-eda/
├── main.py                  # FastAPI 진입점 + /chat 라우터
├── analyzer.py              # 기존 통계 계산 (도구로 재사용)
├── agent/
│   ├── __init__.py
│   ├── loop.py              # Agent 메인 루프 (도구 호출 사이클)
│   ├── tools.py             # Function Calling 도구 정의
│   ├── session.py           # 세션 관리 (DataFrame 보관)
│   └── prompts.py           # 시스템 프롬프트
├── gemini_client.py         # Function Calling 지원으로 리팩토링
├── static/
│   ├── index.html           # 채팅 UI 추가
│   ├── chat.js              # 메시지 송수신, 차트 렌더링
│   └── style.css
└── samples/                 # 데모용 CSV (PUBG, 게임 로그 등)
```

---


## 8. 유지 vs 재작성 정리

**유지**
- `analyzer.py` 전체 로직 (도구 내부에서 그대로 호출)
- `main.py`의 `/upload`, 예외 핸들러
- `static/` 기본 레이아웃, CSS
- README, LICENSE, 환경 설정

**리팩토링**
- `gemini_client.py` → Function Calling 지원하도록 변경
- `static/index.html` → 채팅 UI로 확장

**신규**
- `agent/` 패키지 전체
- 채팅 프론트엔드 JS
- 샘플 데이터셋
