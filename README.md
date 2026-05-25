# Auto EDA

CSV 파일을 업로드하면 Gemini AI가 자동으로 탐색적 데이터 분석(EDA)을 수행하고, 한국어 인사이트 리포트를 생성하는 웹앱.

## 기술 스택

| 항목 | 내용 |
|------|------|
| 런타임 | Python 3.11+ |
| 웹 서버 | FastAPI + Uvicorn |
| 프론트엔드 | HTML / CSS / JS (프레임워크 없음) |
| AI | Google Gemini API (`gemini-2.0-flash`) |
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

## 주요 기능

- CSV 업로드 (드래그&드롭, UTF-8 / EUC-KR 자동 감지, 최대 50MB)
- 컬럼 타입 자동 분류 (수치형 / 범주형 / 날짜형)
- 기초 통계 자동 계산 (행/열 수, 결측률, min/max/mean 등)
- Gemini AI → 한국어 EDA 리포트 생성
- 리포트 마크다운 다운로드

## 프로젝트 구조

```
auto-eda/
├── main.py              # FastAPI 앱 진입점
├── analyzer.py          # CSV 파싱 및 통계 계산
├── gemini_client.py     # Gemini API 호출 및 프롬프트 관리
├── static/
│   ├── index.html
│   ├── style.css
│   └── app.js
├── pyproject.toml
└── .env.example
```

## API

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/` | 웹 UI 서빙 |
| POST | `/upload` | CSV 업로드 및 기초 통계 반환 |
| POST | `/analyze` | Gemini API 호출 → EDA 리포트 반환 |
