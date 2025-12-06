from fastapi import Depends, FastAPI, HTTPException
from src.utils import create_internal_token, verify_google_token

app = FastAPI()


@app.post("/login")
async def login(user=Depends(verify_google_token)):
    if user is None:
        raise HTTPException(status_code=401, detail="Invalid Google token")
    expire, token = create_internal_token(user)

    return {"token": token, "expire": expire}
