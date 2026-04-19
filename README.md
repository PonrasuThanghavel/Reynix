# Reynix 🚀

A modern, high-performance E-Commerce platform designed for a seamless, intelligent, and secure shopping experience. Reynix features a robust multi-vendor backend, a responsive frontend, and a sophisticated logistics management system.

---

## 🏗️ Project Structure

The project is divided into two main components:

- **[backend](./backend)**: Node.js Express API with PostgreSQL & Sequelize.
- **[frontend](./frontend)**: React + Vite web application.

---

## ⚙️ Quick Start

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL

### 2. Backend Setup
```bash
cd backend
npm install
# Configure your .env file (copy from .env.example if available)
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 📚 Documentation

Detailed documentation for each layer of the application is available in the [backend/docs](./backend/docs) directory:

- 🛰️ **[API Reference](./backend/docs/API.md)**: Endpoints, request/response examples, and authentication.
- 🏗️ **[Architecture & Controllers](./backend/docs/CONTROLLERS.md)**: Deep dive into the request flow and service layer.
- 🗃️ **[Data Models](./backend/docs/MODELS.md)**: Detailed schema definitions and associations.
- 🛠️ **[Utilities & Helpers](./backend/docs/UTILS.md)**: Authentication, validation, and error handling.

---

## 🧪 Testing & Data Tools

I've included specialized scripts to help with development and testing:

- **Database Sync**: `node backend/recreate_tables.js` - Syncs or recreates database tables without losing the entire database.
- **API Test Flow**: `node backend/test_api.js` - An end-to-end test script that creates test users, products, categories, and places a test order.

---

## ✨ Features

- **Multi-Role Support**: Customer, Seller, Shipper, and Admin roles.
- **Intelligent Fulfillment**: Order splitting among sellers and OTP-verified deliveries.
- **Robust Security**: JWT Auth, Rate Limiting, and Request Validation.
- **Domain Events**: In-process event system ready for scaling to microservices.

---

## 👨‍💻 Contributing

Please refer to the documentation for architectural guidelines before submitting pull requests.
