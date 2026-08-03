import { useState } from 'react';
import './ProductCard.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:8080';

export default function ProductCard({ product }) {
  const [imgError, setImgError] = useState(false);

  const imageUrl = product.images && product.images.length > 0
    ? `${API_BASE}${product.images[0].imageUrl}`
    : null;

  const categoryName = product.category?.categoryName || 'General';

  const CATEGORY_EMOJIS = {
    Smartphones: '📱',
    Smartwatches: '⌚',
    Headphones: '🎧',
    Laptops: '💻',
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
            ${parseFloat(product.price).toFixed(2)}
          </span>
          <span className="product-card-action">View Details →</span>
        </div>
      </div>
    </div>
  );
}
