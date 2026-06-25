import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { usePageTitle } from "../hooks/usePageTitle.js";
import { api } from "../utils/api.js";
import DashboardLayout from "../components/DashboardLayout.jsx";
import Notifications from "../components/Notifications.jsx";
import Chat from "../components/Chat.jsx";
import RatingModal from "../components/RatingModal.jsx";
import { 
  PlusCircle, 
  Building2, 
  Users, 
  Briefcase, 
  CheckCircle, 
  XCircle, 
  ChevronDown, 
  ChevronUp, 
  Star,
  MapPin,
  User,
} from "lucide-react";

export default function BusinessDashboard({ user, onLogout }) {
  usePageTitle("Dashboard | LocalGigFinder");
  const [gigs, setGigs] = useState([]);
  const [appsByGig, setAppsByGig] = useState({});
  const [expanded, setExpanded] = useState(null);
  const [msg, setMsg] = useState({ text: "", ok: true });
  const [ratingTarget, setRatingTarget] = useState(null);
  const [ratingLoading, setRatingLoading] = useState(false);

  const loadGigs = async () => {
    const data = await api("/api/gigs/mine/list");
    setGigs(data.gigs || []);
  };

  useEffect(() => {
    (async () => {
      try { await loadGigs(); }
      catch (e) { setMsg({ text: e.message || "Failed to load", ok: false }); }
    })();
  }, []);

  const loadApps = async (gigId) => {
    const data = await api(`/api/applications/gig/${gigId}/list`);
    setAppsByGig((prev) => ({ ...prev, [gigId]: data.applications || [] }));
  };

  const setStatus = async (applicationId, status, gigId) => {
    setMsg({ text: "", ok: true });
    try {
      await api(`/api/applications/${applicationId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setMsg({ 
        text: status === "accepted" ? "✅ Applicant accepted! Chat is now open." : "Application rejected.", 
        ok: status === "accepted" 
      });
      await loadGigs();
      if (gigId) await loadApps(gigId);
    } catch (e) {
      setMsg({ text: e.message || "Update failed", ok: false });
    }
  };

  const completeRate = async ({ workQuality, behavior }) => {
    if (!ratingTarget) return;
    const { applicationId, gigId, workerName } = ratingTarget;
    setRatingLoading(true);
    setMsg({ text: "", ok: true });
    try {
      await api("/api/applications/complete-rate", {
        method: "POST",
        body: JSON.stringify({ applicationId, workQuality, behavior }),
      });
      setMsg({ text: "✅ Marked complete and worker rated!", ok: true });
      setRatingTarget(null);
      await loadGigs();
      if (gigId) await loadApps(gigId);
    } catch (e) {
      setMsg({ text: e.message || "Could not complete", ok: false });
    } finally {
      setRatingLoading(false);
    }
  };

  const gigStatusBadge = (status) => {
    const map = { 
      open: { class: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: <CheckCircle size={12} /> }, 
      filled: { class: "bg-indigo-100 text-indigo-700 border-indigo-200", icon: <Users size={12} /> }, 
      completed: { class: "bg-slate-100 text-slate-700 border-slate-200", icon: <Star size={12} fill="currentColor" /> }, 
      cancelled: { class: "bg-red-100 text-red-700 border-red-200", icon: <XCircle size={12} /> } 
    };
    const config = map[status] || { class: "bg-amber-100 text-amber-700 border-amber-200", icon: <PlusCircle size={12} /> };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-[9px] uppercase font-black border flex items-center gap-1.5 ${config.class}`}>
        {config.icon} {status}
      </span>
    );
  };

  const appStatusBadge = (status) => {
    const map = { 
      pending: "bg-amber-100 text-amber-700", 
      accepted: "bg-emerald-100 text-emerald-700", 
      rejected: "bg-red-100 text-red-700", 
      completed: "bg-indigo-100 text-indigo-700" 
    };
    return <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${map[status] || "bg-slate-100"}`}>{status}</span>;
  };

  const openGigs = gigs.filter(g => g.status === "open").length;
  const filledGigs = gigs.filter(g => g.status === "filled").length;
  const completedGigs = gigs.filter(g => g.status === "completed").length;

  const sidebar = (
    <>
      <div className="web-sidebar-card">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center shadow-md">
            <Building2 size={22} strokeWidth={2.5} />
          </div>
          <div className="min-w-0">
            <p className="web-sidebar-title">Business</p>
            <p className="font-black text-slate-900 truncate">{user?.businessName || user?.name}</p>
          </div>
        </div>
        <p className="text-xs font-medium text-slate-500 truncate">{user?.email}</p>
        {user?.businessCategory && (
          <p className="text-xs font-bold text-emerald-600 mt-1">{user.businessCategory}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="web-stat-card">
          <p className="web-stat-label">Total</p>
          <p className="web-stat-value">{gigs.length}</p>
        </div>
        <div className="web-stat-card">
          <p className="web-stat-label">Active</p>
          <p className="web-stat-value text-emerald-600">{openGigs}</p>
        </div>
        <div className="web-stat-card">
          <p className="web-stat-label">Filled</p>
          <p className="web-stat-value text-indigo-600">{filledGigs}</p>
        </div>
        <div className="web-stat-card">
          <p className="web-stat-label">Done</p>
          <p className="web-stat-value text-amber-600">{completedGigs}</p>
        </div>
      </div>

      <Link
        to="/business/post"
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-all shadow-sm"
      >
        <PlusCircle size={16} strokeWidth={2.5} /> Post New Gig
      </Link>

      <Link
        to="/profile"
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white text-emerald-700 font-bold text-sm border border-emerald-200 hover:bg-emerald-50 transition-all"
      >
        <User size={16} /> Edit Profile
      </Link>
    </>
  );

  const toolbar = (
    <div className="web-toolbar flex items-center justify-between">
      <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
        <Briefcase size={18} className="text-emerald-600" /> Managed Gigs
      </h2>
      <span className="text-xs font-bold text-slate-400">{gigs.length} total</span>
    </div>
  );

  return (
    <>
    <DashboardLayout
      theme="theme-business"
      homeTo="/business"
      roleLabel="Business Portal"
      onLogout={onLogout}
      extra={
        <div className="flex items-center gap-3">
          <Link
            to="/business/post"
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 transition-all"
          >
            <PlusCircle size={15} strokeWidth={2.5} /> Post Gig
          </Link>
          <Notifications />
        </div>
      }
      sidebar={sidebar}
      toolbar={toolbar}
    >
      {msg.text && (
        <div className={`mb-5 p-4 rounded-xl font-bold text-sm border animate-in ${msg.ok ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-700"}`}>
          {msg.text}
        </div>
      )}

      {gigs.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 py-20 text-center">
          <PlusCircle size={48} className="mx-auto mb-4 text-slate-200" />
          <p className="text-slate-600 font-black text-lg">No gigs posted yet</p>
          <Link to="/business/post" className="inline-flex items-center gap-2 mt-4 px-6 py-2.5 rounded-lg bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-all">
            <PlusCircle size={15} /> Post Your First Gig
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {gigs.map((g) => (
            <div key={g._id} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-sm transition-all">
              <div className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1.5">
                      <h3 className="text-lg font-black text-slate-900 truncate">{g.title}</h3>
                      {gigStatusBadge(g.status)}
                    </div>
                    <p className="text-slate-500 text-sm line-clamp-1 mb-2">{g.description}</p>
                    <div className="flex items-center gap-4 text-xs font-bold">
                      <span className="text-emerald-700">₹{g.rate}/{g.payType === "hourly" ? "hr" : "day"}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-400 flex items-center gap-1"><MapPin size={11} /> {g.address || "Main Site"}</span>
                    </div>
                  </div>
                  <button
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wide transition-all ${expanded === g._id ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-600 border border-slate-200 hover:border-emerald-300 hover:text-emerald-600"}`}
                    onClick={() => {
                      if (expanded === g._id) { setExpanded(null); }
                      else { setExpanded(g._id); loadApps(g._id); }
                    }}
                  >
                    {expanded === g._id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    Applicants
                  </button>
                </div>

                {expanded === g._id && (
                  <div className="mt-5 pt-5 border-t border-slate-100 space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                      <Users size={13} /> Applications ({appsByGig[g._id]?.length || 0})
                    </h4>

                    {(!appsByGig[g._id] || appsByGig[g._id].length === 0) ? (
                      <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <p className="text-slate-400 font-medium text-sm">No applications yet.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                        {appsByGig[g._id].map(a => (
                          <div key={a._id} className="p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-200 transition-all">
                            <div className="flex justify-between items-center mb-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-sm">
                                  {a.seeker?.name?.[0]?.toUpperCase()}
                                </div>
                                <div>
                                  <Link to={`/worker/${a.seeker?._id}`} className="font-bold text-slate-800 text-sm hover:text-emerald-600">
                                    {a.seeker?.name}
                                  </Link>
                                  <div className="flex items-center gap-1 text-xs font-medium text-slate-400">
                                    <Star size={10} className="text-amber-400 fill-amber-400" />
                                    {a.seeker?.averageRating || "N/A"} ({a.seeker?.ratingCount || 0})
                                  </div>
                                </div>
                              </div>
                              {appStatusBadge(a.status)}
                            </div>

                            {a.status === "pending" && (
                              <div className="flex gap-2">
                                <button className="flex-1 py-2 rounded-lg bg-emerald-600 text-white font-bold text-xs uppercase hover:bg-emerald-700" onClick={() => setStatus(a._id, "accepted", g._id)}>Accept</button>
                                <button className="flex-1 py-2 rounded-lg bg-red-50 text-red-600 border border-red-200 font-bold text-xs uppercase hover:bg-red-100" onClick={() => setStatus(a._id, "rejected", g._id)}>Reject</button>
                              </div>
                            )}

                            {a.status === "accepted" && (
                              <div className="space-y-2">
                                <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-100 text-emerald-700 font-bold text-xs">
                                  Worker accepted — chat to coordinate
                                </div>
                                <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
                                  <Chat applicationId={a._id} currentUserId={user._id} />
                                </div>
                                <button
                                  className="w-full py-2 rounded-lg bg-slate-900 text-white font-bold text-xs uppercase hover:bg-slate-800"
                                  onClick={() => setRatingTarget({
                                    applicationId: a._id,
                                    gigId: g._id,
                                    workerName: a.seeker?.name,
                                  })}
                                >
                                  Mark Done & Rate
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>

    <RatingModal
      open={!!ratingTarget}
      workerName={ratingTarget?.workerName}
      loading={ratingLoading}
      onClose={() => setRatingTarget(null)}
      onSubmit={completeRate}
    />
  </>
  );
}
