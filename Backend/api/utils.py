import random
from database import supabase

LOAN_PURPOSE_PREFIXES = {
    "business": "BL",
    "agriculture": "AL",
    "education": "EL",
    "home": "HL",
    "vehicle": "VL",
    "vehicle purchase": "VL",
    "medical": "ML",
    "other": "OL",
}


def application_id_prefix(loan_purpose: str) -> str:
    if not loan_purpose:
        return "OL"
    return LOAN_PURPOSE_PREFIXES.get(loan_purpose.strip().lower(), "OL")


def generate_unique_id(prefix, table_name="users", id_column="user_id"):

    while True:

        generated_id = (
            f"{prefix}{random.randint(10000,99999)}"
        )

        result = (
            supabase
            .table(table_name)
            .select(id_column)
            .eq(id_column, generated_id)
            .execute()
        )

        if len(result.data) == 0:
            return generated_id


def generate_application_id(loan_purpose: str) -> str:
    return generate_unique_id(
        application_id_prefix(loan_purpose),
        "loan_applications",
        "application_id",
    )
