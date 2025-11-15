from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app import crud, models, schemas
from app.core.auth import get_db, get_current_user, get_optional_current_user
from app.core.permissions import PermissionChecker
from app.core.config import settings

router = APIRouter()


@router.get("/", response_model=List[schemas.Book])
def read_books(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(settings.DEFAULT_PAGE_SIZE, le=settings.MAX_PAGE_SIZE),
    category_id: Optional[int] = Query(None),
) -> Any:
    """
    Retrieve books with optional category filtering (Public endpoint)
    """
    if category_id:
        books = crud.book.get_by_category(db, category_id=category_id, skip=skip, limit=limit)
    else:
        books = crud.book.get_multi(db, skip=skip, limit=limit)
    return books


@router.get("/search", response_model=List[schemas.Book])
def search_books(
    db: Session = Depends(get_db),
    q: str = Query(..., min_length=1, description="Search query"),
    category_id: Optional[int] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(settings.DEFAULT_PAGE_SIZE, le=settings.MAX_PAGE_SIZE),
) -> Any:
    """
    Search books by title, author, or description (Public endpoint)
    """
    books = crud.book.search_books(db, query=q, category_id=category_id, skip=skip, limit=limit)
    return books


@router.get("/available", response_model=List[schemas.Book])
def read_available_books(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(settings.DEFAULT_PAGE_SIZE, le=settings.MAX_PAGE_SIZE),
) -> Any:
    """
    Retrieve books that are in stock (Public endpoint)
    """
    books = crud.book.get_available_books(db, skip=skip, limit=limit)
    return books


@router.get("/low-stock", response_model=List[schemas.Book])
def read_low_stock_books(
    db: Session = Depends(get_db),
    threshold: int = Query(5, ge=0, description="Stock threshold"),
    skip: int = Query(0, ge=0),
    limit: int = Query(settings.DEFAULT_PAGE_SIZE, le=settings.MAX_PAGE_SIZE),
    current_user: models.User = Depends(get_current_user),
) -> Any:
    """
    Retrieve books with low stock (Admin only)
    """
    PermissionChecker.can_manage_inventory(current_user)
    books = crud.book.get_low_stock_books(db, threshold=threshold, skip=skip, limit=limit)
    return books


@router.get("/popular", response_model=List[dict])
def read_popular_books(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, le=50),
    current_user: models.User = Depends(get_optional_current_user),
) -> Any:
    """
    Retrieve most popular books by sales
    """
    books = crud.book.get_popular_books(db, skip=skip, limit=limit)
    return [{"book": book, "total_sold": total_sold} for book, total_sold in books]


@router.post("/", response_model=schemas.Book)
def create_book(
    *,
    db: Session = Depends(get_db),
    book_in: schemas.BookCreate,
    current_user: models.User = Depends(get_current_user),
) -> Any:
    """
    Create new book (Admin only)
    """
    PermissionChecker.can_manage_inventory(current_user)
    
    # Check if book with same ISBN exists
    if book_in.isbn:
        existing_book = crud.book.get_by_isbn(db, isbn=book_in.isbn)
        if existing_book:
            raise HTTPException(
                status_code=400,
                detail="A book with this ISBN already exists."
            )
    
    # Validate category exists
    if book_in.category_id:
        category = crud.category.get(db, id=book_in.category_id)
        if not category:
            raise HTTPException(status_code=400, detail="Category not found")
    
    book = crud.book.create(db, obj_in=book_in)
    return book


@router.get("/{book_id}", response_model=schemas.BookWithCategory)
def read_book(
    *,
    db: Session = Depends(get_db),
    book_id: int,
) -> Any:
    """
    Get book by ID with category information (Public endpoint)
    """
    book = crud.book.get(db, id=book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return book


@router.put("/{book_id}", response_model=schemas.Book)
def update_book(
    *,
    db: Session = Depends(get_db),
    book_id: int,
    book_in: schemas.BookUpdate,
    current_user: models.User = Depends(get_current_user),
) -> Any:
    """
    Update a book (Admin only)
    """
    PermissionChecker.can_manage_inventory(current_user)
    
    book = crud.book.get(db, id=book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    # Check ISBN uniqueness
    if book_in.isbn and book_in.isbn != book.isbn:
        existing_book = crud.book.get_by_isbn(db, isbn=book_in.isbn)
        if existing_book:
            raise HTTPException(
                status_code=400,
                detail="A book with this ISBN already exists."
            )
    
    # Validate category exists
    if book_in.category_id:
        category = crud.category.get(db, id=book_in.category_id)
        if not category:
            raise HTTPException(status_code=400, detail="Category not found")
    
    book = crud.book.update(db, db_obj=book, obj_in=book_in)
    return book


@router.put("/{book_id}/stock", response_model=schemas.Book)
def update_book_stock(
    *,
    db: Session = Depends(get_db),
    book_id: int,
    quantity_change: int,
    current_user: models.User = Depends(get_current_user),
) -> Any:
    """
    Update book stock (Admin only)
    """
    PermissionChecker.can_manage_inventory(current_user)
    
    book = crud.book.update_stock(db, book_id=book_id, quantity_change=quantity_change)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return book


@router.delete("/{book_id}", response_model=schemas.MessageResponse)
def delete_book(
    *,
    db: Session = Depends(get_db),
    book_id: int,
    current_user: models.User = Depends(get_current_user),
) -> Any:
    """
    Delete a book (Admin only)
    """
    PermissionChecker.can_manage_inventory(current_user)
    
    book = crud.book.get(db, id=book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    # Check if book has sales
    sales = crud.sale.get_sales_by_book(db, book_id=book_id, limit=1)
    if sales:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete book that has sales records. Consider marking as out of stock instead."
        )
    
    crud.book.remove(db, id=book_id)
    return {"message": "Book deleted successfully", "success": True}