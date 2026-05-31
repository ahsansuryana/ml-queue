import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  useEffect(() => {
    const token = params.get('token');
    if (token) {
      localStorage.setItem('token', token);
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  }, [params, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-bg-primary">
      <p className="text-text-secondary">Authenticating...</p>
    </div>
  );
}
