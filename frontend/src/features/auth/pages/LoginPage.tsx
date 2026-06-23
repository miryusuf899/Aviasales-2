import { Lock, Mail } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { toApiError } from '@/shared/api/httpClient';
import { Button } from '@/shared/ui/Button';
import { FormField } from '@/shared/ui/FormField';
import { ErrorState } from '@/shared/ui/StatusView';

import { useAuth } from '../api/AuthContext';
import { AuthLayout } from '../components/AuthLayout';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState('alex@example.com');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login({ email, password });
      const state = location.state as { from?: string } | null;
      navigate(state?.from ?? '/dashboard');
    } catch (requestError) {
      setError(toApiError(requestError).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout variant="login">
      <form className="auth-card" onSubmit={submit}>
        <header>
          <h1>Welcome back</h1>
          <p>Sign in to manage your bookings and find great deals.</p>
        </header>
        {error ? <ErrorState title="Could not sign in" description={error} /> : null}
        <FormField label="Email Address" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="alex@example.com" icon={<Mail size={17} />} required />
        <FormField label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" icon={<Lock size={17} />} required />
        <div className="auth-row">
          <label><input type="checkbox" /> Remember me</label>
          <button type="button">Forgot password?</button>
        </div>
        <Button fullWidth type="submit" disabled={submitting}>{submitting ? 'Signing in...' : 'Sign In'}</Button>
        <div className="auth-divider"><span />or continue with<span /></div>
        <div className="social-grid">
          <button type="button">G Google</button>
          <button type="button">🍎 Apple</button>
        </div>
        <p className="auth-switch">
          Don't have an account? <button type="button" onClick={() => navigate('/register')}>Create one free</button>
        </p>
      </form>
    </AuthLayout>
  );
}
