# Auto EDA — 프로젝트 기획서 초안

**작성일** 2026-05-25 | **버전** v0.2

---

## 1. 프로젝트 개요

CSV 파일을 업로드하면 Claude API가 자동으로 탐색적 데이터 분석(EDA)을 수행하고, 사람이 읽을 수 있는 인사이트 리포트를 생성하는 웹 앱.

---

## 2. 기술 스택

| 항목 | 내용 |
|------|------|
| 개발 도구 | Claude Code |
| 런타임 | Python 3.11+ |
| 웹 서버 | FastAPI + Uvicorn |
| 프론트엔드 | HTML/CSS/JS (정적 파일, 프레임워크 없음) |
| AI | Anthropic Claude API (claude-sonnet-4) |
| 데이터 처리 | pandas, numpy |
| 패키지 관리 | uv |

---

## 3. 입력 파일 사양

| 항목 | 내용 |
|------|------|
| 지원 형식 | `.csv` |
| 인코딩 | UTF-8, EUC-KR 자동 감지 |
| 최대 파일 크기 | 50MB |
| 구분자 | 쉼표(,) 기본, 자동 감지 지원 |

---

## 4. 출력물 형식

**메인 리포트 (웹 화면 표시)**
- 데이터 개요: 행/열 수, 결측률, 메모리 사용량
- 컬럼별 요약: 수치형(min/max/mean/std), 범주형(유니크 수/상위 빈도)
- AI 인사이트: 데이터 성격 추론, 이상값, 품질 이슈, 다음 분석 단계 제안

**다운로드 (선택)**
- `report.md` — 마크다운 리포트

---

## 5. API 설계

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/` | 웹 UI 서빙 |
| POST | `/upload` | CSV 업로드 및 기초 통계 반환 |
| POST | `/analyze` | Claude API 호출 → EDA 리포트 반환 |
| GET | `/download/report` | 마크다운 리포트 다운로드 |

---

## 6. 핵심 기능 범위 (MVP)

1. CSV 업로드 및 파싱
2. 컬럼 타입 자동 분류 (수치형 / 범주형 / 날짜형)
3. 기초 통계 자동 계산
4. Claude API 호출 → 한국어 EDA 리포트 생성
5. 리포트 화면 표시 및 마크다운 다운로드

**MVP 제외 (추후)**
- Excel(.xlsx) 입력 지원
- 시각화 차트 자동 생성
- 다중 파일 비교 분석

---

## 7. 디렉토리 구조 (예상)

```
auto-eda/
├── main.py              # FastAPI 앱 진입점, 라우터 정의
├── analyzer.py          # pandas 기반 통계 계산
├── claude_client.py     # Claude API 호출 및 프롬프트 관리
├── static/
│   ├── index.html       # 웹 UI
│   ├── style.css
│   └── app.js           # fetch API로 백엔드 호출
├── pyproject.toml
└── .env                 # ANTHROPIC_API_KEY
```

---

## 8. 개발 순서

1. FastAPI 프로젝트 세팅 (`pyproject.toml`, `.env`)
2. `analyzer.py` — CSV 파싱 + 통계 계산 로직
3. `main.py` — `/upload`, `/analyze` 엔드포인트 구현
4. `claude_client.py` — API 연동 + 프롬프트 작성
5. `static/` — HTML/JS UI 구현 (fetch로 API 연동)
6. 통합 테스트 (샘플 CSV 3종 이상)