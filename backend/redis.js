// backend/redis.js - Redis connection file

require('dotenv').config();
const { createClient } = require('redis');

if (!process.env.REDIS_URL) {
  console.error('Missing REDIS_URL environment variable');
  process.exit(1);
}
if (!process.env.REDIS_USERNAME) {
  console.error('Missing REDIS_USERNAME environment variable');
  process.exit(1);
}
if (!process.env.REDIS_PASSWORD) {
  console.error('Missing REDIS_PASSWORD environment variable');
  process.exit(1);
}
if (!process.env.REDIS_PORT) {
  console.error('Missing REDIS_PORT environment variable');
  process.exit(1);
}

// Create redis client with username, password, url and port
const client = createClient({
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_URL,
        port: process.env.REDIS_PORT
    }
});

module.exports = client;