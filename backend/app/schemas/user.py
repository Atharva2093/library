from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict


# Base User Schema
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    is_superuser: bool = False


# Schema for User Creation
class UserCreate(UserBase):
    password: str


# Schema for User Update
class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    password: Optional[str] = None
    is_superuser: Optional[bool] = None


# Schema for User Response
class User(UserBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    created_at: datetime


# Schema for User in Database
class UserInDB(User):
    hashed_password: str


# Schema for User Authentication
class UserLogin(BaseModel):
    email: EmailStr
    password: str


# Schema for Token
class Token(BaseModel):
    access_token: str
    token_type: str


# Schema for Token Data
class TokenData(BaseModel):
    email: Optional[str] = None