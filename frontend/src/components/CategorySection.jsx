import { useState, useEffect } from 'react';
import api from '../api/axios';
import './CategorySection.css';

const CATEGORY_ICONS = {
  Smartphones: '📱',
  Smartwatches: '⌚',
  Headphones: '🎧',
  Laptops: '💻',
};

export default function CategorySection() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.get('/categories')
      .then((res) => setCategories(res.data))
      .catch(() => {
        // Fallback data if backend is not running
        setCategories([
          { categoryId: 1, categoryName: 'Smartphones' },
          { categoryId: 2, categoryName: 'Smartwatches' },
          { categoryId: 3, categoryName: 'Headphones' },
          { categoryId: 4, categoryName: 'Laptops' },
        ]);
      });
  }, []);

  return (
    <section className="category-section">
      <div className="container">
        <div className="section-header">
          <h2>Shop by Category</h2>
          <p>Find exactly what you're looking for</p>
        </div>
        <div className="category-grid">
          {categories.map((cat) => (
            <div className="category-card" key={cat.categoryId}>
              <div className="category-card-icon">
                {CATEGORY_ICONS[cat.categoryName] || '📦'}
              </div>
              <h3>{cat.categoryName}</h3>
              <p>Browse deals →</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
