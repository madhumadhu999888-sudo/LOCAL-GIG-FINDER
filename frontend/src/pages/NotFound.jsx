import { Link } from "react-router-dom";
import { usePageTitle } from "../hooks/usePageTitle.js";

export default function NotFound() {
  usePageTitle("404 - Not Found | LocalGigFinder");
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 theme-home" style={{ position: "relative", backgroundColor: "var(--gn-bg)" }}>
      {/* Mesh Background */}
      <div className="mesh-bg" />
      <div className="grid-pattern" />

      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ fontSize: "6rem", fontWeight: 900, lineHeight: 1, marginBottom: "1rem", color: "var(--theme-accent)", opacity: 0.2 }}>
          404
        </div>
        <h1 className="auth-title" style={{ marginBottom: "0.5rem" }}>Oops! Page not found</h1>
        <p className="auth-sub" style={{ marginBottom: "2rem" }}>The page you are looking for doesn't exist or has been moved.</p>
        
        <Link className="auth-btn auth-btn-orange" to="/" style={{ display: "inline-flex", textDecoration: "none" }}>
          Go back home
        </Link>
      </div>
    </div>
  );
}
