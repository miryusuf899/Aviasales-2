import { Plane } from 'lucide-react';

type AuthLayoutProps = {
  variant: 'login' | 'register';
  children: React.ReactNode;
};

export function AuthLayout({ variant, children }: AuthLayoutProps) {
  const isRegister = variant === 'register';

  return (
    <main className="auth-page page-offset">
      <aside className="auth-visual">
        <img
          src={
            isRegister
              ? 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=900&h=1200&fit=crop&auto=format'
              : 'https://images.unsplash.com/photo-1569629743817-70d8db6c323b?w=900&h=1200&fit=crop&auto=format'
          }
          alt={isRegister ? 'Airplane above clouds' : 'Airport terminal'}
        />
        <div />
        <header>
          <span><Plane size={17} /></span>
          <strong>Sky<span>Book</span></strong>
        </header>
        <footer>
          {isRegister ? (
            <ul>
              {[
                'Access to 500+ airlines worldwide',
                'Price alerts & exclusive member deals',
                'Earn SkyMiles on every booking',
                'Free cancellation on most fares',
              ].map((item) => <li key={item}>✓ {item}</li>)}
            </ul>
          ) : (
            <>
              <blockquote>“The journey of a thousand miles begins with a single click.”</blockquote>
              <p>Join 2M+ travelers booking smarter with SkyBook.</p>
            </>
          )}
        </footer>
      </aside>
      <section className="auth-content">{children}</section>
    </main>
  );
}
