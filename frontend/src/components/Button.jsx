import Spinner from './Spinner';

export default function Button({ children, loading = false, disabled, variant = 'primary', type = 'button', icon, ...rest }) {
  return (
    <button
      type={type}
      className={`btn btn--${variant}`}
      disabled={disabled || loading}
      aria-busy={loading ? 'true' : undefined}
      {...rest}
    >
      {loading ? <Spinner size={18} /> : null}
      <span>{children}</span>
      {!loading && icon}
    </button>
  );
}
