import { AlertCircle, RefreshCcw } from 'lucide-react';

import { Button } from './Button';

type StatusViewProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function LoadingState({ label = 'Loading data...' }: { label?: string }) {
  return (
    <div className="state-card">
      <div className="spinner" />
      <p>{label}</p>
    </div>
  );
}

export function EmptyState({ title, description, actionLabel, onAction }: StatusViewProps) {
  return (
    <div className="state-card">
      <AlertCircle className="state-icon" />
      <h3>{title}</h3>
      <p>{description}</p>
      {actionLabel && onAction ? (
        <Button variant="secondary" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

export function ErrorState({ title, description, actionLabel = 'Try again', onAction }: StatusViewProps) {
  return (
    <div className="state-card state-card--error">
      <AlertCircle className="state-icon" />
      <h3>{title}</h3>
      <p>{description}</p>
      {onAction ? (
        <Button variant="secondary" icon={<RefreshCcw size={16} />} onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
