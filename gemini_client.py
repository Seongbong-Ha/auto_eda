import json
import os

from dotenv import load_dotenv
from google import genai

load_dotenv()

_client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
MODEL = "gemini-2.5-flash"


def generate_eda_report(filename: str, stats: dict) -> str:
    prompt = _build_prompt(filename, stats)
    response = _client.models.generate_content(model=MODEL, contents=prompt)
    return response.text


def _build_prompt(filename: str, stats: dict) -> str:
    overview = stats["overview"]
    columns  = stats["columns"]

    col_lines = []
    for name, col in columns.items():
        s = col["stats"]
        if col["type"] == "numeric":
            detail = f"min={s['min']}, max={s['max']}, mean={s['mean']}, std={s['std']}, 결측={s['missing']}"
        elif col["type"] == "categorical":
            detail = f"유니크={s['unique']}, 상위값={s['top']}, 결측={s['missing']}"
        else:
            detail = f"범위={s['min']} ~ {s['max']}, 결측={s['missing']}"
        col_lines.append(f"- {name} ({col['type']}): {detail}")

    col_summary = "\n".join(col_lines)

    return f"""당신은 데이터 분석 전문가입니다. 아래 CSV 데이터 통계를 바탕으로 한국어로 EDA 인사이트 리포트를 작성해 주세요.

## 데이터 개요
- 파일명: {filename}
- 행 수: {overview['rows']:,}
- 열 수: {overview['columns']}
- 결측률: {overview['missing_rate'] * 100:.1f}%
- 메모리: {overview['memory_mb']} MB

## 컬럼별 통계
{col_summary}

## 작성 지침
- 마크다운 형식으로 작성
- 다음 4개 섹션을 포함할 것:
  1. ### 데이터 성격 — 이 데이터가 무엇을 담고 있는지 추론
  2. ### 주요 발견 — 눈에 띄는 패턴, 분포, 특이사항
  3. ### 품질 이슈 — 결측값, 이상값, 데이터 타입 문제
  4. ### 다음 분석 단계 — 구체적인 후속 분석 제안
- 간결하고 실용적으로 작성 (섹션당 3~5문장 또는 불릿 포인트)
- 불필요한 인사말이나 맺음말 없이 리포트 본문만 작성
"""
