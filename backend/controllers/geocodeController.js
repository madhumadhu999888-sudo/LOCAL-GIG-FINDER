function formatAddress(data) {
  const a = data.address || {};
  const city =
    a.city ||
    a.town ||
    a.village ||
    a.suburb ||
    a.municipality ||
    a.county ||
    "";
  const state = a.state || a.region || "";
  const country = a.country || "";
  const parts = [city, state, country].filter(Boolean);
  if (parts.length) return parts.join(", ");
  const dn = (data.display_name || "").trim();
  if (dn) {
    return dn
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 3)
      .join(", ");
  }
  return "Location saved";
}

export const reverseGeocode = async (req, res) => {
  try {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return res.status(400).json({ message: "Valid lat and lng required" });
    }

    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("format", "json");
    url.searchParams.set("lat", String(lat));
    url.searchParams.set("lon", String(lng));
    url.searchParams.set("accept-language", "en");

    const r = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "LocalGigFinder-LocalGigFinder/1.0",
      },
    });

    if (!r.ok) {
      return res.status(502).json({ message: "Address lookup unavailable" });
    }

    const data = await r.json();
    const label = formatAddress(data);
    res.json({
      label,
      displayName: data.display_name || label,
    });
  } catch (err) {
    console.error("reverseGeocode:", err.message);
    res.status(500).json({ message: "Could not resolve address" });
  }
};
