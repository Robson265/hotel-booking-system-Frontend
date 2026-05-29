/**
 * src/pages/Payment.tsx
 *
 * Business rules:
 *   BR-37 – one payment per booking
 *   BR-38 – 15-minute payment window with countdown
 *   BR-39 – retry on failure (button stays active)
 *   BR-40 – exact amount must be sent
 *   BR-41 – hotel currency must be sent
 *   BR-42 – webhook verification handled by backend
 */

import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Button, Alert } from '../components/ui';
import type { Booking } from '../types';

// ── Countdown hook ────────────────────────────────────────────────────────────
function useCountdown(seconds: number) {
  const [timeLeft, setTimeLeft] = useState(seconds);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const formatted = `${minutes}:${String(secs).padStart(2, '0')}`;
  const expired = timeLeft <= 0;
  const urgent = timeLeft < 120; // last 2 minutes

  return { timeLeft, formatted, expired, urgent };
}

// ─────────────────────────────────────────────────────────────────────────────
export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { booking: Booking } | null;

  // Guard: navigate here without booking state
  if (!state?.booking) {
    return (
      <div className="page-wrapper">
        <Alert type="error" message="No booking found. Please start a new booking." />
        <button
          className="btn btn-primary"
          onClick={() => navigate('/hotels')}
          style={{ marginTop: 'var(--space-4)' }}
        >
          Browse Hotels
        </button>
      </div>
    );
  }

  const { booking } = state;
  const { timeLeft, formatted, expired, urgent } = useCountdown(15 * 60); // BR-38
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handlePayment() {
    if (expired) { setError('Payment window expired. Please make a new booking.'); return; }

    setLoading(true);
    setError('');

    try {
      // BR-40: send exact amount; BR-41: send hotel currency
      const { data } = await api.post<{ checkoutUrl: string }>('/payments/initiate', {
        bookingId: booking.id,
        amount: booking.totalAmount,
        currency: booking.currency,
      });

      // Redirect to Stripe / Paystack checkout (BR-42: webhook verified server-side)
      window.location.href = data.checkoutUrl;
    } catch (err: unknown) {
      // BR-39: on failure, booking stays PENDING — user can retry
      setError(err instanceof Error ? err.message : 'Payment initiation failed. You can retry.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-wrapper" style={{ maxWidth: 560 }}>
      <div className="page-header">
        <h1>Complete Payment</h1>
        <p>Confirm your booking details and pay securely</p>
      </div>

      {/* Countdown timer (BR-38) */}
      <div
        style={{
          background: urgent ? '#FEF2F2' : '#F0FDF4',
          border: `1px solid ${urgent ? '#FECACA' : '#A7F3D0'}`,
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-4)',
          marginBottom: 'var(--space-6)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
        }}
        role="timer"
        aria-live="polite"
      >
        <span style={{ fontSize: 22 }}>{expired ? '⏰' : urgent ? '⚠️' : '⏱'}</span>
        <div>
          <p
            style={{
              fontWeight: 600,
              color: urgent ? 'var(--clr-danger)' : 'var(--clr-success)',
              marginBottom: 2,
            }}
          >
            {expired ? 'Payment window expired' : `Time remaining: ${formatted}`}
          </p>
          <p style={{ fontSize: '.8125rem', color: 'var(--clr-text-muted)' }}>
            {expired
              ? 'Your booking has been cancelled. Please start over.'
              : 'Complete payment before the timer runs out to secure your room.'}
          </p>
        </div>
      </div>

      {/* Booking summary */}
      <div
        style={{
          background: 'var(--clr-surface)',
          border: '1px solid var(--clr-border)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-6)',
          marginBottom: 'var(--space-6)',
        }}
      >
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            marginBottom: 'var(--space-4)',
            paddingBottom: 'var(--space-3)',
            borderBottom: '1px solid var(--clr-border)',
          }}
        >
          Booking Summary
        </h3>

        <dl
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 'var(--space-3)',
          }}
        >
          {[
            ['Booking ID', booking.id.slice(0, 8) + '…'],
            ['Hotel', booking.hotel?.name ?? '—'],
            ['Room', booking.room?.roomNumber ?? '—'],
            ['Guests', String(booking.numGuests)],
            ['Check-in', booking.checkInDate],
            ['Check-out', booking.checkOutDate],
          ].map(([label, value]) => (
            <div key={label}>
              <dt style={{ fontSize: '.75rem', color: 'var(--clr-text-muted)', marginBottom: 2 }}>
                {label}
              </dt>
              <dd style={{ fontSize: '.9375rem' }}>{value}</dd>
            </div>
          ))}
        </dl>

        <div
          style={{
            marginTop: 'var(--space-4)',
            paddingTop: 'var(--space-4)',
            borderTop: '1px solid var(--clr-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontWeight: 600 }}>Total due</span>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.5rem',
              color: 'var(--clr-navy)',
              fontWeight: 700,
            }}
          >
            {booking.currency} {booking.totalAmount}
          </span>
        </div>
      </div>

      <Alert type="error" message={error} />

      {/* Actions */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: error ? 'var(--space-4)' : 0 }}>
        <Button
          variant="gold"
          fullWidth
          size="lg"
          loading={loading}
          disabled={expired}
          onClick={handlePayment}
        >
          {loading ? 'Processing…' : `Pay ${booking.currency} ${booking.totalAmount}`}
        </Button>

        <Button
          variant="outline"
          onClick={() => navigate('/hotels')}
          style={{ flexShrink: 0 }}
        >
          Cancel
        </Button>
      </div>

      {expired && (
        <p style={{ fontSize: '.875rem', color: 'var(--clr-text-muted)', marginTop: 'var(--space-4)', textAlign: 'center' }}>
          <Button variant="outline" onClick={() => navigate('/hotels')}>
            Browse Hotels Again
          </Button>
        </p>
      )}
    </div>
  );
}
