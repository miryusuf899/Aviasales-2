type AirlineBadgeProps = {
  code: string;
  color: string;
  size?: 'sm' | 'md' | 'lg';
};

export function AirlineBadge({ code, color, size = 'md' }: AirlineBadgeProps) {
  return (
    <span className={`airline-badge airline-badge--${size}`} style={{ backgroundColor: color }}>
      {code}
    </span>
  );
}
