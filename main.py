from fastapi import FastAPI

app = FastAPI(title="Auto EDA")


@app.get("/")
def root():
    return {"status": "ok", "message": "Auto EDA 서버 정상 작동 중"}
