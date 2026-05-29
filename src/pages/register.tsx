/**
 * src/pages/Register.tsx
 *
 * Business rules: BR-1 (unique email), BR-2 (password rules),
 *                 BR-4 (email verification required), optional avatar upload.
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Input, Button, Alert } from '../components/ui';
import AvatarUpload from '../components/AvatarUpload';

interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState<RegisterForm>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });
  const [avatar, setAvatar] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Initials for the avatar placeholder
  const initials = `${form.firstName[0] ?? ''}${form.lastName[0] ?? ''}`.toUpperCase();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleAvatarChange(file: File) {
    setAvatar(file);
    setPreview(URL.createObjectURL(file));
  }

  function validate(): string | null {
    if (form.password.length < 8) return 'Password must be at least 8 characters.';
    if (form.password !== form.confirmPassword) return 'Passwords do not match.';
    if (!/^\+?[0-9\s\-().]{7,20}$/.test(form.phoneNumber)) return 'Please enter a valid phone number.';
    return null;
  }

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setError('');
    setLoading(true);

    // Strip confirmPassword — backend doesn't need it
    const { confirmPassword, ...payload } = form;

    try {
      // 1. Register user
      await api.post('/auth/register', payload);

      // 2. Optionally upload avatar
      if (avatar) {
        const formData = new FormData();
        formData.append('avatar', avatar);
        await api.post('/upload/avatar', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      // BR-4: user must verify email before logging in
        navigate('/check-email', { 
        state: { 
          email: form.email,
          message: 'Please check your email to verify your account'
        } 
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
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
            Create your account
          </p>
        </div>

        {/* Avatar picker */}
        <AvatarUpload
          preview={preview}
          initials={initials}
          onChange={handleAvatarChange}
        />

        <hr className="divider" style={{ margin: 'var(--space-6) 0' }} />

        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Name row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <Input
              label="First name"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              placeholder="John"
              required
              autoComplete="given-name"
            />
            <Input
              label="Last name"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              placeholder="Doe"
              required
              autoComplete="family-name"
            />
          </div>

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
            label="Phone number"
            type="tel"
            name="phoneNumber"
            value={form.phoneNumber}
            onChange={handleChange}
            placeholder="+234 800 000 0000"
            required
            autoComplete="tel"
            hint="Include your country code, e.g. +234 for Nigeria."
          />

          <Input
            label="Password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Min. 8 characters"
            required
            autoComplete="new-password"
            hint="Use at least 8 characters with letters and numbers."
          />

          <Input
            label="Confirm password"
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter your password"
            required
            autoComplete="new-password"
            error={
              form.confirmPassword && form.password !== form.confirmPassword
                ? 'Passwords do not match'
                : undefined
            }
          />

          <Alert type="error" message={error} />

          <Button type="submit" variant="primary" fullWidth loading={loading}>
            Create Account
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
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--clr-gold)', fontWeight: 500 }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
