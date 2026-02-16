import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../context/store';
import { Loader } from 'lucide-react';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser } = useStore();

  useEffect(() => {
    const token = searchParams.get('token');
    const refresh = searchParams.get('refresh_token');
    const userJson = searchParams.get('user');

    if (token && refresh) {
      localStorage.setItem('access_token', token);
      localStorage.setItem('refresh_token', refresh);

      if (userJson) {
        try {
          const user = JSON.parse(decodeURIComponent(userJson));
          setUser(user);
        } catch {
          // Ignore parse errors
        }
      }

      navigate('/', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  }, [searchParams, navigate, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0908' }}>
      <div className="text-center">
        <Loader className="w-8 h-8 text-gold-400 animate-spin mx-auto mb-4" aria-hidden="true" />
        <p className="text-sm text-charcoal-300" role="status" aria-live="polite">
          Completing authentication...
        </p>
      </div>
    </div>
  );
}
