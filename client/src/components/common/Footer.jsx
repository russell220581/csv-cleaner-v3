function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>CSV Cleaner Pro</h3>
          <p>
            Advanced CSV processing and data cleaning tools for professionals.
          </p>
        </div>

        <div className="footer-section">
          <h4>Features</h4>
          <ul>
            <li>CSV Upload & Processing</li>
            <li>Data Validation</li>
            <li>Duplicate Removal</li>
            <li>Format Conversion</li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Company</h4>
          <ul>
            <li>About Us</li>
            <li>Contact</li>
            <li>Privacy Policy</li>
            <li>Terms of Service</li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Support</h4>
          <ul>
            <li>Help Center</li>
            <li>Documentation</li>
            <li>API Reference</li>
            <li>Status</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2024 CSV Cleaner Pro. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
