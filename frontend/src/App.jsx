import { Routes, Route } from "react-router-dom";
import { useAuth } from "./hooks/useAuth.js";
import { disconnectSocket } from "./utils/socket.js";
import { getToken } from "./utils/api.js";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";

import WorkerDashboard from "./pages/WorkerDashboard.jsx";
import BusinessDashboard from "./pages/BusinessDashboard.jsx";
import PostGig from "./pages/PostGig.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import GigDetails from "./pages/GigDetails.jsx";
import Profile from "./pages/Profile.jsx";
import WorkerProfile from "./pages/WorkerProfile.jsx";
import NotFound from "./pages/NotFound.jsx";

export default function App() {
  const { user, loading, login, logout } = useAuth();

  const handleLogout = () => {
    disconnectSocket();
    logout();
  };

  const handleUserUpdate = (updatedUser) => {
    login(getToken(), updatedUser);
  };

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login onLogin={login} />} />
      <Route path="/signup" element={<Signup onLogin={login} />} />

      <Route
        path="/worker"
        element={
          <ProtectedRoute user={user} loading={loading} roles={["worker"]}>
            <WorkerDashboard user={user} onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/business"
        element={
          <ProtectedRoute user={user} loading={loading} roles={["business"]}>
            <BusinessDashboard user={user} onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/business/post"
        element={
          <ProtectedRoute user={user} loading={loading} roles={["business"]}>
            <PostGig user={user} onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute user={user} loading={loading} roles={["admin"]}>
            <AdminDashboard user={user} onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute user={user} loading={loading} roles={["worker", "business"]}>
            <Profile user={user} onLogout={handleLogout} onUserUpdate={handleUserUpdate} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/worker/:id"
        element={<WorkerProfile user={user} onLogout={user ? handleLogout : undefined} />}
      />

      <Route
        path="/gig/:id"
        element={<GigDetails user={user} onLogout={user ? handleLogout : undefined} />}
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
