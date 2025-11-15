from datetime import datetime
from decimal import Decimal
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, validator


# SaleItem schemas
class SaleItemBase(BaseModel):
    book_id: int
    quantity: int
    unit_price: Decimal
    
    @validator('quantity')
    def validate_quantity(cls, v):
        if v <= 0:
            raise ValueError('Quantity must be greater than 0')
        return v


class SaleItemCreate(SaleItemBase):
    pass


class SaleItem(SaleItemBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    sale_id: int
    total_price: Decimal


# Base Sale Schema
class SaleBase(BaseModel):
    customer_id: Optional[int] = None
    total_amount: Decimal

    @validator('total_amount')
    def validate_total_amount(cls, v):
        if v <= 0:
            raise ValueError('Total amount must be greater than 0')
        return v


# Schema for Sale Creation
class SaleCreate(SaleBase):
    items: List[SaleItemCreate]


# Schema for Sale Update
class SaleUpdate(BaseModel):
    customer_id: Optional[int] = None
    total_amount: Optional[Decimal] = None

    @validator('total_amount')
    def validate_total_amount(cls, v):
        if v is not None and v <= 0:
            raise ValueError('Total amount must be greater than 0')
        return v


# Schema for Sale Response
class Sale(SaleBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    created_at: datetime


# Forward declaration for relationships
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from .book import Book
    from .customer import Customer

# Schema for Sale with Book details
class SaleWithBook(Sale):
    book: Optional["Book"] = None


# Schema for Sale with Customer details
class SaleWithCustomer(Sale):
    customer: Optional["Customer"] = None


# Schema for Sale with full details
class SaleDetail(Sale):
    book: Optional["Book"] = None
    customer: Optional["Customer"] = None


# Schema for Sale Summary (for reports)
class SaleSummary(BaseModel):
    total_sales: int
    total_amount: Decimal
    total_books_sold: int
    period_start: datetime
    period_end: datetime