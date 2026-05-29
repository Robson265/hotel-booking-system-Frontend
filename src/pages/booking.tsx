/**
 * src/pages/Booking.tsx
 *
 * Business rules:
 *   BR-21 – check-in must be today or future
 *   BR-22 – check-out must be after check-in
 *   BR-23 – max 365 days in advance
 *   BR-25 – numGuests <= room.maxOccupancy
 *   BR-26 – totalAmount calculated and frozen at booking time
 *   BR-28 – max 3 pending bookings (backend 400)
 */

import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from "../api/axios";
import { Button, Alert } from '../components/ui';
import type { Room, Booking } from '../types';

interface LocationState {
  room: Room;
  checkIn: string;
  checkOut: string;
}

// ── Small summary card ────────────────────────────────────────────────────────
function PriceSummary({
  nights,
  pricePerNight,
  total,
}: {
  nights: number;
  pricePerNight: number;
  total: number;
}) {
  if (nights <= 0) return null;
  return (
    <div
      style={{
        background: 'var(--clr-surface-alt)',
        border: '1px solid var(--clr-border)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-4)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ color: 'var(--clr-text-muted)', fontSize: '.9375rem' }}>
          {nights} night{nights > 1 ? 's' : ''} × ${pricePerNight}
        </span>
        <span>${nights * pricePerNight}</span>
      </div>
      <hr style={{ border: 'none', borderTop: '1px solid var(--clr-border)', margin: '8px 0' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
        <span>Total</span>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', color: 'var(--clr-navy)' }}>
          ${total}
        </span>
      </div>
      <p style={{ fontSize: '.75rem', color: 'var(--clr-text-muted)', marginTop: 4 }}>
        ✓ This amount is locked in at the time of booking (BR-26)
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function Booking() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | null;

  // Guard: if someone navigates here without room state
  if (!state?.room) {
    return (
      <div className="page-wrapper">
        <Alert type="error" message="No room selected. Please browse hotels and select a room." />
        <button className="btn btn-primary" onClick={() => navigate('/hotels')} style={{ marginTop: 'var(--space-4)' }}>
          Browse Hotels
        </button>
      </div>
    );
  }

  const { room, checkIn: defaultCheckIn, checkOut: defaultCheckOut } = state;

  const [checkIn, setCheckIn] = useState(defaultCheckIn || '');
  const [checkOut, setCheckOut] = useState(defaultCheckOut || '');
  const [numGuests, setNumGuests] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Date limits
  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 365); // BR-23
  const maxDateStr = maxDate.toISOString().split('T')[0];

  // Derived: nights + total
  const nights =
    checkIn && checkOut
      ? Math.ceil(
          (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24),
        )
      : 0;
  const totalAmount = nights * room.pricePerNight;

  // ── Validation ──────────────────────────────────────────────────────────────
  function validate(): string | null {
    if (!checkIn || !checkOut) return 'Please select check-in and check-out dates.';
    if (new Date(checkIn) < new Date(today)) return 'Check-in must be today or a future date.'; // BR-21
    if (new Date(checkOut) <= new Date(checkIn)) return 'Check-out must be after check-in.'; // BR-22
    if (new Date(checkIn) > new Date(maxDateStr)) return 'Cannot book more than 365 days in advance.'; // BR-23
    if (numGuests > room.maxOccupancy) return `This room allows a maximum of ${room.maxOccupancy} guests.`; // BR-25
    if (numGuests < 1) return 'At least 1 guest is required.';
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setError('');
    setLoading(true);

    try {
      const { data } = await api.post<Booking>('/bookings', {
        roomId: room.id,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        numGuests,
      });

      // Redirect to payment with booking data (BR-27)
      navigate('/payment', { state: { booking: data } });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Booking failed. Please try again.';
      // BR-28: max 3 pending bookings
      if (message.toLowerCase().includes('pending')) {
        setError('You already have 3 pending bookings. Please complete or cancel one before making a new booking.');
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-wrapper" style={{ maxWidth: 680 }}>
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--clr-text-muted)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          fontSize: '.875rem',
          marginBottom: 'var(--space-6)',
          padding: 0,
        }}
      >
        ← Back
      </button>

      {/* Page header */}
      <div className="page-header">
        <h1>Book Room {room.roomNumber}</h1>
        <p>
          {room.type} · ${room.pricePerNight} / night · Up to {room.maxOccupancy} guests
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}
      >
        {/* Date row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="checkIn">
              Check-in date
            </label>
            <input
              id="checkIn"
              type="date"
              className="form-input"
              min={today}
              max={maxDateStr}
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="checkOut">
              Check-out date
            </label>
            <input
              id="checkOut"
              type="date"
              className="form-input"
              min={checkIn || today}
              max={maxDateStr}
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Guests */}
        <div className="form-group">
          <label className="form-label" htmlFor="guests">
            Number of guests
            <span style={{ color: 'var(--clr-text-muted)', fontWeight: 400 }}>
              {' '}(max {room.maxOccupancy})
            </span>
          </label>
          <input
            id="guests"
            type="number"
            className="form-input"
            min={1}
            max={room.maxOccupancy}
            value={numGuests}
            onChange={(e) => setNumGuests(Number(e.target.value))}
            style={{ maxWidth: 120 }}
          />
        </div>

        {/* Price summary (BR-26) */}
        <PriceSummary
          nights={nights}
          pricePerNight={room.pricePerNight}
          total={totalAmount}
        />

        <Alert type="error" message={error} />

        <Button type="submit" variant="gold" fullWidth loading={loading} size="lg">
          {loading ? 'Creating booking…' : 'Proceed to Payment'}
        </Button>
      </form>
    </div>
  );
}
