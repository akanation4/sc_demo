from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from models import TextItem
from embedding import embed
from detection import detect
from pydub import AudioSegment

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

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.head("/")
def read_root_head():
    return {"Hello": "World"}

@app.post("/embed")
def get_embed_wav(item: TextItem):
    try:
        filepath = embed(item.text)
        return FileResponse(path=filepath, media_type="audio/wav", filename="stego.wav")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/detect")
async def get_detect_text(file: UploadFile = File(...)):
    temp_file_path = "wav/original"    
    file_path = "wav/recording.wav"
    
    with open(temp_file_path, "wb+") as file_object:
       file_object.write(await file.read())

    try:
        sound = AudioSegment.from_file(temp_file_path)
        sound.expoer(file_path, format="wav")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ファイルの変換に失敗しました: {str(e)}")

    try:
        text = detect(file_path)
        return JSONResponse(status_code=200, content={"detected": text})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
    