from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, Numeric, String, Text, ForeignKey
from sqlalchemy.orm import relationship

from app.db.base import Base


class Book(Base):
    __tablename__ = "books"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    author = Column(String(255), nullable=True)
    price = Column(Numeric(10, 2), nullable=False)
    stock = Column(Integer, default=0, nullable=False)
    isbn = Column(String(30), unique=True, nullable=True)
    description = Column(Text, nullable=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    category = relationship("Category", back_populates="books")
    sales = relationship("Sale", back_populates="book")

    def __repr__(self) -> str:
        return f"<Book id={self.id} title={self.title!r}>"
