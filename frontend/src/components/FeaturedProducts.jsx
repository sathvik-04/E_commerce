import { useState, useEffect } from 'react';
import api from '../api/axios';
import ProductCard from './ProductCard';
import './FeaturedProducts.css';

export default function FeaturedProducts({ categoryId, categoryName }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const pageSize = categoryId ? 12 : 8;

  useEffect(() => {
    setPage(0); // reset page on category change
  }, [categoryId]);

  useEffect(() => {
    setLoading(true);
    const params = {
      size: pageSize,
      page,
      sortBy: 'productId',
      direction: categoryId ? 'asc' : 'desc',
    };
    if (categoryId) params.categoryId = categoryId;

    api.get('/products', { params })
      .then((res) => {
        setProducts(res.data.content || []);
        setTotalPages(res.data.totalPages || 0);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [categoryId, page, pageSize]);

  const title = categoryName ? `${categoryName}` : 'Just Arrived';
  const subtitle = categoryName
    ? `All ${categoryName} products`
    : 'The latest certified refurbished deals';

  return (
    <section className="featured-section">
      <div className="container">
        <div className="featured-header">
          <div className="section-header">
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
          {!categoryId && (
            <a href="#" className="featured-view-all">View all products →</a>
          )}
          {categoryId && totalPages > 1 && (
            <div className="featured-pagination">
              <button
                className="page-btn"
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
              >← Prev</button>
              <span>{page + 1} / {totalPages}</span>
              <button
                className="page-btn"
                disabled={page >= totalPages - 1}
                onClick={() => setPage(p => p + 1)}
              >Next →</button>
            </div>
          )}
        </div>

        <div className="featured-grid">
          {loading ? (
            <div className="featured-loading">
              <div className="spinner" />
              <p>Loading products…</p>
            </div>
          ) : products.length === 0 ? (
            <div className="featured-empty">
              <p>No products found in this category.</p>
            </div>
          ) : (
            products.map((product) => (
              <ProductCard key={product.productId} product={product} />
            ))
          )}
        </div>

        {/* Bottom pagination for category view */}
        {!loading && categoryId && totalPages > 1 && (
          <div className="featured-pagination-bottom">
            <button
              className="page-btn"
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
            >← Prev</button>
            <span>Page {page + 1} of {totalPages}</span>
            <button
              className="page-btn"
              disabled={page >= totalPages - 1}
              onClick={() => setPage(p => p + 1)}
            >Next →</button>
          </div>
        )}
      </div>
    </section>
  );
}
