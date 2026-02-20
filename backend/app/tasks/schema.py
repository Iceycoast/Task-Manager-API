from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import date, datetime

class CreateTask(BaseModel):
    title: str = Field(min_length=3, max_length=255)
    priority: Optional[Literal["low", "medium", "high"]] = "medium"
    due_date: Optional[date] = None

class UpdateTask(BaseModel):
    title: Optional[str] = Field(default=None, min_length=3, max_length=255)
    status: Optional[Literal["pending", "in_progress","completed"]] = None
    priority: Optional[Literal["low", "medium", "high"]] = None
    due_date: Optional[date] = None

class TaskResponse(BaseModel):
    task_id: int
    title: str
    status: Literal["pending", "in_progress","completed"]
    priority: Literal["low", "medium", "high"]
    due_date: Optional[date]
    created_at: datetime
    updated_at: datetime

class TasksResponse(BaseModel):
    total: int
    limit: int
    offset: int
    data: list[TaskResponse]