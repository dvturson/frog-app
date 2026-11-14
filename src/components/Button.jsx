import { Link } from 'react-router-dom';
import { replayAnimation } from '../lib/fx';

const VARIANTS = {
  primary: 'bg-frog-600 text-white hover:bg-frog-700 disabled:bg-frog-300',
  secondary: 'bg-white text-frog-700 border border-frog-600 hover:bg-frog-50 disabled:opacity-50',
  ghost: 'bg-transparent text-frog-700 hover:bg-frog-50 disabled:opacity-50',
  danger: 'bg-red-600 text-white hover:bg-red-700 disabled:opacity-50',
};

/**
 * App button. Pass `to` to render a router Link instead of a <button>.
 * Rocks a little when pressed.
 * @param {{
 *   variant?: keyof typeof VARIANTS,
 *   to?: string,
 *   full?: boolean,
 *   className?: string,
 *   children: import('react').ReactNode,
 * } & import('react').ButtonHTMLAttributes<HTMLButtonElement>} props
 */
export default function Button({
  variant = 'primary',
  to,
  full = false,
  className = '',
  children,
  onPointerDown,
  ...rest
}) {
  /** @param {import('react').PointerEvent<HTMLElement>} e */
  const wobble = (e) => {
    replayAnimation(e.currentTarget, 'btn-wobble');
    onPointerDown?.(/** @type {any} */ (e));
  };

  const classes = `inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-base font-semibold transition-colors disabled:cursor-not-allowed ${
    VARIANTS[variant]
  } ${full ? 'w-full' : ''} ${className}`;

  if (to && rest.disabled) {
    return (
      <span aria-disabled="true" className={`${classes} cursor-not-allowed opacity-50`}>
        {children}
      </span>
    );
  }
  if (to) {
    return (
      <Link to={to} className={classes} onPointerDown={wobble}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" className={classes} onPointerDown={wobble} {...rest}>
      {children}
    </button>
  );
}
