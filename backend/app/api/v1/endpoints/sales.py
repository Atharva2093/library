from typing import Any, List, Optional
from datetime import date, datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app import crud, models, schemas
from app.core.auth import get_db, get_current_user
from app.core.permissions import PermissionChecker
from app.core.config import settings

router = APIRouter()


@router.get("/", response_model=List[schemas.SaleDetail])
def read_sales(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(settings.DEFAULT_PAGE_SIZE, le=settings.MAX_PAGE_SIZE),
    current_user: models.User = Depends(get_current_user),
) -> Any:
    """
    Retrieve sales with details (Admin only)
    """
    PermissionChecker.can_view_all_sales(current_user)
    sales = crud.sale.get_sales_with_details(db, skip=skip, limit=limit)
    return sales


@router.get("/today", response_model=List[schemas.SaleDetail])
def read_today_sales(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> Any:
    """
    Retrieve today's sales (Admin only)
    """
    PermissionChecker.can_view_all_sales(current_user)
    sales = crud.sale.get_today_sales(db)
    return sales


@router.get("/summary", response_model=dict)
def read_sales_summary(
    db: Session = Depends(get_db),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    current_user: models.User = Depends(get_current_user),
) -> Any:
    """
    Get sales summary statistics (Admin only)
    """
    PermissionChecker.can_view_reports(current_user)
    summary = crud.sale.get_sales_summary(db, start_date=start_date, end_date=end_date)
    return summary


@router.get("/daily-report", response_model=List[dict])
def read_daily_sales_report(
    db: Session = Depends(get_db),
    days: int = Query(30, ge=1, le=365, description="Number of days to include"),
    current_user: models.User = Depends(get_current_user),
) -> Any:
    """
    Get daily sales report for the last N days (Admin only)
    """
    PermissionChecker.can_view_reports(current_user)
    report = crud.sale.get_daily_sales_report(db, days=days)
    return [
        {
            "date": str(row.sale_date),
            "total_sales": row.total_sales,
            "total_revenue": float(row.total_revenue),
            "total_books_sold": row.total_books_sold
        }
        for row in report
    ]


@router.get("/top-books", response_model=List[dict])
def read_top_selling_books(
    db: Session = Depends(get_db),
    days: Optional[int] = Query(None, ge=1, description="Filter by last N days"),
    limit: int = Query(10, le=50),
    current_user: models.User = Depends(get_current_user),
) -> Any:
    """
    Get top selling books (Admin only)
    """
    PermissionChecker.can_view_reports(current_user)
    books = crud.sale.get_top_selling_books(db, days=days, limit=limit)
    return [
        {
            "book": book,
            "total_sold": int(total_sold),
            "total_revenue": float(total_revenue)
        }
        for book, total_sold, total_revenue in books
    ]


@router.get("/customer/{customer_id}", response_model=List[schemas.Sale])
def read_customer_sales(
    customer_id: int,
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(settings.DEFAULT_PAGE_SIZE, le=settings.MAX_PAGE_SIZE),
    current_user: models.User = Depends(get_current_user),
) -> Any:
    """
    Get sales for a specific customer (Admin only)
    """
    PermissionChecker.can_view_all_sales(current_user)
    
    # Verify customer exists
    customer = crud.customer.get(db, id=customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    sales = crud.sale.get_sales_by_customer(db, customer_id=customer_id, skip=skip, limit=limit)
    return sales


@router.get("/book/{book_id}", response_model=List[schemas.Sale])
def read_book_sales(
    book_id: int,
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(settings.DEFAULT_PAGE_SIZE, le=settings.MAX_PAGE_SIZE),
    current_user: models.User = Depends(get_current_user),
) -> Any:
    """
    Get sales for a specific book (Admin only)
    """
    PermissionChecker.can_view_all_sales(current_user)
    
    # Verify book exists
    book = crud.book.get(db, id=book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    sales = crud.sale.get_sales_by_book(db, book_id=book_id, skip=skip, limit=limit)
    return sales


@router.post("/", response_model=schemas.Sale)
def create_sale(
    *,
    db: Session = Depends(get_db),
    sale_in: schemas.SaleCreate,
    current_user: models.User = Depends(get_current_user),
) -> Any:
    """
    Create new sale (All authenticated users)
    """
    PermissionChecker.can_create_sale(current_user)
    
    # Verify book exists
    book = crud.book.get(db, id=sale_in.book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    # Verify customer exists (if provided)
    if sale_in.customer_id:
        customer = crud.customer.get(db, id=sale_in.customer_id)
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")
    
    try:
        sale = crud.sale.create_sale(db, obj_in=sale_in)
        return sale
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{sale_id}", response_model=schemas.SaleDetail)
def read_sale(
    *,
    db: Session = Depends(get_db),
    sale_id: int,
    current_user: models.User = Depends(get_current_user),
) -> Any:
    """
    Get sale by ID with full details (Admin only)
    """
    PermissionChecker.can_view_all_sales(current_user)
    
    sale = crud.sale.get(db, id=sale_id)
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    return sale


@router.put("/{sale_id}", response_model=schemas.Sale)
def update_sale(
    *,
    db: Session = Depends(get_db),
    sale_id: int,
    sale_in: schemas.SaleUpdate,
    current_user: models.User = Depends(get_current_user),
) -> Any:
    """
    Update a sale (Admin only)
    """
    PermissionChecker.can_view_all_sales(current_user)
    
    sale = crud.sale.get(db, id=sale_id)
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    
    # If changing book or quantity, validate book exists and stock
    if sale_in.book_id or sale_in.quantity:
        book_id = sale_in.book_id or sale.book_id
        new_quantity = sale_in.quantity or sale.quantity
        old_quantity = sale.quantity
        
        book = crud.book.get(db, id=book_id)
        if not book:
            raise HTTPException(status_code=404, detail="Book not found")
        
        # Calculate stock change
        quantity_diff = new_quantity - old_quantity
        if quantity_diff > book.stock:
            raise HTTPException(status_code=400, detail="Insufficient stock")
        
        # Update book stock
        if quantity_diff != 0:
            crud.book.update_stock(db, book_id=book_id, quantity_change=-quantity_diff)
    
    sale = crud.sale.update(db, db_obj=sale, obj_in=sale_in)
    return sale


@router.delete("/{sale_id}", response_model=schemas.MessageResponse)
def delete_sale(
    *,
    db: Session = Depends(get_db),
    sale_id: int,
    current_user: models.User = Depends(get_current_user),
) -> Any:
    """
    Delete a sale and restore book stock (Admin only)
    """
    PermissionChecker.can_view_all_sales(current_user)
    
    sale = crud.sale.get(db, id=sale_id)
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    
    # Restore book stock
    crud.book.update_stock(db, book_id=sale.book_id, quantity_change=sale.quantity)
    
    crud.sale.remove(db, id=sale_id)
    return {"message": "Sale deleted successfully and stock restored", "success": True}