import { useState, useEffect } from 'react';
import api from '../api/axios';
import ProductCard from './ProductCard';
import './FeaturedProducts.css';

export default function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/products', {
      params: { size: 8, sortBy: 'productId', direction: 'desc' },
    })
      .then((res) => {
        setProducts(res.data.content || []);
      })
      .catch(() => {
        // Fallback sample data if backend is not running
        setProducts([
          { productId: 1, name: 'iPhone 15 Pro', price: '999.99', category: { categoryName: 'Smartphones' }, images: [] },
          { productId: 2, name: 'Samsung Galaxy S24 Ultra', price: '1199.99', category: { categoryName: 'Smartphones' }, images: [] },
          { productId: 3, name: 'MacBook Pro 14" M3 Pro', price: '1999.99', category: { categoryName: 'Laptops' }, images: [] },
          { productId: 4, name: 'Sony WH-1000XM5', price: '349.99', category: { categoryName: 'Headphones' }, images: [] },
          { productId: 5, name: 'Apple Watch Series 9', price: '399.99', category: { categoryName: 'Smartwatches' }, images: [] },
          { productId: 6, name: 'Dell XPS 15', price: '1799.99', category: { categoryName: 'Laptops' }, images: [] },
          { productId: 7, name: 'Google Pixel 8 Pro', price: '799.99', category: { categoryName: 'Smartphones' }, images: [] },
          { productId: 8, name: 'AirPods Pro 2', price: '249.99', category: { categoryName: 'Headphones' }, images: [] },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="featured-section">
      <div className="container">
        <div className="featured-header">
          <div className="section-header">
            <h2>Just Arrived</h2>
            <p>The latest certified refurbished deals</p>
          </div>
          <a href="#" className="featured-view-all">View all products →</a>
        </div>

        <div className="featured-grid">
          {loading ? (
            <div className="featured-loading">
              <div className="spinner"></div>
              <p>Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="featured-empty">
              <p>No products available right now. Check back soon!</p>
            </div>
          ) : (
            products.map((product) => (
              <ProductCard key={product.productId} product={product} />
            ))
          )}
        </div>
      </div>
    </section>
  );
}
