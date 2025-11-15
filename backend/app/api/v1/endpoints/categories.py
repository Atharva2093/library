from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app import crud, models, schemas
from app.core.auth import get_db, get_current_user, get_current_superuser
from app.core.permissions import PermissionChecker
from app.core.config import settings

router = APIRouter()


@router.get("/", response_model=List[schemas.Category])
def read_categories(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(settings.DEFAULT_PAGE_SIZE, le=settings.MAX_PAGE_SIZE),
) -> Any:
    """
    Retrieve categories (Public endpoint)
    """
    categories = crud.category.get_multi(db, skip=skip, limit=limit)
    return categories


@router.get("/active", response_model=List[schemas.Category])
def read_active_categories(
    db: Session = Depends(get_db),
) -> Any:
    """
    Retrieve categories that have books (Public endpoint)
    """
    categories = crud.category.get_active_categories(db)
    return categories


@router.get("/search", response_model=List[schemas.Category])
def search_categories(
    db: Session = Depends(get_db),
    q: str = Query(..., min_length=1, description="Search query"),
    skip: int = Query(0, ge=0),
    limit: int = Query(settings.DEFAULT_PAGE_SIZE, le=settings.MAX_PAGE_SIZE),
) -> Any:
    """
    Search categories by name (Public endpoint)
    """
    categories = crud.category.search_by_name(db, name=q, skip=skip, limit=limit)
    return categories


@router.post("/", response_model=schemas.Category)
def create_category(
    *,
    db: Session = Depends(get_db),
    category_in: schemas.CategoryCreate,
    current_user: models.User = Depends(get_current_user),
) -> Any:
    """
    Create new category (Admin only)
    """
    PermissionChecker.can_manage_categories(current_user)
    
    # Check if category with same name exists
    existing_category = crud.category.get_by_name(db, name=category_in.name)
    if existing_category:
        raise HTTPException(
            status_code=400,
            detail="A category with this name already exists."
        )
    
    category = crud.category.create(db, obj_in=category_in)
    return category


@router.get("/{category_id}", response_model=schemas.Category)
def read_category(
    *,
    db: Session = Depends(get_db),
    category_id: int,
) -> Any:
    """
    Get category by ID (Public endpoint)
    """
    category = crud.category.get(db, id=category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category


@router.put("/{category_id}", response_model=schemas.Category)
def update_category(
    *,
    db: Session = Depends(get_db),
    category_id: int,
    category_in: schemas.CategoryUpdate,
    current_user: models.User = Depends(get_current_user),
) -> Any:
    """
    Update a category (Admin only)
    """
    PermissionChecker.can_manage_categories(current_user)
    
    category = crud.category.get(db, id=category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Check if another category with same name exists
    if category_in.name:
        existing_category = crud.category.get_by_name(db, name=category_in.name)
        if existing_category and existing_category.id != category_id:
            raise HTTPException(
                status_code=400,
                detail="A category with this name already exists."
            )
    
    category = crud.category.update(db, db_obj=category, obj_in=category_in)
    return category


@router.delete("/{category_id}", response_model=schemas.MessageResponse)
def delete_category(
    *,
    db: Session = Depends(get_db),
    category_id: int,
    current_user: models.User = Depends(get_current_superuser),
) -> Any:
    """
    Delete a category (Admin only)
    """
    category = crud.category.get(db, id=category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Check if category has books
    books_in_category = crud.book.get_by_category(db, category_id=category_id, limit=1)
    if books_in_category:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete category that contains books. Move or delete books first."
        )
    
    crud.category.remove(db, id=category_id)
    return {"message": "Category deleted successfully", "success": True}