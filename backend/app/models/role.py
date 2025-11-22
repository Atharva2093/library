from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship

from app.db.base import Base
from app.models.user import user_roles  # Import the association table from user.py


class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)

    # Relationship to users
    users = relationship("User", secondary=user_roles, back_populates="roles")

    def __repr__(self) -> str:
        return f"<Role id={self.id} name={self.name!r}>"
