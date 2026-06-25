import { Link } from "react-router-dom";
import LocalGigFinderLogo from "./LocalGigFinderLogo.jsx";
import { LogOut } from "lucide-react";

export default function Navbar({
  variant = "auth",
  brand = "LocalGigFinder",
  homeTo = "/",
  roleLabel,
  onLogout,
  extra,
  showLogo = true,
  authLink,
}) {
  const isDashboard = variant === "dashboard";

  return (
    <header className={`${isDashboard ? "web-nav" : "dash-nav"} animate-in sticky top-0 z-50`}>
      <div className="web-nav-inner">
        {/* LEFT: Brand + role label */}
        <Link to={homeTo} className="web-nav-brand group flex-shrink-0">
          {showLogo && (
            <div className="web-nav-logo">
              <LocalGigFinderLogo className="h-5 w-5" />
            </div>
          )}
          <div className="flex flex-col justify-center min-w-0">
            <span className="web-nav-title">{brand}</span>
            {roleLabel && (
              <span className="web-nav-role">{roleLabel}</span>
            )}
            {!roleLabel && !isDashboard && (
              <span className="web-nav-role">Local Gig Marketplace</span>
            )}
          </div>
        </Link>

        {/* CENTER: optional nav items (dashboard only) */}
        {isDashboard && extra && (
          <div className="web-nav-center hidden md:flex items-center gap-3 flex-1 justify-center">
            {extra}
          </div>
        )}

        {/* RIGHT: mobile extras + auth links + sign out */}
        <div className="web-nav-actions ml-auto flex items-center gap-3 flex-shrink-0">
          {isDashboard && extra && (
            <div className="flex md:hidden items-center gap-2">
              {extra}
            </div>
          )}

          {!isDashboard && authLink && (
            <Link to={authLink.to} className="web-nav-auth-link">
              {authLink.label}
            </Link>
          )}

          {onLogout && (
            <button
              type="button"
              className="web-nav-signout"
              onClick={onLogout}
            >
              <LogOut size={16} strokeWidth={2.5} />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
