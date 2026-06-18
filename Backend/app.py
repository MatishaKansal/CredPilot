from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from passlib.hash import pbkdf2_sha256

from database import supabase

from api.schemas import (
    RegisterRequest,
    LoginRequest,
    StaffCreateRequest,
    StaffUpdateRequest,
    CustomerAssignmentRequest,
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

# Maps each role to the table it lives in.
# Applicants self-register into "users".
# Officers/admins are added separately into "employees".
ROLE_TABLE_MAP = {
    "applicant": "users",
    "officer": "employees",
    "admin": "employees",
}

# "users" keys its primary id column as "user_id".
# "employees" keys its primary id column as "id".
ID_COLUMN_MAP = {
    "users": "user_id",
    "employees": "id",
}

def normalize_employee(row):
    return {
        "id": row.get("id"),
        "fullName": row.get("full_name", ""),
        "email": row.get("email", ""),
        "phone": row.get("phone", ""),
        "role": row.get("role", ""),
        "address": row.get("address", ""),
        "city": row.get("city", ""),
        "state": row.get("state", ""),
        "pincode": row.get("pincode", ""),
        "createdAt": row.get("created_at"),
    }


def staff_payload(staff):
    return {
        "full_name": staff.fullName,
        "role": staff.role,
        "address": staff.address,
        "city": staff.city,
        "state": staff.state,
        "pincode": staff.pincode,
    }


def normalize_customer(row):
    return {
        "userId": row.get("user_id"),
        "fullName": row.get("full_name", ""),
        "email": row.get("email", ""),
        "phone": row.get("phone", ""),
        "role": row.get("role", ""),
        "assignedEmployeeId": row.get("assigned_employee_id"),
        "createdAt": row.get("created_at"),
    }


@app.get("/")
def home():
    return {"message": "CredPilot Backend Running"}


@app.post("/register")
def register(user: RegisterRequest):
    # Registration stays applicant-only and continues to write to "users".
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

    table_name = ROLE_TABLE_MAP.get(user.role)

    if table_name is None:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown role: {user.role}"
        )

    result = (
        supabase
        .table(table_name)
        .select("*")
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    db_user = next(
        (user_row for user_row in result.data if user_row.get("email", "").lower() == user.email.lower()),
        None,
    )

    if db_user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

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

    id_column = ID_COLUMN_MAP[table_name]

    return {
        "user": {
            "user_id": db_user[id_column],
            "name": db_user["full_name"],
            "email": db_user["email"],
            "role": db_user["role"]
        },
        "token": "dummy_token"
    }


@app.get("/admin/dashboard")
def admin_dashboard():
    employees = (
        supabase
        .table("employees")
        .select("id,role")
        .execute()
    )

    try:
        customers = (
            supabase
            .table("users")
            .select("user_id,assigned_employee_id")
            .eq("role", "applicant")
            .execute()
        )
    except Exception:
        customers = (
            supabase
            .table("users")
            .select("user_id")
            .eq("role", "applicant")
            .execute()
        )

    employee_rows = employees.data or []
    customer_rows = customers.data or []

    return {
        "employeeCount": len(employee_rows),
        "adminCount": len([row for row in employee_rows if row.get("role") == "admin"]),
        "officerCount": len([row for row in employee_rows if row.get("role") == "officer"]),
        "customerCount": len(customer_rows),
        "assignedCustomerCount": len([
            row for row in customer_rows if row.get("assigned_employee_id")
        ]),
    }


@app.get("/admin/employees")
def list_employees():
    result = (
        supabase
        .table("employees")
        .select("*")
        .order("full_name")
        .execute()
    )

    return {
        "employees": [normalize_employee(row) for row in (result.data or [])]
    }


@app.post("/admin/employees")
def create_staff(staff: StaffCreateRequest):
    if staff.role not in ("officer", "admin"):
        raise HTTPException(
            status_code=400,
            detail="Role must be officer or admin"
        )

    existing = (
        supabase
        .table("employees")
        .select("email")
        .eq("email", staff.email)
        .execute()
    )

    if existing.data:
        raise HTTPException(
            status_code=400,
            detail="Employee email already exists"
        )

    staff_id = generate_unique_id(
        "A" if staff.role == "admin" else "E",
        "employees",
        "id",
    )

    hashed_password = pbkdf2_sha256.hash(staff.password)

    inserted = (
        supabase
        .table("employees")
        .insert({
            "id": staff_id,
            "full_name": staff.fullName,
            "email": staff.email,
            "phone": staff.phone,
            "password": hashed_password,
            "role": staff.role,
            "address": staff.address,
            "city": staff.city,
            "state": staff.state,
            "pincode": staff.pincode,
        })
        .execute()
    )

    row = inserted.data[0] if inserted.data else {
        "id": staff_id,
        "full_name": staff.fullName,
        "email": staff.email,
        "phone": staff.phone,
        "role": staff.role,
        "address": staff.address,
        "city": staff.city,
        "state": staff.state,
        "pincode": staff.pincode,
    }

    return {
        "message": "Staff member created",
        "employee": normalize_employee(row),
    }


@app.get("/admin/employees/{employee_id}")
def get_employee(employee_id: str):
    result = (
        supabase
        .table("employees")
        .select("*")
        .eq("id", employee_id)
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    return {
        "employee": normalize_employee(result.data[0])
    }


@app.patch("/admin/employees/{employee_id}")
def update_employee(employee_id: str, staff: StaffUpdateRequest):
    if staff.role not in ("officer", "admin"):
        raise HTTPException(
            status_code=400,
            detail="Role must be officer or admin"
        )

    updated = (
        supabase
        .table("employees")
        .update(staff_payload(staff))
        .eq("id", employee_id)
        .execute()
    )

    if not updated.data:
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    return {
        "message": "Employee updated",
        "employee": normalize_employee(updated.data[0]),
    }


@app.delete("/admin/employees/{employee_id}")
def delete_employee(employee_id: str):
    deleted = (
        supabase
        .table("employees")
        .delete()
        .eq("id", employee_id)
        .execute()
    )

    if not deleted.data:
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    return {
        "message": "Employee deleted",
        "employee_id": employee_id,
    }


@app.get("/admin/customers")
def list_customers():
    result = (
        supabase
        .table("users")
        .select("*")
        .eq("role", "applicant")
        .order("full_name")
        .execute()
    )

    return {
        "customers": [normalize_customer(row) for row in (result.data or [])]
    }


@app.patch("/admin/customers/{customer_id}/assign")
def assign_customer(customer_id: str, assignment: CustomerAssignmentRequest):
    employee = (
        supabase
        .table("employees")
        .select("id,role")
        .eq("id", assignment.employeeId)
        .execute()
    )

    if not employee.data:
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    if employee.data[0].get("role") != "officer":
        raise HTTPException(
            status_code=400,
            detail="Customers can only be assigned to employees"
        )

    updated = (
        supabase
        .table("users")
        .update({"assigned_employee_id": assignment.employeeId})
        .eq("user_id", customer_id)
        .execute()
    )

    if not updated.data:
        raise HTTPException(
            status_code=404,
            detail="Customer not found"
        )

    return {
        "message": "Customer assigned",
        "customer": normalize_customer(updated.data[0]),
    }
