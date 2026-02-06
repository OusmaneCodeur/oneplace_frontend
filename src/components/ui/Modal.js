import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

/**
 * Composant modal générique utilisé dans le back‑office.
 *
 * - Gestion de l'overlay + verrouillage du scroll arrière‑plan
 * - Fermeture via la touche Échap et clic sur le fond
 * - Slot `footer` pour les boutons d'action
 */
export default function Modal({
  open,
  title,
  children,
  footer,
  onClose,
  closeLabel = "Fermer",
}) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="op-modal-backdrop"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        className="op-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="op-modal__head">
          <div>
            <div className="op-h1" style={{ fontSize: 16 }}>
              {title}
            </div>
          </div>
          <button
            className="op-btn op-btn--ghost op-btn--sm"
            onClick={onClose}
          >
            <span className="op-only-sr">{closeLabel}</span>
            <X size={18} />
          </button>
        </div>
        <div className="op-modal__body">{children}</div>
        {footer ? <div className="op-modal__foot">{footer}</div> : null}
      </div>
    </div>,
    document.body
  );
}

