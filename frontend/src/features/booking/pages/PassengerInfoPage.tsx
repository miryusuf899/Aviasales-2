import { ArrowLeft, CalendarDays, IdCard, Mail, Phone, User } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '@/features/auth/api/AuthContext';
import type { FlightOption } from '@/features/flights/types';
import { selectedFlightStorage } from '@/shared/lib/storage';
import { Button } from '@/shared/ui/Button';
import { FormField } from '@/shared/ui/FormField';
import { Stepper } from '@/shared/ui/Stepper';
import { EmptyState } from '@/shared/ui/StatusView';

import { bookingDraft } from '../api/bookingDraft';
import { BookingSummary } from '../components/BookingSummary';
import type { PassengerForm } from '../types';

export function PassengerInfoPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [flight, setFlight] = useState<FlightOption | null>(null);
  const [form, setForm] = useState<PassengerForm>({
    firstName: user?.first_name ?? '',
    lastName: user?.last_name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    birthDate: '',
    nationality: 'United States',
    passport: '',
  });

  useEffect(() => {
    const selected = selectedFlightStorage.get<FlightOption>() ?? bookingDraft.get()?.flight ?? null;
    setFlight(selected);
    if (selected) bookingDraft.setFlight(selected);
  }, []);

  const update = (field: keyof PassengerForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    bookingDraft.setPassenger(form);
    navigate('/booking/payment');
  };

  if (!flight) {
    return (
      <main className="page-offset narrow-page">
        <EmptyState
          title="Choose a flight first"
          description="Passenger details are linked to a selected itinerary."
          actionLabel="Search flights"
          onAction={() => navigate('/flights')}
        />
      </main>
    );
  }

  return (
    <main className="checkout-page page-offset">
      <button className="back-link" onClick={() => navigate(`/flights/${flight.backendId ?? flight.id}`)}>
        <ArrowLeft size={17} /> Back to flight details
      </button>
      <header className="checkout-header">
        <h1>Passenger Information</h1>
        <p>Please enter details exactly as shown on your passport or ID.</p>
      </header>
      <Stepper steps={[{ label: 'Passenger Info', active: true }, { label: 'Payment' }, { label: 'Confirmation' }]} />

      <form className="checkout-layout" onSubmit={submit}>
        <section className="checkout-main">
          <article className="panel">
            <h3>Passenger 1 — Lead Traveler</h3>
            <div className="form-grid two">
              <FormField label="First Name" value={form.firstName} onChange={(event) => update('firstName', event.target.value)} placeholder="Alexandra" icon={<User size={17} />} required />
              <FormField label="Last Name" value={form.lastName} onChange={(event) => update('lastName', event.target.value)} placeholder="Johnson" icon={<User size={17} />} required />
              <FormField label="Email Address" type="email" value={form.email} onChange={(event) => update('email', event.target.value)} placeholder="alex@example.com" icon={<Mail size={17} />} required />
              <FormField label="Phone Number" type="tel" value={form.phone} onChange={(event) => update('phone', event.target.value)} placeholder="+1 (555) 000-0000" icon={<Phone size={17} />} required />
              <FormField label="Date of Birth" value={form.birthDate} onChange={(event) => update('birthDate', event.target.value)} placeholder="Jan 15, 1990" icon={<CalendarDays size={17} />} />
              <label className="field">
                <span className="field__label">Nationality</span>
                <select value={form.nationality} onChange={(event) => update('nationality', event.target.value)}>
                  <option>United States</option>
                  <option>United Kingdom</option>
                  <option>France</option>
                  <option>Germany</option>
                  <option>Tajikistan</option>
                </select>
              </label>
            </div>
            <FormField label="Passport Number" value={form.passport} onChange={(event) => update('passport', event.target.value)} placeholder="US1234567" icon={<IdCard size={17} />} />
          </article>

          <article className="panel">
            <h3>Optional Add-ons</h3>
            {[
              ['Travel Insurance', 'Full trip coverage including medical & cancellation', '+$29.99'],
              ['Priority Boarding', 'Board first and choose your seat at the gate', '+$14.99'],
              ['Extra Checked Bag (23kg)', 'Add a second checked baggage to your booking', '+$65.00'],
            ].map(([label, description, price]) => (
              <label className="addon-row" key={label}>
                <input type="checkbox" />
                <span><strong>{label}</strong><small>{description}</small></span>
                <b>{price}</b>
              </label>
            ))}
          </article>
        </section>

        <aside>
          <BookingSummary
            flight={flight}
            action={<Button fullWidth type="submit">Confirm Booking</Button>}
          />
        </aside>
      </form>
    </main>
  );
}
