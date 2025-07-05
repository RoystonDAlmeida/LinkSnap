// backend/cassandra.js - Cassandra driver definition
const { Client } = require("cassandra-driver");

// Load env variables
require('dotenv').config();

// Check for required env variables
try {
  if (!process.env.CASSANDRA_DB_SCB_PATH) throw new Error('Missing CASSANDRA_DB_SCB_PATH');
  if (!process.env.CASSANDRA_DB_CLIENT_ID) throw new Error('Missing CASSANDRA_DB_CLIENT_ID');
  if (!process.env.CASSANDRA_DB_CLIENT_SECRET) throw new Error('Missing CASSANDRA_DB_CLIENT_SECRET');
} catch (err) {
  console.error('Cassandra connection error:', err.message);
  process.exit(1);
}

// Define cassandra client config
const client = new Client({
    cloud: {
        secureConnectBundle: process.env.CASSANDRA_DB_SCB_PATH,
    },
    credentials: {
        username: process.env.CASSANDRA_DB_CLIENT_ID,
        password: process.env.CASSANDRA_DB_CLIENT_SECRET,
    },
  });

module.exports = client; 