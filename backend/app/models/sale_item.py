from sqlalchemy import Column, Integer, ForeignKey, Float
from sqlalchemy.orm import relationship
from app.db.base import Base

class SaleItem(Base):
    __tablename__ = "sale_items"
    id = Column(Integer, primary_key=True, index=True)
    sale_id = Column(Integer, ForeignKey("sales.id", ondelete="CASCADE"), nullable=False)
    book_id = Column(Integer, ForeignKey("books.id", ondelete="RESTRICT"), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    unit_price = Column(Float, nullable=False, default=0.0)
    subtotal = Column(Float, nullable=False, default=0.0)

    # relationships (back_populates should match definitions in related models)
    sale = relationship("Sale", back_populates="items")
    book = relationship("Book")

    def __repr__(self) -> str:
        return f"<SaleItem id={self.id} sale_id={self.sale_id} book_id={self.book_id} qty={self.quantity}>"