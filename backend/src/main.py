from fastapi import FastAPI
from routes import buckets, oauth

app = FastAPI()

app.include_router(buckets.router)
app.include_router(oauth.router)
