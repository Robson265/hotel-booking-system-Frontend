/**
 * src/components/HotelCard.tsx
 *
 * Displays a single hotel in a card format.
 * Extracted from Hotels.tsx so the grid logic and card UI are separate concerns.
 */

import { useNavigate } from 'react-router-dom';
import { StarDisplay } from './ui';
import type { Hotel } from '../types';

interface HotelCardProps {
  hotel: Hotel;
}

export default function HotelCard({ hotel }: HotelCardProps) {
  const navigate = useNavigate();

  return (
    <article className="card" style={{ cursor: 'default' }}>
      {/* Image */}
      <div
        style={{
          height: 180,
          overflow: 'hidden',
          background: 'var(--clr-surface-alt)',
        }}
      >
        {hotel.imageUrl ? (
          <img
            src={hotel.imageUrl}
            alt={hotel.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .4s' }}
            onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.04)')}
            onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          />
        ) : (
          <div
            style={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 40,
              color: 'var(--clr-text-light)',
            }}
          >
            🏨
          </div>
        )}
      </div>

      {/* Body */}
      <div className="card-body">
        {/* Star class rating (BR-13) */}
        <div style={{ marginBottom: 'var(--space-2)' }}>
          <StarDisplay value={hotel.starRating} />
        </div>

        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.125rem',
            marginBottom: 'var(--space-1)',
          }}
        >
          {hotel.name}
        </h3>

        <p
          style={{
            color: 'var(--clr-text-muted)',
            fontSize: '.875rem',
            marginBottom: 'var(--space-3)',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <span>📍</span> {hotel.location}
        </p>

        {/* Guest review score */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 'var(--space-4)',
          }}
        >
          <span style={{ fontSize: '.875rem', color: 'var(--clr-text-muted)' }}>Guest rating</span>
          <span
            style={{
              background: 'var(--clr-gold)',
              color: '#fff',
              fontSize: '.8125rem',
              fontWeight: 700,
              padding: '2px 10px',
              borderRadius: 'var(--radius-full)',
            }}
          >
            {hotel.averageRating?.toFixed(1) ?? '—'} / 5
          </span>
        </div>

        <button
          className="btn btn-primary btn-full"
          onClick={() => navigate(`/hotels/${hotel.id}/rooms`)}
        >
          View Rooms
        </button>
      </div>
    </article>
  );
}
