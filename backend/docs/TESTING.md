# Testing and Data Tools

Reynix provides built-in scripts to facilitate rapid development, testing, and database management.

## 🛠️ Data Management Scripts

### 1. `recreate_tables.js`

This script is used to synchronize the database schema with the Sequelize models.

**Usage:**

```bash
node recreate_tables.js
```

**What it does:**

- Authenticates with the PostgreSQL database using credentials from `.env`.
- Executes `sequelize.sync({ alter: true })`.
- Safely updates the table structure to match the latest model definitions without dropping the entire database (unless destructive changes are required by Sequelize).

---

## 🧪 Automated API Testing

### 2. `test_api.js`

A comprehensive end-to-end integration test script that verifies the core e-commerce flow and populates the database with initial test data.

**Usage:**

```bash
node test_api.js
```

**The E2E Test Workflow:**

1. **User Registration & Auth**:
   - Registers a new **Admin** user and retrieves a JWT.
   - Registers a new **Seller** user and retrieves a JWT.
   - Registers a new **Buyer** (Customer) user and retrieves a JWT.

2. **Catalog Creation (Admin)**:
   - Creates a **Category** using the Admin token.
   - Creates a **Brand** using the Admin token.

3. **Product Management (Seller)**:
   - Creates a **Product** as a Seller, linked to the newly created Category and Brand.
   - Automatically initializes stock for the product.

4. **Customer Shopping Flow (Buyer)**:
   - Creates a **Shipping Address** for the Buyer.
   - Adds the Seller's product to the **Cart**.
   - Fetches the current cart state.
   - Places an **Order** (Checkout) using the saved address.

5. **Order Verification**:
   - Fetches the order details to ensure items, totals, and seller associations are correct.

6. **Public API Health**:
   - Verifies public endpoints for categories, brands, and products are responsive.

### Benefits:

- **Instant Feedback**: Quickly verify if a code change broke the main checkout flow.
- **Data Seeding**: Useful for fresh installations to populate the dashboard with realistic data.
- **Example Usage**: Acts as a living code example for how to interact with the API.

---

## 🛡️ Best Practices

- Always ensure the backend server is running (`npm run dev`) before executing `test_api.js`.
- Use `recreate_tables.js` whenever you modify a file in the `backend/model/` directory.
