import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);


function getCartStorageKey() {
  try {
    const raw = localStorage.getItem("farmart_current_user");

    if (!raw) return "farmart_cart_guest";

    const user = JSON.parse(raw);

    return `farmart_cart_${user.id}`;
  } catch {
    return "farmart_cart_guest";
  }
}
// โหลดตะกร้าที่เคยบันทึกไว้ตอนเปิดแอปครั้งแรก (กันของหายตอนรีเฟรชหน้า)
function loadStoredCart() {
  try {
    const raw = localStorage.getItem(getCartStorageKey());
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Creates a unique line-item key so the same product with a different
// size/variant is tracked as a separate cart row.
function makeKey(id, variant) {
  return variant ? `${id}__${variant}` : `${id}`;
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadStoredCart);
 useEffect(() => {
  function handleUserChanged() {
    setItems(loadStoredCart());
  }

  window.addEventListener("userChanged", handleUserChanged);

  return () => {
    window.removeEventListener("userChanged", handleUserChanged);
  };
}, []);

  // items: [{ key, id, name, subtitle, price, image, emoji, variant, quantity }]

  // ทุกครั้งที่ตะกร้าเปลี่ยน ให้บันทึกลง localStorage ทันที
  useEffect(() => {
    try {
      localStorage.setItem(getCartStorageKey(), JSON.stringify(items));
    } catch {
      // เผื่อ localStorage เต็มหรือถูกบล็อก ก็ปล่อยผ่าน ไม่ทำให้แอปพัง
    }
  }, [items]);

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