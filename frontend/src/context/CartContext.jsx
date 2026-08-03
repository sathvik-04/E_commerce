import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCartItems([]);
    }
  }, [user]);

  const fetchCart = async () => {
    setCartLoading(true);
    try {
      const res = await api.get('/cart');
      setCartItems(res.data || []);
    } catch {
      setCartItems([]);
    } finally {
      setCartLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    const res = await api.post('/cart', { productId, quantity });
    setCartItems(prev => {
      const idx = prev.findIndex(i => i.productId === productId);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = res.data;
        return updated;
      }
      return [...prev, res.data];
    });
    return res.data;
  };

  const updateQuantity = async (itemId, quantity) => {
    if (quantity < 1) {
      return removeFromCart(itemId);
    }
    const res = await api.put(`/cart/${itemId}`, { quantity });
    setCartItems(prev => prev.map(i => i.id === itemId ? res.data : i));
  };

  const removeFromCart = async (itemId) => {
    await api.delete(`/cart/${itemId}`);
    setCartItems(prev => prev.filter(i => i.id !== itemId));
  };

  const clearCart = async () => {
    await api.delete('/cart');
    setCartItems([]);
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + parseFloat(item.price) * item.quantity,
    0
  );

  return (
    <CartContext.Provider value={{
      cartItems,
      cartLoading,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      totalItems,
      totalPrice,
      fetchCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
