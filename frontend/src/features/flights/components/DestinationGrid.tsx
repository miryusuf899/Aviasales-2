import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { formatMoney } from '@/shared/lib/formatters';

import type { Destination } from '../types';

export function DestinationGrid({ destinations }: { destinations: Destination[] }) {
  const navigate = useNavigate();

  return (
    <section className="section section--muted">
      <div className="section__heading">
        <div>
          <p>Explore the world</p>
          <h2>Popular Destinations</h2>
        </div>
        <button onClick={() => navigate('/flights')}>
          View all destinations <ArrowRight size={17} />
        </button>
      </div>

      <div className="dest-grid">
        {destinations.map((destination, index) => (
          <article
            className={`dest-card ${index > 2 ? 'dest-card--small' : ''}`}
            key={destination.code}
            onClick={() => navigate(`/flights?to=${destination.code}`)}
          >
            <div className="dest-card__image">
              <img src={destination.imageUrl} alt={destination.city} />
              {destination.tag ? <span>{destination.tag}</span> : null}
            </div>
            <div className="dest-card__body">
              <div>
                <h3>{destination.city}</h3>
                <p>{destination.country} · {destination.code}</p>
              </div>
              <strong>{formatMoney(destination.price)}</strong>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
