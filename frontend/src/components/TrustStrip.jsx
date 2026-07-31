import './TrustStrip.css';

export default function TrustStrip() {
  return (
    <div className="trust-strip">
      <div className="trust-strip-inner">
        <div className="trust-item">
          <div className="trust-icon">🔍</div>
          <div className="trust-text">
            Certified Quality
            <span>Rigorous 72-point inspection</span>
          </div>
        </div>
        <div className="trust-item">
          <div className="trust-icon">📦</div>
          <div className="trust-text">
            Free Shipping
            <span>On all orders over ₹999</span>
          </div>
        </div>
        <div className="trust-item">
          <div className="trust-icon">🔄</div>
          <div className="trust-text">
            30-Day Returns
            <span>No questions asked</span>
          </div>
        </div>
        <div className="trust-item">
          <div className="trust-icon">🛡️</div>
          <div className="trust-text">
            12-Month Warranty
            <span>Full manufacturer coverage</span>
          </div>
        </div>
      </div>
    </div>
  );
}
