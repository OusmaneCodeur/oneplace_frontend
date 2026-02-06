import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Wrapper pour protéger certaines pages d'administration.
 *
 * Contrairement à `ProtectedRoute` qui se base sur la déclaration des routes,
 * ce composant s'utilise directement autour d'un élément React pour restreindre
 * l'accès strictement au rôle `admin`.
 *
 * Exemple :
 *   <Route path="/admin/users" element={
 *     <AdminOnlyRoute>
 *       <UsersAdmin />
 *     </AdminOnlyRoute>
 *   } />
 */
export default function AdminOnlyRoute({ children }) {
  const { user } = useAuth();

  // Non connecté → on renvoie vers la page de connexion
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Connecté mais sans le rôle admin → accès refusé
  if (user.role !== "admin") {
    return <Navigate to="/unauthorized" replace />;
  }

  // Cas autorisé : on rend simplement le contenu enfant
  return children;
}
