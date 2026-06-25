import { useEffect, useState, useRef } from "react";
import { api } from "../utils/api.js";
import { getSocket } from "../utils/socket.js";
import { Bell, Info, CheckCircle, MessageSquare, X } from "lucide-react";

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  const fetchNotifs = async () => {
    try {
      const data = await api("/api/notifications");
      setItems(data.notifications || []);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    fetchNotifs();
    const s = getSocket();
    if (s) {
      s.on("notification:new", fetchNotifs);
      return () => { s.off("notification:new", fetchNotifs); };
    }
  }, []);

  useEffect(() => {
    const handleDown = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handleDown);
    return () => document.removeEventListener("mousedown", handleDown);
  }, [open]);

  const markRead = async (id) => {
    try {
      await api(`/api/notifications/${id}/read`, { method: "PATCH" });
      setItems((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
    } catch { /* ignore */ }
  };

  const markAllRead = async () => {
    const unread = items.filter((n) => !n.read);
    await Promise.all(unread.map((n) => markRead(n._id)));
  };

  const handleOpen = () => {
    const next = !open;
    setOpen(next);
    if (next) markAllRead();
  };

  const unread = items.filter((n) => !n.read).length;

  return (
    <div className="relative inline-block" ref={panelRef}>
      <button
        type="button"
        className={`relative p-2.5 rounded-xl transition-all ${open ? "bg-slate-100 text-slate-900" : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-100"}`}
        onClick={handleOpen}
      >
        <Bell size={20} strokeWidth={2.5} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-80 glass-card p-0 overflow-hidden z-[100] animate-in origin-top-right">
          <div className="px-5 py-4 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Alert Center</h3>
            <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
              <X size={16} strokeWidth={3} />
            </button>
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {items.length === 0 ? (
              <div className="p-12 text-center">
                <div className="flex justify-center mb-4 text-slate-200">
                  <Bell size={48} />
                </div>
                <p className="text-slate-400 font-bold text-sm">No new alerts for you.</p>
              </div>
            ) : (
              items.map((n) => (
                <button
                  key={n._id}
                  type="button"
                  onClick={() => markRead(n._id)}
                  className={`w-full text-left px-5 py-4 border-b border-slate-50 last:border-0 transition-colors hover:bg-slate-50/80 ${!n.read ? "bg-indigo-50/30" : ""}`}
                >
                  <div className="flex gap-3">
                    <div className={`mt-1 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${n.title.toLowerCase().includes("accept") ? "bg-emerald-100 text-emerald-600" : n.title.toLowerCase().includes("reject") ? "bg-red-100 text-red-600" : n.title.toLowerCase().includes("message") ? "bg-blue-100 text-blue-600" : "bg-indigo-100 text-indigo-600"}`}>
                      {n.title.toLowerCase().includes("accept") ? <CheckCircle size={14} strokeWidth={3} /> : n.title.toLowerCase().includes("message") ? <MessageSquare size={14} strokeWidth={3} /> : <Info size={14} strokeWidth={3} />}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-800 leading-tight mb-1">{n.title}</h4>
                      <p className="text-xs font-bold text-slate-500 leading-relaxed">{n.message}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {items.length > 0 && (
            <div className="p-3 bg-slate-50/50 text-center border-t border-slate-50">
              <button
                onClick={async () => {
                  try {
                    await api("/api/notifications/clear", { method: "DELETE" });
                    setItems([]);
                  } catch { /* ignore */ }
                }}
                className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700"
              >
                Clear All Notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
