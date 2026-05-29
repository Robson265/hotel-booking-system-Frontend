/**
 * src/components/RoomCard.tsx
 *
 * Displays a single room. Extracted from Rooms.tsx.
 * The parent passes checkIn/checkOut so the card can hand them to the booking page.
 */

import { useNavigate } from 'react-router-dom';
import type { Room } from '../types';

interface RoomCardProps {
  room: Room;
  checkIn: string;
  checkOut: string;
}

// Friendly display names for room types
const TYPE_LABELS: Record<string, string> = {
  SINGLE: 'Single',
  DOUBLE: 'Double',
  TWIN: 'Twin',
  SUITE: 'Suite',
  DELUXE: 'Deluxe',
  FAMILY: 'Family',
  STUDIO: 'Studio',
};

export default function RoomCard({ room, checkIn, checkOut }: RoomCardProps) {
  const navigate = useNavigate();
  const typeLabel = TYPE_LABELS[room.type] ?? room.type;

  return (
    <article className="card">
      {/* Room image (first of up to 10 — BR-20) */}
      <div style={{ height: 160, overflow: 'hidden', background: 'var(--clr-surface-alt)' }}>
        {room.images[0] ? (
          <img
            src={room.images[0]}
            alt={`Room ${room.roomNumber}`}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div
            style={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 36,
              color: 'var(--clr-text-light)',
            }}
          >
            🛏️
          </div>
        )}
      </div>

      <div className="card-body">
        {/* Room number + type */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 'var(--space-3)',
          }}
        >
          <div>
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.0625rem',
                marginBottom: 2,
              }}
            >
              Room {room.roomNumber}
            </h3>
            <span
              style={{
                fontSize: '.8125rem',
                color: 'var(--clr-text-muted)',
                background: 'var(--clr-surface-alt)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                display: 'inline-block',
              }}
            >
              {typeLabel}
            </span>
          </div>

          {/* Price (BR-16: always > 0) */}
          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.25rem',
                color: 'var(--clr-navy)',
                fontWeight: 700,
              }}
            >
              ${room.pricePerNight}
            </div>
            <div style={{ fontSize: '.75rem', color: 'var(--clr-text-muted)' }}>/night</div>
          </div>
        </div>

        {/* Occupancy (BR-17) */}
        <p
          style={{
            fontSize: '.875rem',
            color: 'var(--clr-text-muted)',
            marginBottom: 'var(--space-4)',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <span>👥</span> Up to {room.maxOccupancy} guest{room.maxOccupancy > 1 ? 's' : ''}
        </p>

        {/* Amenities tags (optional) */}
        {room.amenities && room.amenities.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 4,
              marginBottom: 'var(--space-4)',
            }}
          >
            {room.amenities.slice(0, 4).map((a) => (
              <span
                key={a}
                style={{
                  fontSize: '.75rem',
                  padding: '2px 8px',
                  background: 'var(--clr-surface-alt)',
                  borderRadius: 'var(--radius-full)',
                  color: 'var(--clr-text-muted)',
                }}
              >
                {a}
              </span>
            ))}
          </div>
        )}

        <button
          className="btn btn-gold btn-full"
          onClick={() =>
            navigate(`/booking/${room.id}`, { state: { room, checkIn, checkOut } })
          }
        >
          Book Now
        </button>
      </div>
    </article>
  );
}
