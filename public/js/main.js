document.addEventListener('DOMContentLoaded', () => {
  const sensorId = document.getElementById('sensor-id');
  const distanceValue = document.getElementById('distance-value');
  const waterLevel = document.getElementById('water-level');
  const statusIndicator = document.getElementById('status-indicator');
  const temperatureElement = document.getElementById('temperature');
  const humidityElement = document.getElementById('humidity');
  const connectionStatus = document.getElementById('connection-status');
  const lastUpdate = document.getElementById('last-update');

  // Convert distance to water level height (lower distance = higher water)
  const calculateWaterLevel = (distance) => {
    // Assuming max distance is 300cm (empty) and min is 10cm (full)
    const maxDistance = 300;
    const minDistance = 10;
    const clampedDistance = Math.min(Math.max(distance, minDistance), maxDistance);
    
    // Invert the percentage (closer = higher water level)
    const percentage = ((maxDistance - clampedDistance) / (maxDistance - minDistance)) * 100;
    return Math.max(0, Math.min(100, percentage));
  };

  // Update status indication based on water level
  const updateStatus = (waterLevelPercentage, isConnected = true) => {
    let status, color;
    
    if (!isConnected) {
      status = 'Disconnected';
      color = 'secondary';
    } else if (waterLevelPercentage < 20) {
      status = 'Low';
      color = 'success';
    } else if (waterLevelPercentage < 60) {
      status = 'Normal';
      color = 'info';
    } else if (waterLevelPercentage < 80) {
      status = 'High';
      color = 'warning';
    } else {
      status = 'Critical';
      color = 'danger';
    }
    
    statusIndicator.innerHTML = `Status: <span class="badge bg-${color}">${status}</span>`;
    
    // Update map if the function exists
    if (window.updateMapForWaterLevel) {
      window.updateMapForWaterLevel(waterLevelPercentage);
    }
  };

  // Format timestamp
  const formatTimestamp = () => {
    const now = new Date();
    return now.toLocaleTimeString() + ' ' + now.toLocaleDateString();
  };

  // Connect to WebSocket server
  const connectWebSocket = () => {
    // Use secure WebSocket if the page is served over HTTPS
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      connectionStatus.innerHTML = '<span class="badge bg-success">Connected to Server</span>';
    };
    
    ws.onclose = () => {
      connectionStatus.innerHTML = '<span class="badge bg-danger">Disconnected from Server</span>';
      // Try to reconnect after 5 seconds
      setTimeout(connectWebSocket, 5000);
    };
    
    ws.onerror = () => {
      connectionStatus.innerHTML = '<span class="badge bg-danger">Connection Error</span>';
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.sensorId) {
          // Update sensor information
          sensorId.textContent = `Sensor ID: ${data.sensorId}`;
          
          if (data.isConnected === false) {
            // Handle disconnected sensor
            distanceValue.textContent = "Distance: Not available";
            updateStatus(0, false);
            waterLevel.style.height = "0%";
            waterLevel.classList.add('disconnected');
            if (data.temperature !== undefined) {
              temperatureElement.textContent = data.temperature;
            } else {
              temperatureElement.textContent = "--";
            }
            
            if (data.humidity !== undefined) {
              humidityElement.textContent = data.humidity;
            } else {
              humidityElement.textContent = "--";
            }
          } else if (data.distance !== undefined) {
            // Connected sensor with data
            distanceValue.textContent = `Distance: ${data.distance} cm`;
            waterLevel.classList.remove('disconnected');
            
            // Update water level visualization
            const levelPercentage = calculateWaterLevel(data.distance);
            waterLevel.style.height = `${levelPercentage}%`;
            updateStatus(levelPercentage, true);
            
            // Update temperature and humidity if available
            if (data.temperature !== undefined) {
              temperatureElement.textContent = data.temperature;
            }
            
            if (data.humidity !== undefined) {
              humidityElement.textContent = data.humidity;
            }
            
            // Update timestamp
            lastUpdate.textContent = `Last update: ${formatTimestamp()}`;
          }
        }
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    };
    
    // Keep connection alive
    setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000);
  };
  
  // Initial connection
  connectWebSocket();
});
