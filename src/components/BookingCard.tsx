/**
 * src/components/BookingCard.tsx
 *
 * Displays a single booking in the "My Bookings" list.
 * Shows refund policy and a cancel button for cancellable bookings.
 * Extracted from MyBookings.tsx.
 *
 * Business rules handled here:
 *   BR-29: hide cancel button for COMPLETED / CANCELLED
 *   BR-31-33: display refund tier message
 */

import { StatusBadge, Button } from './ui';
import type { Booking } from '../types';

// ── Refund policy helper (BR-31, BR-32, BR-33) ──────────────────────────────
function getRefundInfo(checkInDate: string): {
  message: string;
  type: 'success' | 'warning' | 'error';
} {
  const today = new Date();
  const checkIn = new Date(checkInDate);
  const days = Math.ceil((checkIn.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (days > 7) return { message: '✓ Full refund (100%) — check-in is more than 7 days away', type: 'success' };
  if (days >= 3) return { message: '⚠ 50% refund — check-in is 3–7 days away', type: 'warning' };
  return { message: '✕ No refund — check-in is less than 3 days away', type: 'error' };
}

interface BookingCardProps {
  booking: Booking;
  onCancel: (id: string) => void;
  cancelling: boolean;
}

const refundBg = { success: '#ECFDF5', warning: '#FFFBEB', error: '#FEF2F2' };
const refundColor = { success: 'var(--clr-success)', warning: 'var(--clr-warning)', error: 'var(--clr-danger)' };

export default function BookingCard({ booking, onCancel, cancelling }: BookingCardProps) {
  const cancellable = booking.status === 'PENDING' || booking.status === 'CONFIRMED';
  const refund = getRefundInfo(booking.checkInDate);

  return (
    <article
      className="card"
      style={{ marginBottom: 'var(--space-4)' }}
    >
      <div className="card-body">
        {/* Header row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 'var(--space-4)',
            flexWrap: 'wrap',
            gap: 'var(--space-2)',
          }}
        >
          <div>
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.0625rem',
                marginBottom: 4,
              }}
            >
              {booking.hotel.name}
            </h3>
            <p style={{ color: 'var(--clr-text-muted)', fontSize: '.875rem' }}>
              Room {booking.room.roomNumber} · {booking.room.type}
            </p>
          </div>
          <StatusBadge status={booking.status} />
        </div>

        {/* Details grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: 'var(--space-3)',
            marginBottom: 'var(--space-4)',
            background: 'var(--clr-surface-alt)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-4)',
          }}
        >
          <Detail label="Check-in" value={formatDate(booking.checkInDate)} />
          <Detail label="Check-out" value={formatDate(booking.checkOutDate)} />
          <Detail label="Guests" value={String(booking.numGuests)} />
          <Detail label="Total" value={`$${booking.totalAmount}`} highlight />
        </div>

        {/* Refund policy + cancel button (BR-29) */}
        {cancellable && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 'var(--space-3)',
            }}
          >
            <span
              style={{
                fontSize: '.8125rem',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                background: refundBg[refund.type],
                color: refundColor[refund.type],
              }}
            >
              {refund.message}
            </span>
            <Button
              variant="danger"
              size="sm"
              loading={cancelling}
              onClick={() => onCancel(booking.id)}
            >
              {cancelling ? 'Cancelling…' : 'Cancel Booking'}
            </Button>
          </div>
        )}
      </div>
    </article>
  );
}

// Small helper component for the details grid
function Detail({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <p style={{ fontSize: '.75rem', color: 'var(--clr-text-muted)', marginBottom: 2 }}>{label}</p>
      <p
        style={{
          fontSize: '.9375rem',
          fontWeight: highlight ? 700 : 400,
          color: highlight ? 'var(--clr-navy)' : 'var(--clr-text)',
        }}
      >
        {value}
      </p>
    </div>
  );
}

// Format ISO date string nicely
function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}
