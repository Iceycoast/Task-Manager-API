from datetime import datetime, timezone, timedelta
from app.auth.schema import CreateUser, UserLogin
from typing import Optional
from jose import jwt, JWTError
from psycopg2 import IntegrityError

from passlib.context import CryptContext
from app.core.config import JWT_ALGORITHM, JWT_EXPIRE_MINUTES, JWT_SECRET
from app.core.db import execute_query


pwd_context = CryptContext(schemes=["bcrypt"], deprecated ="auto")

def password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(password: str, password_hash: str) -> bool:
    return  pwd_context.verify(password, password_hash)


def register_user(user: CreateUser) -> Optional[dict]:

    hashed_password = password_hash(user.password)

    try:
        new_user= execute_query(
            """
            INSERT INTO users(email, password_hash)
            VALUES (%s, %s)
            RETURNING user_id, email;
            """,
            params=(user.email, hashed_password),
            fetchone=True
        )
        return new_user

    except IntegrityError:
        return None

def authenticate_user(user:UserLogin)-> Optional[dict]:

    db_user= execute_query(
        """
        SELECT user_id, email, password_hash
        FROM users
        WHERE email = %s;
        """,
        params=(user.email,),
        fetchone=True
    )

    if not db_user:
        return None
    if not verify_password(user.password, db_user["password_hash"]):
        return None

    return {
        "user_id": db_user["user_id"],
        "email": db_user["email"]
    }


def create_access_token(user_id:int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=JWT_EXPIRE_MINUTES)

    payload = {
                "sub" : str(user_id),
                "exp" : expire
    }

    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return token

def decode_access_token(token: str) -> Optional[int]:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if user_id:
            return int(user_id)
        return None
    except(JWTError, ValueError):
        return None