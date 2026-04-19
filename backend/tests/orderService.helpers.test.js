const test = require("node:test");
const assert = require("node:assert/strict");

const {
  groupCartItemsBySeller,
  calculateCouponDiscount,
  deriveOrderStatus,
} = require("../services/orderService.helpers");

test("groupCartItemsBySeller groups by seller id", () => {
  const grouped = groupCartItemsBySeller([
    { product_id: "p1", product: { seller_id: "seller-1" } },
    { product_id: "p2", product: { seller_id: "seller-2" } },
    { product_id: "p3", product: { seller_id: "seller-1" } },
  ]);

  assert.equal(grouped.get("seller-1").length, 2);
  assert.equal(grouped.get("seller-2").length, 1);
});

test("calculateCouponDiscount caps percent discounts", () => {
  const discount = calculateCouponDiscount(1000, {
    discount_type: "percent",
    discount_value: 20,
    max_discount_cap: 150,
  });

  assert.equal(discount, 150);
});

test("deriveOrderStatus returns aggregate state", () => {
  assert.equal(deriveOrderStatus([{ status: "delivered" }, { status: "delivered" }]), "delivered");
  assert.equal(deriveOrderStatus([{ status: "pending" }, { status: "shipped" }]), "shipped");
  assert.equal(deriveOrderStatus([{ status: "packed" }]), "processing");
});
