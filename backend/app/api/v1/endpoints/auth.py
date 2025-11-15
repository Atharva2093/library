from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app import crud, models, schemas
from app.core.auth import get_db, auth_service
from app.core.auth import get_db, auth_service, get_current_user, get_current_superuser
from app.core.config import settings
from app.core.permissions import rate_limiter

router = APIRouter()


@router.post("/login", response_model=schemas.Token)
def login_for_access_token(
    db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    # Rate limiting
    if not rate_limiter.check_rate_limit(form_data.username, max_attempts=5, window_minutes=15):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many login attempts. Please try again later."
        )
    
    user = auth_service.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        rate_limiter.record_attempt(form_data.username)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = security.create_access_token(user.email)
    return {
        "access_token": access_token,
        "token_type": "bearer",
    }


@router.post("/register", response_model=schemas.User)
def register_user(
    *,
    db: Session = Depends(get_db),
    user_in: schemas.UserCreate,
) -> Any:
    """
    Create new user account
    """
    # Rate limiting by email
    if not rate_limiter.check_rate_limit(user_in.email, max_attempts=3, window_minutes=60):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many registration attempts. Please try again later."
        )
    
    user = auth_service.register_user(db, user_in)
    return user


@router.post("/test-token", response_model=schemas.User)
def test_token(current_user: models.User = Depends(get_current_user)) -> Any:
    """
    Test access token
    """
    return current_user


@router.post("/change-password", response_model=schemas.MessageResponse)
def change_password(
    *,
    db: Session = Depends(get_db),
    current_password: str,
    new_password: str,
    current_user: models.User = Depends(get_current_user)
) -> Any:
    """
    Change current user password
    """
    success = auth_service.change_password(
        db, current_user, current_password, new_password
    )
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect current password"
        )
    
    return {"message": "Password changed successfully", "success": True}


@router.post("/reset-password", response_model=schemas.MessageResponse)
def reset_password(
    *,
    db: Session = Depends(get_db),
    email: str,
    new_password: str,
    current_user: models.User = Depends(get_current_superuser)
) -> Any:
    """
    Reset user password (Admin only)
    """
    success = auth_service.reset_password(db, email, new_password)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {"message": "Password reset successfully", "success": True}


@router.get("/me", response_model=schemas.User)
def read_current_user(
    current_user: models.User = Depends(get_current_user)
) -> Any:
    """
    Get current user profile
    """
    return current_user