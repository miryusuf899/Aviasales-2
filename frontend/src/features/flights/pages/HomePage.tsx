import { ArrowRight, Gift, Headphones, Plane, ShieldCheck, Star, TicketCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useAsync } from '@/shared/hooks/useAsync';
import { Button } from '@/shared/ui/Button';
import { ErrorState, LoadingState } from '@/shared/ui/StatusView';

import { contentApi } from '../api/contentApi';
import { DestinationGrid } from '../components/DestinationGrid';
import { SearchPanel } from '../components/SearchPanel';

export function HomePage() {
  const navigate = useNavigate();
  const { data, loading, error, reload } = useAsync(contentApi.getMarketing);

  if (loading) return <LoadingState label="Preparing travel deals..." />;
  if (error || !data) {
    return (
      <main className="page-offset">
        <ErrorState
          title="Could not load SkyBook content"
          description={error?.message ?? 'Please try again in a moment.'}
          onAction={() => void reload()}
        />
      </main>
    );
  }

  return (
    <main className="home-page">
      <section className="hero">
        <img
          src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1920&h=1080&fit=crop&auto=format"
          alt="Airplane wing above clouds"
        />
        <div className="hero__overlay" />
        <div className="hero__content">
          <div className="hero__copy">
            <span><Plane size={15} /> Over 500 airlines. 190+ countries.</span>
            <h1>Book Flights<br /><strong>Worldwide</strong></h1>
            <p>Compare prices across hundreds of airlines and find the perfect flight for any journey.</p>
          </div>
          <SearchPanel />
        </div>
      </section>

      <section className="stats-band">
        {data.stats.map((item) => (
          <div key={item.label}>
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </div>
        ))}
      </section>

      <DestinationGrid destinations={data.destinations} />

      <section className="section" id="about">
        <div className="section__center">
          <p>Why SkyBook</p>
          <h2>Travel smarter, not harder</h2>
        </div>
        <div className="benefits-grid">
          {data.benefits.map((item, index) => {
            const icons = [ShieldCheck, Headphones, TicketCheck, Gift];
            const Icon = icons[index] ?? ShieldCheck;
            return (
              <article className="benefit-card" key={item.title}>
                <span style={{ backgroundColor: item.color }}><Icon size={25} /></span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="partners">
        <p>Trusted Airline Partners</p>
        <div>
          {data.airlinePartners.map((partner) => (
            <span key={partner.code}>
              <b style={{ backgroundColor: partner.color }}>{partner.code}</b>
              {partner.name}
            </span>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section__center">
          <p>Testimonials</p>
          <h2>What our travelers say</h2>
        </div>
        <div className="testimonials">
          {data.testimonials.map((item) => (
            <article key={item.name}>
              <div>{Array.from({ length: item.rating }).map((_, index) => <Star key={index} size={16} />)}</div>
              <p>“{item.text}”</p>
              <footer>
                <span>{item.avatar}</span>
                <div>
                  <strong>{item.name}</strong>
                  <small>{item.role}</small>
                </div>
              </footer>
            </article>
          ))}
        </div>
      </section>

      <section className="cta-panel">
        <h2>Ready for your next adventure?</h2>
        <p>Join over 2 million travelers who book with SkyBook every month.</p>
        <Button onClick={() => navigate('/register')} icon={<ArrowRight size={19} />}>
          Get Started — It's Free
        </Button>
      </section>

      <footer className="site-footer" id="contact">
        <div>
          <h3>Sky<span>Book</span></h3>
          <p>The world's most trusted flight booking platform. Find, compare, and book flights to anywhere.</p>
        </div>
        {[
          ['Product', 'Search Flights', 'My Bookings', 'Price Alerts', 'Mobile App'],
          ['Company', 'About Us', 'Careers', 'Press', 'Blog'],
          ['Support', 'Help Center', 'Contact Us', 'Refund Policy', 'Safety'],
        ].map(([title, ...links]) => (
          <nav key={title}>
            <strong>{title}</strong>
            {links.map((link) => <a href="/" key={link}>{link}</a>)}
          </nav>
        ))}
      </footer>
    </main>
  );
}
