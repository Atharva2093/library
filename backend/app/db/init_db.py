from sqlalchemy import text
from app.database import SessionLocal, engine
from app.models.user import User
from app.models.category import Category
from app.models.book import Book
from app.models.customer import Customer
from app.models.sale import Sale
from app.core.security import get_password_hash
import logging

logger = logging.getLogger(__name__)


def create_tables():
    """Create all database tables"""
    try:
        from app.database import Base
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Error creating tables: {e}")
        raise


def check_db_connection():
    """Check if database connection is working"""
    try:
        db = SessionLocal()
        # Test connection
        db.execute(text("SELECT 1"))
        db.close()
        logger.info("Database connection successful")
        return True
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        return False


def create_superuser(
    email: str = "admin@bookstore.com",
    password: str = "admin123",
    full_name: str = "Admin User"
):
    """Create initial superuser"""
    try:
        db = SessionLocal()
        
        # Check if superuser already exists
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            logger.info(f"Superuser {email} already exists")
            db.close()
            return existing_user
            
        # Create superuser
        hashed_password = get_password_hash(password)
        superuser = User(
            email=email,
            hashed_password=hashed_password,
            full_name=full_name,
            is_superuser=True
        )
        
        db.add(superuser)
        db.commit()
        db.refresh(superuser)
        db.close()
        
        logger.info(f"Superuser {email} created successfully")
        return superuser
        
    except Exception as e:
        logger.error(f"Error creating superuser: {e}")
        raise


def create_sample_data():
    """Create sample categories and books for testing"""
    try:
        db = SessionLocal()
        
        # Check if sample data already exists
        existing_categories = db.query(Category).count()
        if existing_categories > 0:
            logger.info("Sample data already exists")
            db.close()
            return
            
        # Create sample categories
        categories = [
            Category(name="Fiction"),
            Category(name="Non-Fiction"),
            Category(name="Science Fiction"),
            Category(name="Biography"),
            Category(name="History"),
            Category(name="Technology"),
        ]
        
        for category in categories:
            db.add(category)
        db.commit()
        
        # Create sample books
        fiction_cat = db.query(Category).filter(Category.name == "Fiction").first()
        scifi_cat = db.query(Category).filter(Category.name == "Science Fiction").first()
        tech_cat = db.query(Category).filter(Category.name == "Technology").first()
        
        books = [
            Book(
                title="The Great Gatsby",
                author="F. Scott Fitzgerald", 
                price=15.99,
                stock=25,
                isbn="9780743273565",
                description="Classic American literature",
                category_id=fiction_cat.id if fiction_cat else None
            ),
            Book(
                title="1984",
                author="George Orwell",
                price=13.99,
                stock=30,
                isbn="9780451524935", 
                description="Dystopian social science fiction novel",
                category_id=scifi_cat.id if scifi_cat else None
            ),
            Book(
                title="Clean Code",
                author="Robert C. Martin",
                price=45.99,
                stock=15,
                isbn="9780132350884",
                description="A Handbook of Agile Software Craftsmanship",
                category_id=tech_cat.id if tech_cat else None
            ),
        ]
        
        for book in books:
            db.add(book)
        db.commit()
        
        db.close()
        logger.info("Sample data created successfully")
        
    except Exception as e:
        logger.error(f"Error creating sample data: {e}")
        raise


def init_db():
    """Initialize database with tables, superuser, and sample data"""
    logger.info("Initializing database...")
    
    # Check database connection
    if not check_db_connection():
        raise Exception("Database connection failed")
    
    # Create tables
    create_tables()
    
    # Create superuser
    create_superuser()
    
    # Create sample data
    create_sample_data()
    
    logger.info("Database initialization completed successfully")


if __name__ == "__main__":
    init_db()