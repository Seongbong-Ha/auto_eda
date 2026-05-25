import json

import numpy as np
import pandas as pd
from google.genai import types

from agent.session import get_session


def _get_df(session_id: str) -> pd.DataFrame:
    df = get_session(session_id)
    if df is None:
        raise ValueError(f"세션을 찾을 수 없습니다: {session_id}")
    return df


def _safe_float(value) -> float | None:
    if value is None or (isinstance(value, float) and np.isnan(value)):
        return None
    return round(float(value), 4)


# ── Tool implementations ────────────────────────────────────────────────────


def compute_basic_stats(session_id: str, columns: list[str] | None = None) -> dict:
    df = _get_df(session_id)
    if columns:
        missing = [c for c in columns if c not in df.columns]
        if missing:
            return {"error": f"존재하지 않는 컬럼: {missing}"}
        df = df[columns]

    result = {}
    for col in df.columns:
        s = df[col]
        if pd.api.types.is_numeric_dtype(s):
            result[col] = {
                "type": "numeric",
                "min": _safe_float(s.min()),
                "max": _safe_float(s.max()),
                "mean": _safe_float(s.mean()),
                "std": _safe_float(s.std()),
                "median": _safe_float(s.median()),
                "missing": int(s.isna().sum()),
            }
        elif pd.api.types.is_datetime64_any_dtype(s):
            result[col] = {
                "type": "datetime",
                "min": str(s.min()),
                "max": str(s.max()),
                "missing": int(s.isna().sum()),
            }
        else:
            result[col] = {
                "type": "categorical",
                "unique": int(s.nunique()),
                "top": [str(v) for v in s.value_counts().head(5).index.tolist()],
                "missing": int(s.isna().sum()),
            }
    return result


def detect_outliers(session_id: str, column: str, method: str = "iqr") -> dict:
    df = _get_df(session_id)
    if column not in df.columns:
        return {"error": f"컬럼 '{column}'이 존재하지 않습니다."}

    s = df[column].dropna()
    if not pd.api.types.is_numeric_dtype(s):
        return {"error": f"'{column}'은 수치형 컬럼이 아닙니다."}

    if method == "iqr":
        q1, q3 = s.quantile(0.25), s.quantile(0.75)
        iqr = q3 - q1
        mask = (s < q1 - 1.5 * iqr) | (s > q3 + 1.5 * iqr)
    elif method == "zscore":
        z = (s - s.mean()) / s.std()
        mask = z.abs() > 3
    else:
        return {"error": f"지원하지 않는 method: {method} (iqr 또는 zscore)"}

    outliers = s[mask]
    return {
        "column": column,
        "method": method,
        "count": int(outliers.count()),
        "ratio": round(len(outliers) / len(s), 4),
        "values": outliers.head(20).tolist(),
    }


def compute_correlation(session_id: str, columns: list[str] | None = None) -> dict:
    df = _get_df(session_id)
    numeric_df = df.select_dtypes(include="number")

    if columns:
        missing = [c for c in columns if c not in df.columns]
        if missing:
            return {"error": f"존재하지 않는 컬럼: {missing}"}
        non_numeric = [c for c in columns if c not in numeric_df.columns]
        if non_numeric:
            return {"error": f"수치형이 아닌 컬럼: {non_numeric}"}
        numeric_df = numeric_df[columns]

    if numeric_df.shape[1] < 2:
        return {"error": "상관관계 계산에는 수치형 컬럼이 2개 이상 필요합니다."}

    return numeric_df.corr().round(4).to_dict()


def filter_data(session_id: str, column: str, operator: str, value: str) -> dict:
    df = _get_df(session_id)
    if column not in df.columns:
        return {"error": f"컬럼 '{column}'이 존재하지 않습니다."}

    s = df[column]
    _ops = {">": "__gt__", "<": "__lt__", ">=": "__ge__", "<=": "__le__", "==": "__eq__", "!=": "__ne__"}

    try:
        if operator == "contains":
            mask = s.astype(str).str.contains(str(value), na=False)
        elif operator in _ops:
            cmp_value = float(value) if pd.api.types.is_numeric_dtype(s) else value
            mask = getattr(s, _ops[operator])(cmp_value)
        else:
            return {"error": f"지원하지 않는 연산자: {operator}"}
    except Exception as e:
        return {"error": f"필터 적용 실패: {str(e)}"}

    filtered = df[mask]
    return {
        "matched_rows": int(filtered.shape[0]),
        "total_rows": int(df.shape[0]),
        "ratio": round(filtered.shape[0] / df.shape[0], 4),
        "sample": filtered.head(5).to_dict(orient="records"),
    }


def get_column_distribution(session_id: str, column: str) -> dict:
    df = _get_df(session_id)
    if column not in df.columns:
        return {"error": f"컬럼 '{column}'이 존재하지 않습니다."}

    s = df[column].dropna()

    if pd.api.types.is_numeric_dtype(s):
        counts, edges = np.histogram(s, bins=10)
        return {
            "type": "numeric",
            "histogram": {
                "bins": [round(float(e), 4) for e in edges],
                "counts": counts.tolist(),
            },
        }
    if pd.api.types.is_datetime64_any_dtype(s):
        monthly = s.dt.to_period("M").value_counts().sort_index()
        return {
            "type": "datetime",
            "monthly_counts": {str(k): int(v) for k, v in monthly.items()},
        }

    vc = s.value_counts().head(20)
    return {
        "type": "categorical",
        "distribution": [
            {"value": str(k), "count": int(v), "ratio": round(v / len(s), 4)}
            for k, v in vc.items()
        ],
    }


# ── Dispatch ────────────────────────────────────────────────────────────────

_TOOL_FUNCTIONS = {
    "compute_basic_stats": compute_basic_stats,
    "detect_outliers": detect_outliers,
    "compute_correlation": compute_correlation,
    "filter_data": filter_data,
    "get_column_distribution": get_column_distribution,
}


def call_tool(session_id: str, name: str, args: dict) -> str:
    fn = _TOOL_FUNCTIONS.get(name)
    if fn is None:
        return json.dumps({"error": f"알 수 없는 도구: {name}"}, ensure_ascii=False)
    result = fn(session_id=session_id, **args)
    return json.dumps(result, ensure_ascii=False, default=str)


# ── Gemini Function Declarations ────────────────────────────────────────────

TOOL_DECLARATIONS = types.Tool(
    function_declarations=[
        types.FunctionDeclaration(
            name="compute_basic_stats",
            description="지정한 컬럼들의 기초 통계(min/max/mean/std/median/missing)를 계산합니다. columns를 생략하면 전체 컬럼을 분석합니다.",
            parameters=types.Schema(
                type=types.Type.OBJECT,
                properties={
                    "columns": types.Schema(
                        type=types.Type.ARRAY,
                        items=types.Schema(type=types.Type.STRING),
                        description="분석할 컬럼 이름 목록. 생략 시 전체 컬럼.",
                    ),
                },
            ),
        ),
        types.FunctionDeclaration(
            name="detect_outliers",
            description="수치형 컬럼에서 이상값을 탐지합니다.",
            parameters=types.Schema(
                type=types.Type.OBJECT,
                properties={
                    "column": types.Schema(type=types.Type.STRING, description="분석할 컬럼 이름"),
                    "method": types.Schema(
                        type=types.Type.STRING,
                        description="탐지 방법: 'iqr' (기본값) 또는 'zscore'",
                    ),
                },
                required=["column"],
            ),
        ),
        types.FunctionDeclaration(
            name="compute_correlation",
            description="수치형 컬럼 간 상관관계 매트릭스를 계산합니다.",
            parameters=types.Schema(
                type=types.Type.OBJECT,
                properties={
                    "columns": types.Schema(
                        type=types.Type.ARRAY,
                        items=types.Schema(type=types.Type.STRING),
                        description="상관관계를 계산할 컬럼 목록. 생략 시 전체 수치형 컬럼.",
                    ),
                },
            ),
        ),
        types.FunctionDeclaration(
            name="filter_data",
            description="조건으로 데이터를 필터링하고 결과 행 수와 샘플을 반환합니다.",
            parameters=types.Schema(
                type=types.Type.OBJECT,
                properties={
                    "column": types.Schema(type=types.Type.STRING, description="필터링 기준 컬럼"),
                    "operator": types.Schema(
                        type=types.Type.STRING,
                        description="비교 연산자: '>', '<', '>=', '<=', '==', '!=', 'contains'",
                    ),
                    "value": types.Schema(type=types.Type.STRING, description="비교 기준값"),
                },
                required=["column", "operator", "value"],
            ),
        ),
        types.FunctionDeclaration(
            name="get_column_distribution",
            description="컬럼의 분포를 반환합니다. 수치형은 히스토그램 bins/counts, 범주형은 값별 빈도를 반환합니다.",
            parameters=types.Schema(
                type=types.Type.OBJECT,
                properties={
                    "column": types.Schema(type=types.Type.STRING, description="분포를 확인할 컬럼 이름"),
                },
                required=["column"],
            ),
        ),
    ]
)
