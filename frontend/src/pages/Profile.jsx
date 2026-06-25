import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { usePageTitle } from "../hooks/usePageTitle.js";
import { api } from "../utils/api.js";
import Navbar from "../components/Navbar.jsx";
import DashboardLocationCard from "../components/DashboardLocationCard.jsx";
import RatingStars from "../components/RatingStars.jsx";
import { getCurrentPosition, fetchAddressLabel } from "../utils/location.js";
import { PHONE_IN_RE, GST_RE } from "../utils/validators.js";
import {
  User,
  Phone,
  MapPin,
  Loader2,
  Save,
  ArrowLeft,
  Building2,
  Briefcase,
} from "lucide-react";

const SKILL_OPTIONS = [
  "Delivery", "Retail", "Hospitality", "Construction",
  "Cleaning", "Events", "Driving", "General labour",
];

export default function Profile({ user, onLogout, onUserUpdate }) {
  usePageTitle("My Profile | LocalGigFinder");
  const navigate = useNavigate();
  const isWorker = user?.role === "worker";
  const isBusiness = user?.role === "business";

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [skills, setSkills] = useState(user?.skills || []);
  const [experienceYears, setExperienceYears] = useState(user?.experienceYears || 0);
  const [preferredJobType, setPreferredJobType] = useState(user?.preferredJobType || "");
  const [lat, setLat] = useState(
    isWorker
      ? user?.location?.latitude != null ? String(user.location.latitude) : ""
      : user?.businessLocation?.latitude != null ? String(user.businessLocation.latitude) : ""
  );
  const [lng, setLng] = useState(
    isWorker
      ? user?.location?.longitude != null ? String(user.location.longitude) : ""
      : user?.businessLocation?.longitude != null ? String(user.businessLocation.longitude) : ""
  );
  const [addressLabel, setAddressLabel] = useState("");
  const [businessName, setBusinessName] = useState(user?.businessName || "");
  const [businessCategory, setBusinessCategory] = useState(user?.businessCategory || "");
  const [contactNumber, setContactNumber] = useState(user?.contactNumber || "");
  const [gstNumber, setGstNumber] = useState(user?.gstNumber || "");

  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [locLoading, setLocLoading] = useState(false);

  const homeTo = isWorker ? "/worker" : isBusiness ? "/business" : "/admin";

  const toggleSkill = (s) => {
    setSkills((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const captureLocation = async () => {
    setLocLoading(true);
    setErr("");
    try {
      const pos = await getCurrentPosition();
      setLat(String(pos.latitude));
      setLng(String(pos.longitude));
      const label = await fetchAddressLabel(pos.latitude, pos.longitude);
      setAddressLabel(label);
    } catch (e) {
      setErr(e.message || "Could not get location");
    } finally {
      setLocLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setErr("");
    setSuccess("");
    setLoading(true);

    try {
      const body = { name: name.trim() };

      if (isWorker) {
        if (!PHONE_IN_RE.test(phone.trim())) {
          throw new Error("Enter a valid 10-digit Indian mobile number");
        }
        if (skills.length === 0) throw new Error("Select at least one skill");
        body.phone = phone.trim();
        body.skills = skills;
        body.experienceYears = Number(experienceYears) || 0;
        body.preferredJobType = preferredJobType.trim();
        if (lat && lng) {
          body.location = { latitude: Number(lat), longitude: Number(lng) };
        }
      }

      if (isBusiness) {
        if (!businessName.trim() || businessName.trim().length < 2) {
          throw new Error("Business name is required");
        }
        if (!PHONE_IN_RE.test(contactNumber.trim())) {
          throw new Error("Enter a valid 10-digit contact number");
        }
        if (gstNumber && !GST_RE.test(gstNumber.trim())) {
          throw new Error("Invalid GST number format");
        }
        body.businessName = businessName.trim();
        body.businessCategory = businessCategory.trim();
        body.contactNumber = contactNumber.trim();
        body.gstNumber = gstNumber.trim() || undefined;
        if (lat && lng) {
          body.businessLocation = { latitude: Number(lat), longitude: Number(lng) };
        }
      }

      const data = await api("/api/users/profile", {
        method: "PUT",
        body: JSON.stringify(body),
      });
      onUserUpdate?.(data.user);
      setSuccess("Profile updated successfully!");
      setTimeout(() => navigate(homeTo), 1200);
    } catch (e) {
      setErr(e.message || "Could not save profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`web-app-shell ${isWorker ? "theme-worker" : "theme-business"} min-h-screen`}>
      <Navbar
        variant="dashboard"
        homeTo={homeTo}
        roleLabel="Edit Profile"
        onLogout={onLogout}
      />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 animate-in">
        <Link
          to={homeTo}
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 mb-6"
        >
          <ArrowLeft size={16} /> Back to dashboard
        </Link>

        <div className="glass-card p-6 md:p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg ${isWorker ? "bg-gradient-to-br from-indigo-500 to-indigo-600" : "bg-gradient-to-br from-emerald-500 to-emerald-600"}`}>
              {isWorker ? <User size={26} /> : <Building2 size={26} />}
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">My Profile</h1>
              <p className="text-sm font-medium text-slate-500">{user?.email}</p>
              {isWorker && (
                <div className="flex items-center gap-2 mt-1">
                  <RatingStars value={user?.averageRating || 0} />
                  <span className="text-xs text-slate-400 font-bold">({user?.ratingCount || 0} reviews)</span>
                </div>
              )}
            </div>
          </div>

          {err && (
            <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 font-bold text-sm">
              {err}
            </div>
          )}
          {success && (
            <div className="mb-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Full Name</label>
              <input
                className="w-full px-4 py-3 rounded-xl border border-slate-200 font-semibold text-slate-800 focus:outline-none focus:border-indigo-400"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {isWorker && (
              <>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Phone</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 font-semibold focus:outline-none focus:border-indigo-400"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="10-digit mobile"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Skills</label>
                  <div className="flex flex-wrap gap-2">
                    {SKILL_OPTIONS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleSkill(s)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${skills.includes(s) ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Experience (years)</label>
                    <input
                      type="number"
                      min={0}
                      max={60}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 font-semibold focus:outline-none focus:border-indigo-400"
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Preferred Job Type</label>
                    <input
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 font-semibold focus:outline-none focus:border-indigo-400"
                      value={preferredJobType}
                      onChange={(e) => setPreferredJobType(e.target.value)}
                      placeholder="e.g. Part-time"
                    />
                  </div>
                </div>
              </>
            )}

            {isBusiness && (
              <>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Business Name</label>
                  <input
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 font-semibold focus:outline-none focus:border-emerald-400"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Category</label>
                    <input
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 font-semibold focus:outline-none focus:border-emerald-400"
                      value={businessCategory}
                      onChange={(e) => setBusinessCategory(e.target.value)}
                      placeholder="Retail, Events..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Contact Number</label>
                    <input
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 font-semibold focus:outline-none focus:border-emerald-400"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">GST Number (optional)</label>
                  <input
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 font-semibold focus:outline-none focus:border-emerald-400 uppercase"
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value)}
                    placeholder="22AAAAA0000A1Z5"
                  />
                </div>
              </>
            )}

            {(isWorker || isBusiness) && (
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Location</label>
                <button
                  type="button"
                  onClick={captureLocation}
                  disabled={locLoading}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 disabled:opacity-60 mb-3"
                >
                  {locLoading ? <Loader2 size={16} className="animate-spin" /> : <MapPin size={16} />}
                  {locLoading ? "Getting GPS..." : "Update GPS Location"}
                </button>
                {lat && lng && (
                  <DashboardLocationCard
                    title={addressLabel ? addressLabel : "Current coordinates"}
                    latitude={Number(lat)}
                    longitude={Number(lng)}
                  />
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl text-white font-black text-sm uppercase tracking-wide transition-all disabled:opacity-60 ${isWorker ? "bg-indigo-600 hover:bg-indigo-700" : "bg-emerald-600 hover:bg-emerald-700"}`}
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {loading ? "Saving..." : "Save Profile"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
