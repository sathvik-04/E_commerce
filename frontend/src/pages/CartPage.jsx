import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './CartPage.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:8080';

function getImageUrl(url) {
  if (!url) return null;
  return url.startsWith('http') ? url : `${API_BASE}${url}`;
}

export default function CartPage() {
  const { cartItems, cartLoading, updateQuantity, removeFromCart, clearCart, totalPrice } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="cart-empty-state">
        <div className="cart-empty-icon">🛒</div>
        <h2>Sign in to view your cart</h2>
        <p>Your cart items will appear here after you sign in.</p>
        <button className="btn btn-primary" onClick={() => navigate('/auth')}>
          Sign In
        </button>
      </div>
    );
  }

  if (cartLoading) {
    return (
      <div className="cart-empty-state">
        <div className="cart-spinner" />
        <p>Loading your cart…</p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="cart-empty-state">
        <div className="cart-empty-icon">🛒</div>
        <h2>Your cart is empty</h2>
        <p>Add some products to get started.</p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <div className="cart-header">
          <h1>Your Cart</h1>
          <button className="cart-clear-btn" onClick={clearCart}>
            Clear all
          </button>
        </div>

        <div className="cart-layout">
          {/* Items list */}
          <div className="cart-items">
            {cartItems.map(item => {
              const imgUrl = getImageUrl(item.imageUrl);
              return (
                <div className="cart-item" key={item.id}>
                  <div className="cart-item-image">
                    {imgUrl ? (
                      <img src={imgUrl} alt={item.productName} />
                    ) : (
                      <span className="cart-item-placeholder">📦</span>
                    )}
                  </div>

                  <div className="cart-item-info">
                    <div className="cart-item-name">{item.productName}</div>
                    <div className="cart-item-desc">{item.description}</div>
                    <div className="cart-item-price">
                      ₹{parseFloat(item.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  <div className="cart-item-controls">
                    <div className="qty-controls">
                      <button
                        className="qty-btn"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >−</button>
                      <span className="qty-value">{item.quantity}</span>
                      <button
                        className="qty-btn"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                      >+</button>
                    </div>
                    <div className="cart-item-subtotal">
                      ₹{(parseFloat(item.price) * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    <button
                      className="cart-remove-btn"
                      onClick={() => removeFromCart(item.id)}
                      title="Remove item"
                    >✕</button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order summary */}
          <div className="cart-summary">
            <h2>Order Summary</h2>
            <div className="summary-row">
              <span>Subtotal ({cartItems.reduce((s, i) => s + i.quantity, 0)} items)</span>
              <span>₹{totalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span className="summary-free">FREE</span>
            </div>
            <div className="summary-divider" />
            <div className="summary-row summary-total">
              <span>Total</span>
              <span>₹{totalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <button className="btn btn-primary cart-checkout-btn">
              Proceed to Checkout
            </button>
            <button className="btn btn-outline cart-continue-btn" onClick={() => navigate('/')}>
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
