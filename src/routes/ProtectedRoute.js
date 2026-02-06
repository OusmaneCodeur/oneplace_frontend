import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Route protégée par rôle.
 *
 * - Redirige vers `/login` si aucun utilisateur n'est connecté
 * - Redirige vers `/unauthorized` si le rôle de l'utilisateur
 *   n'est pas présent dans le tableau `roles`
 *
 * Exemple :
 *   <Route element={<ProtectedRoute roles={["admin"]} />}>
 *     <Route path="/admin" element={<AdminDashboard />} />
 *   </Route>
 */
export default function ProtectedRoute({ roles }) {
  const { user } = useAuth();

  // Cas 1 : l'utilisateur n'est pas connecté → redirection vers la page de connexion
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Cas 2 : l'utilisateur est connecté mais n'a pas le bon rôle
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Cas 3 : utilisateur connecté ET rôle autorisé → on rend les sous‑routes
  return <Outlet />;
}
