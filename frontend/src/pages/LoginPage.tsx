import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/store';
import { Leaf, Mail, Lock, Eye, EyeOff, ExternalLink } from 'lucide-react';
import api from '../services/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setUser } = useStore();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let response;
      if (isRegister) {
        response = await api.register(email, password, displayName);
      } else {
        response = await api.login(email, password);
      }
      setUser(response.user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Demo login for showcasing
  const handleDemoLogin = () => {
    const demoUser = {
      id: 'demo-user',
      email: 'demo@glowstarlabs.com',
      display_name: 'Demo User',
      avatar_url: null,
      is_active: true,
      is_admin: false,
      created_at: new Date().toISOString(),
    };
    localStorage.setItem('access_token', 'demo-token');
    localStorage.setItem('refresh_token', 'demo-refresh');
    setUser(demoUser);
    navigate('/');
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'radial-gradient(ellipse at 30% 20%, rgba(184,148,32,0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(45,125,45,0.06) 0%, transparent 50%), #0a0908',
      }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, #b89420, #d4ad2e)' }}
            aria-hidden="true"
          >
            <Leaf className="w-8 h-8 text-charcoal-950" />
          </div>
          <h1 className="text-2xl font-bold text-gradient-gold">Universal Data Router</h1>
          <p className="text-sm text-charcoal-400 mt-1">AI-Powered File Organization by GlowStarLabs</p>
        </div>

        {/* Login form */}
        <div className="glass-panel p-6">
          <h2 className="text-lg font-semibold text-earth-200 mb-5">
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h2>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-ember-500/10 border border-ember-500/20" role="alert">
              <p className="text-sm text-ember-300">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label htmlFor="display-name" className="block text-sm font-medium text-charcoal-200 mb-1">
                  Display Name
                </label>
                <input
                  id="display-name"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="input-field"
                  placeholder="Your name"
                />
              </div>
            )}

            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-charcoal-200 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" aria-hidden="true" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-charcoal-200 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" aria-hidden="true" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10 pr-10"
                  placeholder="Your password"
                  required
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-earth-200"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary w-full py-3"
              disabled={loading}
            >
              {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          {/* OAuth buttons */}
          <div className="mt-5">
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-charcoal-800/50" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 text-charcoal-500" style={{ background: 'var(--glass-bg)' }}>or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <a
                href={api.getGoogleAuthUrl()}
                className="btn-secondary flex items-center justify-center gap-2 text-sm"
                aria-label="Sign in with Google"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#c49a52" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="#2d7d2d" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#d4ad2e" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#a83830" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </a>
              <a
                href={api.getGitHubAuthUrl()}
                className="btn-secondary flex items-center justify-center gap-2 text-sm"
                aria-label="Sign in with GitHub"
              >
                <svg className="w-4 h-4" fill="#b8b0a3" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                GitHub
              </a>
            </div>
          </div>

          {/* Demo login */}
          <div className="mt-4 pt-4 border-t border-charcoal-800/30">
            <button
              onClick={handleDemoLogin}
              className="w-full text-center text-sm text-gold-500 hover:text-gold-400 transition-colors"
            >
              Try Demo (no account needed)
            </button>
          </div>

          {/* Toggle register/login */}
          <p className="mt-4 text-center text-sm text-charcoal-400">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => { setIsRegister(!isRegister); setError(''); }}
              className="text-gold-500 hover:text-gold-400 font-medium"
            >
              {isRegister ? 'Sign in' : 'Create one'}
            </button>
          </p>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <a
            href="https://meetaudreyevans.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-charcoal-500 hover:text-gold-500 transition-colors"
            aria-label="Visit GlowStarLabs hub (opens in new tab)"
          >
            GlowStarLabs / Audrey Evans Ecosystem
            <ExternalLink className="w-3 h-3" aria-hidden="true" />
          </a>
        </div>
      </div>
    </div>
  );
}
