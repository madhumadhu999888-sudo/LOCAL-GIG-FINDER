import Navbar from "./Navbar.jsx";

export default function DashboardLayout({
  theme = "theme-worker",
  brand = "LocalGigFinder",
  homeTo = "/",
  roleLabel,
  onLogout,
  extra,
  toolbar,
  tabs,
  children,
  sidebar,
}) {
  return (
    <div className={`web-app-shell ${theme}`}>
      <Navbar
        variant="dashboard"
        brand={brand}
        homeTo={homeTo}
        roleLabel={roleLabel}
        onLogout={onLogout}
        extra={extra}
      />

      {toolbar}

      {tabs}

      <div className="web-app-body">
        {sidebar && <aside className="web-app-sidebar">{sidebar}</aside>}
        <main className={`web-app-main ${sidebar ? "web-app-main--with-sidebar" : ""}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
