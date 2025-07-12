// backend/index.js - Starting point of backend execution
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

// Import firebase admin
const admin = require('firebase-admin');
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

const cassandraClient = require('./cassandra');
const redisClient = require('./redis');
const processBatchClicks = require('./processBatchClicks');

// Import routes
const shortenRoutes = require('./routes/shorten');
const analyticsRoutes = require('./routes/analytics');
const redirectRoutes = require('./routes/redirect');

const app = express();
const allowedOrigin = process.env.FRONTEND_URL;

app.use(cors({ origin: allowedOrigin })); // Restrict the backend server to certain origin
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public'))); // Serve static assets
app.use(express.urlencoded({ extended: true }));  // For reading form submissions in express

// Use routes
app.use('/api/shorten', shortenRoutes);
app.use('/api/links/analytics', analyticsRoutes);
app.use('/', redirectRoutes); // for /:id

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: allowedOrigin } });
global.io = io;

setInterval(() => processBatchClicks(redisClient, cassandraClient, io), 60 * 1000); // every 60 seconds

(async () => {
  const PORT = process.env.PORT || 4000;

  // Connect to Redis cache first
  try {
    await redisClient.connect();
    console.log("Redis client connected");
  } catch (err) {
    console.error("Failed to connect to Redis:", err.message);
    process.exit(1);
  }

  // Connect to Cassandra client
  try {
    await cassandraClient.connect();
    console.log("Cassandra client connected");
  } catch (err) {
    console.error("Failed to connect to Cassandra:", err.message);
    process.exit(1);
  }
  
  server.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`)
  });
})(); 