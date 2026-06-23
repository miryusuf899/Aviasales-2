import { Check } from 'lucide-react';

export type Step = {
  label: string;
  active?: boolean;
  done?: boolean;
};

export function Stepper({ steps }: { steps: Step[] }) {
  return (
    <div className="stepper">
      {steps.map((step, index) => (
        <div className="stepper__item" key={step.label}>
          <span
            className={`stepper__dot ${step.active ? 'is-active' : ''} ${
              step.done ? 'is-done' : ''
            }`}
          >
            {step.done ? <Check size={16} /> : index + 1}
          </span>
          <span className={`stepper__label ${step.active || step.done ? 'is-current' : ''}`}>
            {step.label}
          </span>
          {index < steps.length - 1 ? <span className="stepper__line" /> : null}
        </div>
      ))}
    </div>
  );
}
