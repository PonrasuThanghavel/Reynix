import { createContext, useContext, useState, useEffect } from "react";
import { wishlistAPI } from "../api/wishlist";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const WishlistContext = createContext();

/**
 *
 * @param root0
 * @param root0.children
 */
export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [items, setItems] = useState([]);
  const fetchWishlist = async () => {
    try {
      const res = await wishlistAPI.getWishlist();
      const fetchedItems = res.data.data.items || [];
      setItems(fetchedItems);
      setWishlistIds(new Set(fetchedItems.map((item) => item.product_id)));
    } catch {
      // Background fetch, ignore error
    }
  };

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchWishlist();
    } else {
      setWishlistIds(new Set());
      setItems([]);
    }
  }, [user]);

  const toggleWishlist = async (product) => {
    if (!user) {
      toast.error("Please log in to use wishlist");
      return;
    }

    const isWishlisted = wishlistIds.has(product.id);

    try {
      if (isWishlisted) {
        // Find the wishlist item id
        const item = items.find((i) => i.product_id === product.id);
        if (item) {
          await wishlistAPI.removeFromWishlist(item.id);
          setWishlistIds((prev) => {
            const next = new Set(prev);
            next.delete(product.id);
            return next;
          });
          setItems((prev) => prev.filter((i) => i.id !== item.id));
          toast.success("Removed from wishlist");
        }
      } else {
        const res = await wishlistAPI.addToWishlist(product.id);
        const newItem = res.data.data.item;
        setWishlistIds((prev) => {
          const next = new Set(prev);
          next.add(product.id);
          return next;
        });
        setItems((prev) => [...prev, newItem]);
        toast.success("Added to wishlist");
      }
    } catch {
      toast.error("Failed to update wishlist");
    }
  };

  const isInWishlist = (productId) => wishlistIds.has(productId);

  return (
    <WishlistContext.Provider
      value={{
        items,
        wishlistIds,
        toggleWishlist,
        isInWishlist,
        fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

/**
 *
 */
export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context)
    throw new Error("useWishlist must be used within WishlistProvider");
  return context;
}
