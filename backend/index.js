// backend/index.js - Starting point of backend execution
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const redisClient = require('./redis');
const http = require('http');
const { Server } = require('socket.io');

// Import firebase admin
const admin = require('firebase-admin');

// Import cassandra client for connection with cassandra
const cassandraClient = require('./cassandra');

// Import base62 function for generating IDs for long URLs
const { base62Encode } = require('./base62');

// Import processBatchClicks function for processing URL clicks from redis and insertion to cassandra
const processBatchClicks = require('./processBatchClicks');

const app = express();
const allowedOrigin = process.env.FRONTEND_URL;
app.use(cors({ origin: allowedOrigin }));    // Restrict CORS to frontend
app.use(bodyParser.json());

// Initialize Firebase Admin(with service account key)
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Middleware to verify Firebase token
async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  // Validate the authHeader is present
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });
  const token = authHeader.split(' ')[1];

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Shorten URL endpoint
app.post('/api/shorten', authenticate, async (req, res) => {
  const { longUrl } = req.body;

  // Verify if longURL is present
  if (!longUrl) return res.status(400).json({ error: 'No URL provided' });

  try {
    // 1. Increment and get the next sequence number from Cassandra counter table
    const counterQuery = "UPDATE url_counter SET seq = seq + 1 WHERE id = 'global';";
    const selectQuery = "SELECT seq FROM url_counter WHERE id = 'global';";
    
    await cassandraClient.execute(counterQuery);
    
    const result = await cassandraClient.execute(selectQuery);
    const nextId = result.rows[0].seq.low || result.rows[0].seq;

    // 2. Encode the integer ID to Base62
    const shortId = base62Encode(nextId);

    // 3. Save the mapping in the urls table
    const userId = req.user.uid;
    const createdAt = new Date();
    const shortUrl = `${process.env.BASE_URL}/${shortId}`;

    // Insert the record into the main urls table
    const insertQuery = 'INSERT INTO urls (id, clicks, created_at, long_url, short_url, status, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)';
    await cassandraClient.execute(
      insertQuery,
      [shortId, 0, createdAt, longUrl, shortUrl, 'active', userId],
      { prepare: true }
    );

    // Insert into urls_by_id for fast redirect
    const insertByIdQuery = 'INSERT INTO urls_by_id (id, long_url) VALUES (?, ?)';
    await cassandraClient.execute(
      insertByIdQuery,
      [shortId, longUrl],
      { prepare: true }
    );

    res.status(200).json({ shortUrl });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Redirect endpoint with Redis cache
app.get('/:id', async (req, res) => {
  const { id } = req.params;

  if (!id || typeof id !== 'string' || id.trim() === '') {
    return res.status(400).send('Invalid or missing short URL id.');
  }

  try {
    // 1. Try Redis cache first
    const cachedUrl = await redisClient.get(id);
    let userId;
    if (cachedUrl) {
      // Get userId for this id
      try {
        const userIdResult = await cassandraClient.execute(
          'SELECT user_id FROM urls WHERE id = ? ALLOW FILTERING',
          [id],
          { prepare: true }
        );
        if (userIdResult.rowLength > 0) {
          userId = userIdResult.rows[0].user_id;
          // Increment click count in Redis (batch write to Cassandra later)
          await redisClient.incr(`clicks:${userId}:${id}`);

          // Emit real-time update to frontend (sum of Cassandra + Redis)
          if (io) {
            // Get Redis count
            const redisClicks = Number(await redisClient.get(`clicks:${userId}:${id}`)) || 0;
            // Get Cassandra count
            let cassandraClicks = 0;
            try {
              const clicksResult = await cassandraClient.execute(
                'SELECT clicks FROM url_clicks WHERE user_id = ? AND id = ?',
                [userId, id],
                { prepare: true }
              );
              if (clicksResult.rowLength > 0) {
                cassandraClicks = Number(clicksResult.rows[0].clicks) || 0;
              }
            } catch {}
            // Emit the sum
            io.emit('clicksUpdated', { userId, id, newClicks: cassandraClicks + redisClicks });
          }
        }
      } catch (err) {
        console.error('Failed to increment clicks in Redis:', err);
      }
      return res.status(302).redirect(cachedUrl);
    }

    // 2. Fallback to Cassandra (use urls_by_id table)
    const query = 'SELECT long_url FROM urls_by_id WHERE id = ?';
    const result = await cassandraClient.execute(query, [id], { prepare: true });

    if (result.rowLength === 0) {
      return res.status(404).send('Short URL not found.');
    }

    const longUrl = result.rows[0].long_url;

    if (!longUrl || typeof longUrl !== 'string' || !/^https?:\/\//i.test(longUrl)) {
      return res.status(400).send('Invalid destination URL.');
    }

    // 3. Cache in Redis for 1 day (86400 seconds)
    await redisClient.setEx(id, 86400, longUrl);

    // Get userId for this id
    try {
      const userIdResult = await cassandraClient.execute(
        'SELECT user_id FROM urls WHERE id = ? ALLOW FILTERING',
        [id],
        { prepare: true }
      );
      if (userIdResult.rowLength > 0) {
        userId = userIdResult.rows[0].user_id;
        // Increment click count in Redis (batch write to Cassandra later)
        await redisClient.incr(`clicks:${userId}:${id}`);
        
        // Emit real-time update to frontend (sum of Cassandra + Redis)
        if (io) {
          // Get Redis count
          const redisClicks = Number(await redisClient.get(`clicks:${userId}:${id}`)) || 0;
          // Get Cassandra count
          let cassandraClicks = 0;
          try {
            const clicksResult = await cassandraClient.execute(
              'SELECT clicks FROM url_clicks WHERE user_id = ? AND id = ?',
              [userId, id],
              { prepare: true }
            );
            if (clicksResult.rowLength > 0) {
              cassandraClicks = Number(clicksResult.rows[0].clicks) || 0;
            }
          } catch {}
          // Emit the sum
          io.emit('clicksUpdated', { userId, id, newClicks: cassandraClicks + redisClicks });
        }
      }
    } catch (err) {
      console.error('Failed to increment clicks in Redis:', err);
    }

    res.status(302).redirect(longUrl);
  } catch (err) {
    console.error('Error during redirect:', err);
    res.status(500).send('Server error');
  }
});

// Endpoint to get links analytics (with Redis cache)
app.get('/api/links/analytics', authenticate, async (req, res) => {
    const userId = req.user.uid;
    const cacheKey = `analytics:${userId}`;
    try {
      // 1. Try Redis cache first
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return res.status(200).json(JSON.parse(cached));
      }

      // 2. Fetch from Cassandra (existing logic)
      const query = 'SELECT id, created_at, long_url, short_url, status FROM urls WHERE user_id = ?';
      const result = await cassandraClient.execute(query, [userId], { prepare: true });
      const links = await Promise.all(result.rows.map(async (row) => {
        // Fetch clicks from url_clicks table
        let clicks = 0;
        try {
          const clicksResult = await cassandraClient.execute(
            'SELECT clicks FROM url_clicks WHERE user_id = ? AND id = ?',
            [userId, row.id],
            { prepare: true }
          );
          if (clicksResult.rowLength > 0) {
            clicks = clicksResult.rows[0].clicks;
          }
        } catch (err) {
          // If error, keep clicks as 0
        }
        // Add Redis click count (real-time, not yet batched)
        let redisClicks = 0;
        try {
          const redisVal = await redisClient.get(`clicks:${userId}:${row.id}`);
          if (redisVal) redisClicks = Number(redisVal) || 0;
        } catch {}

        // Ensure both are numbers
        const clicksNum = Number(clicks) || 0;
        const redisClicksNum = Number(redisClicks) || 0;

        return {
          ...row,
          clicks: clicksNum + redisClicksNum,
        };
      }));

      // 3. Cache the result in Redis for 30 seconds
      await redisClient.setEx(cacheKey, 30, JSON.stringify({ links }));

      res.status(200).json({ links });
    } catch (err) {
      res.status(500).json({ error: 'Database error', details: err.message });
    }
});

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: allowedOrigin } });

setInterval(() => processBatchClicks(redisClient, cassandraClient, io), 60 * 1000); // every 60 seconds

(async () => {
  const PORT = process.env.PORT || 4000;

  // Connect to Redis client
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

  // Connect to both Redis and Cassandra before listening to the server
  server.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`)
  });
})(); 