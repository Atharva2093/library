from typing import List, Optional
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.customer import Customer
from app.schemas.customer import CustomerCreate, CustomerUpdate


class CRUDCustomer(CRUDBase[Customer, CustomerCreate, CustomerUpdate]):
    def get_by_email(self, db: Session, *, email: str) -> Optional[Customer]:
        return db.query(Customer).filter(Customer.email == email).first()

    def get_by_phone(self, db: Session, *, phone: str) -> Optional[Customer]:
        return db.query(Customer).filter(Customer.phone == phone).first()

    def search_customers(
        self, db: Session, *, query: str, skip: int = 0, limit: int = 100
    ) -> List[Customer]:
        """Search customers by name, email, or phone"""
        from sqlalchemy import or_
        
        search_filter = or_(
            Customer.name.ilike(f"%{query}%"),
            Customer.email.ilike(f"%{query}%"),
            Customer.phone.ilike(f"%{query}%")
        )
        
        return (
            db.query(Customer)
            .filter(search_filter)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_customers_with_sales(
        self, db: Session, *, skip: int = 0, limit: int = 100
    ) -> List[Customer]:
        """Get customers who have made purchases"""
        from app.models.sale import Sale
        
        return (
            db.query(Customer)
            .join(Sale)
            .distinct()
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_top_customers(
        self, db: Session, *, skip: int = 0, limit: int = 10
    ) -> List[Customer]:
        """Get customers with most purchases (by total amount)"""
        from app.models.sale import Sale
        from sqlalchemy import func
        
        return (
            db.query(Customer)
            .join(Sale)
            .group_by(Customer.id)
            .order_by(func.sum(Sale.total_amount).desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_customer_total_spent(self, db: Session, *, customer_id: int) -> float:
        """Get total amount spent by a customer"""
        from app.models.sale import Sale
        from sqlalchemy import func
        
        result = (
            db.query(func.sum(Sale.total_amount))
            .filter(Sale.customer_id == customer_id)
            .scalar()
        )
        return float(result) if result else 0.0

    def get_customer_purchase_count(self, db: Session, *, customer_id: int) -> int:
        """Get number of purchases made by a customer"""
        from app.models.sale import Sale
        
        return (
            db.query(Sale)
            .filter(Sale.customer_id == customer_id)
            .count()
        )


customer = CRUDCustomer(Customer)