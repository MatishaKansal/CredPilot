from pydantic import BaseModel

class RegisterRequest(BaseModel):
    fullName: str
    email: str
    phone: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str
    role: str