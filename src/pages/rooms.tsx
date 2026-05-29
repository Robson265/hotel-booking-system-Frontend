/**
 * src/pages/Rooms.tsx
 *
 * Business rules:
 *   BR-16 – price > 0
 *   BR-17 – maxOccupancy >= 1
 *   BR-18 – unavailable rooms are filtered by backend
 *   BR-20 – max 10 images (RoomCard shows only first)
 *   BR-21 – check-in min = today
 *   BR-22 – check-out must be after check-in
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Spinner, EmptyState, Alert, Button } from '../components/ui';
import RoomCard from '../components/RoomCard';
import type { Room } from '../types';

export default function Rooms() {
  const { hotelId } = useParams<{ hotelId: string }>();
  const navigate = useNavigate();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [hotelName, setHotelName] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [loading, setLoading] = useState(true);
  const [dateError, setDateError] = useState('');
  const [fetchError, setFetchError] = useState('');

  // BR-21: minimum date = today
  const today = new Date().toISOString().split('T')[0];

  // Initial fetch on mount (without date filter)
  useEffect(() => {
    fetchRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotelId]);

  async function fetchRooms(params?: { checkIn: string; checkOut: string }) {
    setLoading(true);
    setFetchError('');
    try {
      const { data } = await api.get<Room[]>(`/hotels/${hotelId}/rooms`, {
        params,
      });
      setRooms(data);
    } catch (err: unknown) {
      setFetchError(err instanceof Error ? err.message : 'Failed to load rooms');
    } finally {
      setLoading(false);
    }
  }

  function handleSearch() {
    setDateError('');

    if (!checkIn || !checkOut) {
      setDateError('Please select both check-in and check-out dates.');
      return;
    }

    // BR-22: check-out must be after check-in
    if (new Date(checkOut) <= new Date(checkIn)) {
      setDateError('Check-out date must be after check-in date.');
      return;
    }

    fetchRooms({ checkIn, checkOut });
  }

  return (
    <div className="page-wrapper">
      {/* Back link */}
      <button
        onClick={() => navigate('/hotels')}
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
        ← Back to Hotels
      </button>

      {/* Page header */}
      <div className="page-header">
        <h1>{hotelName || 'Available Rooms'}</h1>
        <p>Select dates to check availability</p>
      </div>

      {/* Date filter */}
      <div
        style={{
          background: 'var(--clr-surface)',
          border: '1px solid var(--clr-border)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-6)',
          marginBottom: 'var(--space-8)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--space-4)',
          alignItems: 'flex-end',
        }}
      >
        {/* Check-in */}
        <div className="form-group" style={{ flex: '1 1 160px', minWidth: 0 }}>
          <label className="form-label" htmlFor="checkIn">
            Check-in
          </label>
          <input
            id="checkIn"
            type="date"
            className="form-input"
            min={today}
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
          />
        </div>

        {/* Check-out */}
        <div className="form-group" style={{ flex: '1 1 160px', minWidth: 0 }}>
          <label className="form-label" htmlFor="checkOut">
            Check-out
          </label>
          <input
            id="checkOut"
            type="date"
            className="form-input"
            min={checkIn || today}
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
          />
        </div>

        <Button variant="gold" onClick={handleSearch} style={{ flexShrink: 0 }}>
          Search
        </Button>
      </div>

      {dateError && (
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <Alert type="error" message={dateError} />
        </div>
      )}

      {/* Room list states */}
      {loading && <Spinner label="Loading rooms…" />}

      {!loading && fetchError && <Alert type="error" message={fetchError} />}

      {!loading && !fetchError && rooms.length === 0 && (
        <EmptyState
          icon="🛏️"
          title="No rooms available"
          message="Try different dates or check back later."
        />
      )}

      {!loading && !fetchError && rooms.length > 0 && (
        <>
          <p
            style={{
              fontSize: '.875rem',
              color: 'var(--clr-text-muted)',
              marginBottom: 'var(--space-4)',
            }}
          >
            {rooms.length} room{rooms.length === 1 ? '' : 's'} available
          </p>
          <div className="grid-3">
            {rooms.map((room) => (
              <RoomCard key={room.id} room={room} checkIn={checkIn} checkOut={checkOut} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
