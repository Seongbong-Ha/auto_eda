# Auto EDA

CSV 파일을 업로드하면 Gemini AI가 자동으로 EDA 리포트를 생성하고, 데이터에 대해 **대화형으로 분석**할 수 있는 AI Agent 웹앱.

## 주요 기능

- CSV 업로드 (드래그&드롭, UTF-8 / EUC-KR 자동 감지, 최대 50MB)
- 컬럼 타입 자동 분류 (수치형 / 범주형 / 날짜형)
- 기초 통계 자동 계산 및 한국어 EDA 리포트 생성
- **AI Agent 채팅** — 리포트 생성 후 데이터에 대해 자유롭게 질문
  - 기초 통계 조회, 이상값 탐지, 상관관계 분석
  - 조건 필터링, 컬럼 분포 확인
  - Gemini Function Calling 기반 멀티턴 대화

## 기술 스택

| 항목 | 내용 |
|------|------|
| 런타임 | Python 3.11+ |
| 웹 서버 | FastAPI + Uvicorn |
| 프론트엔드 | HTML / CSS / JS (프레임워크 없음) |
| AI | Google Gemini API (`gemini-2.5-flash`) |
| 데이터 처리 | pandas, numpy |
| 패키지 관리 | uv |

## 시작하기

**1. 저장소 클론**

```bash
git clone https://github.com/Seongbong-Ha/auto_eda.git
cd auto_eda
```

**2. 의존성 설치**

```bash
uv sync
```

**3. 환경변수 설정**

```bash
cp .env.example .env
# .env 파일에 GEMINI_API_KEY 입력
```

> Gemini API 키는 [Google AI Studio](https://aistudio.google.com)에서 무료로 발급받을 수 있습니다.

**4. 서버 실행**

```bash
uv run uvicorn main:app --reload
```

브라우저에서 `http://localhost:8000` 접속

## 사용 흐름

```
CSV 업로드 → 기초 통계 계산 → Gemini EDA 리포트 생성 → 채팅으로 추가 분석
```

리포트 화면 하단의 채팅창에서 데이터에 대해 자유롭게 질문할 수 있습니다.

## 프로젝트 구조

```
auto_eda/
├── main.py              # FastAPI 진입점 (/upload, /analyze, /chat)
├── analyzer.py          # CSV 파싱 및 통계 계산
├── gemini_client.py     # Gemini API 단발 호출 (EDA 리포트)
├── agent/
│   ├── loop.py          # Function Calling 에이전트 루프
│   ├── tools.py         # 분석 도구 정의 및 Gemini 스키마
│   ├── session.py       # 세션 관리 (DataFrame + 대화 히스토리)
│   └── prompts.py       # 시스템 프롬프트
├── static/
│   ├── index.html
│   ├── style.css
│   └── js/
│       ├── app.js
│       ├── api.js
│       ├── store.js
│       └── components/
│           ├── upload.js
│           ├── analyzing.js
│           ├── report.js
│           └── chat.js
├── pyproject.toml
└── .env.example
```

## API

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/` | 웹 UI 서빙 |
| POST | `/upload` | CSV 업로드 → 통계 + session_id 반환 |
| POST | `/analyze` | Gemini API → EDA 리포트 반환 |
| POST | `/chat` | Agent 채팅 (`session_id`, `message` 필요) |
