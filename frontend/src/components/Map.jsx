import { MapPin, Navigation } from "lucide-react";

export default function Map({ latitude, longitude, label = "Location" }) {
  if (latitude == null || longitude == null) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl p-6 min-h-[280px]">
        <MapPin size={32} className="text-slate-300 mb-2" />
        <p className="text-sm font-semibold">Location coordinates unavailable</p>
      </div>
    );
  }

  const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

  return (
    <div className="relative w-full h-full min-h-[280px] rounded-2xl overflow-hidden border border-slate-200/80 shadow-md group">
      {/* Embedded Map Iframe */}
      <iframe
        title="Gig Location Map"
        width="100%"
        height="100%"
        className="absolute inset-0 w-full h-full filter contrast-[0.9] saturate-[0.8] hover:filter-none transition-all duration-500"
        style={{ border: 0 }}
        loading="lazy"
        src={`https://maps.google.com/maps?q=${latitude},${longitude}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
      />

      {/* Floating Coordinates & Action Overlay */}
      <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-xl border border-slate-100 shadow-xl flex items-center justify-between gap-3 transform translate-y-1 group-hover:translate-y-0 transition-all duration-300">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
            <MapPin size={18} strokeWidth={2.5} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-black text-slate-800 leading-none mb-1 truncate">{label}</p>
            <p className="text-[10px] font-bold text-slate-400 leading-none">
              {Number(latitude).toFixed(5)}, {Number(longitude).toFixed(5)}
            </p>
          </div>
        </div>

        <a
          href={mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors shrink-0 shadow-sm"
        >
          <Navigation size={12} strokeWidth={3} className="rotate-45" />
          Open Maps
        </a>
      </div>
    </div>
  );
}
