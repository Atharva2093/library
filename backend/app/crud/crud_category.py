from typing import List, Optional
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryUpdate


class CRUDCategory(CRUDBase[Category, CategoryCreate, CategoryUpdate]):
    def get_by_name(self, db: Session, *, name: str) -> Optional[Category]:
        return db.query(Category).filter(Category.name == name).first()

    def get_categories_with_books_count(self, db: Session) -> List[Category]:
        """Get all categories with the count of books in each category"""
        from sqlalchemy import func
        from app.models.book import Book
        
        return (
            db.query(Category)
            .outerjoin(Book)
            .group_by(Category.id)
            .all()
        )

    def search_by_name(
        self, db: Session, *, name: str, skip: int = 0, limit: int = 100
    ) -> List[Category]:
        return (
            db.query(Category)
            .filter(Category.name.ilike(f"%{name}%"))
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_active_categories(self, db: Session) -> List[Category]:
        """Get categories that have at least one book"""
        from app.models.book import Book
        
        return (
            db.query(Category)
            .join(Book)
            .distinct()
            .all()
        )


category = CRUDCategory(Category)