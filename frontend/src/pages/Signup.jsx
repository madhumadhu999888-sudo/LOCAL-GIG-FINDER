import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { usePageTitle } from "../hooks/usePageTitle.js";
import { api } from "../utils/api.js";
import Navbar from "../components/Navbar.jsx";
import { getCurrentPosition, fetchAddressLabel } from "../utils/location.js";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
  MapPin,
  ShieldCheck,
  Building2,
  Loader2,
  CheckCircle2,
  Zap,
  Star as StarIcon,
  Sparkles
} from "lucide-react";
import {
  validatePasswordClient,
  NAME_RE,
  EMAIL_RE,
  PHONE_IN_RE,
  GST_RE,
} from "../utils/validators.js";

const SKILL_OPTIONS = [
  "Delivery", "Retail", "Hospitality", "Construction", 
  "Cleaning", "Events", "Driving", "General labour"
];

export default function Signup({ onLogin }) {
  usePageTitle("Create Identity | LocalGigFinder");
  const navigate = useNavigate();

  const [role, setRole] = useState("worker");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [skills, setSkills] = useState([]);
  const [experienceYears, setExperienceYears] = useState(0);
  const [preferredJobType, setPreferredJobType] = useState("");
  const [phone, setPhone] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [locLoading, setLocLoading] = useState(false);

  const [businessName, setBusinessName] = useState("");
  const [businessCategory, setBusinessCategory] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [bizLat, setBizLat] = useState("");
  const [bizLng, setBizLng] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [workerAddressLabel, setWorkerAddressLabel] = useState("");
  const [bizAddressLabel, setBizAddressLabel] = useState("");

  const [err, setErr] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const toggleSkill = (s) => {
    setSkills((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const captureLocation = async (target) => {
    setLocLoading(true);
    setErr("");
    try {
      const pos = await getCurrentPosition();
      const la = String(pos.latitude);
      const ln = String(pos.longitude);
      if (target === "worker") {
        setLat(la);
        setLng(ln);
        setWorkerAddressLabel("Locating...");
      } else {
        setBizLat(la);
        setBizLng(ln);
        setBizAddressLabel("Locating...");
      }
      const label = await fetchAddressLabel(pos.latitude, pos.longitude);
      if (target === "worker") {
        setWorkerAddressLabel(label || "Area pinned successfully");
      } else {
        setBizAddressLabel(label || "Business area pinned successfully");
      }
    } catch {
      setErr("GPS access blocked. Please enable location or type manually.");
    } finally {
      setLocLoading(false);
    }
  };

  const validate = () => {
    const errors = {};
    if (!name.trim()) {
      errors.name = "Full Name is required.";
    } else if (!NAME_RE.test(name.trim())) {
      errors.name = "Full Name must be 3-50 characters.";
    }

    if (!email.trim()) {
      errors.email = "Email address is required.";
    } else if (!EMAIL_RE.test(email.trim())) {
      errors.email = "Please provide a valid email address.";
    }

    const pe = validatePasswordClient(password);
    if (pe) {
      errors.password = pe;
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    if (role === "worker") {
      if (skills.length < 1) {
        errors.skills = "Please select at least one skill.";
      }
      if (!phone.trim()) {
        errors.phone = "Phone number is required.";
      } else if (!PHONE_IN_RE.test(phone.trim())) {
        errors.phone = "10-digit Indian phone number is required (starting with 6-9).";
      }
      if (lat === "" || lng === "") {
        errors.location = "Work area location is required.";
      }
    } else {
      if (!businessName.trim()) {
        errors.businessName = "Business or Trading name required.";
      }
      if (!contactNumber.trim()) {
        errors.contactNumber = "Official contact number is required.";
      } else if (!PHONE_IN_RE.test(contactNumber.trim())) {
        errors.contactNumber = "10-digit contact number is required (starting with 6-9).";
      }
      if (bizLat === "" || bizLng === "") {
        errors.businessLocation = "Business location is required.";
      }
      if (gstNumber.trim() && !GST_RE.test(gstNumber.trim().toUpperCase())) {
        errors.gstNumber = "Invalid GST format.";
      }
    }
    return errors;
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setFieldErrors({});
    
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErr("Please resolve the highlighted field errors below.");
      return;
    }
    
    setLoading(true);
    try {
      const body = role === "worker"
        ? { name: name.trim(), email: email.trim(), password, confirmPassword, role: "worker", skills, experienceYears: Number(experienceYears), preferredJobType, phone: phone.trim(), location: { latitude: Number(lat), longitude: Number(lng) } }
        : { name: name.trim(), email: email.trim(), password, confirmPassword, role: "business", businessName: businessName.trim(), businessCategory, contactNumber: contactNumber.trim(), businessLocation: { latitude: Number(bizLat), longitude: Number(bizLng) }, gstNumber: gstNumber.trim() || undefined };

      await api("/api/auth/register", { method: "POST", body: JSON.stringify(body) });
      navigate("/login", { replace: true });
    } catch (e2) {
      if (e2.message && e2.message.includes("Email already registered")) {
        setFieldErrors({ email: "Email already registered." });
      }
      setErr(e2.message || "Signup failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col theme-signup font-sans overflow-x-hidden">
      {/* Dynamic Light Green Mesh Background Layer */}
      <div className="mesh-layer" style={{ opacity: 0.8 }} />
      
      {/* Green-themed Animated Orbs */}
      <div className="fixed top-[20%] left-[-10%] w-[500px] h-[500px] bg-green-200/30 rounded-full blur-[120px] animate-pulse" />
      <div className="fixed bottom-[10%] right-[-10%] w-[500px] h-[500px] bg-emerald-200/30 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />

      <Navbar brand="LocalGigFinder" homeTo="/" showLogo authLink={{ to: "/login", label: "Sign In" }} />

      <main className="flex-1 flex items-center justify-center px-4 py-6 relative z-10 animate-in">
        <div className="w-full max-w-6xl grid lg:grid-cols-[1.1fr_1.4fr] gap-6 lg:gap-8">
          
          {/* LEFT COLUMN: Role Selection */}
          <div className="flex flex-col gap-6">
            <div className="glass-card p-8 shadow-2xl border-0">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg">
                  <Sparkles size={24} strokeWidth={2.5} />
                </div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight" style={{ color: 'var(--form-title)' }}>Join Us</h1>
              </div>
              <p className="font-medium text-slate-500 text-sm md:text-base leading-relaxed mb-8">
                Choose your role to get started.
              </p>
              
              <label className="block text-[11px] font-bold uppercase tracking-[0.2em] mb-4 text-slate-400">I am a...</label>
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  className={`flex items-center gap-4 px-6 py-5 rounded-2xl font-bold text-base transition-all border-2 ${role === "worker" ? "bg-slate-900 border-slate-900 text-white shadow-lg scale-105" : "bg-slate-50 border-slate-100 text-slate-600 hover:border-slate-300"}`}
                  onClick={() => setRole("worker")}
                >
                  <User size={20} strokeWidth={2.5} />
                  <span>Worker</span>
                </button>
                <button
                  type="button"
                  className={`flex items-center gap-4 px-6 py-5 rounded-2xl font-bold text-base transition-all border-2 ${role === "business" ? "bg-slate-900 border-slate-900 text-white shadow-lg scale-105" : "bg-slate-50 border-slate-100 text-slate-600 hover:border-slate-300"}`}
                  onClick={() => setRole("business")}
                >
                  <Building2 size={20} strokeWidth={2.5} />
                  <span>Business</span>
                </button>
              </div>
            </div>

            {/* Benefits Card */}
            <div className="glass-card p-6 shadow-xl border-0 bg-gradient-to-br from-slate-50 to-white">
              <h3 className="font-black text-slate-900 text-sm mb-4">Why Join?</h3>
              <ul className="space-y-3">
                {role === "worker" ? (
                  <>
                    <li className="flex items-start gap-3 text-sm">
                      <Zap size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="font-medium text-slate-700">Find jobs nearby instantly</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm">
                      <Zap size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="font-medium text-slate-700">Build your reputation</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm">
                      <Zap size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="font-medium text-slate-700">Direct chat support</span>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="flex items-start gap-3 text-sm">
                      <Zap size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="font-medium text-slate-700">Hire local talent fast</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm">
                      <Zap size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="font-medium text-slate-700">Post unlimited gigs</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm">
                      <Zap size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="font-medium text-slate-700">Manage projects easily</span>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>

          {/* RIGHT COLUMN: Form */}
          <div className="glass-card p-6 md:p-8 shadow-2xl border-0 max-h-[85vh] overflow-y-auto">
            <form onSubmit={submit} className="space-y-5">
              
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700 block ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} strokeWidth={2.5} />
                  <input className="w-full bg-slate-50 border-2 border-transparent rounded-xl py-3 pl-10 pr-4 font-medium placeholder:text-slate-300 focus:outline-none focus:border-green-500 focus:bg-white transition-all shadow-sm" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                {fieldErrors.name && <p className="text-red-500 text-xs font-bold mt-1">⚠️ {fieldErrors.name}</p>}
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700 block ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} strokeWidth={2.5} />
                  <input className="w-full bg-slate-50 border-2 border-transparent rounded-xl py-3 pl-10 pr-4 font-medium placeholder:text-slate-300 focus:outline-none focus:border-green-500 focus:bg-white transition-all shadow-sm" type="email" placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                {fieldErrors.email && <p className="text-red-500 text-xs font-bold mt-1">⚠️ {fieldErrors.email}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-700 block ml-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} strokeWidth={2.5} />
                    <input className="w-full bg-slate-50 border-2 border-transparent rounded-xl py-3 pl-10 pr-8 font-medium placeholder:text-slate-300 focus:outline-none focus:border-green-500 focus:bg-white transition-all shadow-sm" type={showPassword ? "text" : "password"} placeholder="••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" onClick={() => setShowPassword(!showPassword)} tabIndex="-1">
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold leading-tight mt-1">
                    Rule: 6–10 chars, needs uppercase, lowercase, number, and symbol.
                  </p>
                  {fieldErrors.password && <p className="text-red-500 text-xs font-bold mt-1">⚠️ {fieldErrors.password}</p>}
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-700 block ml-1">Confirm</label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} strokeWidth={2.5} />
                    <input className="w-full bg-slate-50 border-2 border-transparent rounded-xl py-3 pl-10 pr-8 font-medium placeholder:text-slate-300 focus:outline-none focus:border-green-500 focus:bg-white transition-all shadow-sm" type={showConfirmPassword ? "text" : "password"} placeholder="••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" onClick={() => setShowConfirmPassword(!showConfirmPassword)} tabIndex="-1">
                      {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {fieldErrors.confirmPassword && <p className="text-red-500 text-xs font-bold mt-1">⚠️ {fieldErrors.confirmPassword}</p>}
                </div>
              </div>

              {role === "worker" && (
                <div className="pt-3 space-y-3 border-t border-slate-200">
                  <label className="text-sm font-bold text-slate-700 block ml-1">Skills</label>
                  <div className="flex flex-wrap gap-2">
                    {SKILL_OPTIONS.map((s) => (
                      <button key={s} type="button" className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border ${skills.includes(s) ? "bg-green-600 border-green-600 text-white" : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"}`} onClick={() => toggleSkill(s)}>
                        {s}
                      </button>
                    ))}
                  </div>
                  {fieldErrors.skills && <p className="text-red-500 text-xs font-bold mt-1">⚠️ {fieldErrors.skills}</p>}
                </div>
              )}

              {role === "worker" && (
                <div className="pt-2 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 block ml-1">Experience (yrs)</label>
                      <input className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-3 px-4 font-medium focus:outline-none focus:border-green-500 transition-all shadow-sm" type="number" min={0} max={70} value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 block ml-1">Phone</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} strokeWidth={2.5} />
                        <input className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-3 pl-10 pr-4 font-medium placeholder:text-slate-300 focus:outline-none focus:border-green-500 transition-all shadow-sm" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10 digits" />
                      </div>
                      {fieldErrors.phone && <p className="text-red-500 text-xs font-bold mt-1">⚠️ {fieldErrors.phone}</p>}
                    </div>
                  </div>
                  <button type="button" className="w-full py-3 bg-slate-50 text-green-600 rounded-xl font-bold text-sm border-2 border-green-200 hover:bg-green-50 transition-all flex items-center justify-center gap-2" onClick={() => captureLocation("worker")} disabled={locLoading}>
                    {locLoading ? <Loader2 size={14} className="animate-spin" /> : <MapPin size={14} strokeWidth={2.5} />}
                    {locLoading ? "Locating..." : "Share Location"}
                  </button>
                  {workerAddressLabel && <p className="text-xs font-medium text-green-700 text-center">{workerAddressLabel}</p>}
                  {fieldErrors.location && <p className="text-red-500 text-xs font-bold mt-1 text-center">⚠️ {fieldErrors.location}</p>}
                </div>
              )}

              {role === "business" && (
                <div className="pt-3 space-y-3 border-t border-slate-200">
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-700 block ml-1">Business Name</label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} strokeWidth={2.5} />
                      <input className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-3 pl-10 pr-4 font-medium placeholder:text-slate-300 focus:outline-none focus:border-green-500 transition-all shadow-sm" placeholder="Acme Corp" value={businessName} onChange={(e) => setBusinessName(e.target.value)} required />
                    </div>
                    {fieldErrors.businessName && <p className="text-red-500 text-xs font-bold mt-1">⚠️ {fieldErrors.businessName}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 block ml-1">Phone</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} strokeWidth={2.5} />
                        <input className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-3 pl-10 pr-4 font-medium placeholder:text-slate-300 focus:outline-none focus:border-green-500 transition-all shadow-sm" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} placeholder="10 digits" />
                      </div>
                      {fieldErrors.contactNumber && <p className="text-red-500 text-xs font-bold mt-1">⚠️ {fieldErrors.contactNumber}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 block ml-1">GSTIN (opt.)</label>
                      <input className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-3 px-4 font-medium placeholder:text-slate-300 focus:outline-none focus:border-green-500 transition-all shadow-sm" value={gstNumber} onChange={(e) => setGstNumber(e.target.value.toUpperCase())} maxLength={15} placeholder="22AAA..." />
                    </div>
                    {fieldErrors.gstNumber && <p className="text-red-500 text-xs font-bold mt-1 col-span-2">⚠️ {fieldErrors.gstNumber}</p>}
                  </div>
                  <button type="button" className="w-full py-3 bg-slate-50 text-emerald-600 rounded-xl font-bold text-sm border-2 border-emerald-200 hover:bg-emerald-50 transition-all flex items-center justify-center gap-2" onClick={() => captureLocation("business")} disabled={locLoading}>
                    {locLoading ? <Loader2 size={14} className="animate-spin" /> : <Building2 size={14} strokeWidth={2.5} />}
                    {locLoading ? "Locating..." : "Location"}
                  </button>
                  {bizAddressLabel && <p className="text-xs font-medium text-emerald-700 text-center">{bizAddressLabel}</p>}
                  {fieldErrors.businessLocation && <p className="text-red-500 text-xs font-bold mt-1 text-center">⚠️ {fieldErrors.businessLocation}</p>}
                </div>
              )}

              {err && <div className="p-3 rounded-lg bg-red-50 text-red-600 border border-red-100 font-bold text-xs text-center">⚠️ {err}</div>}

              <button type="submit" disabled={loading} className="w-full py-4 rounded-xl bg-slate-900 text-white font-bold text-base shadow-lg hover:bg-slate-800 transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-3 mt-3">
                {loading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} strokeWidth={2.5} />}
                {loading ? "Creating..." : "Create Account"}
              </button>

              <p className="text-xs font-medium text-slate-500 text-center pt-2">
                Have an account? <Link to="/login" className="font-bold text-green-600 hover:text-green-700">Sign In</Link>
              </p>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
