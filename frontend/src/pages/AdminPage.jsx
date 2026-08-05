import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './AdminPage.css';

export default function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('products');

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user || user.role !== 'ADMIN') return null;

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <h2>Admin Panel</h2>
          <p>Manage your store</p>
        </div>

        <div className="admin-tabs">
          {[
            { key: 'products', label: '📦 Products', },
            { key: 'users', label: '👥 Users', },
            { key: 'revenue', label: '📊 Revenue', },
            { key: 'invoices', label: '🧾 Invoices', },
          ].map(tab => (
            <button
              key={tab.key}
              className={`admin-tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="admin-content">
          {activeTab === 'products' && <ProductsPanel />}
          {activeTab === 'users' && <UsersPanel />}
          {activeTab === 'revenue' && <RevenuePanel />}
          {activeTab === 'invoices' && <InvoicesPanel />}
        </div>
      </div>
    </div>
  );
}

/* ===================== PRODUCTS PANEL ===================== */
function ProductsPanel() {
  const [form, setForm] = useState({ name: '', description: '', price: '', stock: '', categoryId: '', imageUrl: '' });
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch { /* ignore */ }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products?size=100');
      setProducts(res.data.content || []);
    } catch { /* ignore */ }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await api.post('/admin/products', {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
        categoryId: parseInt(form.categoryId),
        imageUrl: form.imageUrl
      });
      setMessage({ type: 'success', text: `Product "${res.data.name}" added successfully!` });
      setForm({ name: '', description: '', price: '', stock: '', categoryId: '', imageUrl: '' });
      fetchProducts();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to add product' });
    }
    setLoading(false);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await api.delete(`/admin/products/${id}`);
      setMessage({ type: 'success', text: `Product "${name}" deleted successfully!` });
      fetchProducts();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to delete product' });
    }
  };

  return (
    <div className="admin-panel">
      <h3>Add New Product</h3>
      {message && <div className={`admin-msg ${message.type}`}>{message.text}</div>}
      <form onSubmit={handleAdd} className="admin-form">
        <div className="form-row">
          <div className="form-group">
            <label>Product Name</label>
            <input className="form-input" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. iPhone 16 Pro" />
          </div>
          <div className="form-group">
            <label>Category</label>
            <select className="form-input" required value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})}>
              <option value="">Select category</option>
              {categories.map(c => <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>)}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea className="form-input" rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Product description..." />
        </div>
        <div className="form-group">
          <label>Image URL</label>
          <input className="form-input" type="url" value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} placeholder="https://example.com/image.jpg" />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Price (₹)</label>
            <input className="form-input" type="number" step="0.01" min="0.01" required value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="99999.00" />
          </div>
          <div className="form-group">
            <label>Stock</label>
            <input className="form-input" type="number" min="0" required value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} placeholder="50" />
          </div>
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Adding...' : '+ Add Product'}
        </button>
      </form>

      <h3 style={{ marginTop: 32 }}>Existing Products ({products.length})</h3>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr><th>ID</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Action</th></tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.productId}>
                <td>#{p.productId}</td>
                <td>{p.name}</td>
                <td>{p.category?.categoryName || '—'}</td>
                <td>₹{Number(p.price).toLocaleString()}</td>
                <td>{p.stock}</td>
                <td><button className="btn-delete" onClick={() => handleDelete(p.productId, p.name)}>Delete</button></td>
              </tr>
            ))}
            {products.length === 0 && <tr><td colSpan={6} className="empty-msg">No products found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ===================== USERS PANEL ===================== */
function UsersPanel() {
  const [userId, setUserId] = useState('');
  const [action, setAction] = useState('username');
  const [formData, setFormData] = useState({ username: '', email: '', currentPassword: '', newPassword: '', role: 'CUSTOMER' });
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) { setMessage({ type: 'error', text: 'Please enter a User ID' }); return; }
    setLoading(true);
    setMessage(null);

    try {
      let body = {};
      if (action === 'username') body = { username: formData.username };
      else if (action === 'email') body = { email: formData.email };
      else if (action === 'password') body = { currentPassword: formData.currentPassword, newPassword: formData.newPassword };
      else if (action === 'role') body = { role: formData.role };

      const res = await api.put(`/admin/users/${userId}/${action}`, body);
      setMessage({ type: 'success', text: res.data.message });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Update failed' });
    }
    setLoading(false);
  };

  return (
    <div className="admin-panel">
      <h3>User Management</h3>
      {message && <div className={`admin-msg ${message.type}`}>{message.text}</div>}

      <div className="form-row" style={{ marginBottom: 16 }}>
        <div className="form-group">
          <label>User ID</label>
          <input className="form-input" type="number" min="1" value={userId} onChange={e => setUserId(e.target.value)} placeholder="Enter user ID" />
        </div>
        <div className="form-group">
          <label>Action</label>
          <select className="form-input" value={action} onChange={e => setAction(e.target.value)}>
            <option value="username">Update Username</option>
            <option value="email">Update Email</option>
            <option value="password">Change Password</option>
            <option value="role">Update Role</option>
          </select>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="admin-form">
        {action === 'username' && (
          <div className="form-group">
            <label>New Username</label>
            <input className="form-input" required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} placeholder="New username (3-50 chars)" />
          </div>
        )}
        {action === 'email' && (
          <div className="form-group">
            <label>New Email</label>
            <input className="form-input" type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="new@email.com" />
          </div>
        )}
        {action === 'password' && (
          <>
            <div className="form-group">
              <label>Current Password</label>
              <input className="form-input" type="password" required value={formData.currentPassword} onChange={e => setFormData({...formData, currentPassword: e.target.value})} />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input className="form-input" type="password" required minLength={6} value={formData.newPassword} onChange={e => setFormData({...formData, newPassword: e.target.value})} />
            </div>
          </>
        )}
        {action === 'role' && (
          <div className="form-group">
            <label>New Role</label>
            <select className="form-input" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
              <option value="CUSTOMER">CUSTOMER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>
        )}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Updating...' : 'Update'}
        </button>
      </form>
    </div>
  );
}

/* ===================== REVENUE PANEL ===================== */
function RevenuePanel() {
  const [daily, setDaily] = useState(null);
  const [monthly, setMonthly] = useState(null);
  const [yearly, setYearly] = useState(null);
  const [overall, setOverall] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [loading, setLoading] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [d, m, y, o] = await Promise.all([
        api.get(`/admin/revenue/daily?date=${date}`),
        api.get(`/admin/revenue/monthly?year=${year}&month=${month}`),
        api.get(`/admin/revenue/yearly?year=${year}`),
        api.get('/admin/revenue/overall'),
      ]);
      setDaily(d.data);
      setMonthly(m.data);
      setYearly(y.data);
      setOverall(o.data);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  return (
    <div className="admin-panel">
      <h3>Business Analytics</h3>

      <div className="revenue-filters">
        <div className="form-group">
          <label>Date</label>
          <input className="form-input" type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Year</label>
          <input className="form-input" type="number" value={year} onChange={e => setYear(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Month</label>
          <select className="form-input" value={month} onChange={e => setMonth(e.target.value)}>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>{new Date(2000, i).toLocaleString('default', { month: 'long' })}</option>
            ))}
          </select>
        </div>
        <button className="btn btn-primary" onClick={fetchAll} disabled={loading} style={{ alignSelf: 'flex-end' }}>
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      <div className="revenue-cards">
        <RevenueCard title="Daily Revenue" data={daily} icon="📅" />
        <RevenueCard title="Monthly Revenue" data={monthly} icon="📆" />
        <RevenueCard title="Yearly Revenue" data={yearly} icon="📈" />
        <RevenueCard title="Overall Revenue" data={overall} icon="💰" />
      </div>
    </div>
  );
}

function RevenueCard({ title, data, icon }) {
  return (
    <div className="revenue-card">
      <div className="revenue-card-icon">{icon}</div>
      <div className="revenue-card-info">
        <span className="revenue-card-title">{title}</span>
        <span className="revenue-card-amount">
          {data ? `₹${Number(data.revenue).toLocaleString('en-IN')}` : '—'}
        </span>
        <span className="revenue-card-period">{data?.period || ''}</span>
        <span className="revenue-card-message">{data?.message || ''}</span>
      </div>
    </div>
  );
}

/* ===================== INVOICES PANEL ===================== */
function InvoicesPanel() {
  const [orderId, setOrderId] = useState('');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!orderId) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await api.post(`/admin/invoices/${orderId}/generate`);
      setMessage({ type: 'success', text: res.data.message });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to generate invoice' });
    }
    setLoading(false);
  };

  const handleDownload = async () => {
    if (!orderId) return;
    try {
      const res = await api.get(`/admin/invoices/${orderId}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-order-${orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setMessage({ type: 'success', text: 'Invoice downloaded!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to download invoice. Generate it first.' });
    }
  };

  return (
    <div className="admin-panel">
      <h3>Invoice Management</h3>
      <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>Generate and download PDF invoices for completed orders.</p>
      {message && <div className={`admin-msg ${message.type}`}>{message.text}</div>}

      <form onSubmit={handleGenerate} className="admin-form">
        <div className="form-group">
          <label>Order ID</label>
          <input className="form-input" type="number" min="1" required value={orderId} onChange={e => setOrderId(e.target.value)} placeholder="Enter order ID" />
        </div>
        <div className="invoice-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Generating...' : '🧾 Generate Invoice'}
          </button>
          <button type="button" className="btn btn-outline" onClick={handleDownload} disabled={!orderId}>
            📥 Download PDF
          </button>
        </div>
      </form>
    </div>
  );
}
