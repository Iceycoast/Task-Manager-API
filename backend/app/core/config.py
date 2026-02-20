from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# -------- Database --------

DB_HOST = os.getenv("DB_HOST")
DB_PORT = int(os.getenv("DB_PORT", 5432))
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")

# Validate DB config
if not all([DB_HOST, DB_NAME, DB_USER, DB_PASSWORD]):
    raise ValueError("Database configuration is incomplete")

# -------- JWT --------

JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM")
JWT_EXPIRE_MINUTES = os.getenv("JWT_EXPIRE_MINUTES")

# Validate JWT config
if not JWT_SECRET:
    raise ValueError("JWT_SECRET is missing")

if not JWT_ALGORITHM:
    raise ValueError("JWT_ALGORITHM is missing")

JWT_EXPIRE_MINUTES = int(JWT_EXPIRE_MINUTES or 30)