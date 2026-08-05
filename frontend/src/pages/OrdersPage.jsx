import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import './OrdersPage.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:8080';

function getImageUrl(url) {
  if (!url) return null;
  return url.startsWith('http') ? url : `${API_BASE}${url}`;
}

export default function OrdersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders');
      setOrders(res.data || []);
    } catch {
      setError('Failed to load your orders.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="orders-empty-state">
        <div className="orders-spinner" />
        <p>Loading your orders…</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="orders-empty-state">
        <div className="orders-empty-icon">📦</div>
        <h2>No orders found</h2>
        <p>You haven't placed any orders yet.</p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="container">
        <div className="orders-header">
          <h1>My Orders</h1>
          <p>View details and track all your past purchases</p>
        </div>

        {error && <div className="orders-error">{error}</div>}

        <div className="orders-list">
          {orders.map((order) => (
            <div className="order-card" key={order.id}>
              <div className="order-card-header">
                <div className="order-meta">
                  <span className="order-id">Order #{order.id}</span>
                  <span className="order-date">{formatDate(order.createdAt)}</span>
                </div>
                <div className="order-status-group">
                  <span className={`order-status-badge ${order.status?.toLowerCase()}`}>
                    {order.status === 'PAID' ? '✓ Paid' : order.status}
                  </span>
                  <span className="order-total-price">
                    ₹{parseFloat(order.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="order-items-list">
                {order.items?.map((item) => {
                  const imgUrl = getImageUrl(item.imageUrl);
                  return (
                    <div className="order-item-row" key={item.id}>
                      <div className="order-item-image">
                        {imgUrl ? (
                          <img src={imgUrl} alt={item.productName} />
                        ) : (
                          <span className="order-item-placeholder">📱</span>
                        )}
                      </div>
                      <div className="order-item-details">
                        <div className="order-item-name">{item.productName}</div>
                        <div className="order-item-qty">Qty: {item.quantity} × ₹{parseFloat(item.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                      </div>
                      <div className="order-item-subtotal">
                        ₹{parseFloat(item.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="order-card-footer">
                <span className="order-payment-id">
                  Payment ID: <code>{order.razorpayPaymentId || 'N/A'}</code>
                </span>
                <div className="order-actions">
                  <button className="btn-text" onClick={async () => {
                    try {
                      const res = await api.post(`/invoices/${order.id}/generate`);
                      alert(res.data.message);
                    } catch (err) {
                      alert(err.response?.data?.message || 'Failed to generate invoice');
                    }
                  }}>
                    🧾 Generate Invoice
                  </button>
                  <button className="btn-text" onClick={async () => {
                    try {
                      const res = await api.get(`/invoices/${order.id}/download`, { responseType: 'blob' });
                      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `invoice-order-${order.id}.pdf`;
                      document.body.appendChild(a);
                      a.click();
                      a.remove();
                      window.URL.revokeObjectURL(url);
                    } catch (err) {
                      alert('Failed to download invoice. Generate it first.');
                    }
                  }}>
                    📥 Download PDF
                  </button>
                  <button className="btn-text order-reorder-btn" onClick={() => navigate('/')}>
                    Buy Again →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
