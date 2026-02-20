from fastapi import APIRouter, HTTPException, status
from app.auth.schema import UserResponse, TokenResponse, CreateUser, UserLogin
from app.auth.service import register_user, authenticate_user, create_access_token

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user:CreateUser):

    new_user = register_user(user)

    if not new_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Email already registered."
        )
    return new_user


@router.post("/login", response_model=TokenResponse)
def login(user:UserLogin):

    authenticated_user = authenticate_user(user)

    if not authenticated_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Invalid Credentials."
        )

    access_token = create_access_token(authenticated_user["user_id"])

    return TokenResponse(access_token=access_token)