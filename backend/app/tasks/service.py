from app.tasks.schema import CreateTask, UpdateTask
from app.core.db import execute_query


def create_task(user_id: int, task: CreateTask)-> dict | None:
    
    task_created = execute_query(
                        """
                        INSERT INTO tasks(user_id, title, priority, due_date)
                        VALUES(%s, %s, %s, %s)
                        RETURNING task_id, title, status, priority, due_date, created_at, updated_at;
                        """,
                        params=(user_id, task.title, task.priority, task.due_date),
                        fetchone=True
    )
    return task_created

def get_task_by_id(user_id:int, task_id:int)-> dict | None:

    fetch_task = execute_query(
                        """
                        SELECT task_id, title, status, priority, due_date, created_at, updated_at
                        FROM tasks
                        WHERE user_id = %s AND task_id = %s
                        """,
                        params=(user_id, task_id),
                        fetchone=True
    )
    return fetch_task 

def get_tasks(user_id: int, limit: int, offset: int)-> dict:
    
    if limit < 1:
        limit = 10

    if limit > 100:
        limit = 100

    if offset < 0:
        offset = 0

    total_result = execute_query(
                        """
                        SELECT COUNT(*) AS total
                        FROM tasks
                        WHERE user_id = %s;
                        """,
                        params=(user_id,),
                        fetchone=True
    )
    total = total_result["total"] if total_result else 0

    tasks = execute_query(
                """
                SELECT task_id, title, status, priority, due_date, created_at, updated_at
                FROM tasks
                WHERE user_id = %s
                ORDER BY created_at DESC
                LIMIT %s OFFSET %s;
                """,
                params=(user_id, limit, offset),
                fetchall=True
    )

    return {
            "total": total,
            "limit" : limit,
            "offset" : offset,
            "data" : tasks
    }

def update_task(user_id: int, task_id:int, update_data: UpdateTask)-> dict| None:

    update_fields = update_data.model_dump(exclude_unset=True)

    if not update_fields:
        raise ValueError("No fields provided")

    set_clauses = []
    values = []

    for field, value in update_fields.items():
        set_clauses.append(f"{field} = %s")
        values.append(value)

    set_clauses.append("updated_at = CURRENT_TIMESTAMP")

    set_query = ", ".join(set_clauses)

    query = f"""
            UPDATE tasks
            SET {set_query}
            WHERE user_id = %s AND task_id = %s
            RETURNING task_id, title, status, priority, due_date, created_at, updated_at;
            """

    values.extend([user_id, task_id])   

    updated_task = execute_query(   query, 
                                    params=tuple(values),
                                    fetchone=True
    )

    return updated_task

def delete_task(user_id:int, task_id:int) -> dict | None:

    task_deleted = execute_query(
                        """
                        DELETE FROM tasks
                        WHERE user_id = %s AND task_id = %s
                        RETURNING task_id, title, status, priority, due_date, created_at, updated_at; 
                        """,
                        params=(user_id, task_id),
                        fetchone=True
    )
    return task_deleted