import { calcPath_osm } from "../map/calcPath_osm";

// Method to compute the midpoint of the longest path between all given places
// Compute the midpoint of the route between the two places that are furthest apart
export const longMiddle = async () => {
  // Haversine formula (lng,lat in degrees → meters)
  const toRad = deg => deg * Math.PI / 180;
  const haversine = ([lng1, lat1], [lng2, lat2]) => {
    const R = 6371e3;
    const φ1 = toRad(lat1), φ2 = toRad(lat2);
    const Δφ = toRad(lat2 - lat1), Δλ = toRad(lng2 - lng1);
    const a = Math.sin(Δφ/2)**2
            + Math.cos(φ1)*Math.cos(φ2)*Math.sin(Δλ/2)**2;
    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  // Gather only "place*" entries
  const places = Object.entries(window.$barry.places)
    .filter(([key]) => key.startsWith("place"));
  if (places.length < 2) {
    throw new Error("Pas assez de places pour calculer un itinéraire.");
  }

  // Find the furthest‐apart pair
  let maxDist = 0, pair = [places[0], places[1]];
  for (let i = 0; i < places.length; i++) {
    for (let j = i + 1; j < places.length; j++) {
      const d = haversine(places[i][1], places[j][1]);
      if (d > maxDist) {
        maxDist = d;
        pair = [places[i], places[j]];
      }
    }
  }
  const [[keyA, coordA], [keyB, coordB]] = pair;
  window.$barry.log(`Furthest apart: ${keyA} ↔ ${keyB} (${(maxDist/1000).toFixed(2)} km)`, 1);

  // Calculate the route once, with step-by-step instructions
  const route = await calcPath_osm(coordA, coordB, `${keyA};${keyB}`, true);

  // Walk the instructions to find the midpoint (by time or distance)
  let timeAcc = 0, distAcc = 0, currentInstr;
  const midTime = Math.round(parseFloat(route.totalTime) / 2);
  const midDist = Math.round(parseFloat(route.totalDistance) / 2);
  for (const instr of route.routeInstructions) {
    timeAcc += parseFloat(instr.duration);
    distAcc += parseFloat(instr.distance);
    currentInstr = instr;
    if ((window.$barry.calculateMode === "time" && timeAcc >= midTime) ||
        (window.$barry.calculateMode === "distance" && distAcc >= midDist)) {
      break;
    }
  }
  const delta = window.$barry.calculateMode === "time"
    ? (timeAcc - midTime) / parseFloat(currentInstr.duration)
    : (distAcc - midDist) / parseFloat(currentInstr.distance);
  const coords = currentInstr.geometry.coordinates;
  return coords[Math.round((1 - delta) * (coords.length - 1))];
};
