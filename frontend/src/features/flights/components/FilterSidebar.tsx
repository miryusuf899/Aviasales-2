import type { FlightOption } from '../types';
import { AirlineBadge } from '@/shared/ui/AirlineBadge';

type FilterSidebarProps = {
  flights: FlightOption[];
  maxPrice: number;
  selectedStops: number[];
  onPriceChange: (value: number) => void;
  onStopsChange: (stops: number[]) => void;
};

export function FilterSidebar({
  flights,
  maxPrice,
  selectedStops,
  onPriceChange,
  onStopsChange,
}: FilterSidebarProps) {
  const toggleStop = (value: number) => {
    onStopsChange(
      selectedStops.includes(value)
        ? selectedStops.filter((item) => item !== value)
        : [...selectedStops, value],
    );
  };

  return (
    <aside className="filters">
      <section>
        <h3>Price Range</h3>
        <div className="range-labels">
          <span>$200</span>
          <strong>${maxPrice}</strong>
        </div>
        <input
          type="range"
          min={200}
          max={1200}
          value={maxPrice}
          onChange={(event) => onPriceChange(Number(event.target.value))}
        />
        <div className="range-labels small">
          <span>Min</span>
          <span>Max $1,200</span>
        </div>
      </section>

      <section>
        <h3>Stops</h3>
        {[{ value: 0, label: 'Nonstop' }, { value: 1, label: '1 Stop' }, { value: 2, label: '2+ Stops' }].map((item) => (
          <button
            className={`check-row ${selectedStops.includes(item.value) ? 'is-active' : ''}`}
            key={item.value}
            onClick={() => toggleStop(item.value)}
          >
            <span />
            {item.label}
          </button>
        ))}
      </section>

      <section>
        <h3>Airlines</h3>
        {flights.map((flight) => (
          <label className="airline-filter" key={flight.id}>
            <input type="checkbox" defaultChecked />
            <AirlineBadge code={flight.code} color={flight.color} size="sm" />
            <span>{flight.airline}</span>
            <strong>${flight.price}</strong>
          </label>
        ))}
      </section>

      <section>
        <h3>Departure Time</h3>
        <div className="time-grid">
          {['00-06', '06-12', '12-18', '18-24'].map((item) => (
            <button key={item}>{item}</button>
          ))}
        </div>
      </section>
    </aside>
  );
}
