import type { InputHTMLAttributes, ReactNode } from 'react';

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon?: ReactNode;
  error?: string;
};

export function FormField({ label, icon, error, className = '', ...props }: FormFieldProps) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      <span className={`field__control ${error ? 'field__control--error' : ''}`}>
        {icon ? <span className="field__icon">{icon}</span> : null}
        <input className={className} {...props} />
      </span>
      {error ? <span className="field__error">{error}</span> : null}
    </label>
  );
}
