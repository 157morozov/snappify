import os
from dotenv import load_dotenv
from fastapi import FastAPI
import uvicorn

load_dotenv()

app: FastAPI = FastAPI()


uvicorn.run(
    app,
    host=os.getenv("HOST"),
    port=int(os.getenv("PORT"))
)
