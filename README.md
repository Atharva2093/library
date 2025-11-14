# 📚 Bookstore Management System

A full-stack, modern, scalable Bookstore Management System built with FastAPI, Next.js, MySQL, and a clean modular architecture. It includes book management, category management, customer management, sales tracking, inventory management, and admin dashboards.

## 🚀 Overview

The Bookstore Management System is a full-stack application designed to digitalize and automate bookstore operations. It supports managing books, categories, customers, sales transactions, authentication, inventory tracking, and comprehensive analytics dashboards.

This project follows scalable patterns suitable for production-level SaaS applications with a focus on clean architecture, type safety, and maintainable code.

## ⭐ Features

### 📘 Books Module
- Add, update, delete books
- Search books by title, author, ISBN
- Real-time inventory tracking
- Book categories & pricing
- Stock management

### 🏷️ Categories Module
- Create/edit/delete book categories
- Organize books by categories
- Category-based filtering

### 👤 Customers Module
- Create/edit/delete customer profiles
- Customer contact information
- Purchase history tracking

### 💰 Sales System
- Process sales transactions
- Multiple items per sale
- Automatic inventory updates
- Sales history and receipts
- Revenue tracking

### 📊 Inventory Management
- Real-time stock levels
- Low stock alerts
- Automatic stock deduction on sales
- Inventory reports

### 🔐 Authentication
- JWT Authentication
- Role-based access control (Admin/User)
- Secure password hashing
- Token refresh mechanism

### 📊 Analytics Dashboard
- Sales analytics
- Top-selling books
- Revenue reports
- Inventory status overview
- Customer insights

### ⚙️ Backend Features
- FastAPI modular structure
- CRUD architecture with SQLAlchemy ORM
- Pydantic validation
- MySQL database with Alembic migrations
- Structured core, schemas, routers, CRUD operations
- Comprehensive error handling

### 🎨 Frontend Features
- Next.js 14 App Router
- Beautiful dashboard UI
- Books, categories, customers management
- Sales processing interface
- Admin panel
- Responsive design
- Type-safe API integration

## 🏗️ Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS** (for styling)
- **Axios** (API client)

### Backend
- **FastAPI** (Python web framework)
- **Python 3.8+**
- **SQLAlchemy** (ORM)
- **Pydantic** (data validation)
- **MySQL** (database)
- **Alembic** (database migrations)
- **passlib** (password hashing)
- **python-jose** (JWT handling)

### DevOps & Tools
- **Git & GitHub**
- **VS Code** (recommended IDE)
- **Docker** (containerization)
- **Uvicorn** (ASGI server)

## 📂 Project Structure

```
library/
├── backend/
│   ├── alembic/                    # Database migrations
│   │   ├── versions/
│   │   ├── env.py
│   │   └── script.py.mako
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── endpoints/
│   │   │       │   └── health.py
│   │   │       └── api.py
│   │   ├── core/
│   │   │   └── config.py           # App configuration
│   │   ├── crud/                   # Database operations
│   │   ├── db/
│   │   │   ├── base.py            # SQLAlchemy base
│   │   │   └── session.py         # DB session
│   │   ├── models/                 # SQLAlchemy models
│   │   │   ├── book.py
│   │   │   ├── category.py
│   │   │   ├── customer.py
│   │   │   ├── sale.py
│   │   │   ├── sale_item.py
│   │   │   ├── user.py
│   │   │   └── role.py
│   │   ├── schemas/                # Pydantic schemas
│   │   ├── main.py                 # FastAPI app entry
│   │   └── __init__.py
│   ├── alembic.ini
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── dashboard/
│   │   │   │   ├── books/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── new/page.tsx
│   │   │   │   │   └── [id]/page.tsx
│   │   │   │   ├── categories/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── new/page.tsx
│   │   │   │   │   └── [id]/page.tsx
│   │   │   │   ├── customers/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── new/page.tsx
│   │   │   │   │   └── [id]/page.tsx
│   │   │   │   ├── layout.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── components/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Protected.tsx
│   │   └── lib/
│   │       └── api.ts              # API client
│   ├── package.json
│   ├── tsconfig.json
│   └── next.config.js
│
├── docs/                           # Documentation
├── .gitignore
└── README.md
```

## 🔌 API Documentation Summary

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/login` | Login user (JWT) |
| POST | `/api/v1/auth/register` | Create new user |
| POST | `/api/v1/auth/refresh` | Refresh JWT token |

### Books
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/books/` | Get all books (paginated) |
| GET | `/api/v1/books/{id}` | Get book by ID |
| POST | `/api/v1/books/` | Add new book |
| PUT | `/api/v1/books/{id}` | Update book |
| DELETE | `/api/v1/books/{id}` | Delete book |

### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/categories/` | Get all categories |
| POST | `/api/v1/categories/` | Create category |
| PUT | `/api/v1/categories/{id}` | Update category |
| DELETE | `/api/v1/categories/{id}` | Delete category |

### Customers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/customers/` | Get all customers |
| POST | `/api/v1/customers/` | Add customer |
| PUT | `/api/v1/customers/{id}` | Update customer |
| DELETE | `/api/v1/customers/{id}` | Delete customer |

### Sales
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/sales/` | Get sales history |
| POST | `/api/v1/sales/` | Process new sale |
| GET | `/api/v1/sales/{id}` | Get sale details |

### Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | API health status |
| GET | `/api/v1/health/` | Detailed health check |

## 🛠️ Backend Setup (FastAPI)

### 1. Create virtual environment
```bash
cd backend
python -m venv venv
```

### 2. Activate virtual environment
```bash
# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Set up environment variables
Create a `.env` file in the backend directory:
```env
DATABASE_URL=mysql+pymysql://username:password@localhost:3306/bookstore_db
JWT_SECRET=your-super-secret-jwt-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=1440
ALLOWED_HOSTS=*
PROJECT_NAME=Bookstore API
```

### 5. Run database migrations
```bash
alembic upgrade head
```

### 6. Start FastAPI server
```bash
uvicorn app.main:app --reload
```

**Backend now runs at:**
- 👉 **API**: http://127.0.0.1:8000
- 👉 **Interactive Docs**: http://127.0.0.1:8000/docs
- 👉 **ReDoc**: http://127.0.0.1:8000/redoc

## 🎨 Frontend Setup (Next.js)

### 1. Navigate to frontend directory
```bash
cd frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env.local` file in the frontend directory:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### 4. Start development server
```bash
npm run dev
```

**Frontend runs at:**
- 👉 **Application**: http://localhost:3000

## 🔧 Environment Variables

### Backend (.env)
```env
# Database Configuration
DATABASE_URL=mysql+pymysql://username:password@localhost:3306/bookstore_db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# CORS Configuration
ALLOWED_HOSTS=localhost,127.0.0.1,*.vercel.app

# App Configuration
PROJECT_NAME=Bookstore API
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## 🐳 Docker Support

### Running with Docker Compose
```bash
# Build and start all services
docker-compose up --build

# Run in detached mode
docker-compose up -d

# Stop services
docker-compose down
```

### Individual Services
```bash
# Backend only
docker build -t bookstore-backend ./backend
docker run -p 8000:8000 bookstore-backend

# Frontend only
docker build -t bookstore-frontend ./frontend
docker run -p 3000:3000 bookstore-frontend
```

## 🚀 Deployment Guide

### Backend Deployment
**Recommended platforms:** Render, Railway, DigitalOcean, AWS

1. Set environment variables on your platform
2. Ensure MySQL database is accessible
3. Run migrations: `alembic upgrade head`
4. Start with: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Frontend Deployment
**Recommended platforms:** Vercel, Netlify

1. Connect your GitHub repository
2. Set `NEXT_PUBLIC_API_BASE_URL` to your backend URL
3. Deploy automatically on git push

### Database Setup
**Recommended:** MySQL on PlanetScale, AWS RDS, or DigitalOcean Managed Database

```sql
CREATE DATABASE bookstore_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📊 Features Roadmap

### Current Features ✅
- ✅ Book management (CRUD)
- ✅ Category management  
- ✅ Customer management
- ✅ Sales processing
- ✅ Inventory tracking
- ✅ User authentication
- ✅ Database migrations

### Upcoming Features 🚧
- 🚧 Advanced reporting and analytics
- 🚧 Email notifications
- 🚧 Barcode scanning
- 🚧 Multi-store support
- 🚧 API rate limiting
- 🚧 Advanced search and filtering
- 🚧 Export functionality (PDF, Excel)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 Code Style

- **Backend**: Follow PEP 8 Python style guide
- **Frontend**: Use Prettier and ESLint configurations
- **Commits**: Use conventional commit messages

## 🐛 Issues & Support

If you encounter any issues or need support:
1. Check existing [GitHub Issues](https://github.com/Atharva2093/library/issues)
2. Create a new issue with detailed description
3. Include environment details and error logs

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- FastAPI for the excellent Python web framework
- Next.js team for the React framework
- SQLAlchemy for the powerful ORM
- All contributors and users of this project

---

**Made with ❤️ for modern bookstore management**

## 📞 Contact

- **Repository**: [https://github.com/Atharva2093/library](https://github.com/Atharva2093/library)
- **Issues**: [https://github.com/Atharva2093/library/issues](https://github.com/Atharva2093/library/issues)

---

### ✅ Quick Start Commands

```bash
# Clone repository
git clone https://github.com/Atharva2093/library.git
cd library

# Backend setup
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
# Configure .env file
alembic upgrade head
uvicorn app.main:app --reload

# Frontend setup (new terminal)
cd frontend
npm install
# Configure .env.local file
npm run dev
```

**🎉 Your bookstore management system is now running!**