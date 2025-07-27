// import { calcPath } from "../map/calcPath";
import { calcPath_osm } from "../map/calcPath_osm";
// Method to compute the midpoint of the longest path between all given places
export const longMiddle = () => {
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
              `${keys[i]};${keys[j]}`
            )
          );
          }

    // Once all routes are calculated, determine the longest one
    Promise.all(prms).then((values) => {
      // Initialize trackers for maximum distance/time and key of that route
      let maxDist = 0;
      let maxTime = 0;
      let keep = values[0].key;
      console.log(values);

      // Iterate through each route result to log details and find the longest
      for (let i = 0; i < values.length; i++) {
        // Extract time and distance from the result
        const t = Number.parseFloat(values[i].totalTime);
        const d = Number.parseFloat(values[i].totalDistance);
        const hours = Math.floor(t / 3600);
        const mins = Math.floor((t / 60) % 60);
        const cities = values[i].key.split(";");

        // Log each route's distance and duration
        window.$barry.log(
          `Entre "${document.querySelector(`input[data-city="${cities[0]}"]`).value}" et ` +
          `"${document.querySelector(`input[data-city="${cities[1]}"]`).value}" il y a ${Math.round((100 * d) / 1000) / 100} km en ${hours}h${mins < 10 ? `0${mins}` : mins}`,
          1
        );

        // Update longest route based on selected calculation mode
        if (
          (window.$barry.calculateMode === "time" && t > maxTime) ||
          (window.$barry.calculateMode === "distance" && d > maxDist)
        ) {
          maxDist = d;
          maxTime = t;
          keep = values[i].key;
        }
      }

      // Log which route is the longest
      const points = keep.split(";");
      window.$barry.log(
        `Le trajet le plus long (en ${window.$barry.calculateMode === "time" ? "temps" : "distance"}) est donc entre ` +
        `"${document.querySelector(`input[data-city="${points[0]}"]`).value}" et ` +
        `"${document.querySelector(`input[data-city="${points[1]}"]`).value}"`,
        1
      );

      // Compute the midpoint on the longest route
      window.$barry.log("Je calcule le point à mi-temps.", 1);
      if (points.length > 1) {
        calcPath_osm(
          window.$barry.places[points[0]],
          window.$barry.places[points[1]],
          "",
          true
        ).then((res) => {
          console.log(res)
          // Traverse instructions to find where half of the route is reached
          let currentInstructions = null;
          const nbInstructions = res.routeInstructions.length;
          let time = 0;
          let km = 0;
          const midTime = Math.round(maxTime / 2);
          const midDist = Math.round(maxDist / 2);
          for (let i = 0; i < nbInstructions; i++) {
            km += Number.parseFloat(res.routeInstructions[i].distance);
            time += Number.parseFloat(res.routeInstructions[i].duration);
            currentInstructions = res.routeInstructions[i];
            if (
              ("time" === window.$barry.calculateMode && time > midTime) ||
              ("distance" === window.$barry.calculateMode && km > midDist)
            )
              break;
          }

          // Calculate exact coordinate within the final instruction segment
          if (currentInstructions != null) {
            let delta = 0;
            if ("time" === window.$barry.calculateMode) {
              delta = (time - midTime) / Number.parseFloat(currentInstructions.duration);
            } else if ("distance" === window.$barry.calculateMode) {
              delta = (km - midDist) / Number.parseFloat(currentInstructions.distance);
            }
            window.$barry.log("Le point est trouvé.", 1);
            resolve(
              currentInstructions.geometry.coordinates[
              Math.round((1 - delta) * currentInstructions.geometry.coordinates.length)
              ]
            );
          }
        });
      } else {
        // No valid route pairs to compute
        reject("Pas de point trouvé");
      }
    });
  });
};
