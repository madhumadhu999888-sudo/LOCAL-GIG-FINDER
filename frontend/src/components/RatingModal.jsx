import { useState } from "react";
import { Star, X } from "lucide-react";

function StarPicker({ label, value, onChange }) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">{label}</p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className="p-1 rounded-lg hover:bg-amber-50 transition-colors"
            aria-label={`${n} stars`}
          >
            <Star
              size={28}
              strokeWidth={2}
              fill={n <= value ? "currentColor" : "none"}
              className={n <= value ? "text-amber-400" : "text-slate-200"}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function RatingModal({ open, workerName, onClose, onSubmit, loading }) {
  const [workQuality, setWorkQuality] = useState(5);
  const [behavior, setBehavior] = useState(5);

  if (!open) return null;

  const handleSubmit = () => {
    onSubmit({ workQuality, behavior });
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
          <div>
            <h3 className="text-lg font-black text-slate-900">Rate Worker</h3>
            <p className="text-sm font-medium text-slate-500 mt-0.5">
              How was {workerName || "this worker"}?
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={18} strokeWidth={3} />
          </button>
        </div>

        <div className="px-6 py-6 space-y-6">
          <StarPicker label="Work Quality" value={workQuality} onChange={setWorkQuality} />
          <StarPicker label="Behaviour & Communication" value={behavior} onChange={setBehavior} />
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-3 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? "Saving..." : "Complete & Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}
