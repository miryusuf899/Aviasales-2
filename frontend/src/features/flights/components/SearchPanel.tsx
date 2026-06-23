import { ArrowRightLeft, CalendarDays, MapPin, Plane, Search, ShieldCheck, Users } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/shared/ui/Button';

export function SearchPanel() {
  const [tripType, setTripType] = useState<'round' | 'one'>('round');
  const [passengers, setPassengers] = useState(1);
  const [cabin, setCabin] = useState('Economy');
  const navigate = useNavigate();

  const submit = (event: FormEvent) => {
    event.preventDefault();
    navigate(`/flights?from=JFK&to=CDG&passengers=${passengers}&cabin=${encodeURIComponent(cabin)}`);
  };

  return (
    <form className="search-card" onSubmit={submit}>
      <div className="search-card__top">
        <div className="segmented">
          {[
            ['round', 'Round Trip'],
            ['one', 'One Way'],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={tripType === value ? 'is-active' : ''}
              onClick={() => setTripType(value as 'round' | 'one')}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="search-card__controls">
          <div className="passenger-control">
            <Users size={16} />
            <button type="button" onClick={() => setPassengers((value) => Math.max(1, value - 1))}>-</button>
            <strong>{passengers}</strong>
            <button type="button" onClick={() => setPassengers((value) => Math.min(9, value + 1))}>+</button>
            <span>Pax</span>
          </div>
          <select value={cabin} onChange={(event) => setCabin(event.target.value)}>
            <option>Economy</option>
            <option>Business</option>
            <option>First Class</option>
          </select>
        </div>
      </div>

      <div className="search-card__route">
        <div className="route-field">
          <label>From</label>
          <span><MapPin size={20} /></span>
          <div>
            <strong>JFK</strong>
            <small>New York, USA</small>
          </div>
        </div>
        <button type="button" className="swap-btn" aria-label="Swap airports">
          <ArrowRightLeft size={17} />
        </button>
        <div className="route-field">
          <label>To</label>
          <span><MapPin size={20} /></span>
          <div>
            <strong>CDG</strong>
            <small>Paris, France</small>
          </div>
        </div>
      </div>

      <div className="search-card__dates">
        <div className="date-field">
          <label>Departure</label>
          <CalendarDays size={20} />
          <div>
            <strong>Mar 15, 2025</strong>
            <small>Saturday</small>
          </div>
        </div>
        <div className={`date-field ${tripType === 'one' ? 'is-disabled' : ''}`}>
          <label>Return</label>
          <CalendarDays size={20} />
          <div>
            <strong>{tripType === 'round' ? 'Mar 22, 2025' : '-'}</strong>
            <small>{tripType === 'round' ? 'Saturday' : 'One way'}</small>
          </div>
        </div>
        <Button type="submit" icon={<Search size={20} />} className="search-card__submit">
          Search Flights
        </Button>
      </div>

      <div className="search-card__perks">
        {['Price guarantee', 'Free cancellation', '24/7 support'].map((item) => (
          <span key={item}>
            {item === 'Price guarantee' ? <ShieldCheck size={16} /> : <Plane size={16} />}
            {item}
          </span>
        ))}
      </div>
    </form>
  );
}
