from fastapi import FastAPI
from routes import buckets, oauth

app = FastAPI()
v1 = FastAPI()

v1.include_router(buckets.router)
v1.include_router(oauth.router)

app.mount("/api/v1", v1)
