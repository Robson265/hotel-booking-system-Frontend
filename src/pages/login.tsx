/**
 * src/pages/Login.tsx
 *
 * Business rules:
 *   BR-4  – email not verified  → 401 with 'verify' in message
 *   BR-5  – account locked after 5 failed attempts → 423
 *   BR-6  – token expiry (handled by Axios interceptor)
 *   BR-7  – deactivated user → 403
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Input, Button, Alert } from '../components/ui';
import type { AxiosError } from 'axios';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/auth/login',
        { email: form.email, password: form.password }
      );

      login(data.accessToken, data.user);
      navigate('/hotels');
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ message: string }>;
      const status = axiosErr.response?.status;
      const msg = axiosErr.response?.data?.message ?? '';

      if (status === 423) {
        // BR-5
        setError('Account locked. Too many failed attempts. Try again in 30 minutes.');
      } else if (status === 403) {
        // BR-7
        setError('Your account has been deactivated. Please contact support.');
      } else if (status === 401 && msg.toLowerCase().includes('verify')) {
        // BR-4
        setError('Please verify your email before logging in.');
      } else {
        setError(axiosErr.message || 'Invalid email or password');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-layout">
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <span>
            Stay<em>Ease</em>
          </span>
          <p style={{ fontSize: '.875rem', color: 'var(--clr-text-muted)', marginTop: 4 }}>
            Welcome back
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
        >
          <Input
            label="Email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="john@example.com"
            required
            autoComplete="email"
          />

          <Input
            label="Password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Your password"
            required
            autoComplete="current-password"
          />

          <Alert type="error" message={error} />

          <Button type="submit" variant="primary" fullWidth loading={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </Button>
        </form>

        <p
          style={{
            textAlign: 'center',
            fontSize: '.875rem',
            color: 'var(--clr-text-muted)',
            marginTop: 'var(--space-6)',
          }}
        >
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--clr-gold)', fontWeight: 500 }}>
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
