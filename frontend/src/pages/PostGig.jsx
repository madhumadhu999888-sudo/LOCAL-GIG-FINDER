import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { usePageTitle } from "../hooks/usePageTitle.js";
import { api } from "../utils/api.js";
import DashboardLayout from "../components/DashboardLayout.jsx";
import { getCurrentPosition, fetchAddressLabel } from "../utils/location.js";
import { 
  PlusCircle, 
  MapPin, 
  Navigation, 
  IndianRupee, 
  Terminal, 
  ChevronRight,
  Loader2,
  Sparkles
} from "lucide-react";

export default function PostGig({ user, onLogout }) {
  usePageTitle("Post Gig | LocalGigFinder");
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [payType, setPayType] = useState("hourly");
  const [rate, setRate] = useState("");
  const [skillsRequired, setSkillsRequired] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState(
    user?.businessLocation?.latitude != null
      ? String(user.businessLocation.latitude)
      : ""
  );
  const [lng, setLng] = useState(
    user?.businessLocation?.longitude != null
      ? String(user.businessLocation.longitude)
      : ""
  );
  const [err, setErr] = useState("");
  const [locLoading, setLocLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mapLabel, setMapLabel] = useState("");

  const refreshMapLabel = async () => {
    if (lat === "" || lng === "") return;
    const n = Number(lat);
    const m = Number(lng);
    if (Number.isNaN(n) || Number.isNaN(m)) return;
    setMapLabel("Looking up address...");
    const label = await fetchAddressLabel(n, m);
    setMapLabel(label || "");
    if (label) setAddress((prev) => (prev.trim() ? prev : label));
  };

  const useLoc = async () => {
    setLocLoading(true);
    setErr("");
    try {
      const pos = await getCurrentPosition();
      setLat(String(pos.latitude));
      setLng(String(pos.longitude));
      setMapLabel("Looking up address...");
      const label = await fetchAddressLabel(pos.latitude, pos.longitude);
      setMapLabel(label || "");
      if (label) setAddress((prev) => (prev.trim() ? prev : label));
    } catch {
      setErr("Could not read GPS. Ensure location is enabled in browser.");
    } finally {
      setLocLoading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    const skills = skillsRequired.split(",").map(s => s.trim()).filter(Boolean);
    if (!title.trim() || !description.trim()) {
      setErr("Please provide a title and job description.");
      return;
    }
    const la = Number(lat);
    const ln = Number(lng);
    if (Number.isNaN(la) || Number.isNaN(ln)) {
      setErr("Gig location is required.");
      return;
    }
    setLoading(true);
    try {
      await api("/api/gigs", {
        method: "POST",
        body: JSON.stringify({
          title,
          description,
          payType,
          rate: Number(rate),
          skillsRequired: skills,
          latitude: la,
          longitude: ln,
          address,
        }),
      });
      navigate("/business", { replace: true });
    } catch (e2) {
      setErr(e2.message || "Failed to post gig.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout
      theme="theme-business"
      homeTo="/business"
      roleLabel="Post a Gig"
      onLogout={onLogout}
      extra={
        <Link to="/business" className="text-sm font-bold text-slate-600 hover:text-emerald-700 transition-colors">
          ← Back to Dashboard
        </Link>
      }
    >
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.4fr] gap-8 animate-in">
        <div className="hidden xl:block">
          <div className="sticky top-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mb-5 shadow-lg">
              <PlusCircle size={28} strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight mb-3">Post a new gig</h1>
            <p className="text-slate-500 font-medium leading-relaxed mb-6">Describe the work, set your rate, and pin the reporting location for workers nearby.</p>
            <ul className="space-y-3 text-sm font-medium text-slate-600">
              <li className="flex items-start gap-2"><span className="text-emerald-500 font-black">1.</span> Add a clear title and description</li>
              <li className="flex items-start gap-2"><span className="text-emerald-500 font-black">2.</span> Set hourly or daily pay rate</li>
              <li className="flex items-start gap-2"><span className="text-emerald-500 font-black">3.</span> Pin the work location on map</li>
              <li className="flex items-start gap-2"><span className="text-emerald-500 font-black">4.</span> Publish and review applicants</li>
            </ul>
          </div>
        </div>

        <form onSubmit={submit} className="bg-white rounded-xl border border-slate-200 p-6 lg:p-8 space-y-6 shadow-sm">
          <div className="xl:hidden mb-2">
            <h1 className="text-2xl font-black text-slate-900">Post a new gig</h1>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 block ml-1">Gig Title</label>
            <input 
              className="input-dark text-lg py-4" 
              placeholder="e.g. Professional Floor Cleaning"
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 block ml-1">Job Description</label>
            <textarea
              className="input-dark min-h-[120px] py-4 leading-relaxed"
              placeholder="What needs to be done? Be specific about timing and workload..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 block ml-1 text-center md:text-left">Payment Schedule</label>
              <div className="flex gap-2 p-1 bg-slate-50 rounded-2xl border-2 border-slate-100">
                {["hourly", "daily"].map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setPayType(type)}
                    className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${payType === type ? "bg-white text-emerald-600 shadow-sm border border-slate-100" : "text-slate-400 hover:text-slate-600"}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 block ml-1">
                Rate (₹ / {payType === "hourly" ? "Hour" : "Day"})
              </label>
              <div className="relative">
                <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} strokeWidth={3} />
                <input
                  className="input-dark py-4 pl-12"
                  type="number"
                  placeholder={payType === "hourly" ? "e.g. 500" : "e.g. 2500"}
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 block ml-1">Skills Needed (Comma Separated)</label>
            <div className="relative">
              <Terminal className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} strokeWidth={3} />
              <input
                className="input-dark py-4 pl-12"
                placeholder="Plumbing, Heavy Lifting, English"
                value={skillsRequired}
                onChange={(e) => setSkillsRequired(e.target.value)}
              />
            </div>
          </div>

          <div className="p-8 rounded-[2.5rem] bg-emerald-50 border-2 border-emerald-100 space-y-6">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-emerald-600 shadow-sm">
                    <MapPin size={24} strokeWidth={2.5} />
                </div>
                <div>
                    <h3 className="font-black text-emerald-900 leading-none mb-1">Reporting Location</h3>
                    <p className="text-xs font-bold text-emerald-700/60">Pin where the worker needs to show up.</p>
                </div>
            </div>

            <div className="p-4 bg-white/70 backdrop-blur-sm rounded-2xl border border-emerald-200 min-h-[60px] flex items-center">
               <p className={`text-sm font-black transition-all ${mapLabel ? "text-slate-800" : "text-emerald-300 italic"}`}>
                 {mapLabel || "No location pinned yet..."}
               </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <button type="button" className="flex items-center justify-center gap-2 py-4 bg-white text-emerald-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-100 transition-all border-2 border-emerald-100 shadow-sm" onClick={useLoc} disabled={locLoading}>
                    {locLoading ? <Loader2 size={16} className="animate-spin" /> : <Navigation size={16} strokeWidth={3} />}
                    {locLoading ? "Locating..." : "Use My Current Location"}
               </button>
               <details className="group">
                  <summary className="flex items-center justify-center gap-2 py-4 bg-white text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest cursor-pointer list-none border-2 border-slate-100 shadow-sm group-open:bg-slate-50 group-open:text-slate-800 transition-all">
                    Manual Coordinates
                  </summary>
                  <div className="grid grid-cols-2 gap-3 mt-4 animate-in">
                    <input className="input-dark py-3 text-xs" placeholder="Lat" value={lat} onChange={(e) => setLat(e.target.value)} onBlur={refreshMapLabel} />
                    <input className="input-dark py-3 text-xs" placeholder="Lng" value={lng} onChange={(e) => setLng(e.target.value)} onBlur={refreshMapLabel} />
                  </div>
               </details>
            </div>

            <input
              className="w-full bg-white/50 border-2 border-emerald-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-700 focus:outline-none focus:border-emerald-400 placeholder:text-emerald-200"
              placeholder="Or type a landmark/address manually..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          {err && (
            <div className="p-4 rounded-2xl bg-red-50 text-red-600 border-2 border-red-100 font-extrabold text-sm text-center animate-shake">
                {err}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-6 rounded-[2rem] bg-slate-900 text-white font-black text-xl shadow-2xl shadow-slate-200 hover:bg-slate-800 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={24} />}
            {loading ? "Publishing Gig..." : "Post Gig Now"}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
