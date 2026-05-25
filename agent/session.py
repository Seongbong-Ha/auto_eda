import uuid

import pandas as pd

_sessions: dict[str, dict] = {}


def create_session(df: pd.DataFrame) -> str:
    session_id = str(uuid.uuid4())
    _sessions[session_id] = {"df": df, "history": []}
    return session_id


def get_session(session_id: str) -> pd.DataFrame | None:
    session = _sessions.get(session_id)
    return session["df"] if session else None


def get_history(session_id: str) -> list | None:
    session = _sessions.get(session_id)
    return session["history"] if session else None


def update_history(session_id: str, history: list) -> None:
    if session_id in _sessions:
        _sessions[session_id]["history"] = history


def delete_session(session_id: str) -> None:
    _sessions.pop(session_id, None)
