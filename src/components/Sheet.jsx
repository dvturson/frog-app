import { useEffect } from 'react';

/**
 * Bottom sheet modal that slides up from the bottom of the phone column.
 * @param {{
 *   open: boolean,
 *   onClose: () => void,
 *   title?: string,
 *   children: import('react').ReactNode,
 * }} props
 */
export default function Sheet({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="max-h-[85dvh] w-full max-w-[390px] overflow-y-auto rounded-t-3xl bg-white p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-neutral-200" />
        {title && <h2 className="mb-3 text-lg font-bold text-frog-900">{title}</h2>}
        {children}
      </div>
    </div>
  );
}
