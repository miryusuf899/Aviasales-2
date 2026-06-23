import { ShieldCheck } from 'lucide-react';

import type { FlightOption } from '@/features/flights/types';
import { formatMoney } from '@/shared/lib/formatters';
import { AirlineBadge } from '@/shared/ui/AirlineBadge';
import { FlightRoute } from '@/shared/ui/FlightRoute';

type BookingSummaryProps = {
  flight: FlightOption;
  action?: React.ReactNode;
  title?: string;
};

export function BookingSummary({ flight, action, title = 'Booking Summary' }: BookingSummaryProps) {
  return (
    <article className="panel booking-summary">
      <h3>{title}</h3>
      <div className="summary-flight">
        <div>
          <AirlineBadge code={flight.code} color={flight.color} size="sm" />
          <div>
            <strong>{flight.airline}</strong>
            <small>{flight.id}</small>
          </div>
        </div>
        <FlightRoute
          compact
          departure={flight.departure}
          arrival={flight.arrival}
          from={flight.from}
          to={flight.to}
          fromCity={flight.fromCity}
          toCity={flight.toCity}
          duration={flight.duration}
        />
        <p>{flight.date} · 1 passenger · Economy</p>
      </div>
      <dl className="price-list">
        <div><dt>Ticket × 1</dt><dd>{formatMoney(flight.price - 77)}</dd></div>
        <div><dt>Taxes & fees</dt><dd>$58.40</dd></div>
        <div><dt>Service fee</dt><dd>$18.60</dd></div>
      </dl>
      <div className="total-row">
        <span>Total</span>
        <strong>{formatMoney(flight.price)}</strong>
      </div>
      {action}
      <p className="secure-note"><ShieldCheck size={14} /> Secured with 256-bit encryption</p>
    </article>
  );
}
