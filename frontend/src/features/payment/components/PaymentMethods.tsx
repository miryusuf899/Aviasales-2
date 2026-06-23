import { CreditCard } from 'lucide-react';

import type { PaymentMethod } from '../types';

type PaymentMethodsProps = {
  value: PaymentMethod;
  onChange: (value: PaymentMethod) => void;
};

export function PaymentMethods({ value, onChange }: PaymentMethodsProps) {
  const methods: Array<{ key: PaymentMethod; label: string; icon: React.ReactNode }> = [
    { key: 'card', label: 'Credit Card', icon: <CreditCard size={22} /> },
    { key: 'paypal', label: 'PayPal', icon: <span className="payment-icon-text">P</span> },
    { key: 'apple', label: 'Apple Pay', icon: <span>🍎</span> },
  ];

  return (
    <div className="payment-methods">
      {methods.map((method) => (
        <button
          type="button"
          className={value === method.key ? 'is-active' : ''}
          key={method.key}
          onClick={() => onChange(method.key)}
        >
          {method.icon}
          {method.label}
        </button>
      ))}
    </div>
  );
}
