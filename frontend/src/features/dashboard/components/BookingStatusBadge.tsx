import { AlertTriangle, Check, Clock, X } from 'lucide-react';

import type { BookingStatus } from '../types';

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const config = {
    confirmed: { icon: Check, label: 'Confirmed', className: 'confirmed' },
    pending: { icon: Clock, label: 'Pending', className: 'pending' },
    cancelled: { icon: X, label: 'Cancelled', className: 'cancelled' },
    payment_failed: { icon: AlertTriangle, label: 'Payment Failed', className: 'failed' },
  }[status];
  const Icon = config.icon;

  return (
    <span className={`status-badge ${config.className}`}>
      <Icon size={13} />
      {config.label}
    </span>
  );
}
