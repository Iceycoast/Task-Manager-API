import psycopg2
from psycopg2.extras import RealDictCursor

from app.core.config import DB_HOST, DB_NAME, DB_PORT, DB_USER, DB_PASSWORD

def get_db_connection():

    return psycopg2.connect(
        host = DB_HOST,
        dbname = DB_NAME,
        port = DB_PORT,
        user = DB_USER,
        password = DB_PASSWORD
    )

def execute_query(  query: str, 
                    params: tuple | None = None,
                    fetchone: bool = False,
                    fetchall: bool = False
    ):

    if fetchone and fetchall:
        raise ValueError("Choose either fetchone or fetchall, not both.")

    conn = get_db_connection()

    try:
        with conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(query, params)

                if fetchone:
                    return cur.fetchone()

                elif fetchall:
                    return cur.fetchall()

                return None
    finally:
        conn.close()
