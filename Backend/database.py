from supabase import create_client
from dotenv import load_dotenv
import os

# Always load Backend/.env regardless of launch directory.
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

supabase = create_client(url, key)

print("Supabase Connected Successfully!")