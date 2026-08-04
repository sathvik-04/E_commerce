import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import './HeroSection.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:8080';

function getImageUrl(url) {
  if (!url) return null;
  return url.startsWith('http') ? url : `${API_BASE}${url}`;
}

export default function HeroSection() {
  const [products, setProducts] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState('next'); // 'next' or 'prev'
  const timerRef = useRef(null);
  const INTERVAL = 3500; // 3.5 seconds

  useEffect(() => {
    api.get('/products', { params: { size: 50, page: 0 } })
      .then((res) => {
        const all = res.data.content || [];
        // Pick one product per category that has an image (for variety)
        const seen = {};
        const picks = [];
        all.forEach((p) => {
          const cat = p.category?.categoryName;
          if (cat && !seen[cat] && p.images && p.images.length > 0) {
            seen[cat] = true;
            picks.push(p);
          }
        });
        // If we have fewer than 4 unique categories, fill with more products
        if (picks.length < 4) {
          all.forEach((p) => {
            if (picks.length >= 6) return;
            if (!picks.find(x => x.productId === p.productId) && p.images?.length > 0) {
              picks.push(p);
            }
          });
        }
        setProducts(picks);
      })
      .catch(() => {});
  }, []);

  const goToNext = useCallback(() => {
    if (products.length <= 1 || animating) return;
    setDirection('next');
    setAnimating(true);
    setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % products.length);
      setAnimating(false);
    }, 500);
  }, [products.length, animating]);

  const goToPrev = useCallback(() => {
    if (products.length <= 1 || animating) return;
    setDirection('prev');
    setAnimating(true);
    setTimeout(() => {
      setActiveIndex((prev) => (prev - 1 + products.length) % products.length);
      setAnimating(false);
    }, 500);
  }, [products.length, animating]);

  // Auto-advance timer
  useEffect(() => {
    if (products.length <= 1) return;
    timerRef.current = setInterval(goToNext, INTERVAL);
    return () => clearInterval(timerRef.current);
  }, [products.length, goToNext]);

  // Pause on hover
  const handleMouseEnter = () => clearInterval(timerRef.current);
  const handleMouseLeave = () => {
    if (products.length <= 1) return;
    timerRef.current = setInterval(goToNext, INTERVAL);
  };

  const currentProduct = products[activeIndex];
  const currentImg = currentProduct?.images?.[0]?.imageUrl
    ? getImageUrl(currentProduct.images[0].imageUrl)
    : null;
  const currentCategory = currentProduct?.category?.categoryName || '';
  const currentPrice = currentProduct?.price
    ? `₹${parseFloat(currentProduct.price).toLocaleString('en-IN')}`
    : '';

  return (
    <section className="hero">
      <div className="container">
        <div className="hero-inner">
          <div className="hero-content">
            <div className="hero-tag">
              <span className="hero-tag-dot"></span>
              Certified Refurbished
            </div>
            <h1>Premium tech, <br/><em>renewed</em> for you.</h1>
            <p>
              Save up to 70% on smartphones, laptops, and more — rigorously
              tested, certified, and backed by our 12-month warranty.
            </p>
            <div className="hero-actions">
              <Link
                to="/"
                className="btn btn-primary hero-cta"
                onClick={() => setTimeout(() => document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' }), 100)}
              >
                Shop Now
              </Link>
              <a href="#why-refurbished" className="btn btn-outline">
                How it works
              </a>
            </div>
          </div>

          <div
            className="hero-visual"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="hero-carousel">
              <div className={`hero-card ${animating ? `slide-out-${direction}` : 'slide-in'}`}>
                {currentImg ? (
                  <img
                    src={currentImg}
                    alt={currentProduct?.name || 'Product'}
                    className="hero-product-img"
                  />
                ) : (
                  <div className="hero-placeholder">📦</div>
                )}
                <div className="hero-card-label">
                  <span className="hero-card-badge-green">Renewed</span>
                  <div className="hero-card-info">
                    <span className="hero-card-name">
                      {currentProduct?.name || 'Featured Product'}
                    </span>
                    {currentPrice && (
                      <span className="hero-card-price">{currentPrice}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Navigation arrows */}
              {products.length > 1 && (
                <div className="hero-carousel-nav">
                  <button
                    className="hero-carousel-btn"
                    onClick={goToPrev}
                    aria-label="Previous product"
                  >
                    ‹
                  </button>
                  <button
                    className="hero-carousel-btn"
                    onClick={goToNext}
                    aria-label="Next product"
                  >
                    ›
                  </button>
                </div>
              )}

              {/* Dot indicators */}
              {products.length > 1 && (
                <div className="hero-carousel-dots">
                  {products.map((_, i) => (
                    <button
                      key={i}
                      className={`hero-dot ${i === activeIndex ? 'active' : ''}`}
                      onClick={() => {
                        if (i === activeIndex || animating) return;
                        setDirection(i > activeIndex ? 'next' : 'prev');
                        setAnimating(true);
                        setTimeout(() => {
                          setActiveIndex(i);
                          setAnimating(false);
                        }, 500);
                      }}
                      aria-label={`Go to product ${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="hero-stats-strip">
              <div className="hero-stat">
                <strong>50K+</strong>
                <span>devices sold</span>
              </div>
              <div className="hero-stat-divider"></div>
              <div className="hero-stat">
                <strong>4.8 ★</strong>
                <span>avg. rating</span>
              </div>
              <div className="hero-stat-divider"></div>
              <div className="hero-stat">
                <strong>12 mo</strong>
                <span>warranty</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
