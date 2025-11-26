import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)


@app.post("/generate-caption/")
async def generate_caption(request: Request):
    data = await request.json()
    prompt = data.get("prompt", "")
    model = genai.GenerativeModel('gemini-pro-latest')
    response = model.generate_content(prompt)
    return { "caption": response.text }
