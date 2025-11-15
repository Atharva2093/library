# Ensure all model modules are imported so SQLAlchemy's Base.metadata collects them.
# Import models in a deterministic order to avoid relational import issues.
from .user import User  # noqa: F401
from .role import Role  # noqa: F401
from .category import Category  # noqa: F401
from .book import Book  # noqa: F401
from .customer import Customer  # noqa: F401
from .sale import Sale  # noqa: F401
# SaleItem was missing — import it now
from .sale_item import SaleItem  # noqa: F401

__all__ = [
    "User",
    "Role",
    "Category",
    "Book",
    "Customer",
    "Sale",
    "SaleItem",
]
