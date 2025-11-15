from datetime import datetime
from decimal import Decimal
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, validator


# Base Book Schema
class BookBase(BaseModel):
    title: str
    author: Optional[str] = None
    price: Decimal
    stock: int = 0
    isbn: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[int] = None

    @validator('price')
    def validate_price(cls, v):
        if v <= 0:
            raise ValueError('Price must be greater than 0')
        return v

    @validator('stock')
    def validate_stock(cls, v):
        if v < 0:
            raise ValueError('Stock cannot be negative')
        return v


# Schema for Book Creation
class BookCreate(BookBase):
    pass


# Schema for Book Update
class BookUpdate(BaseModel):
    title: Optional[str] = None
    author: Optional[str] = None
    price: Optional[Decimal] = None
    stock: Optional[int] = None
    isbn: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[int] = None

    @validator('price')
    def validate_price(cls, v):
        if v is not None and v <= 0:
            raise ValueError('Price must be greater than 0')
        return v

    @validator('stock')
    def validate_stock(cls, v):
        if v is not None and v < 0:
            raise ValueError('Stock cannot be negative')
        return v


# Schema for Book Response
class Book(BookBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    created_at: datetime


# Forward declaration for category relationship
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from .category import Category
    from .sale import Sale

# Schema for Book with Category
class BookWithCategory(Book):
    category: Optional["Category"] = None


# Schema for Book with Sales
class BookWithSales(Book):
    sales: List["Sale"] = []


# Schema for Book with full details
class BookDetail(Book):
    category: Optional["Category"] = None
    sales: List["Sale"] = []