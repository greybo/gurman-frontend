// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FileSpreadsheet, Mail, Lock, LogIn } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signup, login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignup) {
        await signup(email, password);
      } else {
        await login(email, password);
      }
      navigate('/');
    } catch (error) {
      console.error('Auth error:', error);
      setError(
        error.code === 'auth/email-already-in-use' 
          ? 'Email вже використовується'
          : error.code === 'auth/weak-password'
          ? 'Пароль має бути мінімум 6 символів'
          : error.code === 'auth/user-not-found'
          ? 'Користувача не знайдено'
          : error.code === 'auth/wrong-password'
          ? 'Невірний пароль'
          : 'Помилка авторизації'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      await loginWithGoogle();
      navigate('/');
    } catch (error) {
      console.error('Google auth error:', error);
      setError('Помилка входу через Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <FileSpreadsheet className="login-logo" />
          <h1 className="login-title">Excel Parser</h1>
          <p className="login-subtitle">
            {isSignup ? 'Створити обліковий запис' : 'Увійти в систему'}
          </p>
        </div>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">
              <Mail size={18} />
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <Lock size={18} />
              Пароль
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="form-input"
              required
              minLength={6}
            />
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            <LogIn size={20} />
            {loading ? 'Завантаження...' : isSignup ? 'Зареєструватися' : 'Увійти'}
          </button>
        </form>

        <div className="divider">
          <span>або</span>
        </div>

        <button 
          onClick={handleGoogleLogin}
          className="google-button"
          disabled={loading}
        >
          <svg width="20" height="20" viewBox="0 0 20 20">
            <path fill="#4285F4" d="M19.6 10.23c0-.82-.1-1.42-.25-2.05H10v3.72h5.5c-.15.96-.74 2.31-2.04 3.22v2.45h3.16c1.89-1.73 2.98-4.3 2.98-7.34z"/>
            <path fill="#34A853" d="M13.46 15.13c-.83.59-1.96 1-3.46 1-2.64 0-4.88-1.74-5.68-4.15H1.07v2.52C2.72 17.75 6.09 20 10 20c2.7 0 4.96-.89 6.62-2.42l-3.16-2.45z"/>
            <path fill="#FBBC05" d="M3.99 10c0-.69.12-1.35.32-1.97V5.51H1.07A9.973 9.973 0 000 10c0 1.61.39 3.14 1.07 4.49l3.24-2.52c-.2-.62-.32-1.28-.32-1.97z"/>
            <path fill="#EA4335" d="M10 3.88c1.88 0 3.13.81 3.85 1.48l2.84-2.76C14.96.99 12.7 0 10 0 6.09 0 2.72 2.25 1.07 5.51l3.24 2.52C5.12 5.62 7.36 3.88 10 3.88z"/>
          </svg>
          Увійти через Google
        </button>

        <div className="login-footer">
          <button 
            onClick={() => setIsSignup(!isSignup)}
            className="toggle-auth"
          >
            {isSignup 
              ? 'Вже є акаунт? Увійти' 
              : 'Немає акаунту? Зареєструватися'
            }
          </button>
        </div>
      </div>
    </div>
  );
}