import { Navigate, useLocation } from "react-router-dom";
import { getToken } from "../utils/api.js";

export default function ProtectedRoute({ children, user, loading, roles }) {
  const loc = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-300">
        Loading…
      </div>
    );
  }

  if (!user && getToken()) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center text-slate-300 gap-4">
        <p className="max-w-lg text-slate-400">
          Cannot reach the LocalGigFinder API. Start <strong className="text-slate-200">MongoDB</strong>,
          then run the backend: open a terminal,{" "}
          <code className="text-orange-400">cd backend</code> →{" "}
          <code className="text-orange-400">npm run dev</code>. Or from the project root:{" "}
          <code className="text-orange-400">npm run dev</code> (runs API + Vite).
        </p>
        <button
          type="button"
          className="rounded-lg px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium cursor-pointer"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: loc }} replace />;
  }

  if (roles && roles.length && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
