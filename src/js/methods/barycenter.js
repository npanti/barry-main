export function barycenter() {
  return new Promise((resolve) => {
    const keys = Object.keys(window.$barry.places);
    // accumulate Cartesian coordinates for spherical centroid
    let x = 0;
    let y = 0;
    let z = 0;
    let count = 0;

    for (let i = 0; i < keys.length; i++) {
      if (keys[i].startsWith("place")) {
        const [lonDeg, latDeg] = window.$barry.places[keys[i]].map(Number.parseFloat);
        const lonRad = lonDeg * Math.PI / 180;
        const latRad = latDeg * Math.PI / 180;
        x += Math.cos(latRad) * Math.cos(lonRad);
        y += Math.cos(latRad) * Math.sin(lonRad);
        z += Math.sin(latRad);
        count++;
      }
    }

    // compute average vector
    if (count > 0) {
      x /= count;
      y /= count;
      z /= count;
    }
    // convert back to lat/lon
    const hyp = Math.sqrt(x * x + y * y);
    const latRad = Math.atan2(z, hyp);
    const lonRad = Math.atan2(y, x);
    const lat = latRad * 180 / Math.PI;
    const lon = lonRad * 180 / Math.PI;

    window.$barry.log("Je calcule le barycentre des villes.", 1);
    resolve([lon, lat]);
  });
}
