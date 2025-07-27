import { addPoint } from "./addPoint";

// Geocode address using OpenStreetMap Nominatim API
export const getPlace_osm = (address, id) => {
  if (address.trim() !== "") {
    // Use Nominatim search API to convert address to coordinates
    const encodedAddress = encodeURIComponent(address.trim());
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&addressdetails=1`;
    
    return fetch(url, {
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
        if (data && data.length > 0) {
          const location = data[0];
          addPoint(
            parseFloat(location.lon),
            parseFloat(location.lat),
            window.$barry.addressColor,
            id
          );
        } else {
          throw new Error(`Aucune adresse trouvée pour: ${address}`);
        }
      })
      .catch(error => {
        console.error('Geocoding error:', error);
        alert(`Erreur lors de la recherche d'adresse: ${error.message}`);
      });
  }
  window.$barry.canCalculate();
};
