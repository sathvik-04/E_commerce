import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <h3>Sales<span>Basket</span></h3>
          <p>
            Your trusted marketplace for certified refurbished electronics.
            Premium tech at a fraction of the price.
          </p>
        </div>

        <div className="footer-col">
          <h4>Shop</h4>
          <ul>
            <li><Link to="/">Smartphones</Link></li>
            <li><Link to="/">Laptops</Link></li>
            <li><Link to="/">Smartwatches</Link></li>
            <li><Link to="/">Headphones</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Support</h4>
          <ul>
            <li><a href="#">Help Center</a></li>
            <li><a href="#">Shipping Info</a></li>
            <li><a href="#">Returns & Refunds</a></li>
            <li><a href="#">Warranty Policy</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Company</h4>
          <ul>
            <li><a href="#">About Us</a></li>
            <li><a href="#">How It Works</a></li>
            <li><a href="#">Sustainability</a></li>
            <li><a href="#">Contact</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} SalesBasket. All rights reserved.</p>
      </div>
    </footer>
  );
}
