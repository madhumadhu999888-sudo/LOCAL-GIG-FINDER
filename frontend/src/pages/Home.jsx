import { Link } from "react-router-dom";
import { usePageTitle } from "../hooks/usePageTitle.js";
import LocalGigFinderLogo from "../components/LocalGigFinderLogo.jsx";
import { 
  MapPin, 
  Zap, 
  MessageSquare, 
  TrendingUp, 
  Search, 
  ArrowRight,
  ShieldCheck,
  LayoutDashboard
} from "lucide-react";

const FEATURES = [
  {
    icon: <MapPin size={32} strokeWidth={2.5} />,
    title: "Nearby Gigs",
    desc: "See the best local jobs close to you so you can respond quickly and stay connected.",
    color: "#fdf4ff", // Soft Fuchsia
    accent: "#c026d3",
    delay: "0.1s"
  },
  {
    icon: <Zap size={32} strokeWidth={2.5} />,
    title: "Fast Matching",
    desc: "Post a job or apply in seconds and get matched with local people right away.",
    color: "#f0fdf4", // Soft Mint
    accent: "#16a34a",
    delay: "0.2s"
  },
  {
    icon: <MessageSquare size={32} strokeWidth={2.5} />,
    title: "Instant Chat",
    desc: "Talk directly with the people you hire, all inside the app, without losing time.",
    color: "#fffbeb", // Soft Amber
    accent: "#d97706",
    delay: "0.3s"
  },
  {
    icon: <TrendingUp size={32} strokeWidth={2.5} />,
    title: "Trusted Reviews",
    desc: "Share feedback and build a strong local profile that others can trust.",
    color: "#f0f9ff", // Soft Sky
    accent: "#0284c7",
    delay: "0.4s"
  },
];

export default function Home() {
  usePageTitle("LocalGigFinder | Connect Local");

  return (
    <div className="min-h-screen flex flex-col theme-home font-sans">
      <div className="mesh-layer" />
      
      {/* ── Navbar ── */}
      <header className="static w-full bg-white border-b border-slate-100/80 animate-in">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <LocalGigFinderLogo className="h-10 w-10 font-black" />
            <span className="text-2xl font-black text-slate-900 tracking-tight">LocalGigFinder</span>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login" className="px-6 py-2.5 font-bold text-slate-600 hover:text-sky-700 transition-colors">
              Login
            </Link>
            <Link to="/signup" className="px-6 py-2.5 font-black text-white bg-slate-900 rounded-xl shadow-lg shadow-blue-100 hover:bg-slate-800 transition-all hover:scale-105 active:scale-95">
              Sign up free
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center px-6 py-12 animate-in">
        <div className="w-full max-w-7xl grid gap-10 lg:grid-cols-[1.3fr_1fr] items-start">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-white rounded-full shadow-sm border border-slate-100 animate-bounce cursor-default">
              <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
              <span className="text-xs font-black text-sky-600 uppercase tracking-widest leading-none">Built for local gigs</span>
            </div>

            <h1 className="text-center lg:text-left max-w-4xl text-5xl md:text-6xl font-black text-slate-930 tracking-tight leading-[0.95]">
              Find local work or hire help in your neighborhood.
            </h1>

            <p className="text-center lg:text-left max-w-2xl text-lg md:text-xl font-bold text-slate-500 leading-relaxed opacity-85">
              A simple app to connect, chat, and manage local gigs.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link to="/signup" className="flex items-center gap-3 px-8 py-4 bg-sky-600 text-white rounded-2xl font-black text-lg shadow-2xl shadow-sky-200 hover:bg-sky-500 transition-all hover:translate-y-[-2px] group">
                Start free <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/login" className="flex items-center gap-3 px-8 py-4 bg-white text-slate-700 rounded-2xl font-black text-lg border-2 border-slate-100 hover:border-sky-300 transition-all shadow-sm">
                Log in
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {FEATURES.map((f, i) => (
              <div 
                key={i} 
                className="glass-card p-6 group transition-all duration-500 hover:scale-[1.03] hover:rotate-[-1deg]"
                style={{ 
                  backgroundColor: f.color, 
                  border: `2px solid transparent`,
                  animationDelay: f.delay
                }}
              >
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-all duration-500 group-hover:scale-110 group-hover:rotate-[15deg]"
                  style={{ backgroundColor: "white", color: f.accent, boxShadow: `0 10px 20px -5px ${f.accent}20` }}
                >
                  {f.icon}
                </div>
                <h3 className="text-lg font-black text-slate-800 mb-2">{f.title}</h3>
                <p className="text-sm font-semibold text-slate-500 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Social Proof Section */}
        <div className="mt-32 w-full max-w-4xl p-10 bg-white rounded-[2.5rem] border-2 border-slate-50 shadow-2xl shadow-indigo-50 flex flex-col items-center text-center">
            <div className="flex gap-1 mb-6">
                {[1,2,3,4,5].map(s => <Star key={s} className="text-amber-400 fill-amber-400" size={24} />)}
            </div>
            <p className="text-2xl font-black text-slate-800 mb-4 leading-tight italic">
              "LocalGigFinder changed how I find work. It's fast, trustworthy, and actually local."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center font-black text-sky-600 text-xs">AM</div>
              <div className="text-left leading-none">
                <p className="font-black text-slate-900 text-sm">Alex Morgan</p>
                <p className="text-xs font-bold text-slate-400">Local Handyman</p>
              </div>
            </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t mt-20 border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="flex items-center gap-3">
            <LocalGigFinderLogo className="h-8 w-8 grayscale" />
            <span className="text-xl font-black text-slate-400 tracking-tighter">LocalGigFinder.</span>
          </div>
          <div className="flex gap-8">
            {['Privacy', 'Terms', 'Support'].map(link => (
              <a key={link} href="#" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-sky-600 transition-colors">{link}</a>
            ))}
          </div>
          <p className="text-xs font-bold text-slate-300">© 2026 Advanced Local Agentic Platform.</p>
        </div>
      </footer>
    </div>
  );
}

function Star({ className, size }) {
  return (
    <svg 
      className={className} 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
