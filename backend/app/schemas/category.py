from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


# Base Category Schema
class CategoryBase(BaseModel):
    name: str


# Schema for Category Creation
class CategoryCreate(CategoryBase):
    pass


# Schema for Category Update
class CategoryUpdate(BaseModel):
    name: Optional[str] = None


# Schema for Category Response
class Category(CategoryBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    created_at: datetime


# Forward declaration for books relationship
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from .book import Book

# Schema for Category with Books
class CategoryWithBooks(Category):
    books: List["Book"] = []