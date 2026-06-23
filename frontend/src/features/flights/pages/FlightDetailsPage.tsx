import { ArrowLeft, Check, MonitorPlay, Utensils, Wifi, Wind, X } from 'lucide-react';
import { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useAsync } from '@/shared/hooks/useAsync';
import { formatMoney } from '@/shared/lib/formatters';
import { selectedFlightStorage } from '@/shared/lib/storage';
import { AirlineBadge } from '@/shared/ui/AirlineBadge';
import { Button } from '@/shared/ui/Button';
import { FlightRoute } from '@/shared/ui/FlightRoute';
import { ErrorState, LoadingState } from '@/shared/ui/StatusView';

import { flightsApi } from '../api/flightsApi';

export function FlightDetailsPage() {
  const { flightId = '' } = useParams();
  const navigate = useNavigate();
  const loadFlight = useCallback(() => flightsApi.getFlight(flightId), [flightId]);
  const { data: flight, loading, error, reload } = useAsync(loadFlight);

  if (loading) return <LoadingState label="Loading flight details..." />;
  if (error || !flight) {
    return (
      <main className="page-offset">
        <ErrorState
          title="Flight details unavailable"
          description={error?.message ?? 'This flight is no longer available.'}
          onAction={() => void reload()}
        />
      </main>
    );
  }

  const continueBooking = () => {
    selectedFlightStorage.set(flight);
    navigate('/booking/passengers');
  };

  return (
    <main className="details-page page-offset">
      <button className="back-link" onClick={() => navigate('/flights')}>
        <ArrowLeft size={17} /> Back to results
      </button>

      <div className="details-layout">
        <section className="details-main">
          <article className="panel">
            <div className="flight-title">
              <AirlineBadge code={flight.code} color={flight.color} size="lg" />
              <div>
                <h2>{flight.airline}</h2>
                <p>{flight.id} · {flight.aircraft}</p>
              </div>
              <div className="flight-tags">
                <span>Economy</span>
                <span>Nonstop</span>
              </div>
            </div>
            <FlightRoute
              departure={flight.departure}
              arrival={flight.arrival}
              from={flight.from}
              to={flight.to}
              fromCity={flight.fromCity}
              toCity={flight.toCity}
              duration={flight.duration}
              date={flight.date}
            />
          </article>

          <article className="panel">
            <h3>Aircraft & Amenities</h3>
            <p>{flight.aircraft} — wide-body long-haul jet with state-of-the-art passenger comfort systems.</p>
            <div className="amenity-grid">
              {[
                [Wifi, 'In-flight WiFi'],
                [MonitorPlay, 'Entertainment'],
                [Utensils, 'Meals Included'],
                [Wind, 'USB Charging'],
              ].map(([Icon, label]) => (
                <div key={label as string}>
                  <Icon size={22} />
                  <span>{label as string}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="panel">
            <h3>Baggage Policy</h3>
            {[
              ['Cabin bag', '1 × 7 kg — included', true],
              ['Checked bag', '1 × 23 kg — included', true],
              ['Extra bag', '$65 per bag (up to 23 kg)', false],
              ['Sports equipment', '$120 per item', false],
            ].map(([label, detail, included]) => (
              <div className="policy-row" key={label as string}>
                <span>{label as string}</span>
                <small>{detail as string}</small>
                <strong className={included ? 'is-included' : ''}>{included ? 'Included' : 'Add-on'}</strong>
              </div>
            ))}
          </article>

          <article className="panel">
            <h3>Cancellation & Refund</h3>
            {[
              [Check, 'Free cancellation', 'Up to 48 hours before departure'],
              [Check, 'Date change fee', '$75 per change after booking'],
              [X, 'No-show policy', '100% of ticket value forfeited'],
            ].map(([Icon, label, detail]) => (
              <div className="refund-row" key={label as string}>
                <Icon size={17} />
                <span>{label as string}</span>
                <small>{detail as string}</small>
              </div>
            ))}
          </article>
        </section>

        <aside className="details-side">
          <article className="panel sticky-panel">
            <h3>Price Breakdown</h3>
            <dl className="price-list">
              <div><dt>Base fare (1 pax)</dt><dd>{formatMoney(flight.price - 77)}</dd></div>
              <div><dt>Taxes & fees</dt><dd>$58.40</dd></div>
              <div><dt>Service fee</dt><dd>$18.60</dd></div>
            </dl>
            <div className="total-row">
              <span>Total</span>
              <strong>{formatMoney(flight.price)}</strong>
            </div>
            <Button fullWidth onClick={continueBooking}>Continue Booking</Button>
            <p className="secure-note">No hidden fees · Secure payment</p>
          </article>

          <article className="panel">
            <h3>Seat Availability</h3>
            <div className="seat-grid">
              {Array.from({ length: 30 }).map((_, index) => (
                <span className={index < 12 ? 'is-taken' : index < 18 ? 'is-standard' : 'is-premium'} key={index}>
                  {index < 12 ? '×' : ''}
                </span>
              ))}
            </div>
          </article>
        </aside>
      </div>
    </main>
  );
}
