import { Lock, Mail, Phone, User } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { toApiError } from '@/shared/api/httpClient';
import { Button } from '@/shared/ui/Button';
import { FormField } from '@/shared/ui/FormField';
import { ErrorState } from '@/shared/ui/StatusView';

import { useAuth } from '../api/AuthContext';
import { AuthLayout } from '../components/AuthLayout';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await register({
        email: form.email,
        password: form.password,
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone,
      });
      navigate('/dashboard');
    } catch (requestError) {
      setError(toApiError(requestError).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout variant="register">
      <form className="auth-card auth-card--register" onSubmit={submit}>
        <header>
          <h1>Create your account</h1>
          <p>Start booking flights in under 2 minutes.</p>
        </header>
        {error ? <ErrorState title="Could not create account" description={error} /> : null}
        <div className="form-grid two">
          <FormField label="First Name" value={form.first_name} onChange={(event) => update('first_name', event.target.value)} placeholder="Alexandra" icon={<User size={17} />} />
          <FormField label="Last Name" value={form.last_name} onChange={(event) => update('last_name', event.target.value)} placeholder="Johnson" icon={<User size={17} />} />
        </div>
        <FormField label="Email Address" type="email" value={form.email} onChange={(event) => update('email', event.target.value)} placeholder="alex@example.com" icon={<Mail size={17} />} required />
        <FormField label="Phone Number" type="tel" value={form.phone} onChange={(event) => update('phone', event.target.value)} placeholder="+1 (555) 000-0000" icon={<Phone size={17} />} />
        <FormField label="Password" type="password" value={form.password} onChange={(event) => update('password', event.target.value)} placeholder="Min. 8 characters" icon={<Lock size={17} />} required />
        <FormField label="Confirm Password" type="password" value={form.confirmPassword} onChange={(event) => update('confirmPassword', event.target.value)} placeholder="Repeat your password" icon={<Lock size={17} />} required />
        <label className="terms-row">
          <input type="checkbox" required />
          <span>I agree to the <b>Terms of Service</b> and <b>Privacy Policy</b>. I also consent to receive occasional travel deals by email.</span>
        </label>
        <Button fullWidth type="submit" disabled={submitting}>{submitting ? 'Creating account...' : 'Create Account'}</Button>
        <p className="auth-switch">
          Already have an account? <button type="button" onClick={() => navigate('/login')}>Sign in</button>
        </p>
      </form>
    </AuthLayout>
  );
}
