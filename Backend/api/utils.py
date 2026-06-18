import random
from database import supabase

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
