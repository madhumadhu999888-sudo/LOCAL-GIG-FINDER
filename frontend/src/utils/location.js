import { api } from "./api.js";

export function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );
  });
}

/** Turns GPS into a readable place (city, area) via the LocalGigFinder API → OpenStreetMap. */
export async function fetchAddressLabel(latitude, longitude) {
  const lat = Number(latitude);
  const lng = Number(longitude);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return "";
  try {
    const data = await api(
      `/api/location/reverse?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`
    );
    return data.label || data.displayName || "";
  } catch {
    return "";
  }
}
