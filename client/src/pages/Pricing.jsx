import { Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { PLANS } from '../utils/constants';

function Pricing() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="pricing-page">
      <div className="pricing-header">
        <h1>Simple, Transparent Pricing</h1>
        <p>Choose the plan that works best for your needs</p>
      </div>

      <div className="pricing-grid">
        {Object.entries(PLANS).map(([key, plan]) => (
          <div key={key} className="pricing-card">
            <div className="plan-header">
              <h3>{plan.name}</h3>
              <div className="plan-price">
                ${plan.price}
                <span>/month</span>
              </div>
            </div>

            <ul className="plan-features">
              {plan.features.map((feature, index) => (
                <li key={index}>
                  <Check size={16} />
                  {feature}
                </li>
              ))}
            </ul>

            <button
              className={`btn ${
                key === 'FREE' ? 'btn-secondary' : 'btn-primary'
              } btn-lg`}
            >
              {isAuthenticated ? 'Upgrade Plan' : 'Get Started'}
            </button>

            {key === 'PRO' && <div className="plan-badge">Most Popular</div>}
          </div>
        ))}
      </div>

      <div className="pricing-faq">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-grid">
          <div className="faq-item">
            <h4>Can I change plans anytime?</h4>
            <p>Yes, you can upgrade or downgrade your plan at any time.</p>
          </div>
          <div className="faq-item">
            <h4>Is there a free trial?</h4>
            <p>All paid plans come with a 14-day free trial.</p>
          </div>
          <div className="faq-item">
            <h4>What payment methods do you accept?</h4>
            <p>We accept all major credit cards and PayPal.</p>
          </div>
          <div className="faq-item">
            <h4>Do you offer discounts for teams?</h4>
            <p>Yes, we offer special pricing for teams of 5+ users.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Pricing;
