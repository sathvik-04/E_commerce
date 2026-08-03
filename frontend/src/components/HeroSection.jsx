import { Link } from 'react-router-dom';
import './HeroSection.css';

export default function HeroSection() {
  return (
    <section className="hero">
      <div className="container">
        <div className="hero-inner">
          <div className="hero-content">
            <span className="hero-badge">✓ Certified Refurbished</span>
            <h1>Premium tech, renewed for you.</h1>
            <p>
              Save up to 70% on smartphones, laptops, and more — rigorously
              tested, certified, and backed by our quality guarantee.
            </p>
            <div className="hero-actions">
              <Link to="/" className="btn btn-primary">
                Shop Now
              </Link>
              <a href="#why-refurbished" className="hero-link">
                How it works →
              </a>
            </div>

            <div className="hero-stats">
              <div className="hero-stat">
                <strong>50K+</strong>
                <span>Devices sold</span>
              </div>
              <div className="hero-stat">
                <strong>4.8★</strong>
                <span>Customer rating</span>
              </div>
              <div className="hero-stat">
                <strong>12 mo</strong>
                <span>Warranty included</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-image-grid">
              <div className="hero-image-card">
                <div className="card-emoji">📱</div>
                <div className="card-label">Smartphones</div>
                <div className="card-count">From ₹14,999</div>
              </div>
              <div className="hero-image-card">
                <div className="card-emoji">💻</div>
                <div className="card-label">Laptops</div>
                <div className="card-count">From ₹24,999</div>
              </div>
              <div className="hero-image-card">
                <div className="card-emoji">⌚</div>
                <div className="card-label">Smartwatches</div>
                <div className="card-count">From ₹4,999</div>
              </div>
              <div className="hero-image-card">
                <div className="card-emoji">🎧</div>
                <div className="card-label">Headphones</div>
                <div className="card-count">From ₹2,999</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
