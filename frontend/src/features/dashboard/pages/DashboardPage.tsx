import { Bell, CreditCard, Gift, HelpCircle, Plane, Settings, User } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '@/features/auth/api/AuthContext';
import { useAsync } from '@/shared/hooks/useAsync';
import { initials } from '@/shared/lib/formatters';
import { Button } from '@/shared/ui/Button';
import { EmptyState, ErrorState, LoadingState } from '@/shared/ui/StatusView';

import { dashboardApi } from '../api/dashboardApi';
import { BookingCard } from '../components/BookingCard';
import type { BookingStatus } from '../types';
import type { LucideIcon } from 'lucide-react';

type FilterKey = 'all' | BookingStatus;

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [filter, setFilter] = useState<FilterKey>('all');
  const { data, loading, error, reload } = useAsync(dashboardApi.listBookings, []);

  const bookings = data ?? [];
  const filtered = useMemo(
    () => (filter === 'all' ? bookings : bookings.filter((booking) => booking.status === filter)),
    [bookings, filter],
  );

  const cancelBooking = async (bookingId: string) => {
    try {
      await dashboardApi.cancelBooking(bookingId);
      await reload();
    } catch {
      await reload();
    }
  };

  const menuItems: Array<{ icon: LucideIcon; label: string; active: boolean }> = [
    { icon: Plane, label: 'My Bookings', active: true },
    { icon: User, label: 'Profile Settings', active: false },
    { icon: Bell, label: 'Notifications', active: false },
    { icon: CreditCard, label: 'Payment Methods', active: false },
    { icon: Gift, label: 'SkyMiles Rewards', active: false },
    { icon: HelpCircle, label: 'Help & Support', active: false },
  ];

  if (loading) return <LoadingState label="Loading your bookings..." />;

  return (
    <main className="dashboard-page page-offset">
      <aside className="dashboard-sidebar">
        <section className="profile-card">
          <div>
            <span>{initials(user?.first_name, user?.last_name, user?.email)}</span>
            <div>
              <h3>{user?.first_name || 'SkyBook'} {user?.last_name || 'Traveler'}</h3>
              <p>{user?.email}</p>
              <b><Gift size={13} /> Gold Member</b>
            </div>
          </div>
          <footer>
            <span><strong>{bookings.length}</strong><small>Bookings</small></span>
            <span><strong>12,400</strong><small>SkyMiles</small></span>
          </footer>
        </section>
        <nav className="dashboard-menu">
          {menuItems.map(({ icon: Icon, label, active }) => (
            <button className={active ? 'is-active' : ''} key={label}>
              <Icon size={17} />
              {label}
              {active ? <Settings size={15} /> : null}
            </button>
          ))}
        </nav>
      </aside>

      <section className="dashboard-main">
        <header>
          <div>
            <h1>My Bookings</h1>
            <p>Manage and track all your flight reservations</p>
          </div>
          <Button icon={<Plane size={17} />} onClick={() => navigate('/')}>Book New Flight</Button>
        </header>

        <div className="booking-tabs">
          {[
            ['all', 'All Bookings'],
            ['confirmed', 'Confirmed'],
            ['pending', 'Pending'],
            ['cancelled', 'Cancelled'],
          ].map(([key, label]) => {
            const count = key === 'all' ? bookings.length : bookings.filter((item) => item.status === key).length;
            return (
              <button
                className={filter === key ? 'is-active' : ''}
                key={key}
                onClick={() => setFilter(key as FilterKey)}
              >
                {label}
                <span>{count}</span>
              </button>
            );
          })}
        </div>

        {error ? (
          <ErrorState title="Bookings unavailable" description={error.message} onAction={() => void reload()} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No bookings in this category"
            description="When you book a flight, it will appear here with its current status."
            actionLabel="Book New Flight"
            onAction={() => navigate('/')}
          />
        ) : (
          <div className="booking-list">
            {filtered.map((booking) => (
              <BookingCard booking={booking} key={booking.id} onCancel={cancelBooking} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
