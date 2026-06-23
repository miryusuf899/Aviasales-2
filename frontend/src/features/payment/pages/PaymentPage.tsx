import { ArrowLeft, CalendarDays, CreditCard, Lock, User } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { bookingApi } from '@/features/booking/api/bookingApi';
import { bookingDraft } from '@/features/booking/api/bookingDraft';
import { BookingSummary } from '@/features/booking/components/BookingSummary';
import { toApiError } from '@/shared/api/httpClient';
import { Button } from '@/shared/ui/Button';
import { FormField } from '@/shared/ui/FormField';
import { Stepper } from '@/shared/ui/Stepper';
import { EmptyState, ErrorState } from '@/shared/ui/StatusView';

import { paymentApi } from '../api/paymentApi';
import { PaymentMethods } from '../components/PaymentMethods';
import type { PaymentMethod } from '../types';

export function PaymentPage() {
  const navigate = useNavigate();
  const draft = bookingDraft.get();
  const flight = draft?.flight;
  const [method, setMethod] = useState<PaymentMethod>('card');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!flight) return;
    setSubmitting(true);
    setError(null);

    try {
      const booking =
        draft?.booking ??
        (await bookingApi.createBooking(flight.backendId ?? (Number(flight.id) || 1), 1));
      bookingDraft.setBooking(booking);
      await paymentApi.createPayment({
        bookingId: booking.id,
        amount: flight.price,
        paymentMethod: method,
      });
      navigate('/booking/success');
    } catch (requestError) {
      setError(toApiError(requestError).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!flight) {
    return (
      <main className="page-offset narrow-page">
        <EmptyState
          title="No booking draft"
          description="Choose a flight and enter passenger details before payment."
          actionLabel="Search flights"
          onAction={() => navigate('/flights')}
        />
      </main>
    );
  }

  return (
    <main className="checkout-page page-offset">
      <button className="back-link" onClick={() => navigate('/booking/passengers')}>
        <ArrowLeft size={17} /> Back to passenger info
      </button>
      <header className="checkout-header">
        <h1>Secure Payment</h1>
        <p>Your payment information is encrypted and secure.</p>
      </header>
      <Stepper
        steps={[
          { label: 'Passenger Info', done: true },
          { label: 'Payment', active: true },
          { label: 'Confirmation' },
        ]}
      />

      {error ? (
        <ErrorState
          title="Payment could not be completed"
          description={error}
          onAction={() => setError(null)}
        />
      ) : null}

      <form className="checkout-layout" onSubmit={submit}>
        <section className="checkout-main">
          <article className="panel">
            <h3>Payment Method</h3>
            <PaymentMethods value={method} onChange={setMethod} />

            {method === 'card' ? (
              <div className="card-payment">
                <div className="credit-card-preview">
                  <div>
                    <CreditCard size={33} />
                    <span><i /><i /></span>
                  </div>
                  <small>Card Number</small>
                  <strong>4532 •••• •••• 8291</strong>
                  <footer>
                    <span><small>Card Holder</small><b>ALEX JOHNSON</b></span>
                    <span><small>Expires</small><b>09/28</b></span>
                  </footer>
                </div>
                <FormField label="Card Number" placeholder="4532 0000 0000 0000" icon={<CreditCard size={17} />} />
                <FormField label="Card Holder Name" placeholder="Alex Johnson" icon={<User size={17} />} />
                <div className="form-grid two">
                  <FormField label="Expiry Date" placeholder="MM / YY" icon={<CalendarDays size={17} />} />
                  <FormField label="CVV" placeholder="•••" type="password" icon={<Lock size={17} />} />
                </div>
                <label className="remember-row">
                  <input type="checkbox" />
                  <span>Save this card for future bookings</span>
                </label>
              </div>
            ) : (
              <div className="external-payment">
                <span>{method === 'paypal' ? 'P' : '🍎'}</span>
                <p>
                  {method === 'paypal'
                    ? "You'll be redirected to PayPal to complete your payment securely."
                    : 'Use Face ID or Touch ID to pay.'}
                </p>
                <small>Total: <strong>${flight.price}.00</strong></small>
              </div>
            )}
          </article>

          <div className="accepted-row">
            <span>Accepted:</span>
            {['VISA', 'MC', 'AMEX', 'JCB'].map((item) => <b key={item}>{item}</b>)}
            <small><Lock size={15} /> SSL Secured</small>
          </div>
        </section>

        <aside>
          <BookingSummary
            title="Order Summary"
            flight={flight}
            action={<Button fullWidth type="submit" disabled={submitting}>{submitting ? 'Processing...' : 'Complete Payment'}</Button>}
          />
        </aside>
      </form>
    </main>
  );
}
