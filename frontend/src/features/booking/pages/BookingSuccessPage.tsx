import { ArrowRight, Check, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { bookingDraft } from '../api/bookingDraft';
import { formatMoney } from '@/shared/lib/formatters';
import { AirlineBadge } from '@/shared/ui/AirlineBadge';
import { Button } from '@/shared/ui/Button';
import { EmptyState } from '@/shared/ui/StatusView';

export function BookingSuccessPage() {
  const navigate = useNavigate();
  const draft = bookingDraft.get();
  const flight = draft?.flight;

  if (!flight) {
    return (
      <main className="page-offset narrow-page">
        <EmptyState
          title="No confirmed itinerary"
          description="Complete a booking to view the confirmation ticket."
          actionLabel="Book a flight"
          onAction={() => navigate('/')}
        />
      </main>
    );
  }

  return (
    <main className="success-page page-offset">
      <div className="success-pulse">
        <span><Check size={64} /></span>
      </div>
      <h1>Booking Confirmed!</h1>
      <p>Your flight has been booked successfully. Check your email for your e-ticket.</p>
      <small>Confirmation sent to <strong>{draft?.passenger?.email ?? 'your email'}</strong></small>

      <article className="ticket-card">
        <header>
          <div>
            <AirlineBadge code={flight.code} color={flight.color} size="sm" />
            <span><strong>{flight.airline}</strong><small>{flight.id} · Economy</small></span>
          </div>
          <div>
            <small>Booking ID</small>
            <strong>{draft.booking?.id ?? 'SKB-2025-00892'}</strong>
          </div>
        </header>
        <section>
          <div>
            <strong>{flight.departure}</strong>
            <span>{flight.from}</span>
            <small>{flight.fromCity}</small>
          </div>
          <div className="ticket-line">
            <small>{flight.duration} · Direct</small>
            <span />
          </div>
          <div>
            <strong>{flight.arrival}</strong>
            <span>{flight.to}</span>
            <small>{flight.toCity}</small>
          </div>
        </section>
        <footer>
          {[
            ['Passenger', `${draft.passenger?.firstName ?? 'Alex'} ${draft.passenger?.lastName ?? 'Johnson'}`],
            ['Seat', '14A'],
            ['Class', 'Economy'],
            ['Baggage', '23 kg'],
          ].map(([label, value]) => (
            <span key={label}><small>{label}</small><strong>{value}</strong></span>
          ))}
        </footer>
        <div>
          <span>Amount paid</span>
          <strong>{formatMoney(flight.price)}</strong>
        </div>
      </article>

      <div className="success-actions">
        <Button variant="secondary" icon={<Download size={17} />}>Download Ticket</Button>
        <Button icon={<ArrowRight size={17} />} onClick={() => navigate('/dashboard')}>View My Bookings</Button>
      </div>
    </main>
  );
}
