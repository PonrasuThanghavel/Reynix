# Reynix 🚀

A modern, high-performance **multi-vendor E-Commerce platform** designed for a seamless, intelligent, and secure shopping experience. Reynix features a robust backend API, responsive frontend, and sophisticated logistics management system.

> Built with **Node.js**, **React**, **PostgreSQL**, and modern web technologies for scalability and performance.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Environment Setup](#-environment-setup)
- [Documentation](#-documentation)
- [Development Tools](#-development-tools)
- [Contributing](#-contributing)
- [Community](#-community)

---

## ✨ Features

- **🔐 Multi-Role System**: Customer, Seller, Shipper, and Admin roles with role-based access control
- **🏪 Multi-Vendor Support**: Multiple sellers can list and manage products independently
- **📦 Intelligent Order Fulfillment**: Automatic order splitting among sellers with OTP-verified deliveries
- **🔒 Enterprise Security**: JWT authentication, rate limiting, input validation, and error handling
- **🎯 Domain Events System**: In-process event architecture ready for microservices scaling
- **💻 Linting & Quality**: ESLint integrated into both frontend and backend with automated GitHub Actions workflows.
- **📱 Responsive Design**: Mobile-first frontend with modern React + Vite
- **💳 Payment Integration**: Support for multiple payment methods and gateway integration
- **⭐ Review & Ratings**: Verified purchase reviews with image support
- **🛒 Shopping Features**: Cart management, wishlists, coupons, and inventory tracking
- **📊 Admin Dashboard**: Comprehensive seller and order management

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Sequelize
- **Authentication**: JWT
- **Rate Limiting**: Express Rate Limit
- **Logging**: Custom Logger

### Frontend
- **Framework**: React 18+
- **Build Tool**: Vite
- **Language**: JavaScript/JSX
- **CSS**: CSS Modules

---

## 🏗️ Project Structure

```
Reynix/
├── backend/                    # Express API Server
│   ├── config/                # Database & configuration
│   ├── controller/            # Request handlers
│   ├── model/                 # Sequelize models
│   ├── routes/                # API routes
│   ├── services/              # Business logic layer
│   ├── middleware/            # Custom middleware
│   ├── utils/                 # Helpers & utilities
│   ├── validation/            # Input validators
│   ├── migrations/            # Database migrations
│   ├── docs/                  # API documentation
│   ├── tests/                 # Test files
│   └── package.json
│
├── frontend/                   # React Application
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── assets/            # Images & static files
│   │   └── main.jsx
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

---

## ⚙️ Quick Start

### Prerequisites

- **Node.js** v18 or higher
- **PostgreSQL** 12 or higher
- **npm** or **yarn**

### 1️⃣ Backend Setup

```bash
cd backend
npm install

# Configure environment variables
cp .env.example .env

# Update .env with your PostgreSQL credentials
# DATABASE_URL=postgresql://user:password@localhost:5432/ecommerce_db

# Sync database tables
node recreate_tables.js

# Start development server
npm run dev
```

The backend will be available at `http://localhost:5000`

### 2️⃣ Frontend Setup

```bash
cd frontend
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173` (or the next available port)

---

## 🔧 Environment Setup

### Backend `.env` Configuration

Create a `.env` file in the `backend/` directory with the following variables:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/ecommerce_db
NODE_ENV=development

# Server
PORT=5000
API_BASE_URL=http://localhost:5000

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100

# Email (if applicable)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASS=your_password
```

---

## 📚 Documentation

Comprehensive documentation is available in the [backend/docs](./backend/docs/) directory:

| Document | Purpose |
|----------|---------|
| [API Reference](./backend/docs/API.md) | Complete API endpoints with request/response examples |
| [Controllers](./backend/docs/CONTROLLERS.md) | Request flow and service layer architecture |
| [Data Models](./backend/docs/MODELS.md) | Database schema and entity relationships |
| [Utilities](./backend/docs/UTILS.md) | Authentication, validation, and error handling |
| [Testing](./backend/docs/TESTING.md) | Test strategies and examples |

---

## 🧪 Development Tools

### Database Management

```bash
# Sync database tables (creates/updates schema without data loss)
cd backend
node recreate_tables.js
```

### Testing & Data Generation

```bash
# Run end-to-end API tests with sample data
cd backend
node test_api.js
```

This script:
- Creates test admin, seller, and buyer accounts
- Sets up product categories and brands
- Creates sample products with variants
- Adds inventory and addresses
- Places test orders
- Validates all endpoints

---

## 🚀 Running in Production

```bash
# Backend
cd backend
NODE_ENV=production npm start

# Frontend (build first)
cd frontend
npm run build
npm run preview
```

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

Please refer to our [documentation](./backend/docs) for architectural guidelines before submitting PRs.

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 💬 Community & Support

- **Discord**: [Join our community](https://discord.gg/p8nCs2sT)
- **Issues**: Found a bug? [Open an issue](../../issues)
- **Discussions**: Have questions? Check [discussions](../../discussions)

---

**Made with ❤️ by the Reynix Team**