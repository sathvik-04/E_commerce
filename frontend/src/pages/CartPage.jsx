import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import './CartPage.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:8080';

function getImageUrl(url) {
  if (!url) return null;
  return url.startsWith('http') ? url : `${API_BASE}${url}`;
}

export default function CartPage() {
  const { cartItems, cartLoading, updateQuantity, removeFromCart, clearCart, fetchCart, totalPrice } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  /* ── Razorpay Checkout ── */
  const handleCheckout = async () => {
    if (!user) { navigate('/auth'); return; }
    if (!window.Razorpay) {
      setPaymentError('Payment SDK failed to load. Please refresh the page.');
      return;
    }

    setCheckoutLoading(true);
    setPaymentError('');

    try {
      // Step 1 – create order on server
      const { data: order } = await api.post('/payment/create-order', {
        amount: totalPrice,
      });

      // Step 2 – open Razorpay modal
      const options = {
        key: order.keyId,
        amount: Math.round(totalPrice * 100), // paise
        currency: order.currency || 'INR',
        name: 'SalesBasket',
        description: `${cartItems.length} item(s) — Certified Refurbished Electronics`,
        order_id: order.orderId,
        image: 'https://via.placeholder.com/64x64/2d6a4f/ffffff?text=SB',
        prefill: {
          name: user.username,
        },
        theme: { color: '#2d6a4f' },

        handler: async function (response) {
          // Step 3 – verify on server
          try {
            await api.post('/payment/verify', {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            await fetchCart(); // refresh frontend cart (which backend cleared)
            setPaymentSuccess(true);
          } catch (err) {
            const msg = err.response?.data?.message || 'Payment verification failed. Please try again.';
            setPaymentError(msg);
          } finally {
            setCheckoutLoading(false);
          }
        },

        modal: {
          ondismiss: () => setCheckoutLoading(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        setPaymentError(`Payment failed: ${response.error?.description || 'Declined'}`);
        setCheckoutLoading(false);
      });
      rzp.open();
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not initiate payment. Please try again.';
      setPaymentError(msg);
      setCheckoutLoading(false);
    }
  };

  /* ── Payment Success Screen ── */
  if (paymentSuccess) {
    return (
      <div className="cart-empty-state">
        <div className="payment-success-icon">✅</div>
        <h2>Payment Successful!</h2>
        <p>Thank you for your order, <strong>{user?.username}</strong>. Your order has been placed!</p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-primary" onClick={() => navigate('/orders')}>
            View My Orders
          </button>
          <button className="btn btn-outline" onClick={() => navigate('/')}>
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  /* ── Not Logged In ── */
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

  /* ── Loading ── */
  if (cartLoading) {
    return (
      <div className="cart-empty-state">
        <div className="cart-spinner" />
        <p>Loading your cart…</p>
      </div>
    );
  }

  /* ── Empty Cart ── */
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

  const totalItems = cartItems.reduce((s, i) => s + i.quantity, 0);

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
          {/* Items */}
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

          {/* Order Summary */}
          <div className="cart-summary">
            <h2>Order Summary</h2>
            <div className="summary-row">
              <span>Subtotal ({totalItems} item{totalItems !== 1 ? 's' : ''})</span>
              <span>₹{totalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span className="summary-free">FREE</span>
            </div>
            <div className="summary-row">
              <span>Tax (GST incl.)</span>
              <span>₹0.00</span>
            </div>
            <div className="summary-divider" />
            <div className="summary-row summary-total">
              <span>Total</span>
              <span>₹{totalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>

            {/* Error message */}
            {paymentError && (
              <div className="payment-error">{paymentError}</div>
            )}

            {/* Razorpay Checkout Button */}
            <button
              className="btn btn-primary cart-checkout-btn"
              onClick={handleCheckout}
              disabled={checkoutLoading}
            >
              {checkoutLoading ? (
                <>
                  <span className="checkout-spinner" />
                  Processing…
                </>
              ) : (
                <>
                  <span className="razorpay-icon">🔒</span>
                  Pay ₹{totalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </>
              )}
            </button>

            <div className="razorpay-badge">
              <img
                src="https://razorpay.com/assets/razorpay-glyph.svg"
                alt="Razorpay"
                width="16"
                height="16"
              />
              Secured by Razorpay
            </div>

            <button className="btn btn-outline cart-continue-btn" onClick={() => navigate('/')}>
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
