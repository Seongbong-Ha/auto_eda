import json
import os

from dotenv import load_dotenv
from google import genai
from google.genai import types
from google.genai.errors import APIError

from agent.prompts import SYSTEM_PROMPT
from agent.session import get_history, update_history
from agent.tools import TOOL_DECLARATIONS, call_tool

load_dotenv()

MODEL = "gemini-2.5-flash"


def _get_client() -> genai.Client:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY 환경 변수가 설정되지 않았습니다.")
    return genai.Client(api_key=api_key)


def run_agent(session_id: str, user_message: str) -> str:
    """사용자 메시지를 받아 Function Calling 루프를 실행하고 최종 응답 텍스트를 반환합니다."""
    history = get_history(session_id)
    if history is None:
        raise ValueError(f"세션을 찾을 수 없습니다: {session_id}")

    client = _get_client()
    contents = history + [types.Content(role="user", parts=[types.Part(text=user_message)])]

    try:
        while True:
            response = client.models.generate_content(
                model=MODEL,
                contents=contents,
                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_PROMPT,
                    tools=[TOOL_DECLARATIONS],
                    temperature=0.2,
                ),
            )

            model_content = response.candidates[0].content
            function_calls = [p.function_call for p in model_content.parts if p.function_call is not None]

            if not function_calls:
                # 최종 텍스트 응답 — 히스토리 저장 후 반환
                contents.append(model_content)
                update_history(session_id, contents)
                return response.text

            # 도구 실행
            tool_result_parts = []
            for fc in function_calls:
                result_json = call_tool(session_id, fc.name, dict(fc.args))
                tool_result_parts.append(
                    types.Part(
                        function_response=types.FunctionResponse(
                            name=fc.name,
                            response=json.loads(result_json),
                        )
                    )
                )

            # model의 function_call + tool 결과를 대화에 추가하고 재호출
            contents.append(model_content)
            contents.append(types.Content(role="user", parts=tool_result_parts))

    except APIError as e:
        raise RuntimeError(f"Gemini API 오류: {e.message}")
    except Exception as e:
        raise RuntimeError(f"에이전트 실행 중 오류: {str(e)}")
