import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import ProtectedRoute from "./routes/ProtectedRoute";

// Routes importées
import { clientRoutes } from "./routes/clientRoutes";
import { adminRoutes } from "./routes/adminRoutes";

// Pages temporaires
const Unauthorized = () => <h1>Accès refusé</h1>;
const ClientHome = () => <h1>Client Home</h1>;
const ModeratorDashboard = () => <h1>Moderator Dashboard</h1>;

function App() {
  return (
    <BrowserRouter>
      <ToastContainer
        position="bottom-right"
        theme="light"
        closeOnClick
        pauseOnHover
        newestOnTop
      />

      <Routes>
        {/* CLIENT ROUTES (VITRINE) - inclut Login et Register */}
        {clientRoutes.map((route, i) => (
          <Route key={i} element={route.element}>
            {route.children.map((child, idx) => (
              <Route key={idx} path={child.path} element={child.element} />
            ))}
          </Route>
        ))}

        {/* ROUTES PUBLIQUES */}
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* PROTECTED CLIENT ROUTE */}
        <Route element={<ProtectedRoute roles={["client"]} />}>
          <Route path="/client" element={<ClientHome />} />
        </Route>

        {/* PROTECTED MODERATOR ROUTE */}
        <Route element={<ProtectedRoute roles={["moderator"]} />}>
          <Route path="/moderator" element={<ModeratorDashboard />} />
        </Route>

        {/* PROTECTED ADMIN / MODERATOR ROUTES */}
        <Route element={<ProtectedRoute roles={["admin", "moderator"]} />}>
          {adminRoutes.map((route, i) => (
            <Route key={i} element={route.element}>
              {route.children.map((child, idx) => (
                <Route key={idx} path={child.path} element={child.element} />
              ))}
            </Route>
          ))}
        </Route>

        {/* DEFAULT REDIRECTION */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
