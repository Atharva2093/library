from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app import crud, models, schemas
from app.core.auth import get_db, get_current_user
from app.core.permissions import PermissionChecker
from app.core.config import settings

router = APIRouter()


@router.get("/", response_model=List[schemas.Customer])
def read_customers(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(settings.DEFAULT_PAGE_SIZE, le=settings.MAX_PAGE_SIZE),
    current_user: models.User = Depends(get_current_user),
) -> Any:
    """
    Retrieve customers (Admin only)
    """
    PermissionChecker.can_view_all_customers(current_user)
    customers = crud.customer.get_multi(db, skip=skip, limit=limit)
    return customers


@router.get("/search", response_model=List[schemas.Customer])
def search_customers(
    db: Session = Depends(get_db),
    q: str = Query(..., min_length=1, description="Search query"),
    skip: int = Query(0, ge=0),
    limit: int = Query(settings.DEFAULT_PAGE_SIZE, le=settings.MAX_PAGE_SIZE),
    current_user: models.User = Depends(get_current_user),
) -> Any:
    """
    Search customers by name, email, or phone (Admin only)
    """
    PermissionChecker.can_view_all_customers(current_user)
    customers = crud.customer.search_customers(db, query=q, skip=skip, limit=limit)
    return customers


@router.get("/top", response_model=List[schemas.Customer])
def read_top_customers(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, le=50),
    current_user: models.User = Depends(get_current_user),
) -> Any:
    """
    Retrieve top customers by total purchases (Admin only)
    """
    PermissionChecker.can_view_all_customers(current_user)
    customers = crud.customer.get_top_customers(db, skip=skip, limit=limit)
    return customers


@router.post("/", response_model=schemas.Customer)
def create_customer(
    *,
    db: Session = Depends(get_db),
    customer_in: schemas.CustomerCreate,
    current_user: models.User = Depends(get_current_user),
) -> Any:
    """
    Create new customer
    """
    # Check if customer with same email exists
    if customer_in.email:
        existing_customer = crud.customer.get_by_email(db, email=customer_in.email)
        if existing_customer:
            raise HTTPException(
                status_code=400,
                detail="A customer with this email already exists."
            )
    
    customer = crud.customer.create(db, obj_in=customer_in)
    return customer


@router.get("/{customer_id}", response_model=schemas.CustomerWithSales)
def read_customer(
    *,
    db: Session = Depends(get_db),
    customer_id: int,
    current_user: models.User = Depends(get_current_user),
) -> Any:
    """
    Get customer by ID with sales information (Admin only)
    """
    PermissionChecker.can_view_all_customers(current_user)
    
    customer = crud.customer.get(db, id=customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer


@router.get("/{customer_id}/stats", response_model=dict)
def read_customer_stats(
    *,
    db: Session = Depends(get_db),
    customer_id: int,
    current_user: models.User = Depends(get_current_user),
) -> Any:
    """
    Get customer statistics (Admin only)
    """
    PermissionChecker.can_view_all_customers(current_user)
    
    customer = crud.customer.get(db, id=customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    total_spent = crud.customer.get_customer_total_spent(db, customer_id=customer_id)
    purchase_count = crud.customer.get_customer_purchase_count(db, customer_id=customer_id)
    
    return {
        "customer": customer,
        "total_spent": total_spent,
        "total_purchases": purchase_count,
        "average_purchase": total_spent / purchase_count if purchase_count > 0 else 0
    }


@router.put("/{customer_id}", response_model=schemas.Customer)
def update_customer(
    *,
    db: Session = Depends(get_db),
    customer_id: int,
    customer_in: schemas.CustomerUpdate,
    current_user: models.User = Depends(get_current_user),
) -> Any:
    """
    Update a customer
    """
    customer = crud.customer.get(db, id=customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Check email uniqueness
    if customer_in.email and customer_in.email != customer.email:
        existing_customer = crud.customer.get_by_email(db, email=customer_in.email)
        if existing_customer:
            raise HTTPException(
                status_code=400,
                detail="A customer with this email already exists."
            )
    
    customer = crud.customer.update(db, db_obj=customer, obj_in=customer_in)
    return customer


@router.delete("/{customer_id}", response_model=schemas.MessageResponse)
def delete_customer(
    *,
    db: Session = Depends(get_db),
    customer_id: int,
    current_user: models.User = Depends(get_current_user),
) -> Any:
    """
    Delete a customer (Admin only)
    """
    PermissionChecker.can_view_all_customers(current_user)
    
    customer = crud.customer.get(db, id=customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Check if customer has sales
    sales = crud.sale.get_sales_by_customer(db, customer_id=customer_id, limit=1)
    if sales:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete customer with sales records. Consider archiving instead."
        )
    
    crud.customer.remove(db, id=customer_id)
    return {"message": "Customer deleted successfully", "success": True}