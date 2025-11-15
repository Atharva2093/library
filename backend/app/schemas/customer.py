from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, ConfigDict, validator


# Base Customer Schema
class CustomerBase(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None

    @validator('phone')
    def validate_phone(cls, v):
        if v and not v.strip():
            return None
        return v


# Schema for Customer Creation
class CustomerCreate(CustomerBase):
    pass


# Schema for Customer Update
class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None

    @validator('phone')
    def validate_phone(cls, v):
        if v and not v.strip():
            return None
        return v


# Schema for Customer Response
class Customer(CustomerBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    created_at: datetime


# Forward declaration for sales relationship
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from .sale import Sale

# Schema for Customer with Sales
class CustomerWithSales(Customer):
    sales: List["Sale"] = []