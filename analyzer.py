import csv
import io

import numpy as np
import pandas as pd


def parse_csv(file_bytes: bytes) -> pd.DataFrame:
    for encoding in ("utf-8", "euc-kr", "cp949"):
        try:
            text = file_bytes.decode(encoding)
        except UnicodeDecodeError:
            continue
            
        # 1차 시도: csv.Sniffer를 이용한 구분자 및 형식 감지
        try:
            dialect = csv.Sniffer().sniff(text[:4096], delimiters=",;\t|")
            return pd.read_csv(io.StringIO(text), dialect=dialect)
        except csv.Error:
            # 2차 시도: Sniffer 실패 시 pandas 엔진의 자동 구분자 감지 또는 기본 쉼표 폴백
            try:
                return pd.read_csv(io.StringIO(text), sep=None, engine="python")
            except Exception:
                try:
                    return pd.read_csv(io.StringIO(text), sep=",")
                except Exception:
                    continue
    raise ValueError("지원하지 않는 인코딩이거나 올바른 CSV 파일이 아닙니다.")


def _classify_column(series: pd.Series) -> str:
    if pd.api.types.is_numeric_dtype(series):
        return "numeric"
    if pd.api.types.is_datetime64_any_dtype(series):
        return "datetime"
    # 문자열 컬럼 중 날짜 패턴 감지 (샘플 20개)
    sample = series.dropna().head(20).astype(str)
    if sample.empty:
        return "categorical"
        
    # 단순 숫자로만 구성되었거나 연도 형태(4자리 이하)의 단순 값은 날짜 판정에서 제외 (오탐지 방지)
    # 예: ID "100234", 연도 "2025" 등
    is_pure_digit = sample.str.match(r"^\d+$").all()
    if is_pure_digit:
        return "categorical"
        
    try:
        pd.to_datetime(sample, format="mixed")
        return "datetime"
    except (ValueError, TypeError):
        pass
    return "categorical"


def compute_stats(file_bytes: bytes) -> tuple[dict, pd.DataFrame]:
    df = parse_csv(file_bytes)

    # 날짜형으로 분류된 컬럼은 변환 시도
    col_types = {}
    for col in df.columns:
        col_type = _classify_column(df[col])
        if col_type == "datetime":
            try:
                df[col] = pd.to_datetime(df[col], format="mixed")
            except (ValueError, TypeError):
                col_type = "categorical"
        col_types[col] = col_type

    total_cells = df.size
    missing_cells = int(df.isna().sum().sum())

    overview = {
        "rows": len(df),
        "columns": len(df.columns),
        "missing_rate": round(missing_cells / total_cells, 4) if total_cells else 0,
        "memory_mb": round(df.memory_usage(deep=True).sum() / 1024 / 1024, 3),
    }

    columns = {}
    for col, col_type in col_types.items():
        series = df[col]
        missing_count = int(series.isna().sum())

        if col_type == "numeric":
            stats = {
                "min": _safe_float(series.min()),
                "max": _safe_float(series.max()),
                "mean": _safe_float(series.mean()),
                "std": _safe_float(series.std()),
                "missing": missing_count,
            }
        elif col_type == "datetime":
            stats = {
                "min": str(series.min()),
                "max": str(series.max()),
                "missing": missing_count,
            }
        else:
            top = series.value_counts().head(3).index.tolist()
            stats = {
                "unique": int(series.nunique()),
                "top": [str(v) for v in top],
                "missing": missing_count,
            }

        columns[col] = {"type": col_type, "stats": stats}

    return {"overview": overview, "columns": columns}, df


def _safe_float(value) -> float | None:
    if value is None or (isinstance(value, float) and np.isnan(value)):
        return None
    return round(float(value), 4)
