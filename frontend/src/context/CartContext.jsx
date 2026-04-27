import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { cartAPI } from "../api/cart";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

/**
 *
 * @param root0
 * @param root0.children
 */
export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  const items = cart?.items || [];
  const itemCount = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const subtotal = items.reduce((sum, item) => sum + (item.quantity || 0) * Number.parseFloat(item.unit_price || 0), 0);

  const fetchCart = useCallback(async () => {
    if (!user) {
      setCart(null);
      return;
    }
    setLoading(true);
    try {
      const res = await cartAPI.getCart();
      setCart(res.data.data.cart);
    } catch {
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch cart when user changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCart();
  }, [fetchCart]);

  const addItem = async (productId, variantId = null, quantity = 1) => {
    const res = await cartAPI.addItem({
      product_id: productId,
      variant_id: variantId,
      quantity,
    });
    // Re-fetch full cart to get product details
    await fetchCart();
    return res.data.data.item;
  };

  const updateItem = async (itemId, quantity) => {
    await cartAPI.updateItem(itemId, { quantity });
    await fetchCart();
  };

  const removeItem = async (itemId) => {
    await cartAPI.removeItem(itemId);
    await fetchCart();
  };

  const clearCart = async () => {
    await cartAPI.clearCart();
    await fetchCart();
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        items,
        itemCount,
        subtotal,
        loading,
        fetchCart,
        addItem,
        updateItem,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

/**
 *
 */
export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}
