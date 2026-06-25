import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { usePageTitle } from "../hooks/usePageTitle.js";
import { api } from "../utils/api.js";
import Navbar from "../components/Navbar.jsx";
import RatingStars from "../components/RatingStars.jsx";
import { ArrowLeft, User, Briefcase, Star, Phone } from "lucide-react";

export default function WorkerProfile({ user, onLogout }) {
  const { id } = useParams();
  const [worker, setWorker] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  usePageTitle(worker ? `${worker.name} | LocalGigFinder` : "Worker Profile | LocalGigFinder");

  useEffect(() => {
    (async () => {
      try {
        const data = await api(`/api/users/worker/${id}`);
        setWorker(data.user);
      } catch (e) {
        setErr(e.message || "Worker not found");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const homeTo = user?.role === "business" ? "/business" : user?.role === "worker" ? "/worker" : "/";

  return (
    <div className="web-app-shell theme-worker min-h-screen">
      <Navbar
        variant="dashboard"
        homeTo={homeTo}
        roleLabel="Worker Profile"
        onLogout={onLogout}
        showLogo
      />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 animate-in">
        <Link
          to={homeTo}
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 mb-6"
        >
          <ArrowLeft size={16} /> Back
        </Link>

        {loading ? (
          <div className="glass-card p-12 text-center">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
          </div>
        ) : err ? (
          <div className="glass-card p-8 text-center text-red-600 font-bold">{err}</div>
        ) : (
          <div className="glass-card p-6 md:p-8">
            <div className="flex items-start gap-5 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white flex items-center justify-center text-2xl font-black shadow-lg">
                {worker.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-black text-slate-900">{worker.name}</h1>
                <div className="flex items-center gap-2 mt-2">
                  <RatingStars value={worker.averageRating || 0} />
                  <span className="text-sm font-bold text-slate-500">
                    {worker.averageRating || 0} ({worker.ratingCount || 0} reviews)
                  </span>
                </div>
                {worker.experienceYears > 0 && (
                  <p className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-1.5">
                    <Briefcase size={14} /> {worker.experienceYears} years experience
                  </p>
                )}
                {worker.preferredJobType && (
                  <p className="text-xs font-bold text-indigo-600 mt-1 uppercase tracking-wide">
                    Prefers: {worker.preferredJobType}
                  </p>
                )}
              </div>
            </div>

            {worker.skills?.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {worker.skills.map((s) => (
                    <span key={s} className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {worker.phone && user?.role === "business" && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                <Phone size={18} className="text-indigo-500" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Contact</p>
                  <p className="font-bold text-slate-800">{worker.phone}</p>
                </div>
              </div>
            )}

            <div className="mt-8 p-4 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center gap-3">
              <Star size={20} className="text-amber-500 fill-amber-500" />
              <p className="text-sm font-medium text-indigo-800">
                Trusted local worker on LocalGigFinder. Ratings are from completed gigs.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
