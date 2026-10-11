const EARTH_RADIUS_KM = 6371;
const KM_PER_DEGREE_LAT = 111.32;

const toRadians = (degrees) => (degrees * Math.PI) / 180;

// Great-circle distance between two { lat, lng } points, in kilometres.
function haversineKm(a, b) {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(a.lat)) * Math.cos(toRadians(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

// A lat/lng box that contains every point within radiusKm of center. Used to
// pre-filter rows in the database; exact distance is checked afterwards.
function boundingBox(center, radiusKm) {
  const latDelta = radiusKm / KM_PER_DEGREE_LAT;
  const cosLat = Math.cos(toRadians(center.lat));
  const lngDelta = cosLat < 1e-6 ? 180 : Math.min(180, radiusKm / (KM_PER_DEGREE_LAT * cosLat));
  return {
    minLat: Math.max(-90, center.lat - latDelta),
    maxLat: Math.min(90, center.lat + latDelta),
    minLng: center.lng - lngDelta,
    maxLng: center.lng + lngDelta,
  };
}

module.exports = { haversineKm, boundingBox };
