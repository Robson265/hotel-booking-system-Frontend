// ─────────────────────────────────────────────
//  Shared TypeScript types for the entire app
// ─────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'CUSTOMER' | 'ADMIN';
  avatarUrl: string | null;
  isEmailVerified: boolean;
}

export interface Hotel {
  id: string;
  name: string;
  location: string;
  starRating: number;      // BR-13: 1-5, set by Hotel Admin
  averageRating: number;   // platform review score
  imageUrl: string;
  description?: string;
}

export interface Room {
  id: string;
  roomNumber: string;
  type: string;
  pricePerNight: number;   // BR-16: must be > 0
  maxOccupancy: number;    // BR-17: must be >= 1
  isAvailable: boolean;    // BR-18: false = hidden from listing
  images: string[];        // BR-20: max 10
  description?: string;
  amenities?: string[];
}

export interface Booking {
  id: string;
  checkInDate: string;
  checkOutDate: string;
  numGuests: number;
  totalAmount: number;     // BR-26: frozen at booking time
  currency: string;        // BR-41: hotel's configured currency
  status: BookingStatus;
  room: Pick<Room, 'id' | 'roomNumber' | 'type'>;
  hotel: Pick<Hotel, 'id' | 'name'>;
}

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export interface CompletedBooking {
  id: string;
  hotel: Pick<Hotel, 'name'>;
  checkInDate: string;
  checkOutDate: string;
  hasReview: boolean; // BR-44: already reviewed?
}

export interface Review {
  id: string;
  bookingId: string;
  rating: number;    // 1-5
  comment: string;
  createdAt: string;
}

// Generic API error shape returned by NestJS
export interface ApiError {
  message: string | string[];
  statusCode: number;
  error?: string;
}
