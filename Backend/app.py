from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from passlib.hash import pbkdf2_sha256

from database import supabase

from api.schemas import (
    RegisterRequest,
    LoginRequest
)

from api.utils import (
    generate_unique_id
)

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "CredPilot Backend Running"}

@app.post("/register")
def register(user: RegisterRequest):

    existing = (
        supabase
        .table("users")
        .select("email")
        .eq("email", user.email)
        .execute()
    )

    if existing.data:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    user_id = generate_unique_id("U")

    hashed_password = pbkdf2_sha256.hash(user.password)

    supabase.table("users").insert({
        "user_id": user_id,
        "full_name": user.fullName,
        "email": user.email,
        "phone": user.phone,
        "password": hashed_password,
        "role": "applicant"
    }).execute()

    return {
        "message": "Registration Successful",
        "user_id": user_id
    }

@app.post("/login")
def login(user: LoginRequest):

    result = (
        supabase
        .table("users")
        .select("*")
        .eq("email", user.email)
        .execute()
    )

    if not result.data:

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    db_user = result.data[0]

    if not pbkdf2_sha256.verify(user.password, db_user["password"]):

        raise HTTPException(
            status_code=401,
            detail="Invalid password"
        )

    if db_user["role"] != user.role:

        raise HTTPException(
            status_code=403,
            detail=f"This account is not registered as {user.role}"
        )

    return {
    "user": {
        "user_id": db_user["user_id"],
        "name": db_user["full_name"],
        "email": db_user["email"],
        "role": db_user["role"]
    },
    "token": "dummy_token"
    }