import Modal from "./Modal";

/**
 * Boîte de dialogue de confirmation réutilisable.
 *
 * Utilisée pour les actions sensibles du back‑office
 * (suppression, changement de statut, etc.).
 */
export default function ConfirmDialog({
  open,
  title = "Confirmation",
  message = "Confirmer cette action ?",
  confirmText = "Confirmer",
  cancelText = "Annuler",
  variant = "danger", // danger | primary
  loading = false,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={loading ? undefined : onCancel}
      footer={
        <>
          <button className="op-btn" onClick={onCancel} disabled={loading}>
            {cancelText}
          </button>
          <button
            className={`op-btn ${
              variant === "primary" ? "op-btn--primary" : "op-btn--danger"
            }`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "..." : confirmText}
          </button>
        </>
      }
    >
      <p style={{ margin: 0, color: "var(--op-muted)", fontSize: 14 }}>
        {message}
      </p>
    </Modal>
  );
}

