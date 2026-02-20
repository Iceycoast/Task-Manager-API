from fastapi import APIRouter, HTTPException, status, Depends
from typing import Annotated

from app.tasks.schema import CreateTask, UpdateTask, TaskResponse, TasksResponse
from app.tasks.service import create_task, get_task_by_id, get_tasks, update_task, delete_task
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/tasks", tags=["Tasks"])

CurrentUser = Annotated[int, Depends(get_current_user)]

@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_new_task(user_id:CurrentUser,
                    task:CreateTask
):
    return create_task(user_id, task)
    

@router.get("/{task_id}", response_model=TaskResponse)
def get_single_task(user_id:CurrentUser,
                    task_id:int
):
    task = get_task_by_id(user_id, task_id)

    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="Task not found."
        )

    return task

@router.get("/", response_model=TasksResponse)
def get_all_tasks(  user_id: CurrentUser,
                    limit:int = 10,
                    offset:int = 0
):
    return get_tasks(user_id, limit, offset)


@router.patch("/{task_id}", response_model=TaskResponse)
def update_existing_task(   user_id:CurrentUser,
                            task_id:int,
                            update_data:UpdateTask
):
    updated_task = update_task(user_id, task_id, update_data)

    if update_data.model_dump(exclude_unset=True) == {}:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="No fields provided.")

    if not updated_task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="Task not found.")

    return updated_task

@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_task(   user_id:CurrentUser,
                            task_id: int
):
    deleted_task = delete_task(user_id, task_id)

    if not deleted_task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="Task not found.")

