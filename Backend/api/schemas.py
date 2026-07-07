from typing import List, Optional

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


class ApplicantUpdateRequest(BaseModel):
    fullName: str
    address: Optional[str] = ""
    city: Optional[str] = ""
    state: Optional[str] = ""
    pincode: Optional[str] = ""


class ApplicationCreateRequest(BaseModel):
    fullName: str
    dateOfBirth: str
    gender: str
    maritalStatus: str
    numChildren: int = 0
    educationLevel: str
    phoneNumber: str
    address: str
    employmentType: str
    yearsEmployed: float = 0
    monthlyIncome: float
    ownsCar: bool = False
    ownsHouse: bool = False
    regionType: str
    loanAmount: float
    loanPurpose: str
    tenureMonths: int
    hasPastLoans: bool = False
    numPastLoans: int = 0
    hadLatePayments: bool = False
    existingOutstandingDebt: Optional[float] = 0


class ApplicationReviewRequest(BaseModel):
    action: str
    notes: Optional[str] = ""


class EligibilityCheckRequest(BaseModel):
    loanAmount: float
    tenureMonths: int
    monthlyIncome: float
    dateOfBirth: str
    gender: str
    maritalStatus: str = "Single"
    numChildren: int = 0
    educationLevel: str = "Graduate"
    employmentType: str = "Salaried"
    yearsEmployed: float = 0
    ownsCar: bool = False
    ownsHouse: bool = False
    regionType: str = "Urban"
    hasPastLoans: bool = False
    numPastLoans: int = 0
    hadLatePayments: bool = False
    existingOutstandingDebt: Optional[float] = 0


class SupportChatMessage(BaseModel):
    role: str
    content: str


class SupportChatRequest(BaseModel):
    message: str
    history: Optional[List[SupportChatMessage]] = []
