import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { usePageTitle } from "../hooks/usePageTitle.js";
import { api } from "../utils/api.js";
import Navbar from "../components/Navbar.jsx";
import { Eye, EyeOff, Mail, Lock, Sparkles, Loader2, ArrowLeft, ShieldCheck } from "lucide-react";

export default function Login({ onLogin }) {
  usePageTitle("Sign In | LocalGigFinder");
  const nav = useNavigate();
  const loc = useLocation();
  const from = loc.state?.from?.pathname || "/";

  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submitCredentials = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const data = await api("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      onLogin(data.token, data.user);
      redirectUser(data.user);
    } catch (e2) {
      setErr(e2.message || "Invalid credentials. Please verify your email and password.");
    } finally {
      setLoading(false);
    }
  };

  const redirectUser = (user) => {
    if (user.role === "worker") nav("/worker", { replace: true });
    else if (user.role === "business") nav("/business", { replace: true });
    else if (user.role === "admin") nav("/admin", { replace: true });
    else nav(from, { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col theme-login font-sans overflow-hidden">
      {/* Dynamic Light Orange Mesh Background Layer */}
      <div className="mesh-layer" style={{ opacity: 0.8 }} />
      
      {/* Orange-themed Animated Orbs */}
      <div className="absolute top-[10%] left-[10%] w-64 h-64 bg-orange-200/40 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-[10%] right-[10%] w-64 h-64 bg-amber-200/40 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />

      <Navbar brand="LocalGigFinder" homeTo="/" showLogo authLink={{ to: "/signup", label: "Create Account" }} />

      <main className="flex-1 grid place-items-center px-4 py-6 relative z-10 animate-in">
        <div className="glass-card max-w-lg w-full p-6 md:p-8 shadow-2xl border-0">
          
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center mb-5 shadow-xl group overflow-hidden">
              <Sparkles size={24} strokeWidth={2.5} className="group-hover:scale-125 transition-transform" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-none mb-2" style={{ color: 'var(--form-title)' }}>Welcome Back</h1>
            <p className="font-medium text-slate-500 max-w-[300px] mx-auto leading-relaxed">Sign in to continue finding local gigs or hiring talent.</p>
          </div>

          <form onSubmit={submitCredentials} className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-bold tracking-tight block ml-1 text-slate-700">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} strokeWidth={2.5} />
                <input
                  className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 pl-12 pr-4 font-semibold placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white transition-all shadow-sm"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold tracking-tight block ml-1 text-slate-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} strokeWidth={2.5} />
                <input
                  className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 pl-12 pr-12 font-semibold placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white transition-all shadow-sm"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
                </button>
              </div>
            </div>

            {err && (
              <div className="p-4 rounded-xl bg-red-50 text-red-600 border border-red-100 font-bold text-sm text-center animate-shake">
                ⚠️ {err}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-slate-900 text-white font-bold text-lg shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 mt-4"
            >
              {loading && <Loader2 className="animate-spin" />}
              {loading ? "Verifying..." : "Sign In"}
            </button>
          </form>

          <footer className="mt-7 pt-5 border-t border-slate-100 text-center">
            <p className="text-sm font-medium text-slate-500">
              New here?{" "}
              <Link className="text-orange-600 hover:text-orange-700 font-bold transition-all ml-1" to="/signup">
                Create an account
              </Link>
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
