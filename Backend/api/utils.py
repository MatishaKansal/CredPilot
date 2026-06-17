import random
from database import supabase

def generate_unique_id(prefix):

    while True:

        generated_id = (
            f"{prefix}{random.randint(10000,99999)}"
        )

        result = (
            supabase
            .table("users")
            .select("user_id")
            .eq("user_id", generated_id)
            .execute()
        )

        if len(result.data) == 0:
            return generated_id