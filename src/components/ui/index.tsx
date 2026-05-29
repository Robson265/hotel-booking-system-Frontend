/**
 * src/components/ui/index.tsx
 *
 * Small, reusable "primitive" UI components used throughout the app.
 * Keeping them all in one file avoids lots of tiny imports for simple things.
 */

import { type ButtonHTMLAttributes, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import type { BookingStatus } from '@/types';

// ── Button ────────────────────────────────────────────────────────────────────
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'gold' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  children,
  disabled,
  className = '',
  ...rest
}: ButtonProps) {
  const cls = [
    'btn',
    `btn-${variant}`,
    size !== 'md' ? `btn-${size}` : '',
    fullWidth ? 'btn-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={cls} disabled={disabled || loading} {...rest}>
      {loading ? (
        <>
          <span
            style={{
              width: 14,
              height: 14,
              border: '2px solid rgba(255,255,255,.4)',
              borderTopColor: '#fff',
              borderRadius: '50%',
              animation: 'spin .7s linear infinite',
              display: 'inline-block',
            }}
          />
          {children}
        </>
      ) : (
        children
      )}
    </button>
  );
}

// ── Input ─────────────────────────────────────────────────────────────────────
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, id, className = '', ...rest }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="form-group">
      {label && (
        <label className="form-label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`form-input${error ? ' form-input--error' : ''} ${className}`}
        style={error ? { borderColor: 'var(--clr-danger)' } : {}}
        {...rest}
      />
      {hint && !error && (
        <span style={{ fontSize: '.8125rem', color: 'var(--clr-text-muted)' }}>{hint}</span>
      )}
      {error && (
        <span style={{ fontSize: '.8125rem', color: 'var(--clr-danger)' }}>{error}</span>
      )}
    </div>
  );
}

// ── Textarea ──────────────────────────────────────────────────────────────────
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, id, ...rest }: TextareaProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="form-group">
      {label && (
        <label className="form-label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className="form-input"
        style={error ? { borderColor: 'var(--clr-danger)' } : {}}
        {...rest}
      />
      {error && (
        <span style={{ fontSize: '.8125rem', color: 'var(--clr-danger)' }}>{error}</span>
      )}
    </div>
  );
}

// ── Alert banner ──────────────────────────────────────────────────────────────
interface AlertProps {
  type?: 'error' | 'success' | 'warning' | 'info';
  message: string | null | undefined;
}

export function Alert({ type = 'error', message }: AlertProps) {
  if (!message) return null;
  const icons = { error: '✕', success: '✓', warning: '⚠', info: 'ℹ' };
  return (
    <div className={`alert alert-${type}`} role="alert">
      <span style={{ flexShrink: 0 }}>{icons[type]}</span>
      <span>{message}</span>
    </div>
  );
}

// ── Loading spinner ───────────────────────────────────────────────────────────
export function Spinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="loading-wrapper">
      <div className="spinner" role="status" aria-label={label} />
      <span style={{ fontSize: '.9rem' }}>{label}</span>
    </div>
  );
}

// ── Star rating display ───────────────────────────────────────────────────────
export function StarDisplay({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <span aria-label={`${value} out of ${max} stars`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < Math.round(value) ? 'star' : 'star-empty'}>
          ★
        </span>
      ))}
    </span>
  );
}

// ── Interactive star picker ───────────────────────────────────────────────────
export function StarPicker({
  value,
  onChange,
  max = 5,
}: {
  value: number;
  onChange: (v: number) => void;
  max?: number;
}) {
  return (
    <div style={{ display: 'flex', gap: 4 }} role="group" aria-label="Rating">
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
          style={{
            background: 'none',
            border: 'none',
            fontSize: 28,
            color: star <= value ? 'var(--clr-gold)' : 'var(--clr-border)',
            cursor: 'pointer',
            padding: 0,
            transition: 'color 150ms, transform 150ms',
            transform: star <= value ? 'scale(1.1)' : 'scale(1)',
          }}
        >
          ★
        </button>
      ))}
    </div>
  );
}

// ── Status badge ──────────────────────────────────────────────────────────────
export function StatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span className={`badge badge-${status.toLowerCase()}`}>
      {status}
    </span>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
export function EmptyState({
  icon = '🏨',
  title,
  message,
}: {
  icon?: string;
  title: string;
  message?: string;
}) {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: 'var(--space-16) var(--space-6)',
        color: 'var(--clr-text-muted)',
      }}
    >
      <div style={{ fontSize: 48, marginBottom: 'var(--space-4)' }}>{icon}</div>
      <h3
        style={{
          fontFamily: 'var(--font-display)',
          color: 'var(--clr-navy)',
          marginBottom: 'var(--space-2)',
        }}
      >
        {title}
      </h3>
      {message && <p style={{ fontSize: '.9375rem' }}>{message}</p>}
    </div>
  );
}
