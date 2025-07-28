// Calculate route using OSRM API
export const calcPath_osm = (start, end, key, routeInstructions = false) => {
  return new Promise((resolve, reject) => {
    // Format coordinates for OSRM API: longitude,latitude;longitude,latitude
    const coordinates = `${start[0]},${start[1]};${end[0]},${end[1]}`;
    const url = `https://router.project-osrm.org/route/v1/car/${coordinates}?geometries=geojson&overview=full`;

    // Add steps parameter if route instructions are needed
    const finalUrl = routeInstructions ? `${url}&steps=true` : url;
    
    fetch(finalUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (data.code !== 'Ok') {
          throw new Error(`OSRM API error: ${data.message || 'Unknown error'}`);
        }
        
        const route = data.routes[0];
        
        // Transform OSRM response to match expected format
        const result = {
          key: key,
          totalTime: route.duration, // in seconds
          totalDistance: route.distance, // in meters
          routeGeometry: route.geometry,
          routeInstructions: routeInstructions ? route.legs[0].steps.map(step => ({
            distance: step.distance,
            duration: step.duration,
            geometry: step.geometry
          })) : []
        };
        
        resolve(result);
      })
      .catch(error => {
        console.error('Route calculation error:', error);
        alert(`Erreur lors du calcul d'itinéraire: ${error.message}`);
        reject(error);
      });
  });
};
