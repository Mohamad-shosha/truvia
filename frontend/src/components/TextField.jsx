import { useId, useState } from 'react';
import { EyeIcon } from './icons';

/** Accessible labelled input with inline validation message and optional password reveal. */
export default function TextField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  icon,
  hint,
  autoComplete,
  disabled,
  ...rest
}) {
  const uid = useId();
  const id = `${name}-${uid}`;
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const [reveal, setReveal] = useState(false);
  const isPassword = type === 'password';

  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined;

  return (
    <div className="field">
      <label htmlFor={id} className="field__label">
        {label}
      </label>
      <div className={`field__control${error ? ' field__control--error' : ''}${disabled ? ' field__control--disabled' : ''}`}>
        {icon && <span className="field__icon">{icon}</span>}
        <input
          id={id}
          name={name}
          type={isPassword && reveal ? 'text' : type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          autoComplete={autoComplete}
          disabled={disabled}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={describedBy}
          className="field__input"
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            className="field__toggle"
            onClick={() => setReveal((r) => !r)}
            aria-label={reveal ? 'Hide password' : 'Show password'}
            aria-pressed={reveal}
          >
            <EyeIcon off={reveal} />
          </button>
        )}
      </div>
      {hint && !error && (
        <p id={hintId} className="field__hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="field__error">
          {error}
        </p>
      )}
    </div>
  );
}
