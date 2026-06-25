import { useEffect, useState } from "react";
import { usePageTitle } from "../hooks/usePageTitle.js";
import { api } from "../utils/api.js";
import Navbar from "../components/Navbar.jsx";
import { 
  Users, 
  Briefcase, 
  Building2, 
  UserCheck, 
  Zap,
  CheckCircle2,
  XCircle,
  Trash2,
  ShieldCheck,
  FileText,
  MessageSquare,
  Layers,
  Search
} from "lucide-react";

const STAT_CONFIG = [
  { key: "workers", label: "Workers", icon: <UserCheck size={32} strokeWidth={2.5} />, color: "#eff6ff", accent: "#2563eb", delay: "0.1s" },
  { key: "businesses", label: "Businesses", icon: <Building2 size={32} strokeWidth={2.5} />, color: "#ecfdf5", accent: "#059669", delay: "0.2s" },
  { key: "gigs", label: "Gigs Posted", icon: <Briefcase size={32} strokeWidth={2.5} />, color: "#fffbeb", accent: "#d97706", delay: "0.3s" },
  { key: "applications", label: "Applies", icon: <Zap size={32} strokeWidth={2.5} />, color: "#fdf4ff", accent: "#c026d3", delay: "0.4s" },
  { key: "messages", label: "Messages", icon: <MessageSquare size={32} strokeWidth={2.5} />, color: "#f0fdf4", accent: "#16a34a", delay: "0.5s", colSpan: true },
];

export default function AdminDashboard({ user, onLogout }) {
  usePageTitle("Admin Console | LocalGigFinder");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [gigs, setGigs] = useState([]);
  const [messages, setMessages] = useState([]);
  const [applications, setApplications] = useState([]);
  const [msg, setMsg] = useState({ text: "", ok: true });
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [s, u, g, m, a] = await Promise.all([
          api("/api/admin/stats"),
          api("/api/admin/users"),
          api("/api/admin/gigs"),
          api("/api/admin/messages"),
          api("/api/admin/applications"),
        ]);
        setStats(s);
        setUsers(u.users || []);
        setGigs(g.gigs || []);
        setMessages(m.messages || []);
        setApplications(a.applications || []);
      } catch (e) {
        setMsg({ text: e.message || "Failed to load management data.", ok: false });
      }
    })();
  }, []);

  // Reset search when active tab changes
  useEffect(() => {
    setSearchQuery("");
  }, [activeTab]);

  const removeGig = async (id) => {
    if (!confirm("Are you sure you want to PERMANENTLY remove this gig from the platform?")) return;
    setMsg({ text: "", ok: true });
    try {
      await api(`/api/gigs/${id}/admin`, { method: "DELETE" });
      setGigs((prev) => prev.filter((x) => x._id !== id));
      setMsg({ text: "Gig removed from platform successfully.", ok: true });
    } catch (e) {
      setMsg({ text: e.message || "Failed to remove gig.", ok: false });
    }
  };

  // Filter lists based on Search Query
  const filteredUsers = users.filter((u) =>
    (u.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.role || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGigs = gigs.filter((g) =>
    (g.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (g.business?.businessName || g.business?.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMessages = messages.filter((m) =>
    (m.text || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.sender?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.sender?.role || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.application?.gig?.title || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredApplications = applications.filter((app) =>
    (app.seeker?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (app.seeker?.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (app.gig?.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (app.status || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="web-app-shell theme-yellow overflow-hidden">
      <div className="mesh-layer" />
      
      <Navbar variant="dashboard" brand="LocalGigFinder" homeTo="/admin" roleLabel="Admin Console" onLogout={onLogout} />

      <main className="flex-1 w-full px-4 sm:px-6 lg:px-10 pb-5 pt-4 animate-in h-[calc(100vh-64px)]">
        <div className="grid h-full grid-cols-1 gap-5 lg:grid-cols-[320px_1fr]">
          <aside className="glass-card p-5 md:p-6 lg:h-full flex flex-col gap-5 bg-gradient-to-b from-white to-sky-50/40 border-sky-100 shadow-xl shadow-sky-100/50">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-900 rounded-full shadow-sm mb-4">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] leading-none">Live Overview</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-none">
                Admin <span className="text-sky-600">Console</span>
              </h1>
              <p className="mt-3 text-sm font-bold text-slate-500 leading-relaxed">
                Moderate users and gigs with a faster side-by-side workflow.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-white px-4 py-3 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Network Status</p>
              <div className="mt-1 flex items-center justify-between">
                <p className="text-lg font-black text-emerald-600">Healthy</p>
                <p className="text-sm font-black text-slate-800">{user?.name?.split(" ")[0]}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {stats ? (
                STAT_CONFIG.map((s) => (
                  <div
                    key={s.key}
                    className={`rounded-2xl border border-white/70 p-3 shadow-sm ${s.colSpan ? "col-span-2" : ""}`}
                    style={{ backgroundColor: s.color }}
                  >
                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">{s.label}</p>
                    <p className="mt-2 text-3xl font-black text-slate-900 leading-none">{stats[s.key] ?? 0}</p>
                  </div>
                ))
              ) : (
                [1, 2, 3, 4, 5].map((k) => (
                  <div key={k} className={`h-20 rounded-2xl bg-slate-100 animate-pulse ${k === 5 ? "col-span-2" : ""}`} />
                ))
              )}
            </div>

            <div className="mt-auto hidden lg:flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-wider">
              <ShieldCheck size={14} />
              Secure admin controls
            </div>
          </aside>

          <section className="glass-card p-0 lg:h-full overflow-hidden border-slate-100 shadow-2xl shadow-slate-100/80 flex flex-col min-h-0">
            {msg.text && (
              <div className={`mx-4 mt-4 rounded-2xl border px-4 py-3 text-sm font-bold flex items-center gap-2 ${msg.ok ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-red-50 border-red-100 text-red-700"}`}>
                {msg.ok ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                <p>{msg.text}</p>
              </div>
            )}

            <div className="flex border-b border-slate-100 overflow-x-auto no-scrollbar px-2 mt-2">
              {[
                { id: "overview", label: `System Users (${users.length})`, icon: <Users size={16} strokeWidth={3} /> },
                { id: "gigs", label: `Moderate Gigs (${gigs.length})`, icon: <FileText size={16} strokeWidth={3} /> },
                { id: "messages", label: `All Messages (${messages.length})`, icon: <MessageSquare size={16} strokeWidth={3} /> },
                { id: "applications", label: `Applications (${applications.length})`, icon: <Layers size={16} strokeWidth={3} /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-5 py-4 flex items-center gap-2.5 font-black text-[11px] uppercase tracking-widest transition-all relative whitespace-nowrap ${activeTab === tab.id ? "text-sky-600" : "text-slate-400 hover:text-slate-600"}`}
                >
                  {tab.icon} {tab.label}
                  {activeTab === tab.id && <div className="absolute bottom-0 left-3 right-3 h-0.5 bg-sky-600 rounded-full" />}
                </button>
              ))}
            </div>

            {/* Sticky Search bar */}
            <div className="px-5 pt-4 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100/60 bg-slate-50/20">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder={`Search ${
                    activeTab === "overview" ? "users by name or email" :
                    activeTab === "gigs" ? "gigs by title or business" :
                    activeTab === "messages" ? "messages by text or sender" : "applications by seeker or gig"
                  }...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50/80 border-2 border-transparent focus:border-sky-500 focus:bg-white rounded-xl py-2 pl-4 pr-10 text-sm focus:outline-none transition-all font-semibold placeholder:text-slate-400"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Search size={16} strokeWidth={2.5} />
                </span>
              </div>
            </div>

            <div className="p-4 md:p-5 flex-1 min-h-0">
              {activeTab === "overview" ? (
                <div className="h-full overflow-auto rounded-2xl border border-slate-100">
                  <table className="w-full text-left min-w-[640px] whitespace-nowrap">
                    <thead className="sticky top-0 bg-slate-50 z-10">
                      <tr>
                        <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Name</th>
                        <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Email</th>
                        <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 text-center">Role</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredUsers.map((u) => (
                        <tr key={u._id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center font-black text-sky-600 shadow-sm uppercase">
                                {u.name?.[0]}
                              </div>
                              <span className="text-base font-black text-slate-900">{u.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <span className="text-sm font-bold text-slate-500">{u.email}</span>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex justify-center">
                              <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest leading-none ${
                                u.role === "admin"
                                  ? "bg-slate-900 text-white"
                                  : u.role === "business"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-indigo-100 text-indigo-700"
                              }`}>
                                {u.role}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredUsers.length === 0 && (
                        <tr>
                          <td colSpan={3} className="text-center py-10 font-bold text-slate-400">
                            No users matched your query.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              ) : activeTab === "gigs" ? (
                <div className="h-full overflow-auto">
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {filteredGigs.length === 0 ? (
                      <div className="xl:col-span-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-10 flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-2xl bg-white text-slate-400 flex items-center justify-center mb-4 shadow-sm border border-slate-100">
                          <Briefcase size={30} strokeWidth={2} />
                        </div>
                        <h3 className="text-xl font-black text-slate-800 mb-1">No gigs found</h3>
                        <p className="text-slate-400 font-bold text-sm">No gigs match your search or require moderating.</p>
                      </div>
                    ) : (
                      filteredGigs.map((g) => (
                        <div key={g._id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md transition-all">
                          <div className="flex justify-between items-start gap-4 mb-4">
                            <div>
                              <h3 className="text-xl font-black text-slate-900 mb-1">{g.title}</h3>
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                By <span className="text-slate-600">{g.business?.businessName || g.business?.name || "Member"}</span>
                              </p>
                            </div>
                            <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.18em] ${
                              g.status === "open" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                            }`}>
                              {g.status}
                            </div>
                          </div>
                          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                            <div className="text-lg font-black text-slate-900">
                              ₹{g.rate} <span className="text-[10px] text-slate-400 uppercase">{g.payType === "hourly" ? "/ hr" : "/ day"}</span>
                            </div>
                            <button
                              onClick={() => removeGig(g._id)}
                              className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all active:scale-95 shadow-sm shadow-red-100"
                            >
                              <Trash2 size={18} strokeWidth={2.5} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : activeTab === "messages" ? (
                <div className="h-full overflow-auto rounded-2xl border border-slate-100">
                  <table className="w-full text-left min-w-[640px] whitespace-nowrap">
                    <thead className="sticky top-0 bg-slate-50 z-10">
                      <tr>
                        <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Sender</th>
                        <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Message Content</th>
                        <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Context (Gig)</th>
                        <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Sent At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredMessages.map((m) => (
                        <tr key={m._id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center font-black text-sky-600 shadow-sm uppercase">
                                {m.sender?.name?.[0] || "?"}
                              </div>
                              <div>
                                <span className="text-base font-black text-slate-900 block">{m.sender?.name || "Unknown"}</span>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{m.sender?.role || "user"}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 max-w-[300px] whitespace-pre-wrap">
                            <span className="text-sm font-semibold text-slate-700">{m.text}</span>
                          </td>
                          <td className="px-6 py-5">
                            {m.application?.gig ? (
                              <div>
                                <span className="text-sm font-black text-slate-800 block">{m.application.gig.title}</span>
                                <span className={`text-[10px] font-black uppercase tracking-widest ${
                                  m.application.status === "accepted" ? "text-emerald-600" :
                                  m.application.status === "rejected" ? "text-red-500" : "text-amber-500"
                                }`}>
                                  App Status: {m.application.status}
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm text-slate-400 font-bold">General chat</span>
                            )}
                          </td>
                          <td className="px-6 py-5">
                            <span className="text-xs font-bold text-slate-400">
                              {new Date(m.createdAt).toLocaleString()}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {filteredMessages.length === 0 && (
                        <tr>
                          <td colSpan={4} className="text-center py-10 font-bold text-slate-400">
                            No messages found matching query.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="h-full overflow-auto rounded-2xl border border-slate-100">
                  <table className="w-full text-left min-w-[640px] whitespace-nowrap">
                    <thead className="sticky top-0 bg-slate-50 z-10">
                      <tr>
                        <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Seeker / Worker</th>
                        <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Gig Details</th>
                        <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 text-center">Status</th>
                        <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Applied On</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredApplications.map((app) => (
                        <tr key={app._id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center font-black text-violet-600 shadow-sm uppercase">
                                {app.seeker?.name?.[0] || "?"}
                              </div>
                              <div>
                                <span className="text-base font-black text-slate-900 block">{app.seeker?.name || "Unknown"}</span>
                                <span className="text-xs font-bold text-slate-400">{app.seeker?.email} {app.seeker?.phone ? `| ${app.seeker.phone}` : ""}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            {app.gig ? (
                              <div>
                                <span className="text-sm font-black text-slate-800 block">{app.gig.title}</span>
                                <span className="text-xs text-slate-400 font-bold">
                                  ₹{app.gig.rate} {app.gig.payType === "hourly" ? "/ hr" : "/ day"}
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm text-red-500 font-bold">[Gig Removed]</span>
                            )}
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex justify-center">
                              <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest leading-none ${
                                app.status === "accepted" ? "bg-emerald-100 text-emerald-700" :
                                app.status === "rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                              }`}>
                                {app.status}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <span className="text-xs font-bold text-slate-400">
                              {new Date(app.createdAt).toLocaleDateString()}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {filteredApplications.length === 0 && (
                        <tr>
                          <td colSpan={4} className="text-center py-10 font-bold text-slate-400">
                            No applications found matching query.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
