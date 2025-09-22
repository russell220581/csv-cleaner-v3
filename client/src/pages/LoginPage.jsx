import { useState } from 'react';
import Login from '../components/auth/Login';
import Register from '../components/auth/Register';
import '../styles/components/auth.css';

function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-left">
          <h1>CSV Cleaner Pro</h1>
          <p>Sign in to access your dashboard and start processing CSV files</p>
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

export default LoginPage;
