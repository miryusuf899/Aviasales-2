import { Save, ShieldCheck, Trash2 } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';

import { useAsync } from '@/shared/hooks/useAsync';
import { Button } from '@/shared/ui/Button';
import { FormField } from '@/shared/ui/FormField';
import { EmptyState, ErrorState, LoadingState } from '@/shared/ui/StatusView';

import { adminApi } from '../api/adminApi';
import type { AirportPayload, FlightAdminItem, FlightPayload } from '../types';

const airportInitial: AirportPayload = { code: '', city: '', country: '' };
const flightInitial: FlightPayload = {
  flight_number: '',
  from_airport_id: 0,
  to_airport_id: 0,
  departure_time: '',
  arrival_time: '',
  available_seats: 20,
  price: '299.00',
  currency: 'USD',
};

function toDateInput(value: string) {
  return value ? value.slice(0, 16) : '';
}

function toIsoDate(value: string) {
  return new Date(value).toISOString();
}

export function AdminPage() {
  const [airportForm, setAirportForm] = useState<AirportPayload>(airportInitial);
  const [flightForm, setFlightForm] = useState<FlightPayload>(flightInitial);
  const [selectedFlightId, setSelectedFlightId] = useState<number | null>(null);
  const [seatDelta, setSeatDelta] = useState(-1);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const airportsState = useAsync(adminApi.listAirports);
  const flightsState = useAsync(adminApi.listFlights);
  const airports = airportsState.data ?? [];
  const flights = flightsState.data ?? [];

  const selectedFlight = useMemo(
    () => flights.find((flight) => flight.id === selectedFlightId) ?? null,
    [flights, selectedFlightId],
  );

  const reloadAll = async () => {
    await Promise.all([airportsState.reload(), flightsState.reload()]);
  };

  const submitAirport = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await adminApi.createAirport(airportForm);
      setAirportForm(airportInitial);
      setMessage('Airport created successfully.');
      await airportsState.reload();
    } finally {
      setSaving(false);
    }
  };

  const submitFlight = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const payload = {
        ...flightForm,
        departure_time: toIsoDate(flightForm.departure_time),
        arrival_time: toIsoDate(flightForm.arrival_time),
        available_seats: Number(flightForm.available_seats),
        from_airport_id: Number(flightForm.from_airport_id),
        to_airport_id: Number(flightForm.to_airport_id),
      };

      if (selectedFlightId) {
        await adminApi.updateFlight(selectedFlightId, payload);
        setMessage('Flight updated successfully.');
      } else {
        await adminApi.createFlight(payload);
        setMessage('Flight created successfully.');
      }
      setSelectedFlightId(null);
      setFlightForm(flightInitial);
      await flightsState.reload();
    } finally {
      setSaving(false);
    }
  };

  const editFlight = (flight: FlightAdminItem) => {
    const fromAirport = airports.find((airport) => airport.code === flight.from_airport);
    const toAirport = airports.find((airport) => airport.code === flight.to_airport);
    setSelectedFlightId(flight.id);
    setFlightForm({
      flight_number: flight.flight_number,
      from_airport_id: fromAirport?.id ?? 0,
      to_airport_id: toAirport?.id ?? 0,
      departure_time: toDateInput(flight.departure_time),
      arrival_time: toDateInput(flight.arrival_time),
      available_seats: flight.available_seats,
      price: String(flight.price),
      currency: flight.currency,
    });
  };

  const patchSeats = async (flightId: number) => {
    setSaving(true);
    setMessage(null);
    try {
      await adminApi.patchSeats(flightId, Number(seatDelta));
      setMessage('Seats updated successfully.');
      await flightsState.reload();
    } finally {
      setSaving(false);
    }
  };

  const deleteFlight = async (flightId: number) => {
    setSaving(true);
    setMessage(null);
    try {
      await adminApi.deleteFlight(flightId);
      if (selectedFlightId === flightId) {
        setSelectedFlightId(null);
        setFlightForm(flightInitial);
      }
      setMessage('Flight deleted successfully.');
      await flightsState.reload();
    } finally {
      setSaving(false);
    }
  };

  if (airportsState.loading || flightsState.loading) return <LoadingState label="Loading admin workspace..." />;

  if (airportsState.error || flightsState.error) {
    return (
      <main className="admin-page page-offset">
        <ErrorState
          title="Admin data unavailable"
          description={airportsState.error?.message ?? flightsState.error?.message ?? 'Please try again.'}
          onAction={() => void reloadAll()}
        />
      </main>
    );
  }

  return (
    <main className="admin-page page-offset">
      <header className="admin-hero">
        <div>
          <span><ShieldCheck size={16} /> Admin workspace</span>
          <h1>Flight Management</h1>
          <p>Create airports, publish flights, adjust seats, and remove outdated routes.</p>
        </div>
        {message ? <strong>{message}</strong> : null}
      </header>

      <section className="admin-grid">
        <form className="panel admin-form" onSubmit={submitAirport}>
          <h3>Create airport</h3>
          <FormField
            label="Airport code"
            maxLength={3}
            minLength={3}
            placeholder="JFK"
            required
            value={airportForm.code}
            onChange={(event) => setAirportForm((form) => ({ ...form, code: event.target.value.toUpperCase() }))}
          />
          <FormField
            label="City"
            placeholder="New York"
            required
            value={airportForm.city}
            onChange={(event) => setAirportForm((form) => ({ ...form, city: event.target.value }))}
          />
          <FormField
            label="Country"
            placeholder="United States"
            required
            value={airportForm.country}
            onChange={(event) => setAirportForm((form) => ({ ...form, country: event.target.value }))}
          />
          <Button type="submit" icon={<Save size={16} />} disabled={saving}>Create airport</Button>
        </form>

        <form className="panel admin-form admin-form--wide" onSubmit={submitFlight}>
          <div className="admin-form__head">
            <h3>{selectedFlightId ? `Edit flight #${selectedFlightId}` : 'Create flight'}</h3>
            {selectedFlightId ? (
              <button
                type="button"
                onClick={() => {
                  setSelectedFlightId(null);
                  setFlightForm(flightInitial);
                }}
              >
                Clear selection
              </button>
            ) : null}
          </div>
          <div className="form-grid two">
            <FormField
              label="Flight number"
              placeholder="AF337"
              required
              value={flightForm.flight_number}
              onChange={(event) => setFlightForm((form) => ({ ...form, flight_number: event.target.value.toUpperCase() }))}
            />
            <FormField
              label="Currency"
              maxLength={3}
              required
              value={flightForm.currency}
              onChange={(event) => setFlightForm((form) => ({ ...form, currency: event.target.value.toUpperCase() }))}
            />
          </div>
          <div className="form-grid two">
            <label className="field">
              <span className="field__label">From airport</span>
              <select
                required
                value={flightForm.from_airport_id || ''}
                onChange={(event) => setFlightForm((form) => ({ ...form, from_airport_id: Number(event.target.value) }))}
              >
                <option value="">Select airport</option>
                {airports.map((airport) => (
                  <option value={airport.id} key={airport.id}>{airport.code} - {airport.city}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span className="field__label">To airport</span>
              <select
                required
                value={flightForm.to_airport_id || ''}
                onChange={(event) => setFlightForm((form) => ({ ...form, to_airport_id: Number(event.target.value) }))}
              >
                <option value="">Select airport</option>
                {airports.map((airport) => (
                  <option value={airport.id} key={airport.id}>{airport.code} - {airport.city}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="form-grid two">
            <FormField
              label="Departure"
              type="datetime-local"
              required
              value={flightForm.departure_time}
              onChange={(event) => setFlightForm((form) => ({ ...form, departure_time: event.target.value }))}
            />
            <FormField
              label="Arrival"
              type="datetime-local"
              required
              value={flightForm.arrival_time}
              onChange={(event) => setFlightForm((form) => ({ ...form, arrival_time: event.target.value }))}
            />
          </div>
          <div className="form-grid two">
            <FormField
              label="Seats"
              type="number"
              min={0}
              required
              value={flightForm.available_seats}
              onChange={(event) => setFlightForm((form) => ({ ...form, available_seats: Number(event.target.value) }))}
            />
            <FormField
              label="Price"
              type="number"
              min={1}
              step="0.01"
              required
              value={flightForm.price}
              onChange={(event) => setFlightForm((form) => ({ ...form, price: event.target.value }))}
            />
          </div>
          <Button type="submit" icon={<Save size={16} />} disabled={saving || airports.length < 2}>
            {selectedFlightId ? 'Update flight' : 'Create flight'}
          </Button>
        </form>
      </section>

      <section className="panel admin-table">
        <div className="admin-table__head">
          <h3>Flights</h3>
          <div>
            <input
              aria-label="Seat delta"
              type="number"
              value={seatDelta}
              onChange={(event) => setSeatDelta(Number(event.target.value))}
            />
            <span>seat delta</span>
          </div>
        </div>

        {flights.length === 0 ? (
          <EmptyState
            title="No flights yet"
            description="Create the first flight from the admin form above."
          />
        ) : (
          <div className="admin-table__scroll">
            <table>
              <thead>
                <tr>
                  <th>Flight</th>
                  <th>Route</th>
                  <th>Departure</th>
                  <th>Seats</th>
                  <th>Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {flights.map((flight) => (
                  <tr className={selectedFlight?.id === flight.id ? 'is-selected' : ''} key={flight.id}>
                    <td><strong>{flight.flight_number}</strong></td>
                    <td>{flight.from_airport} → {flight.to_airport}</td>
                    <td>{new Date(flight.departure_time).toLocaleString()}</td>
                    <td>{flight.available_seats}</td>
                    <td>{flight.currency} {Number(flight.price).toFixed(2)}</td>
                    <td>
                      <button type="button" onClick={() => editFlight(flight)}>Edit</button>
                      <button type="button" onClick={() => void patchSeats(flight.id)} disabled={saving}>Seats</button>
                      <button type="button" onClick={() => void deleteFlight(flight.id)} disabled={saving} aria-label="Delete flight">
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
