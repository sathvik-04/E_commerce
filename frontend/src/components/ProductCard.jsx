import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './ProductCard.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:8080';

function getImageUrl(url) {
  if (!url) return null;
  return url.startsWith('http') ? url : `${API_BASE}${url}`;
}

export default function ProductCard({ product }) {
  const [imgError, setImgError] = useState(false);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const rawUrl = product.images && product.images.length > 0
    ? product.images[0].imageUrl
    : null;
  const imageUrl = getImageUrl(rawUrl);

  const categoryName = product.category?.categoryName || 'General';

  const CATEGORY_EMOJIS = {
    Smartphones: '📱',
    Smartwatches: '⌚',
    Headphones: '🎧',
    Laptops: '💻',
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (!user) {
      navigate('/auth');
      return;
    }
    setAdding(true);
    try {
      await addToCart(product.productId, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch {
      // silent fail
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="product-card">
      <div className="product-card-image">
        {imageUrl && !imgError ? (
          <img
            src={imageUrl}
            alt={product.name}
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <span className="placeholder-icon">
            {CATEGORY_EMOJIS[categoryName] || '📦'}
          </span>
        )}
        <span className="product-card-badge">Renewed</span>
      </div>
      <div className="product-card-body">
        <div className="product-card-category">{categoryName}</div>
        <div className="product-card-name">{product.name}</div>
        <div className="product-card-footer">
          <span className="product-card-price">
            ₹{parseFloat(product.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <button
          className={`product-card-cart-btn ${added ? 'added' : ''}`}
          onClick={handleAddToCart}
          disabled={adding || product.stock === 0}
        >
          {product.stock === 0
            ? 'Out of Stock'
            : adding
            ? 'Adding…'
            : added
            ? '✓ Added to Cart'
            : '+ Add to Cart'}
        </button>
      </div>
    </div>
  );
}
