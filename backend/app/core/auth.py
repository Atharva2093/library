from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from app import crud, models, schemas
from app.core import security
from app.core.config import settings
from app.database import SessionLocal

# HTTP Bearer token security scheme
security_scheme = HTTPBearer()


def get_db() -> Generator:
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()


def get_current_user(
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme)
) -> models.User:
    """
    Get current authenticated user from JWT token
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(
            credentials.credentials, 
            settings.SECRET_KEY, 
            algorithms=[settings.ALGORITHM]
        )
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = schemas.TokenData(email=email)
    except JWTError:
        raise credentials_exception
    
    user = crud.user.get_by_email(db, email=token_data.email)
    if user is None:
        raise credentials_exception
    return user


def get_current_active_user(
    current_user: models.User = Depends(get_current_user),
) -> models.User:
    """
    Get current active user (for future use if we implement user deactivation)
    """
    if not crud.user.is_active(current_user):
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


def get_current_superuser(
    current_user: models.User = Depends(get_current_user),
) -> models.User:
    """
    Get current superuser - for admin-only endpoints
    """
    if not crud.user.is_superuser(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges"
        )
    return current_user


def get_optional_current_user(
    db: Session = Depends(get_db),
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme)
) -> Optional[models.User]:
    """
    Get current user if token is provided, otherwise return None
    Useful for endpoints that work with both authenticated and anonymous users
    """
    if not credentials:
        return None
    
    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        email: str = payload.get("sub")
        if email is None:
            return None
        
        user = crud.user.get_by_email(db, email=email)
        return user
    except JWTError:
        return None


class AuthService:
    """
    Authentication service for handling login, registration, and token management
    """
    
    @staticmethod
    def authenticate_user(db: Session, email: str, password: str) -> Optional[models.User]:
        """
        Authenticate user with email and password
        """
        user = crud.user.get_by_email(db, email=email)
        if not user:
            return None
        if not security.verify_password(password, user.hashed_password):
            return None
        return user
    
    @staticmethod
    def register_user(db: Session, user_data: schemas.UserCreate) -> models.User:
        """
        Register a new user
        """
        # Check if user already exists
        existing_user = crud.user.get_by_email(db, email=user_data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create new user
        user = crud.user.create(db, obj_in=user_data)
        return user
    
    @staticmethod
    def create_access_token_for_user(user: models.User) -> str:
        """
        Create access token for a user
        """
        return security.create_access_token(subject=user.email)
    
    @staticmethod
    def change_password(
        db: Session, user: models.User, current_password: str, new_password: str
    ) -> bool:
        """
        Change user password
        """
        if not security.verify_password(current_password, user.hashed_password):
            return False
        
        # Update password
        user_update = schemas.UserUpdate(password=new_password)
        crud.user.update(db, db_obj=user, obj_in=user_update)
        return True
    
    @staticmethod
    def reset_password(db: Session, email: str, new_password: str) -> bool:
        """
        Reset user password (for admin or password reset flow)
        """
        user = crud.user.get_by_email(db, email=email)
        if not user:
            return False
        
        user_update = schemas.UserUpdate(password=new_password)
        crud.user.update(db, db_obj=user, obj_in=user_update)
        return True


auth_service = AuthService()