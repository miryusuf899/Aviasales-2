import { Plane } from 'lucide-react';

type FlightRouteProps = {
  departure: string;
  arrival: string;
  from: string;
  to: string;
  fromCity: string;
  toCity: string;
  duration: string;
  date?: string;
  compact?: boolean;
};

export function FlightRoute({
  departure,
  arrival,
  from,
  to,
  fromCity,
  toCity,
  duration,
  date,
  compact,
}: FlightRouteProps) {
  return (
    <div className={`flight-route ${compact ? 'flight-route--compact' : ''}`}>
      <div className="flight-route__point">
        <strong>{departure}</strong>
        <span>{from}</span>
        <small>{fromCity}</small>
        {date ? <em>{date}</em> : null}
      </div>
      <div className="flight-route__line">
        <small>{duration}</small>
        <div>
          <span />
          <Plane size={compact ? 16 : 20} />
          <span />
        </div>
        <small>Direct</small>
      </div>
      <div className="flight-route__point">
        <strong>{arrival}</strong>
        <span>{to}</span>
        <small>{toCity}</small>
        {date ? <em>{date}</em> : null}
      </div>
    </div>
  );
}
