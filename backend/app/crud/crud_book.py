from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from app.crud.base import CRUDBase
from app.models.book import Book
from app.schemas.book import BookCreate, BookUpdate


class CRUDBook(CRUDBase[Book, BookCreate, BookUpdate]):
    def get_by_isbn(self, db: Session, *, isbn: str) -> Optional[Book]:
        return db.query(Book).filter(Book.isbn == isbn).first()

    def search_books(
        self,
        db: Session,
        *,
        query: str,
        category_id: Optional[int] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Book]:
        """Search books by title, author, or description"""
        search_filter = or_(
            Book.title.ilike(f"%{query}%"),
            Book.author.ilike(f"%{query}%"),
            Book.description.ilike(f"%{query}%")
        )
        
        filters = [search_filter]
        if category_id:
            filters.append(Book.category_id == category_id)
            
        return (
            db.query(Book)
            .filter(and_(*filters))
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_category(
        self, db: Session, *, category_id: int, skip: int = 0, limit: int = 100
    ) -> List[Book]:
        return (
            db.query(Book)
            .filter(Book.category_id == category_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_low_stock_books(
        self, db: Session, *, threshold: int = 5, skip: int = 0, limit: int = 100
    ) -> List[Book]:
        return (
            db.query(Book)
            .filter(Book.stock <= threshold)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_out_of_stock_books(self, db: Session) -> List[Book]:
        return db.query(Book).filter(Book.stock == 0).all()

    def update_stock(self, db: Session, *, book_id: int, quantity_change: int) -> Optional[Book]:
        """Update book stock by adding/subtracting quantity_change"""
        book = self.get(db, book_id)
        if book:
            new_stock = book.stock + quantity_change
            if new_stock < 0:
                new_stock = 0
            book.stock = new_stock
            db.commit()
            db.refresh(book)
        return book

    def get_books_with_category(
        self, db: Session, *, skip: int = 0, limit: int = 100
    ) -> List[Book]:
        """Get books with their category information"""
        from app.models.category import Category
        
        return (
            db.query(Book)
            .join(Category, Book.category_id == Category.id, isouter=True)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_popular_books(
        self, db: Session, *, skip: int = 0, limit: int = 10
    ) -> List[Dict[str, Any]]:
        """Get most sold books"""
        from app.models.sale import Sale
        from sqlalchemy import func
        
        return (
            db.query(
                Book,
                func.sum(Sale.quantity).label('total_sold')
            )
            .join(Sale)
            .group_by(Book.id)
            .order_by(func.sum(Sale.quantity).desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_available_books(
        self, db: Session, *, skip: int = 0, limit: int = 100
    ) -> List[Book]:
        """Get books that are in stock"""
        return (
            db.query(Book)
            .filter(Book.stock > 0)
            .offset(skip)
            .limit(limit)
            .all()
        )


book = CRUDBook(Book)