from functools import wraps
from typing import Callable, List, Optional
from fastapi import HTTPException, status
from app import models


class PermissionChecker:
    """
    Permission checker for role-based access control
    """
    
    @staticmethod
    def require_superuser(user: models.User) -> bool:
        """Check if user is superuser"""
        if not user.is_superuser:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Superuser access required"
            )
        return True
    
    @staticmethod
    def require_active_user(user: models.User) -> bool:
        """Check if user is active (for future use)"""
        # For now, all users are considered active
        # This can be extended when user activation/deactivation is implemented
        return True
    
    @staticmethod
    def can_modify_user(current_user: models.User, target_user: models.User) -> bool:
        """Check if current user can modify target user"""
        # User can modify their own profile or superuser can modify any profile
        if current_user.id == target_user.id or current_user.is_superuser:
            return True
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to modify this user"
        )
    
    @staticmethod
    def can_view_user(current_user: models.User, target_user: models.User) -> bool:
        """Check if current user can view target user details"""
        # User can view their own profile or superuser can view any profile
        # In a bookstore, staff might need to view customer details
        if current_user.id == target_user.id or current_user.is_superuser:
            return True
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to view this user"
        )
    
    @staticmethod
    def can_manage_inventory(user: models.User) -> bool:
        """Check if user can manage book inventory"""
        # Only superusers can manage inventory (add/edit/delete books)
        if not user.is_superuser:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Inventory management requires admin privileges"
            )
        return True
    
    @staticmethod
    def can_manage_categories(user: models.User) -> bool:
        """Check if user can manage book categories"""
        # Only superusers can manage categories
        if not user.is_superuser:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Category management requires admin privileges"
            )
        return True
    
    @staticmethod
    def can_view_all_sales(user: models.User) -> bool:
        """Check if user can view all sales data"""
        # Only superusers can view all sales
        if not user.is_superuser:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Sales data access requires admin privileges"
            )
        return True
    
    @staticmethod
    def can_view_all_customers(user: models.User) -> bool:
        """Check if user can view all customer data"""
        # Only superusers can view all customers
        if not user.is_superuser:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Customer data access requires admin privileges"
            )
        return True
    
    @staticmethod
    def can_create_sale(user: models.User) -> bool:
        """Check if user can create sales"""
        # All authenticated users can create sales (customers can buy books)
        return True
    
    @staticmethod
    def can_view_reports(user: models.User) -> bool:
        """Check if user can view business reports"""
        # Only superusers can view reports
        if not user.is_superuser:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Report access requires admin privileges"
            )
        return True


def permission_required(permission_func: Callable[[models.User], bool]):
    """
    Decorator to check permissions before executing endpoint
    
    Usage:
    @permission_required(PermissionChecker.require_superuser)
    def some_admin_endpoint(current_user: User = Depends(get_current_user)):
        pass
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Extract user from kwargs (assumes dependency injection)
            current_user = None
            for key, value in kwargs.items():
                if isinstance(value, models.User):
                    current_user = value
                    break
            
            if current_user is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Authentication required"
                )
            
            # Check permission
            permission_func(current_user)
            
            return func(*args, **kwargs)
        return wrapper
    return decorator


class RateLimiter:
    """
    Simple rate limiting for authentication endpoints
    """
    
    def __init__(self):
        self._attempts = {}
        self._blocked = {}
    
    def check_rate_limit(self, identifier: str, max_attempts: int = 5, window_minutes: int = 15) -> bool:
        """
        Check if identifier (IP, email) has exceeded rate limit
        """
        import time
        current_time = time.time()
        window_seconds = window_minutes * 60
        
        # Clean old attempts
        if identifier in self._attempts:
            self._attempts[identifier] = [
                attempt_time for attempt_time in self._attempts[identifier]
                if current_time - attempt_time < window_seconds
            ]
        
        # Check if blocked
        if identifier in self._blocked:
            if current_time - self._blocked[identifier] < window_seconds:
                return False
            else:
                del self._blocked[identifier]
        
        # Count recent attempts
        attempts_count = len(self._attempts.get(identifier, []))
        
        if attempts_count >= max_attempts:
            self._blocked[identifier] = current_time
            return False
        
        return True
    
    def record_attempt(self, identifier: str):
        """Record a failed attempt"""
        import time
        if identifier not in self._attempts:
            self._attempts[identifier] = []
        self._attempts[identifier].append(time.time())


rate_limiter = RateLimiter()