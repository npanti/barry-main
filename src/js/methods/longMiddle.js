import { calcPath_osm } from "../map/calcPath_osm";

// Method to compute the midpoint of the longest path between all given places
export const longMiddle = async (mode = 'center', waitMs = 1000) => {
  // helper to pause between requests
  const sleep = ms => new Promise(res => setTimeout(res, ms));

  window.$barry.log("Je calcule tous les chemins !", 1);
  const keys = Object.keys(window.$barry.places);
  const values = [];

  if (waitMs > 0) {
    // sequential execution with delay
    for (let i = 0; i < keys.length; i++) {
      for (let j = i + 1; j < keys.length; j++) {
        if (!keys[i].startsWith("place") || !keys[j].startsWith("place")) continue;
        const res = await calcPath_osm(
          window.$barry.places[keys[i]],
          window.$barry.places[keys[j]],
          `${keys[i]};${keys[j]}`,
          true
        );
        values.push(res);
        await sleep(waitMs);
      }
    }
  } else {
    // parallel execution (original behavior)
    const prms = [];
    for (let i = 0; i < keys.length; i++) {
      for (let j = i + 1; j < keys.length; j++) {
        if (keys[i].startsWith("place") && keys[j].startsWith("place")) {
          prms.push(
            calcPath_osm(
              window.$barry.places[keys[i]],
              window.$barry.places[keys[j]],
              `${keys[i]};${keys[j]}`,
              true
            )
          );
        }
      }
    }
    values.push(...await Promise.all(prms));
  }

  // compute midpoint for longest or all then center
  if (mode === 'longest') {
    window.$barry.log("Je calcule le midpoint du trajet le plus long.", 1);
    const longest = values.reduce((max, curr) =>
      (window.$barry.calculateMode === "time"
        ? parseFloat(curr.totalTime) > parseFloat(max.totalTime)
        : parseFloat(curr.totalDistance) > parseFloat(max.totalDistance)
      ) ? curr : max
    , values[0]);
    let timeAcc = 0, distAcc = 0, currentInstr;
    const midTime = Math.round(parseFloat(longest.totalTime) / 2);
    const midDist = Math.round(parseFloat(longest.totalDistance) / 2);
    for (const instr of longest.routeInstructions) {
      timeAcc += parseFloat(instr.duration);
      distAcc += parseFloat(instr.distance);
      currentInstr = instr;
      if ((window.$barry.calculateMode === "time" && timeAcc >= midTime) ||
          (window.$barry.calculateMode === "distance" && distAcc >= midDist)) break;
    }
    const delta = window.$barry.calculateMode === "time"
      ? (timeAcc - midTime) / parseFloat(currentInstr.duration)
      : (distAcc - midDist) / parseFloat(currentInstr.distance);
    const coords = currentInstr.geometry.coordinates;
    return coords[Math.round((1 - delta) * (coords.length - 1))];
  }

  window.$barry.log("Je calcule les midpoints de tous les trajets !", 1);
  const midpoints = values.map(val => {
    let timeAcc = 0, distAcc = 0, currentInstr;
    const midTime = Math.round(parseFloat(val.totalTime) / 2);
    const midDist = Math.round(parseFloat(val.totalDistance) / 2);
    for (const instr of val.routeInstructions) {
      timeAcc += parseFloat(instr.duration);
      distAcc += parseFloat(instr.distance);
      currentInstr = instr;
      if ((window.$barry.calculateMode === "time" && timeAcc >= midTime) ||
          (window.$barry.calculateMode === "distance" && distAcc >= midDist)) break;
    }
    const delta = window.$barry.calculateMode === "time"
      ? (timeAcc - midTime) / parseFloat(currentInstr.duration)
      : (distAcc - midDist) / parseFloat(currentInstr.distance);
    const coords = currentInstr.geometry.coordinates;
    return coords[Math.round((1 - delta) * (coords.length - 1))];
  });

  window.$barry.log("Je calcule le centre de tous les midpoints.", 1);
  if (!midpoints.length) throw new Error("Pas de midpoints trouvés");
  const sum = midpoints.reduce((acc, [lng, lat]) => [acc[0] + lng, acc[1] + lat], [0, 0]);
  const center = [sum[0] / midpoints.length, sum[1] / midpoints.length];
  window.$barry.log("Le centre est trouvé.", 1);
  return center;
};
