import express from "express";
import cors from "cors";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const app = express();
const port = 3000;

// Middleware and static files
app.use(express.json());
app.use(cors());
app.use(express.static("public"));
app.set("view engine", "ejs");

// Global variable to store the latest ML output
let latestMlOutput = null;

// Track connected sensors and their last activity
const sensorStatus = {};
const browserClients = new Set();

/**
 * Processes a video frame through a Huggingface ML model.
 * @param {string} frame - The video frame data (e.g., base64-encoded image)
 * @returns {Promise<any>} - The output from the ML model
 */
const processFrameThroughML = async (frame) => {
  try {
    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${process.env.HF_MODEL}`,
      { inputs: frame },
      { headers: { Authorization: `Bearer ${process.env.HF_API_KEY}` } }
    );
    return response.data;
  } catch (error) {
    console.error("Error processing frame through Huggingface:", error);
    return null;
  }
};

// Create HTTP server and attach the WebSocket server
const server = createServer(app);
server.listen(port, "0.0.0.0", () => {
  console.log(`Server listening on port ${port}`);
});

const wss = new WebSocketServer({ server });

function heartbeat() {
  this.isAlive = true;
}

// Broadcast data to all browser clients
function broadcastToClients(data) {
  browserClients.forEach(client => {
    if (client.readyState === client.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

// Listen for connections from ESP8266
wss.on("connection", (ws, req) => {
  console.log("New client connected");
  ws.isAlive = true;
  ws.on("pong", heartbeat);
  
  // Identify client type
  ws.isBrowser = req.headers.origin !== undefined;
  
  if (ws.isBrowser) {
    browserClients.add(ws);
    
    // Send the current sensor status to new browser client
    Object.entries(sensorStatus).forEach(([id, status]) => {
      ws.send(JSON.stringify({
        ...status,
        sensorId: id,
        isConnected: (Date.now() - status.lastSeen < 60000)
      }));
    });
  }

  ws.on("message", async (data) => {
    try {
      const parsedData = JSON.parse(data.toString());
      
      // Browser ping to keep connection alive
      if (parsedData.type === 'ping') {
        return;
      }
      
      // Handle ESP8266 data
      const { distance, temperature, humidity, sensorId } = parsedData;

      // Check if the message contains ultrasonic sensor data
      if (distance !== undefined && sensorId) {
        console.log("ESP8266 connected");
        console.log(`Ultrasonic Sensor ID: ${sensorId} - Distance: ${distance} cm`);
        
        // Update sensor status
        sensorStatus[sensorId] = {
          distance,
          temperature,
          humidity,
          lastSeen: Date.now(),
          isConnected: true
        };
        
        // Broadcast data to all browser clients
        broadcastToClients({
          distance,
          temperature,
          humidity,
          sensorId,
          isConnected: true
        });
      }

      // Send acknowledgment back to ESP8266
      ws.send(JSON.stringify({ status: "success", message: "Data received" }));
    } catch (error) {
      console.error("Error processing incoming data:", error);
      ws.send(JSON.stringify({ status: "error", message: "Invalid data format" }));
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
    if (ws.isBrowser) {
      browserClients.delete(ws);
    }
  });
});

// Check sensor status periodically and notify if disconnected
setInterval(() => {
  const now = Date.now();
  Object.entries(sensorStatus).forEach(([sensorId, status]) => {
    const wasConnected = status.isConnected;
    const isConnected = now - status.lastSeen < 60000; // Consider disconnected after 60 seconds
    
    if (wasConnected !== isConnected) {
      sensorStatus[sensorId].isConnected = isConnected;
      broadcastToClients({
        sensorId,
        isConnected,
        distance: status.distance,
        temperature: status.temperature,
        humidity: status.humidity
      });
    }
  });
}, 10000); // Check every 10 seconds

// If a client does not respond with a pong within the interval, terminate it.
const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) {
        console.log('Terminating a dead connection');
        if (ws.isBrowser) {
          browserClients.delete(ws);
        }
        return ws.terminate();
      }
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);
  
  wss.on('close', () => {
    clearInterval(interval);
  });

// API endpoint to fetch the latest ML output for the front-end
app.get("/ml-output", (req, res) => {
  res.json({ mlOutput: latestMlOutput });
});

// Render the main page and pass the ML output to the view
app.get("/", (req, res) => {
  res.render("index", { mlOutput: latestMlOutput });
});
