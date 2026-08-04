import { useState, useEffect } from 'react';
import api from '../api/axios';
import './CategorySection.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:8080';

function getImageUrl(url) {
  if (!url) return null;
  return url.startsWith('http') ? url : `${API_BASE}${url}`;
}

export default function CategorySection({ selectedCategoryId, onSelectCategory }) {
  const [categories, setCategories] = useState([]);
  const [categoryImages, setCategoryImages] = useState({});

  useEffect(() => {
    api.get('/categories')
      .then((res) => setCategories(res.data || []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (categories.length === 0) return;
    categories.forEach((cat) => {
      api.get('/products', { params: { categoryId: cat.categoryId, size: 1, page: 0 } })
        .then((res) => {
          const products = res.data.content || [];
          if (products.length > 0 && products[0].images && products[0].images.length > 0) {
            setCategoryImages((prev) => ({
              ...prev,
              [cat.categoryId]: getImageUrl(products[0].images[0].imageUrl),
            }));
          }
        })
        .catch(() => {});
    });
  }, [categories]);

  if (categories.length === 0) return null;

  return (
    <section className="category-section">
      <div className="container">
        <div className="category-top">
          <div className="section-header">
            <h2>Shop by category</h2>
            <p>
              {selectedCategoryId
                ? 'Tap again to show all'
                : 'Find exactly what you need'}
            </p>
          </div>
        </div>
        <div className="category-grid">
          {categories.map((cat) => {
            const isActive = selectedCategoryId === cat.categoryId;
            const imgUrl = categoryImages[cat.categoryId];
            return (
              <button
                className={`category-card ${isActive ? 'active' : ''}`}
                key={cat.categoryId}
                onClick={() => onSelectCategory(cat)}
              >
                <div className="category-card-img-wrap">
                  {imgUrl ? (
                    <img src={imgUrl} alt={cat.categoryName} />
                  ) : (
                    <div className="category-card-placeholder">{
                      { Smartphones: '📱', Smartwatches: '⌚', Headphones: '🎧', Laptops: '💻' }[cat.categoryName] || '📦'
                    }</div>
                  )}
                </div>
                <span className="category-card-name">{cat.categoryName}</span>
                {isActive && <span className="category-card-check">✓</span>}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
