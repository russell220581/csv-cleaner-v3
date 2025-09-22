import { Link } from 'react-router-dom';
import { Upload, Shield, Zap, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Clean, Process & Analyze CSV Files with Ease</h1>
          <p>
            CSV Cleaner Pro helps you process, validate, and transform your CSV
            files with powerful AI-powered tools and intuitive interface.
          </p>
          <div className="hero-actions">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn btn-primary btn-lg">
                Go to Dashboard
              </Link>
            ) : (
              <Link to="/register" className="btn btn-primary btn-lg">
                Get Started Free
              </Link>
            )}
            <Link to="/pricing" className="btn btn-secondary btn-lg">
              View Pricing
            </Link>
          </div>
        </div>
        <div className="hero-image">
          <div className="placeholder-image">
            <Upload size={64} />
            <p>CSV Processing Interface</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2>Why Choose CSV Cleaner Pro?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <Zap size={48} />
              <h3>Lightning Fast</h3>
              <p>
                Process large CSV files in seconds with our optimized algorithms
              </p>
            </div>
            <div className="feature-card">
              <Shield size={48} />
              <h3>Secure & Private</h3>
              <p>
                Your data is encrypted and never stored longer than necessary
              </p>
            </div>
            <div className="feature-card">
              <Users size={48} />
              <h3>Team Collaboration</h3>
              <p>Share processed files with your team members securely</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <h2>Ready to Transform Your Data Workflow?</h2>
          <p>
            Join thousands of professionals who trust CSV Cleaner Pro for their
            data processing needs
          </p>
          {!isAuthenticated && (
            <Link to="/register" className="btn btn-primary btn-lg">
              Start Free Trial
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}

export default Home;
