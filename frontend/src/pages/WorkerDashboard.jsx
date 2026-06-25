import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { usePageTitle } from "../hooks/usePageTitle.js";
import { api } from "../utils/api.js";
import DashboardLayout from "../components/DashboardLayout.jsx";
import Notifications from "../components/Notifications.jsx";
import RatingStars from "../components/RatingStars.jsx";
import Chat from "../components/Chat.jsx";
import { getCurrentPosition } from "../utils/location.js";
import { getSocket } from "../utils/socket.js";
import { 
  Search, 
  ClipboardList, 
  TrendingUp,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  MapPin,
  User,
} from "lucide-react";

export default function WorkerDashboard({ user, onLogout }) {
  usePageTitle("Dashboard | LocalGigFinder");
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [skillsQ, setSkillsQ] = useState("");
  const [lat, setLat] = useState(
    user?.location?.latitude != null ? String(user.location.latitude) : ""
  );
  const [lng, setLng] = useState(
    user?.location?.longitude != null ? String(user.location.longitude) : ""
  );
  const [msg, setMsg] = useState("");
  const [activeTab, setActiveTab] = useState("find");
  const [myApps, setMyApps] = useState([]);
  const [applyingTo, setApplyingTo] = useState(null);

  const loadMyApps = useCallback(async () => {
    try {
      const data = await api("/api/applications/mine");
      setMyApps(data.applications || []);
    } catch (e) {
      setMsg(e.message || "Failed to load apps");
    }
  }, []);

  useEffect(() => {
    loadMyApps();
  }, [loadMyApps]);

  useEffect(() => {
    const s = getSocket();
    if (s) {
      const onAppUpdate = () => { loadMyApps(); };
      s.on("application:updated", onAppUpdate);
      return () => { s.off("application:updated", onAppUpdate); };
    }
  }, [loadMyApps]);

  const resolveCoords = useCallback(async () => {
    let qLat = lat === "" ? NaN : Number(lat);
    let qLng = lng === "" ? NaN : Number(lng);
    if (!Number.isNaN(qLat) && !Number.isNaN(qLng)) return { lat: qLat, lng: qLng };
    if (user?.location?.latitude != null && user?.location?.longitude != null) {
      return { lat: user.location.latitude, lng: user.location.longitude };
    }
    try {
      const pos = await getCurrentPosition();
      setLat(String(pos.latitude));
      setLng(String(pos.longitude));
      return { lat: pos.latitude, lng: pos.longitude };
    } catch { return null; }
  }, [lat, lng, user]);

  const load = useCallback(async () => {
    setLoading(true);
    setMsg("");
    try {
      const coords = await resolveCoords();
      const params = new URLSearchParams();
      if (coords) {
        params.set("lat", String(coords.lat));
        params.set("lng", String(coords.lng));
        params.set("radiusKm", "10");
      }
      if (skillsQ.trim()) params.set("skills", skillsQ.trim());
      const qs = params.toString();
      const data = await api(qs ? `/api/gigs/open?${qs}` : "/api/gigs/open");
      setGigs(data.gigs || []);
    } catch (e) {
      setMsg(e.message || "Could not load gigs");
      setGigs([]);
    } finally {
      setLoading(false);
    }
  }, [resolveCoords, skillsQ]);

  useEffect(() => { load(); }, []); // eslint-disable-line

  const apply = async (gigId) => {
    setMsg("");
    setApplyingTo(gigId);
    try {
      await api(`/api/applications/gig/${gigId}`, { method: "POST" });
      setMsg("✅ Application sent successfully!");
      setGigs(prev => prev.filter(g => g._id !== gigId));
      loadMyApps();
    } catch (e) {
      setMsg(e.message || "Apply failed");
    } finally {
      setApplyingTo(null);
    }
  };

  const statusBadge = (status) => {
    const map = { 
      pending: { class: "bg-amber-100 text-amber-700 border-amber-200", icon: <Clock size={12} /> }, 
      accepted: { class: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: <CheckCircle size={12} /> }, 
      rejected: { class: "bg-red-100 text-red-700 border-red-200", icon: <XCircle size={12} /> }, 
      completed: { class: "bg-indigo-100 text-indigo-700 border-indigo-200", icon: <TrendingUp size={12} /> } 
    };
    const config = map[status] || map.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-black border flex items-center gap-1.5 ${config.class}`}>
        {config.icon} {status}
      </span>
    );
  };

  const pendingCount = myApps.filter(a => a.status === "pending").length;
  const acceptedCount = myApps.filter(a => a.status === "accepted").length;
  const filteredGigs = gigs.filter(g => !myApps.some(a => (a.gig?._id || a.gig) === g._id));

  const sidebar = (
    <>
      <div className="web-sidebar-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white flex items-center justify-center shadow-md">
            <TrendingUp size={22} strokeWidth={2.5} />
          </div>
          <div className="min-w-0">
            <p className="web-sidebar-title">Worker</p>
            <p className="font-black text-slate-900 truncate">{user?.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <RatingStars value={user?.averageRating || 0} />
          <span className="text-xs text-slate-500 font-bold">({user?.ratingCount || 0})</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
          <MapPin size={12} className="text-indigo-500" />
          Searching within 10 km
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="web-stat-card">
          <p className="web-stat-label">Available</p>
          <p className="web-stat-value text-indigo-600">{filteredGigs.length}</p>
        </div>
        <div className="web-stat-card">
          <p className="web-stat-label">Pending</p>
          <p className="web-stat-value text-amber-600">{pendingCount}</p>
        </div>
        <div className="web-stat-card">
          <p className="web-stat-label">Accepted</p>
          <p className="web-stat-value text-emerald-600">{acceptedCount}</p>
        </div>
        <div className="web-stat-card">
          <p className="web-stat-label">Applied</p>
          <p className="web-stat-value">{myApps.length}</p>
        </div>
      </div>

      {user?.skills?.length > 0 && (
        <div className="web-sidebar-card">
          <p className="web-sidebar-title">Your Skills</p>
          <div className="flex flex-wrap gap-1.5">
            {user.skills.map((s) => (
              <span key={s} className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      <Link
        to="/profile"
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white text-indigo-700 font-bold text-sm border border-indigo-200 hover:bg-indigo-50 transition-all"
      >
        <User size={16} /> Edit Profile
      </Link>
    </>
  );

  const tabs = (
    <div className="web-tab-bar">
      <button
        className={`web-tab-btn ${activeTab === "find" ? "active" : ""}`}
        onClick={() => setActiveTab("find")}
      >
        <Search size={16} strokeWidth={2.5} /> Find Gigs
      </button>
      <button
        className={`web-tab-btn ${activeTab === "myapps" ? "active" : ""}`}
        onClick={() => setActiveTab("myapps")}
      >
        <ClipboardList size={16} strokeWidth={2.5} /> My Applications
        {acceptedCount > 0 && (
          <span className="ml-1 w-5 h-5 bg-red-500 text-white rounded-full inline-flex items-center justify-center text-[10px] font-black">
            {acceptedCount}
          </span>
        )}
      </button>
    </div>
  );

  return (
    <DashboardLayout
      theme="theme-worker"
      homeTo="/worker"
      roleLabel="Worker Portal"
      onLogout={onLogout}
      extra={<Notifications />}
      sidebar={sidebar}
      tabs={tabs}
    >
      {msg && (
        <div className={`mb-5 p-4 rounded-xl font-bold text-sm border animate-in ${msg.startsWith("✅") ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-700"}`}>
          {msg}
        </div>
      )}

      {activeTab === "find" ? (
        <div className="space-y-5">
          <div className="flex gap-3 items-center bg-white rounded-xl border border-slate-200 p-2 shadow-sm">
            <div className="flex items-center gap-2 pl-4 text-slate-400">
              <Search size={18} strokeWidth={2.5} />
            </div>
            <input
              className="flex-1 py-2.5 px-2 bg-transparent font-semibold placeholder:text-slate-300 focus:outline-none text-slate-800"
              placeholder="Search by skills — Delivery, Construction, Hospitality..."
              value={skillsQ}
              onChange={(e) => setSkillsQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && load()}
            />
            <button className="px-6 py-2.5 rounded-lg bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition-all" onClick={load}>
              Search
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="h-44 bg-white rounded-xl animate-pulse border border-slate-100" />)}
            </div>
          ) : filteredGigs.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 py-20 text-center">
              <MapPin size={48} className="mx-auto mb-4 text-slate-200" />
              <p className="text-slate-600 font-black text-lg">No gigs found in your area</p>
              <p className="text-slate-400 font-medium text-sm mt-1">Try expanding your search or check back later.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredGigs.map((g) => (
                <div key={g._id} className="bg-white rounded-xl border border-slate-200 p-5 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-base font-black text-slate-800 leading-tight truncate flex-1">{g.title}</h3>
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md text-[10px] font-black uppercase ml-2 flex-shrink-0">Open</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mb-3">
                    <MapPin size={11} className="text-indigo-400 flex-shrink-0" />
                    <span className="truncate">{g.address || "Local Area"}</span>
                  </div>
                  <p className="text-slate-500 text-sm mb-4 line-clamp-2 leading-relaxed flex-1">{g.description}</p>
                  <div className="text-emerald-600 font-extrabold text-base mb-4">
                    ₹{g.rate}
                    <span className="text-[10px] uppercase tracking-tight opacity-70 font-bold ml-1">/ {g.payType === "hourly" ? "hr" : "day"}</span>
                  </div>
                  <div className="flex gap-2 mt-auto">
                    <Link to={`/gig/${g._id}`} className="flex-1 py-2.5 rounded-lg text-center font-bold text-sm border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600 transition-all">
                      Details
                    </Link>
                    <button 
                      className="flex-1 py-2.5 rounded-lg font-bold text-sm bg-indigo-600 text-white hover:bg-indigo-700 transition-all disabled:opacity-50" 
                      onClick={() => apply(g._id)}
                      disabled={applyingTo === g._id}
                    >
                      {applyingTo === g._id ? "..." : "Apply"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          {myApps.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 py-20 text-center">
              <ClipboardList size={48} className="mx-auto mb-4 text-slate-200" />
              <p className="text-slate-600 font-black text-lg">No applications yet</p>
              <button className="text-indigo-600 font-bold mt-2 hover:underline text-sm" onClick={() => setActiveTab("find")}>Browse gigs</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {myApps.map((app) => (
                <div key={app._id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-black text-slate-800 truncate">{app.gig?.title || "Gig"}</h3>
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mt-0.5">
                        <span>{app.gig?.business?.businessName || "Employer"}</span>
                        <span>•</span>
                        <span className="text-indigo-600">₹{app.gig?.rate}/{app.gig?.payType === "hourly" ? "hr" : "day"}</span>
                      </div>
                    </div>
                    {statusBadge(app.status)}
                  </div>

                  {app.status === "accepted" && app.chatEnabled && (
                    <div className="space-y-3">
                      <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-100 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-emerald-700 font-bold text-xs">Chat is active</span>
                      </div>
                      <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
                        <Chat applicationId={app._id} currentUserId={user._id} />
                      </div>
                    </div>
                  )}

                  {app.status === "pending" && (
                    <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-100 text-amber-700 font-bold text-xs flex items-center gap-2">
                      <Clock size={14} /> Review in progress
                    </div>
                  )}

                  {app.status === "rejected" && (
                    <div className="p-2.5 bg-red-50 rounded-lg border border-red-100 text-red-700 font-bold text-xs flex items-center gap-2">
                      <XCircle size={14} /> Not selected
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
