import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          Sales<span>Basket</span>
        </Link>

        <button
          className="navbar-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={`navbar-center ${menuOpen ? 'open' : ''}`}>
          <div className="navbar-links">
            <Link to="/" className={isActive('/')} onClick={() => setMenuOpen(false)}>
              Home
            </Link>
            <Link to="/" className="" onClick={() => { setMenuOpen(false); setTimeout(() => document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' }), 100); }}>
              Products
            </Link>
          </div>

          <div className="navbar-actions">
            {/* Cart icon */}
            <Link
              to="/cart"
              className="navbar-cart"
              onClick={() => setMenuOpen(false)}
              title="Cart"
            >
              🛒
              {totalItems > 0 && (
                <span className="navbar-cart-badge">{totalItems > 99 ? '99+' : totalItems}</span>
              )}
            </Link>

            {user ? (
              <div className="navbar-user">
                <span>Hi, <strong>{user.username}</strong></span>
                <button onClick={handleLogout} className="navbar-logout">
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/auth"
                  className="btn-text"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/auth?tab=signup"
                  className="btn btn-primary"
                  style={{ padding: '8px 20px', fontSize: '0.875rem' }}
                  onClick={() => setMenuOpen(false)}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
