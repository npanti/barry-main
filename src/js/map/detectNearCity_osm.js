// Find nearest city using OpenStreetMap Nominatim API
export const detectNearCity_osm = (point) => {
  return new Promise((resolve) => {
    const [lon, lat] = point;
    
    // Use Nominatim reverse geocoding API to find nearest city
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1&zoom=10&limit=1`;
    
    fetch(url, {
      headers: {
        'User-Agent': 'Barry Meeting Point Calculator' // Required by Nominatim
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        // Check if we found a valid location
        if (data && data.address) {
          const address = data.address;
          
          // Try to find city/town/village in order of preference
          const cityName = address.city || 
                          address.town || 
                          address.village || 
                          address.municipality || 
                          address.hamlet ||
                          address.suburb;
          
          if (cityName) {
            window.$barry.log(
              `On se retrouve donc à <b>${cityName}</b>`
            );
            // Return the coordinates from Nominatim response
            resolve([parseFloat(data.lon), parseFloat(data.lat)]);
          } else {
            // No city found, return original point
            window.$barry.log("Aucune ville trouvée à proximité");
            resolve(point);
          }
        } else {
          // No results found
          window.$barry.log("Aucune ville trouvée à proximité");
          resolve(point);
        }
      })
      .catch(error => {
        console.error('Reverse geocoding error:', error);
        window.$barry.log("Erreur lors de la recherche de ville");
        resolve(point); // Return original point on error
      });
  });
};
