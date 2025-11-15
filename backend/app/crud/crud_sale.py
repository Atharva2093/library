from typing import List, Optional, Dict, Any
from datetime import datetime, date
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from app.crud.base import CRUDBase
from app.models.sale import Sale
from app.schemas.sale import SaleCreate, SaleUpdate


class CRUDSale(CRUDBase[Sale, SaleCreate, SaleUpdate]):
    def create_sale(self, db: Session, *, obj_in: SaleCreate) -> Sale:
        """Create a sale and update book stock"""
        from app.crud.crud_book import book as crud_book
        
        # Check if book exists and has enough stock
        book_obj = crud_book.get(db, obj_in.book_id)
        if not book_obj:
            raise ValueError("Book not found")
        
        if book_obj.stock < obj_in.quantity:
            raise ValueError("Insufficient stock")
        
        # Create sale
        sale = self.create(db, obj_in=obj_in)
        
        # Update book stock
        crud_book.update_stock(db, book_id=obj_in.book_id, quantity_change=-obj_in.quantity)
        
        return sale

    def get_sales_by_customer(
        self, db: Session, *, customer_id: int, skip: int = 0, limit: int = 100
    ) -> List[Sale]:
        return (
            db.query(Sale)
            .filter(Sale.customer_id == customer_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_sales_by_book(
        self, db: Session, *, book_id: int, skip: int = 0, limit: int = 100
    ) -> List[Sale]:
        return (
            db.query(Sale)
            .filter(Sale.book_id == book_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_sales_by_date_range(
        self,
        db: Session,
        *,
        start_date: date,
        end_date: date,
        skip: int = 0,
        limit: int = 100
    ) -> List[Sale]:
        return (
            db.query(Sale)
            .filter(
                and_(
                    func.date(Sale.created_at) >= start_date,
                    func.date(Sale.created_at) <= end_date
                )
            )
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_today_sales(self, db: Session) -> List[Sale]:
        today = date.today()
        return self.get_sales_by_date_range(
            db, start_date=today, end_date=today
        )

    def get_sales_with_details(
        self, db: Session, *, skip: int = 0, limit: int = 100
    ) -> List[Sale]:
        """Get sales with book and customer information"""
        from app.models.book import Book
        from app.models.customer import Customer
        
        return (
            db.query(Sale)
            .join(Book, Sale.book_id == Book.id)
            .join(Customer, Sale.customer_id == Customer.id, isouter=True)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_sales_summary(
        self,
        db: Session,
        *,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> Dict[str, Any]:
        """Get sales summary statistics"""
        query = db.query(
            func.count(Sale.id).label('total_sales'),
            func.sum(Sale.total_amount).label('total_revenue'),
            func.sum(Sale.quantity).label('total_books_sold'),
            func.avg(Sale.total_amount).label('average_sale_amount')
        )
        
        if start_date and end_date:
            query = query.filter(
                and_(
                    func.date(Sale.created_at) >= start_date,
                    func.date(Sale.created_at) <= end_date
                )
            )
        
        result = query.first()
        
        return {
            'total_sales': result.total_sales or 0,
            'total_revenue': float(result.total_revenue or 0),
            'total_books_sold': result.total_books_sold or 0,
            'average_sale_amount': float(result.average_sale_amount or 0),
            'period_start': start_date,
            'period_end': end_date
        }

    def get_daily_sales_report(
        self, db: Session, *, days: int = 30
    ) -> List[Dict[str, Any]]:
        """Get daily sales for the last N days"""
        from datetime import timedelta
        
        end_date = date.today()
        start_date = end_date - timedelta(days=days)
        
        return (
            db.query(
                func.date(Sale.created_at).label('sale_date'),
                func.count(Sale.id).label('total_sales'),
                func.sum(Sale.total_amount).label('total_revenue'),
                func.sum(Sale.quantity).label('total_books_sold')
            )
            .filter(
                and_(
                    func.date(Sale.created_at) >= start_date,
                    func.date(Sale.created_at) <= end_date
                )
            )
            .group_by(func.date(Sale.created_at))
            .order_by(func.date(Sale.created_at))
            .all()
        )

    def get_top_selling_books(
        self, db: Session, *, days: Optional[int] = None, limit: int = 10
    ) -> List[Dict[str, Any]]:
        """Get top selling books"""
        from app.models.book import Book
        
        query = (
            db.query(
                Book,
                func.sum(Sale.quantity).label('total_sold'),
                func.sum(Sale.total_amount).label('total_revenue')
            )
            .join(Sale, Book.id == Sale.book_id)
        )
        
        if days:
            from datetime import timedelta
            start_date = date.today() - timedelta(days=days)
            query = query.filter(func.date(Sale.created_at) >= start_date)
        
        return (
            query
            .group_by(Book.id)
            .order_by(func.sum(Sale.quantity).desc())
            .limit(limit)
            .all()
        )


sale = CRUDSale(Sale)