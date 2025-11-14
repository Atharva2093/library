from fastapi import APIRouter

from backend.app.api.v1.endpoints import (
    auth,
    users,
    categories,
    books,
    customers,
    sales,
    health,
)

api_router = APIRouter()
api_router.include_router(health.router, prefix="/health", tags=["Health"])
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(categories.router, prefix="/categories", tags=["Categories"])
api_router.include_router(books.router, prefix="/books", tags=["Books"])
api_router.include_router(customers.router, prefix="/customers", tags=["Customers"])
api_router.include_router(sales.router, prefix="/sales", tags=["Sales"])
