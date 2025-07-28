// import { calcPath } from "../map/calcPath";
import { calcPath_osm } from "../map/calcPath_osm";
// Method to compute the midpoint of the longest path between all given places
export const longMiddle = (mode = 'center') => {
  return new Promise((resolve, reject) => {
    // Log start of multi-route computations
    window.$barry.log("Je calcule tous les chemins !", 1);
    
    // Build an array of promises for all unique place-pairs
    const prms = [];
    const keys = Object.keys(window.$barry.places);
    for (let i = 0; i < keys.length; i++)
      for (let j = i + 1; j < keys.length; j++)
        if (keys[i].startsWith("place") && keys[j].startsWith("place")) {
          // prms.push(
          //   calcPath(
          //     window.$barry.places[keys[i]],
          //     window.$barry.places[keys[j]],
          //     `${keys[i]};${keys[j]}`
          //   )
          // );
          prms.push(
            calcPath_osm(
              window.$barry.places[keys[i]],
              window.$barry.places[keys[j]],
              `${keys[i]};${keys[j]}`,
              true
            )
          );
          }

    // Once all routes are calculated, determine the longest one
    Promise.all(prms)
      .then((values) => {
        // If mode is 'longest', find and compute only the midpoint of the longest route
        if (mode === 'longest') {
          window.$barry.log("Je calcule le midpoint du trajet le plus long.", 1);
          // Determine longest route based on calculateMode
          const longest = values.reduce((max, curr) =>
            (window.$barry.calculateMode === "time"
              ? parseFloat(curr.totalTime) > parseFloat(max.totalTime)
              : parseFloat(curr.totalDistance) > parseFloat(max.totalDistance)
            ) ? curr : max
          , values[0]);
          // Compute midpoint for the longest route
          let timeAcc = 0, distAcc = 0, currentInstr = null;
          const midTime = Math.round(parseFloat(longest.totalTime) / 2);
          const midDist = Math.round(parseFloat(longest.totalDistance) / 2);
          for (let i = 0; i < longest.routeInstructions.length; i++) {
            const instr = longest.routeInstructions[i];
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
          // Return a single midpoint coordinate
          return [coords[Math.round((1 - delta) * (coords.length - 1))]];
        }
        window.$barry.log("Je calcule les midpoints de tous les trajets !", 1);
        const midpointPromises = values.map((val) => {
          // Traverse existing routeInstructions to find midpoint
          let timeAcc = 0;
          let distAcc = 0;
          let currentInstr = null;
          const midTime = Math.round(parseFloat(val.totalTime) / 2);
          const midDist = Math.round(parseFloat(val.totalDistance) / 2);
          for (let i = 0; i < val.routeInstructions.length; i++) {
            const instr = val.routeInstructions[i];
            timeAcc += parseFloat(instr.duration);
            distAcc += parseFloat(instr.distance);
            currentInstr = instr;
            if (
              (window.$barry.calculateMode === "time" && timeAcc >= midTime) ||
              (window.$barry.calculateMode === "distance" && distAcc >= midDist)
            ) break;
          }
          // Compute exact interpolation within the instruction
          let delta = 0;
          if (window.$barry.calculateMode === "time") {
            delta = (timeAcc - midTime) / parseFloat(currentInstr.duration);
          } else {
            delta = (distAcc - midDist) / parseFloat(currentInstr.distance);
          }
          const coords = currentInstr.geometry.coordinates;
          return coords[Math.round((1 - delta) * (coords.length - 1))];
        });
        return Promise.all(midpointPromises);
      })
      .then((midpoints) => {
        // If mode is 'longest', resolve directly with that single midpoint
        if (mode === 'longest') {
          window.$barry.log("Le midpoint du trajet le plus long est trouvé.", 1);
          // midpoints is an array with one coordinate
          return resolve(midpoints[0]);
        }
        window.$barry.log("Je calcule le centre de tous les midpoints.", 1);
        if (!midpoints.length) {
          return reject("Pas de midpoints trouvés");
        }
        const sum = midpoints.reduce(
          (acc, [lng, lat]) => [acc[0] + lng, acc[1] + lat],
          [0, 0]
        );
        const center = [sum[0] / midpoints.length, sum[1] / midpoints.length];
        window.$barry.log("Le centre est trouvé.", 1);
        resolve(center);
      })
      .catch((err) => reject(err));
  });
};
