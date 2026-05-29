/**
 * src/pages/Hotels.tsx
 *
 * Business rules:
 *   BR-9  – backend only returns isApproved = true hotels
 *   BR-13 – star rating displayed as stars
 */

import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Spinner, EmptyState, Alert } from '../components/ui';
import HotelCard from '../components/HotelCard';
import type { Hotel } from '../types';

export default function Hotels() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchHotels() {
      try {
        // Backend only returns approved hotels (BR-9)
        const { data } = await api.get<Hotel[]>('/hotels');
        setHotels(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load hotels');
      } finally {
        setLoading(false);
      }
    }
    fetchHotels();
  }, []);

  // Client-side filter by name or location
  const filtered = hotels.filter(
    (h) =>
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.location.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="page-wrapper">
      {/* Page header */}
      <div className="page-header">
        <h1>Available Hotels</h1>
        <p>Browse our curated selection of properties</p>
      </div>

      {/* Search bar */}
      <div style={{ maxWidth: 480, marginBottom: 'var(--space-8)' }}>
        <div style={{ position: 'relative' }}>
          <span
            style={{
              position: 'absolute',
              left: 'var(--space-4)',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--clr-text-light)',
              fontSize: '1.1rem',
              pointerEvents: 'none',
            }}
          >
            🔍
          </span>
          <input
            className="form-input"
            style={{ paddingLeft: 44 }}
            placeholder="Search by name or location…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search hotels"
          />
        </div>
      </div>

      {/* States */}
      {loading && <Spinner label="Loading hotels…" />}

      {!loading && error && <Alert type="error" message={error} />}

      {!loading && !error && filtered.length === 0 && (
        <EmptyState
          icon="🔍"
          title="No hotels found"
          message={
            search
              ? `No results for "${search}". Try a different name or location.`
              : 'No hotels are currently available.'
          }
        />
      )}

      {!loading && !error && filtered.length > 0 && (
        <>
          <p
            style={{
              fontSize: '.875rem',
              color: 'var(--clr-text-muted)',
              marginBottom: 'var(--space-4)',
            }}
          >
            {filtered.length} propert{filtered.length === 1 ? 'y' : 'ies'} found
          </p>

          <div className="grid-3">
            {filtered.map((hotel) => (
              <HotelCard key={hotel.id} hotel={hotel} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
