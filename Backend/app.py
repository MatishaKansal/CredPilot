from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

import json
from datetime import datetime, timezone

from passlib.hash import pbkdf2_sha256

from database import supabase

from api.schemas import (
    RegisterRequest,
    LoginRequest,
    StaffCreateRequest,
    StaffUpdateRequest,
    CustomerAssignmentRequest,
    ApplicantUpdateRequest,
    ApplicationCreateRequest,
    ApplicationReviewRequest,
)

from api.utils import (
    generate_unique_id,
    generate_application_id,
)

from risk_model import hydrate_application_risk, predict_application_risk, risk_fields_for_storage

from dashboard_analytics import (
    build_admin_dashboard,
    build_admin_reports,
    build_applicant_dashboard,
    build_employee_dashboard,
    build_employee_reports,
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

def empty_to_none(value):
    if value is None:
        return None
    if isinstance(value, str) and not value.strip():
        return None
    return value


def db_pincode(value):
    value = empty_to_none(value)
    if value is None:
        return None
    text = str(value).strip()
    if text.isdigit():
        return int(text)
    return text


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
        "pincode": row.get("pincode") or "",
        "createdAt": row.get("created_at"),
    }


def staff_payload(staff):
    return {
        "full_name": staff.fullName,
        "role": staff.role,
        "address": empty_to_none(staff.address),
        "city": empty_to_none(staff.city),
        "state": empty_to_none(staff.state),
        "pincode": db_pincode(staff.pincode),
    }


def normalize_customer(row):
    return normalize_applicant(row)


def normalize_applicant(row):
    return {
        "userId": row.get("user_id"),
        "fullName": row.get("full_name", ""),
        "email": row.get("email", ""),
        "phone": row.get("phone", ""),
        "role": row.get("role", ""),
        "address": row.get("address", ""),
        "city": row.get("city", ""),
        "state": row.get("state", ""),
        "pincode": row.get("pincode") or "",
        "assignedEmployeeId": row.get("assigned_employee_id"),
        "createdAt": row.get("created_at"),
    }


def applicant_payload(applicant):
    return {
        "full_name": applicant.fullName,
        "address": empty_to_none(applicant.address),
        "city": empty_to_none(applicant.city),
        "state": empty_to_none(applicant.state),
        "pincode": db_pincode(applicant.pincode),
    }



def application_row_with_risk(row):
    merged, updates = hydrate_application_risk(row)
    if updates:
        try:
            (
                supabase
                .table("loan_applications")
                .update(updates)
                .eq("application_id", row.get("application_id"))
                .execute()
            )
        except Exception:
            pass
    return merged


def normalize_application(row, applicant=None, include_risk=False):
    payload = {
        "applicationId": row.get("application_id"),
        "userId": row.get("user_id"),
        "status": (row.get("status") or "pending").lower(),
        "fullName": row.get("full_name", ""),
        "dateOfBirth": row.get("date_of_birth"),
        "gender": row.get("gender", ""),
        "maritalStatus": row.get("marital_status", ""),
        "numChildren": row.get("num_children", 0),
        "educationLevel": row.get("education_level", ""),
        "phoneNumber": row.get("phone_number", ""),
        "address": row.get("address", ""),
        "employmentType": row.get("employment_type", ""),
        "yearsEmployed": row.get("years_employed", 0),
        "monthlyIncome": row.get("monthly_income", 0),
        "ownsCar": row.get("owns_car", False),
        "ownsHouse": row.get("owns_house", False),
        "regionType": row.get("region_type", ""),
        "loanAmount": row.get("loan_amount", 0),
        "loanPurpose": row.get("loan_purpose", ""),
        "tenureMonths": row.get("tenure_months", 0),
        "hasPastLoans": row.get("has_past_loans", False),
        "numPastLoans": row.get("num_past_loans", 0),
        "hadLatePayments": row.get("had_late_payments", False),
        "existingOutstandingDebt": row.get("existing_outstanding_debt", 0),
        "createdAt": row.get("created_at"),
        "applicantName": applicant.get("full_name", row.get("full_name", "")) if applicant else row.get("full_name", ""),
        "assignedEmployeeId": applicant.get("assigned_employee_id") if applicant else None,
        "reviewNotes": row.get("review_notes", ""),
        "reviewedBy": row.get("reviewed_by"),
        "reviewedAt": row.get("reviewed_at"),
    }

    if include_risk:
        row = application_row_with_risk(row)
        risk_factors = row.get("risk_factors")
        if isinstance(risk_factors, str):
            try:
                risk_factors = json.loads(risk_factors)
            except json.JSONDecodeError:
                risk_factors = []
        risk_score = row.get("risk_score")
        if risk_score is not None:
            risk_score = int(float(risk_score))
        payload.update({
            "riskScore": risk_score,
            "riskLevel": row.get("risk_level"),
            "riskRecommendation": row.get("risk_recommendation"),
            "riskFactors": risk_factors or [],
        })

    return payload


def application_insert_payload(user_id: str, application_id: str, body: ApplicationCreateRequest):
    return {
        "application_id": application_id,
        "user_id": user_id,
        "status": "pending",
        "full_name": body.fullName,
        "date_of_birth": body.dateOfBirth,
        "gender": body.gender,
        "marital_status": body.maritalStatus,
        "num_children": body.numChildren,
        "education_level": body.educationLevel,
        "phone_number": body.phoneNumber,
        "address": body.address,
        "employment_type": body.employmentType,
        
        "years_employed": body.yearsEmployed,
        "monthly_income": body.monthlyIncome,
        "owns_car": body.ownsCar,
        "owns_house": body.ownsHouse,
        "region_type": body.regionType,
        "loan_amount": body.loanAmount,
        "loan_purpose": body.loanPurpose,
        "tenure_months": body.tenureMonths,
        
        "has_past_loans": body.hasPastLoans,
        "num_past_loans": body.numPastLoans if body.hasPastLoans else 0,
        "had_late_payments": body.hadLatePayments if body.hasPastLoans else False,
        "existing_outstanding_debt": body.existingOutstandingDebt or 0,
    }


EMPLOYEE_REVIEW_ACTIONS = {
    "approve": "approved",
    "decline": "declined",
    "escalate": "pending_admin",
}

ADMIN_REVIEW_ACTIONS = {
    "approve": "approved",
    "decline": "declined",
}


def get_application_row(application_id: str):
    result = (
        supabase
        .table("loan_applications")
        .select("*")
        .eq("application_id", application_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Application not found")
    return result.data[0]


def get_applicant_for_application(application_row):
    applicant = (
        supabase
        .table("users")
        .select("user_id,full_name,assigned_employee_id")
        .eq("user_id", application_row.get("user_id"))
        .execute()
    )
    return applicant.data[0] if applicant.data else None


def ensure_employee_can_review(application_row, employee_id: str):
    applicant = get_applicant_for_application(application_row)
    if not applicant:
        raise HTTPException(status_code=404, detail="Applicant not found")
    assigned_officer = str(applicant.get("assigned_employee_id") or "").strip()
    if assigned_officer != str(employee_id).strip():
        raise HTTPException(
            status_code=403,
            detail="This application belongs to a customer not assigned to you",
        )
    return applicant


def apply_application_review(
    application_id: str,
    reviewer_id: str,
    action: str,
    notes: str,
    allowed_actions: dict,
    required_status: str,
):
    normalized_action = action.strip().lower()
    if normalized_action not in allowed_actions:
        raise HTTPException(
            status_code=400,
            detail=f"Action must be one of: {', '.join(allowed_actions.keys())}",
        )

    application_row = get_application_row(application_id)
    current_status = (application_row.get("status") or "pending").lower()
    if current_status != required_status.lower():
        raise HTTPException(
            status_code=400,
            detail=f"Application must be in '{required_status}' status to perform this action",
        )

    next_status = allowed_actions[normalized_action]
    review_payload = {
        "status": next_status,
        "review_notes": notes or "",
        "reviewed_by": reviewer_id,
        "reviewed_at": datetime.now(timezone.utc).isoformat(),
    }

    try:
        updated = (
            supabase
            .table("loan_applications")
            .update(review_payload)
            .eq("application_id", application_id)
            .execute()
        )
    except Exception as exc:
        try:
            updated = (
                supabase
                .table("loan_applications")
                .update({"status": next_status})
                .eq("application_id", application_id)
                .execute()
            )
        except Exception as fallback_exc:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Unable to save review. Supabase said: "
                    f"{str(fallback_exc)}. Run Backend/applications_schema.sql in Supabase."
                ),
            ) from fallback_exc

    row = updated.data[0] if updated.data else get_application_row(application_id)
    if (row.get("status") or "").lower() != next_status.lower():
        raise HTTPException(
            status_code=400,
            detail="Review could not be saved. Check loan_applications status column in Supabase.",
        )

    applicant = get_applicant_for_application(row)
    return normalize_application(row, applicant, include_risk=True)


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
        .select("id,role,full_name")
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

    try:
        applications = (
            supabase
            .table("loan_applications")
            .select("*")
            .execute()
        )
    except Exception:
        applications = type("obj", (), {"data": []})()

    return build_admin_dashboard(
        employees.data or [],
        customers.data or [],
        applications.data or [],
    )


@app.get("/admin/reports")
def admin_reports():
    employees = (
        supabase
        .table("employees")
        .select("id,role,full_name")
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

    try:
        applications = (
            supabase
            .table("loan_applications")
            .select("*")
            .order("created_at", desc=True)
            .execute()
        )
    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail="Unable to load reports. Run Backend/applications_schema.sql in Supabase first.",
        ) from exc

    return build_admin_reports(
        employees.data or [],
        customers.data or [],
        [application_row_with_risk(row) for row in (applications.data or [])],
    )


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
            "address": empty_to_none(staff.address),
            "city": empty_to_none(staff.city),
            "state": empty_to_none(staff.state),
            "pincode": db_pincode(staff.pincode),
        })
        .execute()
    )

    row = inserted.data[0] if inserted.data else {
        "id": staff_id,
        "full_name": staff.fullName,
        "email": staff.email,
        "phone": staff.phone,
        "role": staff.role,
        "address": empty_to_none(staff.address),
        "city": empty_to_none(staff.city),
        "state": empty_to_none(staff.state),
        "pincode": db_pincode(staff.pincode),
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

    try:
        updated = (
            supabase
            .table("employees")
            .update(staff_payload(staff))
            .eq("id", employee_id)
            .execute()
        )
    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail=(
                "Unable to save details. Supabase said: "
                f"{str(exc)}. If this mentions schema cache or missing columns, "
                "run Backend/admin_schema.sql in Supabase again."
            ),
        ) from exc

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


@app.get("/employee/{employee_id}/dashboard")
def employee_dashboard(employee_id: str):
    employee = (
        supabase
        .table("employees")
        .select("*")
        .eq("id", employee_id)
        .execute()
    )

    if not employee.data:
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    try:
        customers = (
            supabase
            .table("users")
            .select("user_id")
            .eq("role", "applicant")
            .eq("assigned_employee_id", employee_id)
            .execute()
        )
    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail=(
                "Unable to load assigned customers. Run Backend/admin_schema.sql "
                "in Supabase so users has assigned_employee_id."
            ),
        ) from exc

    customer_ids = {row.get("user_id") for row in (customers.data or [])}
    try:
        applications = (
            supabase
            .table("loan_applications")
            .select("*")
            .in_("user_id", list(customer_ids))
            .order("created_at", desc=True)
            .execute()
        ) if customer_ids else type("obj", (), {"data": []})()
    except Exception:
        applications = type("obj", (), {"data": []})()

    return build_employee_dashboard(
        employee.data[0],
        applications.data or [],
        len(customers.data or []),
    )


@app.get("/employee/{employee_id}/reports")
def employee_reports(employee_id: str):
    employee = (
        supabase
        .table("employees")
        .select("id")
        .eq("id", employee_id)
        .execute()
    )

    if not employee.data:
        raise HTTPException(status_code=404, detail="Employee not found")

    try:
        assigned_customers = (
            supabase
            .table("users")
            .select("user_id")
            .eq("role", "applicant")
            .eq("assigned_employee_id", employee_id)
            .execute()
        )
    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail=(
                "Unable to load reports. Run Backend/admin_schema.sql "
                "in Supabase so users has assigned_employee_id."
            ),
        ) from exc

    customer_ids = [row.get("user_id") for row in (assigned_customers.data or [])]
    applications_data = []
    if customer_ids:
        try:
            applications = (
                supabase
                .table("loan_applications")
                .select("*")
                .in_("user_id", customer_ids)
                .order("created_at", desc=True)
                .execute()
            )
            applications_data = applications.data or []
        except Exception as exc:
            raise HTTPException(
                status_code=400,
                detail="Unable to load reports. Run Backend/applications_schema.sql in Supabase first.",
            ) from exc

    return build_employee_reports(
        [application_row_with_risk(row) for row in applications_data],
        len(assigned_customers.data or []),
    )


@app.get("/employee/{employee_id}/customers")
def employee_customers(employee_id: str):
    try:
        result = (
            supabase
            .table("users")
            .select("*")
            .eq("role", "applicant")
            .eq("assigned_employee_id", employee_id)
            .order("full_name")
            .execute()
        )
    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail=(
                "Unable to load assigned customers. Run Backend/admin_schema.sql "
                "in Supabase so users has assigned_employee_id."
            ),
        ) from exc

    return {
        "customers": [normalize_customer(row) for row in (result.data or [])]
    }


@app.patch("/employee/{employee_id}/details")
def update_employee_details(employee_id: str, staff: StaffUpdateRequest):
    return update_employee(employee_id, staff)


@app.get("/applicant/{user_id}/profile")
def get_applicant_profile(user_id: str):
    result = (
        supabase
        .table("users")
        .select("*")
        .eq("user_id", user_id)
        .eq("role", "applicant")
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=404,
            detail="Applicant not found"
        )

    return {
        "applicant": normalize_applicant(result.data[0])
    }


@app.patch("/applicant/{user_id}/details")
def update_applicant_details(user_id: str, applicant: ApplicantUpdateRequest):
    try:
        updated = (
            supabase
            .table("users")
            .update(applicant_payload(applicant))
            .eq("user_id", user_id)
            .eq("role", "applicant")
            .execute()
        )
    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail=(
                "Unable to save details. Supabase said: "
                f"{str(exc)}. If this mentions schema cache or missing columns, "
                "run Backend/admin_schema.sql in Supabase again."
            ),
        ) from exc

    if not updated.data:
        raise HTTPException(
            status_code=404,
            detail="Applicant not found"
        )

    return {
        "message": "Profile updated",
        "applicant": normalize_applicant(updated.data[0]),
    }


@app.get("/applicant/{user_id}/dashboard")
def applicant_dashboard(user_id: str):
    result = (
        supabase
        .table("users")
        .select("*")
        .eq("user_id", user_id)
        .eq("role", "applicant")
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=404,
            detail="Applicant not found"
        )

    applications = (
        supabase
        .table("loan_applications")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )

    return build_applicant_dashboard(
        result.data[0],
        applications.data or [],
    )


@app.post("/applicant/{user_id}/applications")
def create_application(user_id: str, body: ApplicationCreateRequest):
    applicant = (
        supabase
        .table("users")
        .select("user_id")
        .eq("user_id", user_id)
        .eq("role", "applicant")
        .execute()
    )

    if not applicant.data:
        raise HTTPException(status_code=404, detail="Applicant not found")

    application_id = generate_application_id(body.loanPurpose)
    base_payload = application_insert_payload(user_id, application_id, body)
    risk_prediction = predict_application_risk(base_payload)
    payload = {**base_payload, **risk_fields_for_storage(risk_prediction)}

    try:
        inserted = (
            supabase
            .table("loan_applications")
            .insert(payload)
            .execute()
        )
    except Exception:
        try:
            inserted = (
                supabase
                .table("loan_applications")
                .insert(base_payload)
                .execute()
            )
        except Exception as exc:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Unable to save application. Supabase said: "
                    f"{str(exc)}. Run Backend/applications_schema.sql in Supabase first."
                ),
            ) from exc

    row = inserted.data[0] if inserted.data else {"application_id": application_id, "user_id": user_id}
    return {
        "message": "Application submitted successfully",
        "application": normalize_application(row),
    }


@app.get("/applicant/{user_id}/applications")
def list_applicant_applications(user_id: str):
    result = (
        supabase
        .table("loan_applications")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )

    return {
        "applications": [normalize_application(row) for row in (result.data or [])]
    }


@app.get("/admin/applications")
def list_admin_applications():
    try:
        applications = (
            supabase
            .table("loan_applications")
            .select("*")
            .order("created_at", desc=True)
            .execute()
        )
    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail=(
                "Unable to load applications. Run Backend/applications_schema.sql in Supabase first."
            ),
        ) from exc

    users = (
        supabase
        .table("users")
        .select("user_id,full_name,assigned_employee_id")
        .eq("role", "applicant")
        .execute()
    )
    user_map = {row["user_id"]: row for row in (users.data or [])}

    return {
        "applications": [
            normalize_application(row, user_map.get(row.get("user_id")), include_risk=True)
            for row in (applications.data or [])
        ]
    }


@app.get("/employee/{employee_id}/applications")
def list_employee_applications(employee_id: str):
    employee = (
        supabase
        .table("employees")
        .select("id")
        .eq("id", employee_id)
        .execute()
    )

    if not employee.data:
        raise HTTPException(status_code=404, detail="Employee not found")

    try:
        assigned_customers = (
            supabase
            .table("users")
            .select("user_id,full_name,assigned_employee_id")
            .eq("role", "applicant")
            .eq("assigned_employee_id", employee_id)
            .execute()
        )
    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail=(
                "Unable to load assigned customers. Run Backend/admin_schema.sql "
                "in Supabase so users has assigned_employee_id."
            ),
        ) from exc

    customer_rows = assigned_customers.data or []
    if not customer_rows:
        return {"applications": []}

    user_map = {row["user_id"]: row for row in customer_rows}
    customer_ids = list(user_map.keys())

    try:
        applications = (
            supabase
            .table("loan_applications")
            .select("*")
            .in_("user_id", customer_ids)
            .order("created_at", desc=True)
            .execute()
        )
    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail=(
                "Unable to load applications. Run Backend/applications_schema.sql in Supabase first."
            ),
        ) from exc

    return {
        "applications": [
            normalize_application(row, user_map.get(row.get("user_id")), include_risk=True)
            for row in (applications.data or [])
        ]
    }


@app.get("/employee/{employee_id}/applications/{application_id}")
def get_employee_application(employee_id: str, application_id: str):
    application_row = get_application_row(application_id)
    ensure_employee_can_review(application_row, employee_id)
    applicant = get_applicant_for_application(application_row)
    return {
        "application": normalize_application(application_row, applicant, include_risk=True),
    }


@app.patch("/employee/{employee_id}/applications/{application_id}/review")
def review_application_as_employee(
    employee_id: str,
    application_id: str,
    review: ApplicationReviewRequest,
):
    try:
        application_row = get_application_row(application_id)
        ensure_employee_can_review(application_row, employee_id)

        application = apply_application_review(
            application_id,
            employee_id,
            review.action,
            review.notes or "",
            EMPLOYEE_REVIEW_ACTIONS,
            "pending",
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail=f"Unable to submit review. {str(exc)}",
        ) from exc

    return {
        "message": "Application reviewed",
        "application": application,
    }


@app.patch("/admin/applications/{application_id}/review")
def review_application_as_admin(application_id: str, review: ApplicationReviewRequest):
    application = apply_application_review(
        application_id,
        "admin",
        review.action,
        review.notes or "",
        ADMIN_REVIEW_ACTIONS,
        "pending_admin",
    )

    return {
        "message": "Application reviewed",
        "application": application,
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
