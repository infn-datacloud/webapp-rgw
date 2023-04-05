from typing import Union
from fastapi import FastAPI
from routes import buckets

app = FastAPI()

app.include_router(buckets.router)
