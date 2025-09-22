import { useState } from 'react';
import Login from '../components/auth/Login';
import Register from '../components/auth/Register';
import '../styles/components/auth.css';

function RegisterPage() {
  const [isLogin, setIsLogin] = useState(false);

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-left">
          <h1>Join CSV Cleaner Pro</h1>
          <p>Create your account and start processing CSV files in minutes</p>
        </div>

        <div className="auth-right">
          {isLogin ? (
            <Login onSwitchToRegister={() => setIsLogin(false)} />
          ) : (
            <Register onSwitchToLogin={() => setIsLogin(true)} />
          )}
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
