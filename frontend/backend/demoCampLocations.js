const REGION_CENTERS = [
  { regionName: "Bangladesh", lat: 23.7, lng: 90.4 },
  { regionName: "Palestine Area", lat: 31.5, lng: 34.5 },
  { regionName: "Yemen", lat: 15.5, lng: 47.5 },
  { regionName: "Sudan", lat: 15.6, lng: 32.5 },
  { regionName: "Jordan Area", lat: 31.9, lng: 35.9 },
  { regionName: "Lebanon Area", lat: 33.9, lng: 35.5 }
];

function hashString(value) {
  let hash = 0;
  const text = String(value || "");
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function offsetFromHash(hash, shift, spread) {
  const n = (hash >> shift) & 1023;
  return ((n / 1023) * 2 - 1) * spread;
}

export function getDemoCampLocation(campId) {
  const hash = hashString(campId);
  const center = REGION_CENTERS[hash % REGION_CENTERS.length];

  const latOffset = offsetFromHash(hash, 3, 0.9);
  const lngOffset = offsetFromHash(hash, 13, 1.2);

  return {
    regionName: center.regionName,
    lat: Number((center.lat + latOffset).toFixed(4)),
    lng: Number((center.lng + lngOffset).toFixed(4))
  };
}
