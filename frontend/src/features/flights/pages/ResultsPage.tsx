import { CalendarDays, Plane, Search, Users } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useAsync } from '@/shared/hooks/useAsync';
import { Button } from '@/shared/ui/Button';
import { EmptyState, ErrorState, LoadingState } from '@/shared/ui/StatusView';

import { flightsApi } from '../api/flightsApi';
import { FilterSidebar } from '../components/FilterSidebar';
import { FlightCard } from '../components/FlightCard';

export function ResultsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [maxPrice, setMaxPrice] = useState(800);
  const [selectedStops, setSelectedStops] = useState<number[]>([]);
  const [sort, setSort] = useState<'cheapest' | 'fastest' | 'best'>('cheapest');

  const searchFlights = useCallback(
    () =>
      flightsApi.searchFlights({
        from: searchParams.get('from') ?? undefined,
        to: searchParams.get('to') ?? undefined,
        passengers: Number(searchParams.get('passengers') ?? 1),
        cabin: searchParams.get('cabin') ?? 'Economy',
      }),
    [searchParams],
  );
  const { data: flights, loading, error, reload } = useAsync(searchFlights);

  const visibleFlights = useMemo(() => {
    return [...(flights ?? [])]
      .filter((flight) => flight.price <= maxPrice)
      .filter((flight) => selectedStops.length === 0 || selectedStops.includes(flight.stops))
      .sort((a, b) => {
        if (sort === 'cheapest') return a.price - b.price;
        if (sort === 'fastest') return a.duration.localeCompare(b.duration);
        return b.seats - a.seats;
      });
  }, [flights, maxPrice, selectedStops, sort]);

  if (loading) return <LoadingState label="Searching available flights..." />;

  return (
    <main className="results-page page-offset">
      <div className="search-summary">
        <span><Plane size={16} /> <strong>JFK</strong> → <strong>CDG</strong></span>
        <span><CalendarDays size={16} /> Mar 15 — Mar 22, 2025</span>
        <span><Users size={16} /> 1 Passenger · Economy</span>
        <Button icon={<Search size={16} />} onClick={() => navigate('/')}>Modify Search</Button>
      </div>

      {error ? (
        <ErrorState
          title="Could not load flights"
          description={error.message}
          onAction={() => void reload()}
        />
      ) : (
        <div className="results-layout">
          <FilterSidebar
            flights={flights ?? []}
            maxPrice={maxPrice}
            selectedStops={selectedStops}
            onPriceChange={setMaxPrice}
            onStopsChange={setSelectedStops}
          />
          <section className="results-list">
            <div className="results-list__head">
              <p><strong>{visibleFlights.length} flights</strong> found for your search</p>
              <div>
                <span>Sort by:</span>
                {(['cheapest', 'fastest', 'best'] as const).map((item) => (
                  <button
                    key={item}
                    className={sort === item ? 'is-active' : ''}
                    onClick={() => setSort(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {visibleFlights.length === 0 ? (
              <EmptyState
                title="No flights matched your filters"
                description="Try increasing the price range or clearing stop filters."
                actionLabel="Reset filters"
                onAction={() => {
                  setMaxPrice(1200);
                  setSelectedStops([]);
                }}
              />
            ) : (
              visibleFlights.map((flight) => <FlightCard flight={flight} key={flight.id} />)
            )}
          </section>
        </div>
      )}
    </main>
  );
}
