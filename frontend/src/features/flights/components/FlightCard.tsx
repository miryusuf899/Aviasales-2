import { Plane, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { formatMoney } from '@/shared/lib/formatters';
import { selectedFlightStorage } from '@/shared/lib/storage';
import { AirlineBadge } from '@/shared/ui/AirlineBadge';
import { Button } from '@/shared/ui/Button';
import { FlightRoute } from '@/shared/ui/FlightRoute';

import type { FlightOption } from '../types';

export function FlightCard({ flight }: { flight: FlightOption }) {
  const navigate = useNavigate();

  const select = () => {
    selectedFlightStorage.set(flight);
    navigate(`/flights/${flight.backendId ?? flight.id}`);
  };

  return (
    <article className="flight-card">
      <AirlineBadge code={flight.code} color={flight.color} />
      <div className="flight-card__main">
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
        <div className="flight-card__meta">
          <span><Plane size={13} /> {flight.aircraft}</span>
          <span><Users size={13} /> {flight.seats} seats left</span>
          <span>{flight.airline} · {flight.id}</span>
        </div>
      </div>
      <div className="flight-card__price">
        <small>per person</small>
        <strong>{formatMoney(flight.price, flight.currency)}</strong>
        <small>+ taxes & fees</small>
        <Button onClick={select}>Select Flight</Button>
        {flight.seats <= 5 ? <em>Only {flight.seats} seats left!</em> : null}
      </div>
    </article>
  );
}
