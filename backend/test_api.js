// using global fetch in node 22

const API_URL = "http://localhost:5000/api";

async function postData(endpoint, body, token = null) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    console.error(`Error POST ${endpoint}:`, data);
    return null;
  }
  return data;
}

async function getData(endpoint, token = null) {
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${endpoint}`, {
    method: "GET",
    headers,
  });
  const data = await res.json();
  if (!res.ok) {
    console.error(`Error GET ${endpoint}:`, data);
    return null;
  }
  return data;
}

async function runTests() {
  console.log("=== Starting API Tests and Test Data Insertion ===");

  // 1. Register Users
  const timestamp = Date.now();
  
  const adminEmail = `admin_${timestamp}@example.com`;
  console.log(`\nRegistering Admin: ${adminEmail}`);
  const adminRes = await postData("/users/register", {
    full_name: "Admin User",
    email: adminEmail,
    password: "Password123!",
    role: "admin",
  });
  const adminToken = adminRes?.data?.token;
  if (!adminToken) return console.error("Failed to register admin");

  const sellerEmail = `seller_${timestamp}@example.com`;
  console.log(`Registering Seller: ${sellerEmail}`);
  const sellerRes = await postData("/users/register", {
    full_name: "Seller User",
    email: sellerEmail,
    password: "Password123!",
    role: "seller",
  });
  const sellerToken = sellerRes?.data?.token;

  const buyerEmail = `buyer_${timestamp}@example.com`;
  console.log(`Registering Buyer: ${buyerEmail}`);
  const buyerRes = await postData("/users/register", {
    full_name: "Buyer User",
    email: buyerEmail,
    password: "Password123!",
    role: "customer",
  });
  const buyerToken = buyerRes?.data?.token;

  // 2. Admin Actions: Create Category and Brand
  console.log("\nCreating Category as Admin...");
  const catRes = await postData("/categories", {
    name: `Category ${timestamp}`,
    description: "A test category",
    is_active: true
  }, adminToken);
  const categoryId = catRes?.data?.category?.id;

  console.log("Creating Brand as Admin...");
  const brandRes = await postData("/brands", {
    name: `Brand ${timestamp}`,
    description: "A test brand",
    is_active: true
  }, adminToken);
  const brandId = brandRes?.data?.brand?.id;

  if (!categoryId || !brandId) return console.error("Failed to create Category or Brand");

  // 3. Seller Actions: Create Product
  console.log("\nCreating Product as Seller...");
  const prodRes = await postData("/products", {
    name: `Product ${timestamp}`,
    description: "A very nice test product",
    short_description: "Nice product",
    category_id: categoryId,
    brand_id: brandId,
    base_price: 150.0,
    selling_price: 120.0,
    discount_percent: 20,
    initial_stock: 50,
    status: "active"
  }, sellerToken);
  const productId = prodRes?.data?.product?.id;
  if (!productId) return console.error("Failed to create Product");

  // 4. Buyer Actions: Address, Cart, Order
  console.log("\nAdding Address for Buyer...");
  const addrRes = await postData("/addresses", {
    label: "Home",
    full_name: "Buyer User",
    phone_number: "1234567890",
    address_line1: "123 Test Street",
    city: "Test City",
    state: "Test State",
    postal_code: "12345",
    country: "India",
    is_default: true
  }, buyerToken);
  const addressId = addrRes?.data?.address?.id;
  if (!addressId) return console.error("Failed to create Address");

  console.log("Adding Product to Cart as Buyer...");
  const cartRes = await postData("/cart/items", {
    product_id: productId,
    quantity: 2
  }, buyerToken);

  console.log("Fetching Cart for Buyer...");
  await getData("/cart", buyerToken);

  console.log("Placing Order as Buyer...");
  const orderRes = await postData("/orders", {
    shipping_address_id: addressId,
    billing_address_id: addressId,
    notes: "Please deliver fast."
  }, buyerToken);
  const orderId = orderRes?.data?.order?.id;

  if (orderId) {
    console.log(`\n✅ Order placed successfully! Order ID: ${orderId}`);
    
    // Fetch order details
    await getData(`/orders/${orderId}`, buyerToken);
  } else {
    console.error("Failed to place order");
  }

  // 5. Test some public endpoints
  console.log("\nTesting public endpoints...");
  await getData("/categories");
  await getData("/brands");
  await getData("/products");

  console.log("\n=== Testing Completed Successfully ===");
}

runTests().catch(console.error);
