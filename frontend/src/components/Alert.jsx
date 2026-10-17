import { AlertIcon, CheckCircleIcon } from './icons';

/** variant: 'error' | 'success' | 'info' | 'warning' */
export default function Alert({ variant = 'error', children, id }) {
  const Icon = variant === 'success' ? CheckCircleIcon : AlertIcon;
  return (
    <div id={id} className={`alert alert--${variant}`} role={variant === 'error' ? 'alert' : 'status'}>
      <Icon />
      <div>{children}</div>
    </div>
  );
}
