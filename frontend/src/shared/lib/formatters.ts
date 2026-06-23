export function formatMoney(value: number | string, currency = 'USD') {
  const amount = typeof value === 'string' ? Number(value) : value;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0);
}

export function initials(firstName?: string | null, lastName?: string | null, email?: string) {
  const fromNames = `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.trim();
  if (fromNames) return fromNames.toUpperCase();
  return (email?.slice(0, 2) ?? 'SB').toUpperCase();
}

export function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function formatShortDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
