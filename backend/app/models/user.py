from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, Integer, String, Table, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

# Association table for many-to-many relationship between users and roles
user_roles = Table(
    "user_roles",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("role_id", Integer, ForeignKey("roles.id"), primary_key=True),
)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship to roles
    roles = relationship("Role", secondary=user_roles, back_populates="users")

    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}')>"
