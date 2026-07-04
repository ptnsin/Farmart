import { createContext, useContext, useMemo, useState } from "react";

const CartContext = createContext(null);

// Creates a unique line-item key so the same product with a different
// size/variant is tracked as a separate cart row.
function makeKey(id, variant) {
  return variant ? `${id}__${variant}` : `${id}`;
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  // items: [{ key, id, name, subtitle, price, image, emoji, variant, quantity }]

  function addItem(product, quantity = 1) {
    const key = makeKey(product.id, product.variant);
    setItems((prev) => {
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        return prev.map((i) =>
          i.key === key ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, { ...product, key, quantity }];
    });
  }

  function removeItem(key) {
    setItems((prev) => prev.filter((i) => i.key !== key));
  }

  function updateQuantity(key, quantity) {
    if (quantity < 1) {
      removeItem(key);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.key === key ? { ...i, quantity } : i))
    );
  }

  function clearCart() {
    setItems([]);
  }

  const itemCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items]
  );

  const value = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    itemCount,
    subtotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}
