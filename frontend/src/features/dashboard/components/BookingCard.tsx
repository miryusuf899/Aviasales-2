import { Download, Eye, RefreshCcw, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { formatMoney } from '@/shared/lib/formatters';
import { AirlineBadge } from '@/shared/ui/AirlineBadge';
import { Button } from '@/shared/ui/Button';
import { FlightRoute } from '@/shared/ui/FlightRoute';

import { BookingStatusBadge } from './BookingStatusBadge';
import type { BookingListItem } from '../types';

type BookingCardProps = {
  booking: BookingListItem;
  onCancel: (bookingId: string) => void;
};

export function BookingCard({ booking, onCancel }: BookingCardProps) {
  const navigate = useNavigate();

  return (
    <article className="booking-card">
      <header>
        <div>
          <AirlineBadge
            code={booking.airline.slice(0, 2).toUpperCase()}
            color={booking.color}
          />
          <span>
            <strong>{booking.airline} · {booking.flight}</strong>
            <small>{booking.id}</small>
          </span>
        </div>
        <BookingStatusBadge status={booking.status} />
      </header>
      <section>
        <FlightRoute
          compact
          departure={booking.departure}
          arrival={booking.arrival}
          from={booking.from}
          to={booking.to}
          fromCity={booking.fromCity}
          toCity={booking.toCity}
          duration={booking.date}
        />
        <div className="booking-card__price">
          <small>{booking.passengers} passenger{booking.passengers > 1 ? 's' : ''}</small>
          <strong>{formatMoney(booking.price)}</strong>
        </div>
      </section>
      <footer>
        <Button variant="secondary" icon={<Eye size={16} />}>View Details</Button>
        {booking.status === 'confirmed' ? (
          <Button variant="secondary" icon={<Download size={16} />}>Download Ticket</Button>
        ) : null}
        {booking.status === 'confirmed' || booking.status === 'pending' ? (
          <Button variant="danger" icon={<X size={16} />} onClick={() => onCancel(booking.id)}>
            Cancel Booking
          </Button>
        ) : null}
        {booking.status === 'payment_failed' ? (
          <Button icon={<RefreshCcw size={16} />} onClick={() => navigate('/booking/payment')}>
            Retry Payment
          </Button>
        ) : null}
      </footer>
    </article>
  );
}
