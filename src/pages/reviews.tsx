/**
 * src/pages/Reviews.tsx
 *
 * Business rules:
 *   BR-43 – only COMPLETED bookings can receive reviews
 *   BR-44 – one review per booking (filter hasReview = true)
 *   BR-45 – reviews are not visible until approved (moderation)
 *   BR-48 – user must have actually stayed (COMPLETED status ensures this)
 */

import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Spinner, EmptyState, Alert, StarPicker, Button } from '../components/ui';
import type { CompletedBooking } from '../types';

export default function Reviews() {
  const [completedBookings, setCompletedBookings] = useState<CompletedBooking[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [fetchError, setFetchError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchCompleted() {
      try {
        // BR-43: only COMPLETED bookings
        const { data } = await api.get<CompletedBooking[]>('/bookings/my?status=COMPLETED');
        setCompletedBookings(data);
      } catch (err: unknown) {
        setFetchError(err instanceof Error ? err.message : 'Failed to load bookings');
      } finally {
        setLoading(false);
      }
    }
    fetchCompleted();
  }, []);

  // BR-44: filter out already-reviewed bookings
  const reviewableBookings = completedBookings.filter((b) => !b.hasReview);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedBookingId) {
      setError('Please select a stay to review.');
      return;
    }
    if (!comment.trim()) {
      setError('Please write a comment.');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      await api.post('/reviews', {
        bookingId: selectedBookingId,
        rating,
        comment: comment.trim(),
      });
      setSubmitted(true);
    } catch (err: unknown) {
      if ((err as { response?: { status?: number } }).response?.status === 409) {
        // BR-44: duplicate review
        setError('You have already reviewed this booking.');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to submit review');
      }
    } finally {
      setSubmitting(false);
    }
  }

  // ── Success state ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="page-wrapper" style={{ maxWidth: 560 }}>
        <div
          style={{
            textAlign: 'center',
            padding: 'var(--space-16) var(--space-6)',
            background: 'var(--clr-surface)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--clr-border)',
          }}
        >
          <div style={{ fontSize: 56, marginBottom: 'var(--space-4)' }}>⭐</div>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.5rem',
              marginBottom: 'var(--space-3)',
            }}
          >
            Review Submitted!
          </h2>
          {/* BR-45: moderation notice */}
          <p style={{ color: 'var(--clr-text-muted)', marginBottom: 'var(--space-6)' }}>
            Thank you for your feedback. Your review is pending moderation and will appear publicly
            once approved.
          </p>
          <Button variant="primary" onClick={() => setSubmitted(false)}>
            Write Another Review
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper" style={{ maxWidth: 680 }}>
      {/* Page header */}
      <div className="page-header">
        <h1>Write a Review</h1>
        <p>Share your experience to help other travellers</p>
      </div>

      {loading && <Spinner label="Loading your stays…" />}

      {!loading && fetchError && <Alert type="error" message={fetchError} />}

      {!loading && !fetchError && reviewableBookings.length === 0 && (
        <EmptyState
          icon="✍️"
          title="No stays to review"
          message="You can only review completed stays, and each booking can only be reviewed once."
        />
      )}

      {!loading && !fetchError && reviewableBookings.length > 0 && (
        <form
          onSubmit={handleSubmit}
          style={{
            background: 'var(--clr-surface)',
            border: '1px solid var(--clr-border)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-8)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-6)',
          }}
        >
          {/* Select booking — BR-48: only COMPLETED shown */}
          <div className="form-group">
            <label className="form-label" htmlFor="booking">
              Select your stay
            </label>
            <select
              id="booking"
              className="form-input"
              value={selectedBookingId}
              onChange={(e) => setSelectedBookingId(e.target.value)}
              required
            >
              <option value="">— Choose a booking —</option>
              {reviewableBookings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.hotel.name} · {formatDate(b.checkInDate)} → {formatDate(b.checkOutDate)}
                </option>
              ))}
            </select>
          </div>

          {/* Star rating */}
          <div className="form-group">
            <span className="form-label">Your rating</span>
            <StarPicker value={rating} onChange={setRating} />
            <span style={{ fontSize: '.8125rem', color: 'var(--clr-text-muted)' }}>
              {RATING_LABELS[rating]}
            </span>
          </div>

          {/* Comment */}
          <div className="form-group">
            <label className="form-label" htmlFor="comment">
              Your review
            </label>
            <textarea
              id="comment"
              className="form-input"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us about your stay — what did you love, what could be improved?"
              rows={5}
              required
            />
            <span style={{ fontSize: '.8125rem', color: 'var(--clr-text-muted)', textAlign: 'right' }}>
              {comment.length} characters
            </span>
          </div>

          <Alert type="error" message={error} />

          <Button type="submit" variant="gold" fullWidth size="lg" loading={submitting}>
            {submitting ? 'Submitting…' : 'Submit Review'}
          </Button>

          {/* BR-45 notice */}
          <p style={{ fontSize: '.8125rem', color: 'var(--clr-text-muted)', textAlign: 'center' }}>
            ℹ Reviews are visible to others after moderation approval.
          </p>
        </form>
      )}
    </div>
  );
}

const RATING_LABELS: Record<number, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very good',
  5: 'Excellent',
};

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
