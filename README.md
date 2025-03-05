# Smart Drainage Monitoring System

## Project Overview

The Smart Drainage Monitoring System is an IoT solution designed to monitor and visualize drainage conditions in urban areas, specifically in Eldoret, Kenya. The system provides real-time data on water levels in drainage infrastructure, helping to prevent flooding and facilitate timely maintenance interventions.

### Key Features

- Real-time water level monitoring in drainage pipes
- Environmental data tracking (temperature and humidity)
- Interactive map visualization of drainage infrastructure
- Potential flood zone highlighting based on water levels
- Responsive design for both desktop and mobile devices

## System Architecture

The system follows a client-server architecture with WebSocket communication for real-time data transfer.

```
┌─────────────┐     WebSocket     ┌───────────────┐
│ ESP8266     ├──────────────────►│ Node.js       │
│ Sensors     │    (Data)         │ Server        │
└─────────────┘                   └───────┬───────┘
                                          │
                                          │ WebSocket
                                          ▼
┌─────────────┐     HTTP/WS      ┌───────────────┐
│ Browser     │◄────────────────►│ Frontend      │
│ Clients     │                  │ Application   │
└─────────────┘                  └───────────────┘
```

### Backend Components

- **Express Server**: Handles HTTP requests and serves static files
- **WebSocket Server**: Enables real-time bidirectional communication
- **Sensor Data Processor**: Validates and processes incoming sensor data
- **Huggingface ML Integration**: Processes visual data for additional insights

### Frontend Components

- **Dashboard UI**: Displays sensor readings and status information
- **Map Visualization**: Shows drainage infrastructure and potential flood zones
- **Connection Monitor**: Tracks sensor connectivity status

## Data Flow

```
┌─────────────┐      ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│ Water Level │      │ Temperature/ │      │ WebSocket    │      │ Browser      │
│ Sensor      ├─────►│ Humidity     ├─────►│ Server       ├─────►│ Clients      │
│ (Ultrasonic)│      │ Sensors      │      │              │      │              │
└─────────────┘      └──────────────┘      └──────────────┘      └──────────────┘
                                                  │
                                                  │
                                                  ▼
                                           ┌──────────────┐
                                           │ Potential    │
                                           │ ML Analysis  │
                                           │ (Optional)   │
                                           └──────────────┘
```

## Water Level Monitoring Logic

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Measure     │     │ Calculate   │     │ Update      │     │ Update Map  │
│ Distance to │────►│ Water Level │────►│ Status      │────►│ Visualization│
│ Water       │     │ Percentage  │     │ Indicators  │     │              │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                                              │
                                              │
                                              ▼
                                       ┌─────────────┐
                                       │ Determine   │
                                       │ Flood Risk  │
                                       └─────────────┘
```

## Map Visualization System

The map visualization uses Leaflet.js to display a street in Eldoret (Uganda Road) that represents the drainage system. The visualization changes based on the water level data.

```
┌─────────────┐     ┌─────────────┐     ┌─────────────────────┐
│ Water Level │     │ Threshold   │     │ Map Visual Update   │
│ Percentage  │────►│ Evaluation  │────►│                     │
└─────────────┘     └─────────────┘     │  < 20%: Normal      │
                                        │  < 60%: Normal      │
                                        │  < 80%: Warning     │
                                        │  ≥ 80%: Critical    │
                                        └─────────────────────┘
                                                  │
                                                  │
                                                  ▼
                                        ┌───────────────────┐
                                        │ Flood Zone        │
                                        │ Visibility        │
                                        │                   │
                                        │ Critical: Visible │
                                        │ Other: Hidden     │
                                        └───────────────────┘
```

## Installation and Setup

### Prerequisites

- Node.js (v14 or higher)
- NPM or Yarn package manager
- ESP8266 with ultrasonic sensor and DHT sensor

### Environment Setup

1. Clone the repository:
   ```
   git clone https://github.com/username/smart-traffic.git
   cd smart-traffic
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```
   PORT=3000
   HF_API_KEY=your_huggingface_api_key
   HF_MODEL=model_name
   ```

### Running the Application

Start the server:
```
node smartDrainage.js
```

Access the dashboard at `http://localhost:3000`

## Hardware Setup

### Components Required

- ESP8266 NodeMCU
- Ultrasonic sensor (HC-SR04)
- DHT22 Temperature and Humidity sensor
- Power supply
- Waterproof enclosure

### Wiring Diagram

```
┌───────────────┐          ┌───────────────┐
│ HC-SR04       │          │ DHT22         │
│ Ultrasonic    │          │ Temperature/  │
│ Sensor        │          │ Humidity      │
└───────┬───────┘          └───────┬───────┘
        │                          │
        │                          │
┌───────┴──────────────────────────┴───────┐
│                                          │
│               ESP8266                    │
│               NodeMCU                    │
│                                          │
└───────────────────┬──────────────────────┘
                    │
                    │ WiFi
                    ▼
            ┌───────────────┐
            │     Server    │
            └───────────────┘
```

## Usage Guide

### Dashboard Interpretation

- **Water Level Indicator**: Shows the current water level in the drainage pipe
- **Status Indicator**: Displays the current status (Low, Normal, High, Critical)
- **Environmental Data**: Shows temperature and humidity readings
- **Map Visualization**: Displays the drainage pipe location and potential flood zones

### Status Codes

| Status    | Water Level | Color  | Action Required                            |
|-----------|-------------|--------|-------------------------------------------|
| Low       | < 20%       | Green  | Normal operation, no action needed         |
| Normal    | 20% - 60%   | Blue   | Normal operation, monitoring recommended   |
| High      | 60% - 80%   | Yellow | Increased monitoring, prepare for action   |
| Critical  | > 80%       | Red    | Immediate action required, flooding risk   |

### Map Legend

- **Blue Line**: Normal water level in drainage
- **Orange Line**: High water level in drainage
- **Red Line**: Critical water level with flooding risk
- **Red Shaded Area**: Potential flood zone

## Troubleshooting

### Common Issues

1. **No data received from sensors**
   - Check sensor connectivity
   - Verify WiFi connection on ESP8266
   - Check WebSocket server status

2. **Map not loading**
   - Ensure internet connection (required for OpenStreetMap tiles)
   - Check browser console for JavaScript errors

3. **Inaccurate water level readings**
   - Calibrate ultrasonic sensor
   - Check for obstructions in the sensor path

## Contributing

Contributions to the Smart Drainage Monitoring System are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.