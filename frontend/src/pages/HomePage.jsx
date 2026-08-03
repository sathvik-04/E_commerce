import HeroSection from '../components/HeroSection';
import TrustStrip from '../components/TrustStrip';
import CategorySection from '../components/CategorySection';
import FeaturedProducts from '../components/FeaturedProducts';
import './HomePage.css';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TrustStrip />
      <CategorySection />
      <FeaturedProducts />

      {/* Why Refurbished */}
      <section className="why-section" id="why-refurbished">
        <div className="container">
          <div className="section-header">
            <h2>Why buy refurbished?</h2>
            <p>Smart shopping, without the compromise</p>
          </div>

          <div className="why-grid">
            <div className="why-item">
              <div className="why-icon">💰</div>
              <h3>Save up to 70%</h3>
              <p>
                Why pay full price? Our refurbished devices are functionally
                identical to new — tested, verified, and priced to save you
                serious money.
              </p>
            </div>

            <div className="why-item">
              <div className="why-icon">🌱</div>
              <h3>Better for the planet</h3>
              <p>
                Every refurbished purchase keeps a device out of landfill.
                You're reducing e-waste and the carbon footprint of
                manufacturing a brand-new product.
              </p>
            </div>

            <div className="why-item">
              <div className="why-icon">✅</div>
              <h3>Quality guaranteed</h3>
              <p>
                Each device goes through a rigorous 72-point inspection,
                battery health check, and cosmetic grading. If it doesn't
                meet our standards, we don't sell it.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
