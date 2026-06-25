import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { usePageTitle } from "../hooks/usePageTitle.js";
import { api } from "../utils/api.js";
import Navbar from "../components/Navbar.jsx";
import Map from "../components/Map.jsx";
import { 
  Briefcase, 
  MapPin, 
  IndianRupee, 
  Terminal, 
  ChevronLeft,
  Send,
  Building2,
  Clock,
  CheckCircle2,
  Zap,
  ArrowRight,
  ShieldCheck,
  Loader2,
  Info
} from "lucide-react";

export default function GigDetails({ user, onLogout }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [gig, setGig] = useState(null);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState({ text: "", ok: true });
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [existingApp, setExistingApp] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await api(`/api/gigs/${id}`);
        setGig(data.gig);
      } catch (e) {
        setErr(e.message || "This gig has been removed or is no longer available.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // Check if user already applied to this gig
  useEffect(() => {
    if (!user || user.role !== "worker") return;
    (async () => {
      try {
        const data = await api("/api/applications/mine");
        const apps = data.applications || [];
        const match = apps.find(a => (a.gig?._id || a.gig) === id);
        if (match) setExistingApp(match);
      } catch {
        // Silently ignore — user may not be logged in
      }
    })();
  }, [user, id]);

  usePageTitle(gig ? `${gig.title} | LocalGigFinder` : "Gig Details | LocalGigFinder");

  const apply = async () => {
    setMsg({ text: "", ok: true });
    setApplying(true);
    try {
      const data = await api(`/api/applications/gig/${id}`, { method: "POST" });
      setMsg({ text: "Application sent! The business will review your profile shortly.", ok: true });
      setExistingApp(data.application || { status: "pending" });
    } catch (e) {
      setMsg({ text: e.message || "Failed to send application. Please try again.", ok: false });
    } finally {
      setApplying(false);
    }
  };

  const coords = gig?.location?.coordinates;
  const lat = coords ? coords[1] : null;
  const lng = coords ? coords[0] : null;

  // Use the premium light blue theme as the primary for details view
  const pageTheme = "theme-worker"; 
  
  const home =
    user?.role === "worker"
      ? "/worker"
      : user?.role === "business"
        ? "/business"
        : user?.role === "admin"
          ? "/admin"
          : "/";

  const roleLabel =
    user?.role === "worker"
      ? "Worker Portal"
      : user?.role === "business"
        ? "Business Portal"
        : user?.role === "admin"
          ? "Admin Console"
          : null;

  if (loading) {
    return (
      <div className={user ? "web-app-shell theme-worker" : `min-h-screen flex flex-col ${pageTheme}`}>
        {!user && <div className="mesh-layer" />}
        <Navbar
          variant={user ? "dashboard" : "auth"}
          brand="LocalGigFinder"
          homeTo={home}
          roleLabel={roleLabel}
          onLogout={onLogout}
        />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-sky-600 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className={user ? "web-app-shell theme-worker font-sans" : `min-h-screen flex flex-col ${pageTheme} font-sans`}>
      {!user && <div className="mesh-layer" />}

      <Navbar
        variant={user ? "dashboard" : "auth"}
        brand="LocalGigFinder"
        homeTo={home}
        roleLabel={roleLabel}
        onLogout={onLogout}
      />

      <main className={user ? "web-app-main animate-in" : "flex-1 w-full px-6 lg:px-10 py-8 animate-in"}>
        <div className="mb-6">
            <Link to={home} className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg text-xs font-bold text-slate-500 hover:text-sky-600 border border-slate-200 transition-all">
                <ChevronLeft size={14} strokeWidth={2.5} /> Back to Dashboard
            </Link>
        </div>

        {err ? (
          <div className="glass-card p-20 text-center border-red-100 bg-red-50/20 shadow-2xl shadow-red-50">
            <div className="w-20 h-20 rounded-[2rem] bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-8 shadow-inner">
                <ShieldCheck size={40} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter">Gig Unavailable</h2>
            <p className="text-red-500 font-bold max-w-sm mx-auto">{err}</p>
          </div>
        ) : !gig ? (
          <div className="glass-card p-20 text-center shadow-2xl shadow-slate-100">
             <Info className="mx-auto mb-6 text-slate-200" size={64} />
             <p className="text-slate-400 font-black text-xl uppercase tracking-widest">Metadata Corrupted</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Main Content Area */}
            <div className="lg:col-span-8 space-y-10">
              <div className="glass-card p-0 overflow-hidden shadow-2xl shadow-slate-100 border-b-8 border-slate-100">
                <div className="p-10 md:p-12">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Live Recruitment</span>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black text-slate-930 tracking-tighter leading-[0.9] mb-6">{gig.title}</h1>
                            <div className="flex items-center gap-4 text-slate-600">
                                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                                    <Building2 size={20} className="text-sky-600" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Posted By</p>
                                    <p className="text-xl font-black text-slate-900 leading-none">{gig.business?.businessName || gig.business?.name}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                            <div className="w-full md:w-auto px-10 py-8 bg-slate-900 text-white rounded-[2.5rem] shadow-2xl shadow-slate-200 flex flex-col items-center">
                                <div className="flex items-baseline gap-1 mb-1">
                                    <span className="text-4xl font-black">₹{gig.rate}</span>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{gig.payType === "hourly" ? "/ hr" : "/ day"}</span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/20 rounded-lg text-emerald-400">
                                    <Zap size={10} fill="currentColor" />
                                    <span className="text-[8px] font-black uppercase tracking-widest">Instant Pay</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 mb-12">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Gig Scope & Execution</label>
                        <div className="p-10 rounded-[2.5rem] bg-slate-50/50 border-2 border-slate-50 shadow-inner">
                            <p className="text-2xl font-bold text-slate-700 leading-relaxed tracking-tight italic">
                                "{gig.description}"
                            </p>
                        </div>
                    </div>

                    {gig.skillsRequired?.length > 0 && (
                      <div className="space-y-6">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-3">
                            <Terminal size={14} strokeWidth={3} className="text-sky-600" /> Desired Qualifications
                        </h3>
                        <div className="flex flex-wrap gap-3">
                          {gig.skillsRequired.map(s => (
                            <span key={s} className="px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-900 shadow-sm hover:scale-105 transition-transform cursor-default">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </div>

              {/* Action Card */}
              <div className="glass-card p-12 bg-slate-900 border-slate-800 shadow-2xl shadow-sky-50 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Send size={120} strokeWidth={1} />
                </div>
                
                <div className="relative z-10">
                    <h2 className="text-4xl font-black text-white mb-6 uppercase tracking-tighter">Submit Your Profile</h2>
                    <p className="text-slate-400 font-bold mb-10 leading-relaxed text-lg max-w-xl">
                        Interested in this gig? Send your application instantly. The owner will review your credentials and contact you directly via chat once approved.
                    </p>

                    {msg.text && (
                      <div className={`p-6 rounded-[2rem] font-black text-xs uppercase tracking-widest mb-10 border-2 animate-in ${msg.ok ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-lg shadow-emerald-500/10" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
                        {msg.ok ? "✓ " : "✕ "} {msg.text}
                      </div>
                    )}

                    <div className="flex items-center gap-6">
                        {!user ? (
                          <button 
                            className="flex-1 py-7 bg-sky-600 hover:bg-sky-500 text-white rounded-[2.5rem] font-black text-2xl shadow-2xl shadow-sky-600/30 transition-all flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-[0.98]"
                            onClick={() => navigate("/login", { state: { from: { pathname: `/gig/${id}` } } })}
                          >
                            Login to Connect <ArrowRight size={28} strokeWidth={3} />
                          </button>
                        ) : user?.role === "worker" && gig.status === "open" ? (
                          existingApp ? (
                            <div className="flex-1 py-7 rounded-[2.5rem] border-2 border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-black text-center text-xl flex items-center justify-center gap-4">
                              ✓ {existingApp.status === "pending" ? "Application Pending" : existingApp.status === "accepted" ? "Application Accepted" : existingApp.status === "rejected" ? "Application Not Selected" : "Applied"}
                            </div>
                          ) : (
                            <button 
                              className="flex-1 py-7 bg-sky-600 hover:bg-sky-500 text-white rounded-[2.5rem] font-black text-2xl shadow-2xl shadow-sky-600/30 transition-all flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={apply}
                              disabled={applying || (msg.ok && msg.text)}
                            >
                              <Send size={28} strokeWidth={2.5} /> {applying ? "Applying..." : (msg.ok && msg.text ? "Application Sent!" : "Apply Now")}
                            </button>
                          )
                        ) : (
                          <div className="flex-1 py-7 rounded-[2.5rem] border-2 border-slate-800 text-slate-500 font-black text-center uppercase tracking-[0.3em] text-sm">
                            {gig.status !== "open" ? "Gig Closed" : "Management Perspective"}
                          </div>
                        )}
                    </div>
                </div>
              </div>
            </div>

            {/* Sticky Sidebar */}
            <div className="lg:col-span-4 space-y-8 sticky top-6">
                <div className="glass-card p-0 overflow-hidden shadow-2xl shadow-slate-100 border-b-4 border-slate-100">
                    <div className="p-8 border-b border-slate-50 bg-slate-50/30">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 flex items-center gap-3">
                             <MapPin size={16} strokeWidth={3} className="text-red-500" /> Operational Hub
                        </h3>
                    </div>
                    <div className="h-72 bg-slate-100 relative group overflow-hidden">
                         <Map latitude={lat} longitude={lng} label={gig.address || "Gig Site"} />
                    </div>
                    <div className="p-8">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-600 shrink-0">
                                <MapPin size={20} strokeWidth={2.5} />
                            </div>
                            <p className="text-sm font-black text-slate-800 leading-tight">
                                {gig.address || "Area details are pinned to the secure network map."}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-10 bg-white/40 backdrop-blur-sm border-white/50 text-slate-900 shadow-xl">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-14 h-14 rounded-[1.5rem] bg-sky-600 text-white flex items-center justify-center shadow-lg">
                            <Clock size={28} strokeWidth={2.5} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Time Status</p>
                            <p className="text-xl font-black text-slate-900 leading-none">High Priority</p>
                        </div>
                    </div>
                    <p className="text-sm font-bold text-slate-500 leading-relaxed mb-6">
                        This position was posted recently and has a high recruitment priority. Applications are reviewed sequentially.
                    </p>
                    <div className="flex items-center gap-2 px-4 py-2 bg-sky-50 text-sky-600 rounded-xl font-black text-[10px] uppercase tracking-widest self-start">
                        <CheckCircle2 size={12} strokeWidth={3} /> Trusted Business Partner
                    </div>
                </div>

                <div className="text-center px-10">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Secure Transaction Node 74x-B</p>
                </div>
            </div>

          </div>
        )}
      </main>

      {!user && (
      <footer className="py-20 border-t mt-20 border-slate-100 bg-white">
        <div className="w-full px-6 lg:px-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex flex-col items-center md:items-start gap-4">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center shadow-lg">
                    <Zap size={24} strokeWidth={3} />
                </div>
                <span className="text-3xl font-black text-slate-930 tracking-tighter">LocalGigFinder</span>
             </div>
             <p className="text-xs font-bold text-slate-400 max-w-xs text-center md:text-left">Connecting humans through premium technology and local opportunities.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-12">
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Platform</p>
                <div className="flex flex-col gap-2 font-black text-sm text-slate-600">
                    <Link to="/" className="hover:text-sky-600">Privacy</Link>
                    <Link to="/" className="hover:text-sky-600">Terms</Link>
                </div>
            </div>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Support</p>
                <div className="flex flex-col gap-2 font-black text-sm text-slate-600">
                    <Link to="/" className="hover:text-sky-600">Help Center</Link>
                    <Link to="/" className="hover:text-sky-600">Contact</Link>
                </div>
            </div>
          </div>
        </div>
      </footer>
      )}
    </div>
  );
}
