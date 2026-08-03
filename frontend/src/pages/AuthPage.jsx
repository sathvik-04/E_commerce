import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPage.css';

export default function AuthPage() {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState(
    searchParams.get('tab') === 'signup' ? 'signup' : 'login'
  );

  // Form state
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  const clearToast = () => setTimeout(() => setToast(null), 4000);

  // === Login ===
  const validateLogin = () => {
    const errs = {};
    if (!loginForm.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(loginForm.email)) errs.email = 'Enter a valid email';
    if (!loginForm.password) errs.password = 'Password is required';
    return errs;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const errs = validateLogin();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    setToast(null);
    try {
      await login(loginForm.email, loginForm.password);
      navigate('/');
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Invalid email or password';
      setToast({ type: 'error', message: msg });
      clearToast();
    } finally {
      setLoading(false);
    }
  };

  // === Signup ===
  const validateSignup = () => {
    const errs = {};
    if (!signupForm.username.trim()) errs.username = 'Username is required';
    else if (signupForm.username.length < 3) errs.username = 'At least 3 characters';
    if (!signupForm.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(signupForm.email)) errs.email = 'Enter a valid email';
    if (!signupForm.password) errs.password = 'Password is required';
    else if (signupForm.password.length < 6) errs.password = 'At least 6 characters';
    if (signupForm.password !== signupForm.confirmPassword)
      errs.confirmPassword = 'Passwords do not match';
    return errs;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const errs = validateSignup();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    setToast(null);
    try {
      await register(signupForm.username, signupForm.email, signupForm.password);
      setToast({ type: 'success', message: 'Account created! Sign in to continue.' });
      clearToast();
      setSignupForm({ username: '', email: '', password: '', confirmPassword: '' });
      setTimeout(() => setActiveTab('login'), 1500);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Registration failed. Please try again.';
      setToast({ type: 'error', message: msg });
      clearToast();
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setErrors({});
    setToast(null);
  };

  return (
    <div className="auth-page">
      {/* Left branding panel */}
      <div className="auth-left">
        <div className="auth-left-content">
          <h1>
            Welcome to <br />
            Sales<span>Basket</span>
          </h1>
          <p>
            Join thousands of smart shoppers saving big on certified
            refurbished electronics. Same quality, better price.
          </p>
          <div className="auth-left-features">
            <div className="auth-feature">
              <span className="auth-feature-icon">✓</span>
              <div className="auth-feature-text">
                <strong>Save up to 70%</strong>
                Compared to buying brand new
              </div>
            </div>
            <div className="auth-feature">
              <span className="auth-feature-icon">✓</span>
              <div className="auth-feature-text">
                <strong>12-Month Warranty</strong>
                Every device is fully covered
              </div>
            </div>
            <div className="auth-feature">
              <span className="auth-feature-icon">✓</span>
              <div className="auth-feature-text">
                <strong>Free Returns</strong>
                30-day hassle-free return policy
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="auth-right">
        <div className="auth-form-container">
          <div className="auth-form-header">
            <h2>{activeTab === 'login' ? 'Sign in' : 'Create account'}</h2>
            <p>
              {activeTab === 'login'
                ? 'Welcome back! Enter your credentials.'
                : 'Get started with your free account.'}
            </p>
          </div>

          <div className="auth-tabs">
            <button
              className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => switchTab('login')}
            >
              Sign In
            </button>
            <button
              className={`auth-tab ${activeTab === 'signup' ? 'active' : ''}`}
              onClick={() => switchTab('signup')}
            >
              Sign Up
            </button>
          </div>

          {toast && (
            <div className={`auth-toast ${toast.type}`}>{toast.message}</div>
          )}

          {activeTab === 'login' ? (
            <form className="auth-form" onSubmit={handleLogin} noValidate>
              <div className="form-group">
                <label htmlFor="login-email">Email</label>
                <input
                  id="login-email"
                  type="email"
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  placeholder="you@example.com"
                  value={loginForm.email}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, email: e.target.value })
                  }
                />
                {errors.email && <p className="form-error">{errors.email}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="login-password">Password</label>
                <div className="password-wrapper">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    className={`form-input ${errors.password ? 'error' : ''}`}
                    placeholder="Enter your password"
                    value={loginForm.password}
                    onChange={(e) =>
                      setLoginForm({ ...loginForm, password: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                {errors.password && (
                  <p className="form-error">{errors.password}</p>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary auth-submit"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>

              <div className="auth-switch">
                Don't have an account?
                <button type="button" onClick={() => switchTab('signup')}>
                  Sign up
                </button>
              </div>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleSignup} noValidate>
              <div className="form-group">
                <label htmlFor="signup-username">Username</label>
                <input
                  id="signup-username"
                  type="text"
                  className={`form-input ${errors.username ? 'error' : ''}`}
                  placeholder="johndoe"
                  value={signupForm.username}
                  onChange={(e) =>
                    setSignupForm({ ...signupForm, username: e.target.value })
                  }
                />
                {errors.username && (
                  <p className="form-error">{errors.username}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="signup-email">Email</label>
                <input
                  id="signup-email"
                  type="email"
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  placeholder="you@example.com"
                  value={signupForm.email}
                  onChange={(e) =>
                    setSignupForm({ ...signupForm, email: e.target.value })
                  }
                />
                {errors.email && <p className="form-error">{errors.email}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="signup-password">Password</label>
                <div className="password-wrapper">
                  <input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    className={`form-input ${errors.password ? 'error' : ''}`}
                    placeholder="At least 6 characters"
                    value={signupForm.password}
                    onChange={(e) =>
                      setSignupForm({ ...signupForm, password: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                {errors.password && (
                  <p className="form-error">{errors.password}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="signup-confirm">Confirm Password</label>
                <input
                  id="signup-confirm"
                  type="password"
                  className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                  placeholder="Repeat your password"
                  value={signupForm.confirmPassword}
                  onChange={(e) =>
                    setSignupForm({
                      ...signupForm,
                      confirmPassword: e.target.value,
                    })
                  }
                />
                {errors.confirmPassword && (
                  <p className="form-error">{errors.confirmPassword}</p>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary auth-submit"
                disabled={loading}
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>

              <div className="auth-switch">
                Already have an account?
                <button type="button" onClick={() => switchTab('login')}>
                  Sign in
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
