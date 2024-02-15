from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from models import TextItem
from embedding import embed


app = FastAPI()

origins = [
    "http://localhost:3000",
    "https://sc-demo-lovat.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/modify")
def modify_text(item: TextItem):
    return {"Hello": f"{item.text}!"}

@app.post("/embed")
def get_embed_wav(item: TextItem):
    try:
        filepath = embed(item.text)
        return FileResponse(path=filepath, media_type="audio/wav", filename="stego.wav")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))