from typing import Optional

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


class StaffCreateRequest(BaseModel):
    fullName: str
    email: str
    phone: str
    password: str
    role: str
    address: str
    city: str
    state: str
    pincode: str


class StaffUpdateRequest(BaseModel):
    fullName: str
    role: str
    address: Optional[str] = ""
    city: Optional[str] = ""
    state: Optional[str] = ""
    pincode: Optional[str] = ""


class CustomerAssignmentRequest(BaseModel):
    employeeId: str
