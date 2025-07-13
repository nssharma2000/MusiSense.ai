from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import APIRouter
from routes import recommendations
from pydantic import BaseModel
from pathlib import Path
from dotenv import load_dotenv
import os

load_dotenv()

frontend_url = os.getenv("REACT_FRONTEND_URL")


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

router = APIRouter()

@router.api_route("/ping", methods=["GET", "HEAD"])
def ping():
    return {"message": "pong"}


app.include_router(recommendations.router)
app.include_router(router)

