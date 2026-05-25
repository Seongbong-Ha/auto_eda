from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from starlette.requests import Request

from analyzer import compute_stats
from gemini_client import generate_eda_report

app = FastAPI(title="Auto EDA")


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": f"서버 내부 오류가 발생했습니다: {str(exc)}"},
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )


app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/")
def root():
    return FileResponse("static/index.html")


@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="CSV 파일만 지원합니다.")
    
    content = await file.read()
    if len(content) > 50 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="파일 크기가 50MB를 초과합니다.")
    
    try:
        stats = compute_stats(content)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"CSV 분석 중 오류가 발생했습니다: {str(e)}")
        
    return {"filename": file.filename, "stats": stats}


@app.post("/analyze")
async def analyze(body: dict):
    if "filename" not in body or "stats" not in body:
        raise HTTPException(status_code=400, detail="필수 분석 데이터가 누락되었습니다.")
        
    try:
        report_md = generate_eda_report(body["filename"], body["stats"])
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=502, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI 보고서 생성 중 오류가 발생했습니다: {str(e)}")
        
    return {"report_md": report_md}
