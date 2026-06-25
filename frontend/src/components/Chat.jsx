import { useEffect, useState, useRef } from "react";
import { api } from "../utils/api.js";
import { getSocket } from "../utils/socket.js";
import { Send, User, MessageSquare, Sparkles } from "lucide-react";

export default function Chat({ applicationId, currentUserId }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api(`/api/messages/${applicationId}`);
        if (!cancelled) setMessages(data.messages || []);
      } catch {
        if (!cancelled) setMessages([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    const s = getSocket();
    if (s) {
      s.emit("join:application", applicationId);
      const onNew = (payload) => {
        if (payload?.applicationId !== applicationId) return;
        const incoming = payload?.message;
        if (!incoming) return;
        setMessages((m) => {
          const id = String(incoming._id);
          if (m.some((x) => String(x._id) === id)) return m;
          return [...m, incoming];
        });
      };
      s.on("message:new", onNew);
      return () => {
        s.off("message:new", onNew);
        cancelled = true;
      };
    }
    return () => { cancelled = true; };
  }, [applicationId]);

  const send = async () => {
    if (!text.trim()) return;
    const trimmed = text.trim();
    try {
      const data = await api(`/api/messages/${applicationId}`, {
        method: "POST",
        body: JSON.stringify({ text: trimmed }),
      });
      setMessages((m) => {
        const id = String(data.message._id);
        if (m.some((x) => String(x._id) === id)) return m;
        return [...m, data.message];
      });
      setText("");
    } catch (e) {
      alert(e.message || "Could not send");
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border-2 border-slate-50">
        <div className="flex justify-center gap-1 mb-3">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Waking Up Chat...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[400px] md:h-[500px] bg-white/40 backdrop-blur-3xl rounded-[2rem] md:rounded-[3rem] overflow-hidden border border-white/60 shadow-2xl animate-in">
      {/* Super Header - High Gloss */}
      <div className="px-8 py-5 bg-white/60 backdrop-blur-md border-b border-white/40 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-lg shadow-emerald-200 animate-pulse" />
          <div className="flex flex-col">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 leading-none mb-1">Secure Channel</h3>
            <span className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
              <MessageSquare size={14} strokeWidth={3} className="text-amber-600" /> Live Discussion
            </span>
          </div>
        </div>
      </div>

      {/* High-Density Message Stream */}
      <div className="flex-1 overflow-y-auto p-8 space-y-2 bg-transparent scrollbar-hide">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-20 grayscale p-10 text-center">
            <Sparkles size={48} className="mb-4 text-slate-400" />
            <p className="text-xs font-black uppercase tracking-widest">No Protocol Handshake Yet</p>
          </div>
        ) : (
          messages.map((msg) => {
            const mine = String(msg.sender?._id) === String(currentUserId);
            return (
              <div key={msg._id} className={`flex ${mine ? "justify-end" : "justify-start animate-in"}`}>
                <div className={`max-w-[75%] px-5 py-3 transition-all hover:scale-[1.02] ${
                  mine 
                    ? "bg-slate-900 text-white rounded-[1.5rem] rounded-tr-sm shadow-xl shadow-slate-200/50" 
                    : "bg-white/90 text-slate-930 rounded-[1.5rem] rounded-tl-sm border-2 border-amber-100 shadow-sm"
                }`}>
                  <div className={`text-[9px] font-black uppercase tracking-widest mb-1 opacity-50 ${mine ? "text-amber-200 text-right" : "text-amber-700"}`}>
                    {msg.sender?.name?.split(' ')[0] || "User"}
                  </div>
                  <p className="text-sm font-black leading-relaxed tracking-tight">{msg.text}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Floating Super Input */}
      <div className="p-6 bg-transparent">
        <div className="flex gap-3 bg-white/80 backdrop-blur-xl p-2 rounded-[2rem] border-2 border-amber-100 focus-within:border-amber-400 focus-within:ring-4 focus-within:ring-amber-50 transition-all shadow-xl shadow-amber-900/5">
          <input
            className="flex-1 px-5 py-3 text-sm font-black text-slate-900 bg-transparent focus:outline-none placeholder:text-slate-300"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your message..."
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
            }}
          />
          <button 
            type="button" 
            className="w-12 h-12 rounded-[1.5rem] bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:hover:scale-100"
            disabled={!text.trim()}
            onClick={send}
          >
            <Send size={20} strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
}
