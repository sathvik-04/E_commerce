import { useState, useEffect } from 'react';
import api from '../api/axios';
import './CategorySection.css';

const CATEGORY_ICONS = {
  Smartphones: '📱',
  Smartwatches: '⌚',
  Headphones: '🎧',
  Laptops: '💻',
};

export default function CategorySection({ selectedCategoryId, onSelectCategory }) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.get('/categories')
      .then((res) => setCategories(res.data))
      .catch(() => {
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
          <p>
            {selectedCategoryId
              ? 'Click the same category again to show all products'
              : 'Click a category to filter products'}
          </p>
        </div>
        <div className="category-grid">
          {categories.map((cat) => {
            const isActive = selectedCategoryId === cat.categoryId;
            return (
              <div
                className={`category-card ${isActive ? 'active' : ''}`}
                key={cat.categoryId}
                onClick={() => onSelectCategory(cat)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && onSelectCategory(cat)}
              >
                <div className="category-card-icon">
                  {CATEGORY_ICONS[cat.categoryName] || '📦'}
                </div>
                <h3>{cat.categoryName}</h3>
                <p>{isActive ? 'Showing results ✓' : 'Browse deals →'}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
