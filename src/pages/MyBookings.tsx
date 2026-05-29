/**
 * src/pages/MyBookings.tsx
 *
 * Business rules:
 *   BR-29 – cannot cancel COMPLETED or CANCELLED bookings
 *   BR-30 – only the customer can cancel their own bookings
 *   BR-31 – full refund if check-in > 7 days away
 *   BR-32 – 50% refund if 3-7 days away
 *   BR-33 – no refund if < 3 days away
 */

import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Spinner, EmptyState, Alert } from '../components/ui';
import BookingCard from '../components/BookingCard';
import type { Booking, BookingStatus } from '../types';

// Filter tabs
const STATUS_TABS: { label: string; value: BookingStatus | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Confirmed', value: 'CONFIRMED' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

export default function MyBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<BookingStatus | 'ALL'>('ALL');

  useEffect(() => {
    async function fetchBookings() {
      try {
        const { data } = await api.get<Booking[]>('/bookings/my');
        setBookings(data);
      } catch (err: unknown) {
        setFetchError(err instanceof Error ? err.message : 'Failed to load bookings');
      } finally {
        setLoading(false);
      }
    }
    fetchBookings();
  }, []);

  async function handleCancel(bookingId: string) {
    if (!window.confirm('Are you sure you want to cancel this booking? This cannot be undone.')) return;

    setCancellingId(bookingId);
    try {
      await api.patch(`/bookings/${bookingId}/cancel`);
      // Optimistically update the UI
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: 'CANCELLED' as BookingStatus } : b)),
      );
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Cancellation failed');
    } finally {
      setCancellingId(null);
    }
  }

  // Filter bookings by active tab
  const filtered =
    activeTab === 'ALL' ? bookings : bookings.filter((b) => b.status === activeTab);

  return (
    <div className="page-wrapper">
      {/* Page header */}
      <div className="page-header">
        <h1>My Bookings</h1>
        <p>Manage your hotel reservations</p>
      </div>

      {/* Status filter tabs */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--space-2)',
          flexWrap: 'wrap',
          marginBottom: 'var(--space-6)',
          borderBottom: '1px solid var(--clr-border)',
          paddingBottom: 'var(--space-3)',
        }}
      >
        {STATUS_TABS.map((tab) => {
          const count =
            tab.value === 'ALL'
              ? bookings.length
              : bookings.filter((b) => b.status === tab.value).length;

          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              style={{
                background: activeTab === tab.value ? 'var(--clr-navy)' : 'transparent',
                color: activeTab === tab.value ? '#fff' : 'var(--clr-text-muted)',
                border: `1.5px solid ${activeTab === tab.value ? 'var(--clr-navy)' : 'var(--clr-border)'}`,
                borderRadius: 'var(--radius-full)',
                padding: '4px 14px',
                fontSize: '.875rem',
                cursor: 'pointer',
                transition: 'all var(--transition)',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              {tab.label}
              {count > 0 && (
                <span
                  style={{
                    background: activeTab === tab.value ? 'rgba(255,255,255,.25)' : 'var(--clr-surface-alt)',
                    borderRadius: 'var(--radius-full)',
                    padding: '0 6px',
                    fontSize: '.75rem',
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* States */}
      {loading && <Spinner label="Loading bookings…" />}

      {!loading && fetchError && <Alert type="error" message={fetchError} />}

      {!loading && !fetchError && filtered.length === 0 && (
        <EmptyState
          icon="📋"
          title="No bookings found"
          message={
            activeTab === 'ALL'
              ? "You haven't made any bookings yet."
              : `No ${activeTab.toLowerCase()} bookings.`
          }
        />
      )}

      {!loading && !fetchError && filtered.length > 0 && (
        <div>
          {filtered.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onCancel={handleCancel}
              cancelling={cancellingId === booking.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
