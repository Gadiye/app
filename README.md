# artisan_mg

# MyApp

> A comprehensive full-stack web application for managing artisans, customers, jobs, inventory, orders, and payroll operations.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![Django](https://img.shields.io/badge/django-4.x-green.svg)](https://www.djangoproject.com/)
[![Next.js](https://img.shields.io/badge/next.js-14+-black.svg)](https://nextjs.org/)

## 🚀 Overview

MyApp is a modern full-stack web application designed to streamline business operations for service-based companies. It provides a comprehensive solution for managing artisans, customers, inventory, orders, and payroll with a clean, responsive interface.

### Key Benefits
- **Centralized Management**: All business operations in one place
- **Real-time Updates**: Live status tracking for jobs and orders
- **Automated Payroll**: Generate payslips with PDF export
- **Analytics & Reporting**: Business insights and performance metrics
- **Modern UI/UX**: Responsive design built with latest technologies

## ✨ Features

### 👥 People Management
- **Artisan Management**: Track artisans, skills, jobs, and earnings
- **Customer Management**: Comprehensive customer profiles and order history
- **User Authentication**: Secure login and role-based access control

### 📊 Business Operations
- **Job & Order Tracking**: Create, assign, and monitor job progress
- **Inventory Management**: Real-time stock tracking and product management
- **Payslip Generation**: Automated payroll with PDF generation
- **Status Management**: Dynamic status updates and workflow tracking

### 📈 Analytics & Reporting
- **Performance Metrics**: Job completion rates and artisan performance
- **Financial Reports**: Revenue tracking and expense management
- **Inventory Reports**: Stock levels and product movement analysis

### 🎨 User Experience
- **Modern Interface**: Clean, intuitive design with Tailwind CSS
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Advanced Filtering**: Search and filter across all data entities
- **Real-time Updates**: Live status changes and notifications

## 🛠 Tech Stack

### Backend
- **Framework**: Django 4.x
- **API**: Django REST Framework
- **Database**: SQLite (development) / PostgreSQL (production)
- **PDF Generation**: ReportLab
- **Filtering**: django-filter
- **CORS**: django-cors-headers

### Frontend
- **Framework**: Next.js 14+
- **Language**: TypeScript
- **UI Library**: React 18+
- **Styling**: Tailwind CSS
- **HTTP Client**: Fetch API / Axios

### Development Tools
- **Version Control**: Git
- **Package Management**: pip (Python), npm (Node.js)
- **Code Quality**: ESLint, Prettier
- **Environment**: Docker (optional)

## 🏗 Architecture

```
MyApp/
├── appback/                 # Django Backend
│   ├── apps/               # Django apps
│   │   ├── artisans/      # Artisan management
│   │   ├── customers/     # Customer management
│   │   ├── jobs/          # Job tracking
│   │   ├── orders/        # Order management
│   │   ├── inventory/     # Inventory management
│   │   └── payslips/      # Payroll system
│   ├── config/            # Django settings
│   ├── requirements.txt   # Python dependencies
│   └── manage.py         # Django management
│
├── my-app/                # Next.js Frontend
│   ├── pages/            # Next.js pages
│   ├── components/       # Reusable components
│   ├── lib/             # Utility functions
│   ├── styles/          # Global styles
│   ├── package.json     # Node.js dependencies
│   └── next.config.js   # Next.js configuration
│
└── README.md            # This file
```

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/myapp.git
cd myapp
```

### 2. Backend Setup (Django)
```bash
# Navigate to backend directory
cd appback

# Create virtual environment (recommended)
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup database
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

The API will be available at `http://127.0.0.1:8000/api/`

### 3. Frontend Setup (Next.js)
```bash
# Navigate to frontend directory (in a new terminal)
cd my-app

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
DEBUG=True
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///db.sqlite3
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
NEXT_PUBLIC_APP_NAME=MyApp
```

## 📚 API Documentation

### Base URL
```
http://127.0.0.1:8000/api/
```

### Available Endpoints

| Endpoint | Methods | Description |
|----------|---------|-------------|
| `/products/` | GET, POST, PUT, DELETE | Product management |
| `/artisans/` | GET, POST, PUT, DELETE | Artisan management |
| `/customers/` | GET, POST, PUT, DELETE | Customer management |
| `/jobs/` | GET, POST, PUT, DELETE | Job tracking |
| `/orders/` | GET, POST, PUT, DELETE | Order management |
| `/inventory/` | GET, POST, PUT, DELETE | Inventory management |
| `/payslips/` | GET, POST, PUT, DELETE | Payslip generation |

### Query Parameters
- `search`: Search across relevant fields
- `ordering`: Sort by field (prefix with `-` for descending)
- `page`: Pagination page number
- `page_size`: Number of items per page

### Example Requests

#### Create a Customer
```bash
curl -X POST http://127.0.0.1:8000/api/customers/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  }'
```

#### Get Orders with Filtering
```bash
curl "http://127.0.0.1:8000/api/orders/?search=John&ordering=-created_date"
```

## 🎯 Usage Guide

### Step-by-Step Workflow

1. **Setup Products/Services**
   - Navigate to Products page
   - Add products/services your business offers
   - Set prices and descriptions

2. **Add Customers**
   - Go to Customers section
   - Add customer information
   - Track customer history

3. **Create Orders**
   - Select customers and products
   - Set quantities and requirements
   - Track order status

4. **Assign Jobs**
   - Create jobs from orders
   - Assign artisans to jobs
   - Monitor job progress

5. **Manage Inventory**
   - Track stock levels
   - Update inventory as needed
   - Monitor usage patterns

6. **Generate Payslips**
   - Review completed jobs
   - Generate payslips for artisans
   - Export as PDF

7. **View Reports**
   - Access analytics dashboard
   - Review performance metrics
   - Generate business reports

## 🧪 Testing

### Backend Tests
```bash
cd appback
python manage.py test
```

### Frontend Tests
```bash
cd my-app
npm test
```

### Run All Tests
```bash
# In project root
./run_tests.sh
```

## 🚀 Deployment

### Production Considerations
- Use PostgreSQL for production database
- Configure proper environment variables
- Set up proper CORS settings
- Use a reverse proxy (nginx)
- Configure SSL certificates
- Set up monitoring and logging

### Docker Deployment (Optional)
```bash
# Build and run with Docker Compose
docker-compose up --build
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow PEP 8 for Python code
- Use ESLint and Prettier for JavaScript/TypeScript
- Write tests for new features
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/myapp/issues) page
2. Create a new issue if your problem isn't already reported
3. Provide detailed information about your environment and the issue

## 📚 Additional Resources

- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://reactjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

**Built with ❤️ by [some ai]**
