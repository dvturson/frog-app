/**
 * White rounded section with an optional title and right-side action.
 * @param {{
 *   title?: string,
 *   action?: import('react').ReactNode,
 *   className?: string,
 *   children: import('react').ReactNode,
 * }} props
 */
export default function Card({ title, action, className = '', children }) {
  return (
    <section className={`rounded-2xl border border-frog-100 bg-white p-4 shadow-sm ${className}`}>
      {(title || action) && (
        <div className="mb-3 flex items-center justify-between">
          {title && <h2 className="text-base font-bold text-frog-900">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
