import { useEffect, useState } from "react";
import { fetchAddressLabel } from "../utils/location.js";
import { MapPin, Loader2, Navigation } from "lucide-react";

export default function DashboardLocationCard({ title, latitude, longitude }) {
  const [label, setLabel] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (latitude == null || longitude == null || Number.isNaN(Number(latitude))) {
        setLoading(false);
        return;
      }
      const l = await fetchAddressLabel(latitude, longitude);
      if (!cancelled) {
        setLabel(l || "");
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [latitude, longitude]);

  const hasCoords =
    latitude != null &&
    longitude != null &&
    !Number.isNaN(Number(latitude)) &&
    !Number.isNaN(Number(longitude));

  return (
    <div className="p-4 rounded-2xl bg-white border-2 border-slate-50 shadow-sm flex items-start gap-4 animate-in">
      <div className="icon-box" style={{ width: "40px", height: "40px", flexShrink: 0 }}>
        {loading ? <Loader2 size={18} className="animate-spin" /> : <Navigation size={18} strokeWidth={3} />}
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{title}</span>
        {!hasCoords ? (
          <p className="text-sm font-bold text-slate-300 italic">No area set</p>
        ) : loading ? (
          <p className="text-sm font-bold text-slate-400">Resolving neighborhood...</p>
        ) : (
          <p className="text-sm font-black text-slate-800 leading-snug">{label || "Coordinates Saved"}</p>
        )}
      </div>
    </div>
  );
}
