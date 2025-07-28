import { fitToBox } from "../map/fitToBox";
import { drawMiddle } from "../map/drawMiddle";
// import { detectNearCity } from "../map/detectNearCity";
import { detectNearCity_osm } from "../map/detectNearCity_osm";
import { addPoint } from "../map/addPoint";
import { longMiddle } from "../methods/longMiddle";
import { average } from "../methods/average";
import { center } from "../methods/center";

// Main function activated when the user starts the calculation process
window.$barry.calculate = () => {
  // Reset log area and display loading spinner
  window.$barry.$logContent.innerHTML = "";
  window.$barry.$log.classList.remove("hide");
  window.$barry.$spinner.classList.remove("hide");
  
  // Build URL hash slug based on current mode and input addresses
  const slug = [];
  slug.push(window.$barry.calculateMode);
  document.querySelectorAll(".address").forEach((a) => {
    const val = a.querySelector("input").value;
    if ("" == val) {
      window.$barry.removeAddress(a.id);
    } else {
      slug.push(val);
      a.querySelectorAll("button").forEach((e) => e.classList.add("hide"));
    }
  });
  window.location.hash = btoa(slug.join("|"));
  
  // Log start of search for meeting point
  window.$barry.log(
    "C'est parti pour rechercher votre point de rencontre équitable"
  );

  // Define the three calculation methods and their corresponding weights
  const methods = [longMiddle(), average(), center()];
  const verbalMethods = ["longMiddle", "average", "center"];
  const weightMethods = [10, 2, 1];

  // Run all methods in parallel and handle the results
  Promise.all(methods).then((values) => {
    // Log completion of individual method computations
    window.$barry.log(
      "J'ai fini les différents calculs, je prend maintenant la moyenne des coordonnées.",
      1
    );
    
    // Initialize accumulators for weighted average
    let lon = 0;
    let lat = 0;
    let count = 0;

    // If more than two places, apply weighted average across all methods
    if (Object.keys(window.$barry.places).length > 2) {
      values.map((v, i) => {
        for (let j = 0; j < weightMethods[i]; j++) {
          lon += Number.parseFloat(v[0]);
          lat += Number.parseFloat(v[1]);
          count++;
        }
        addPoint(
          v[0],
          v[1],
          window.$barry.methods[verbalMethods[i]].color,
          verbalMethods[i]
        );
      });
      lon /= count;
      lat /= count;
    } else if (values) {
      // Fallback when only one result is available
      lon = values[0][0];
      lat = values[0][1];
      addPoint(
        lon,
        lat,
        window.$barry.methods[verbalMethods[0]].color,
        verbalMethods[0]
      );
    }

    // Log and mark the computed meeting point
    window.$barry.log(`On se retrouve à [${lon}, ${lat}]`, 1);
    window.$barry.log("Je cherche la ville la plus proche du point.", 1);
    addPoint(lon, lat, window.$barry.resultColor, "result");

    // Find the nearest city to the computed point and display POIs
    detectNearCity_osm([lon, lat]).then((coord) => {
      if (coord[0] === coord[1] && coord[0] === 0) {
        window.$barry.log(
          "Pas de ville trouvée proche, je suis désolé mais va falloir le faire à la main."
        );
      } else {
        drawMiddle(coord, window.$barry.resultColor, "result");
        fitToBox();
        window.$barry.meetPoint = coord;
        window.$barry.$pois.classList.remove("hide");
      }
      // Final UI updates after computation and city detection
      window.$barry.$spinner.classList.add("hide");
      window.$barry.$calculate.classList.add("hide");
      window.$barry.$newsearch.classList.remove("hide");
    });
  });
};
