import { useAuth } from "../../context/AuthContext";

export default function SettingsAdmin() {
  const { user } = useAuth();

  return (
    <div className="op-card" style={{ padding: 16 }}>
      <h1 className="op-h1">Paramètres</h1>
      <p className="op-sub">
        Espace réservé (prêt à connecter): paramètres boutique, préférences back-office, gestion des accès.
      </p>

      <div className="op-divider" style={{ margin: "14px 0" }} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
        <div className="op-card op-card--hover" style={{ padding: 14 }}>
          <div style={{ fontWeight: 800 }}>Profil connecté</div>
          <div style={{ color: "var(--op-muted)", fontSize: 13, marginTop: 6 }}>
            {user?.email || "—"} · rôle: {user?.role || "—"}
          </div>
        </div>
        <div className="op-card op-card--hover" style={{ padding: 14 }}>
          <div style={{ fontWeight: 800 }}>Permissions</div>
          <div style={{ color: "var(--op-muted)", fontSize: 13, marginTop: 6 }}>
            Ici vous pourrez configurer les permissions Admin / Modérateur.
          </div>
        </div>
      </div>
    </div>
  );
}

