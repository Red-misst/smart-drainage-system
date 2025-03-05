document.addEventListener('DOMContentLoaded', () => {
  // Initialize the map centered at Eldoret, Kenya
  const map = L.map('drainage-map').setView([0.5143, 35.2698], 15);

  // Add OpenStreetMap base layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  // Define the drainage street coordinates (Uganda Road in Eldoret)
  const drainageStreetCoords = [
    [0.5143, 35.2698],  // Start point
    [0.5168, 35.2710],
    [0.5193, 35.2725],
    [0.5210, 35.2740],  // End point
  ];

  // Define the potential flood zone (polygon around the street)
  const floodZoneCoords = [
    [0.5133, 35.2688],
    [0.5158, 35.2700],
    [0.5183, 35.2715],
    [0.5220, 35.2750],
    [0.5220, 35.2730],
    [0.5190, 35.2710],
    [0.5153, 35.2678],
  ];

  // Create the drainage street polyline with initial normal state
  const drainageStreet = L.polyline(drainageStreetCoords, {
    color: '#3498db',
    weight: 6,
    opacity: 0.8
  }).addTo(map);

  // Create the flood zone polygon (initially hidden)
  const floodZone = L.polygon(floodZoneCoords, {
    color: '#e74c3c',
    fillColor: '#e74c3c',
    fillOpacity: 0,
    weight: 1
  }).addTo(map);

  // Add a label to the drainage street
  L.marker(drainageStreetCoords[1], {
    icon: L.divIcon({
      className: 'street-label',
      html: '<div style="background-color: rgba(255,255,255,0.7); padding: 2px 5px; border-radius: 3px;">Uganda Road Drainage</div>',
      iconSize: [100, 20],
      iconAnchor: [50, 10]
    })
  }).addTo(map);

  // Add event listener for water level changes
  window.updateMapForWaterLevel = function(levelPercentage) {
    if (levelPercentage < 20) {
      // Normal state
      drainageStreet.setStyle({ color: '#3498db' });
      floodZone.setStyle({ fillOpacity: 0 });
    } else if (levelPercentage < 60) {
      // Normal but higher
      drainageStreet.setStyle({ color: '#3498db' });
      floodZone.setStyle({ fillOpacity: 0 });
    } else if (levelPercentage < 80) {
      // Warning state
      drainageStreet.setStyle({ color: '#f39c12' });
      floodZone.setStyle({ fillOpacity: 0.1 });
    } else {
      // Critical state with flooding risk
      drainageStreet.setStyle({ color: '#e74c3c' });
      floodZone.setStyle({ fillOpacity: 0.3 });
    }
  };

  // Initialize the map with default state
  window.updateMapForWaterLevel(0);
});
