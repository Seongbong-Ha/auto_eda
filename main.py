from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from analyzer import compute_stats
from gemini_client import generate_eda_report

app = FastAPI(title="Auto EDA")

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
    return {"filename": file.filename, "stats": stats}


@app.post("/analyze")
async def analyze(body: dict):
    try:
        report_md = generate_eda_report(body["filename"], body["stats"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return {"report_md": report_md}
