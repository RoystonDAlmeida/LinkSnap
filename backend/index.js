// backend/index.js - Starting point of backend execution
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Import firebase admin
const admin = require('firebase-admin');

// Import cassandra client for connection with cassandra
const cassandraClient = require('./cassandra');

// Import base62 function for generating IDs for long URLs
const { base62Encode } = require('./base62');

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

    // Insert the record into the table
    const insertQuery = 'INSERT INTO urls (id, long_url, short_url, user_id, created_at) VALUES (?, ?, ?, ?, ?)';
    await cassandraClient.execute(insertQuery, [shortId, longUrl, shortUrl, userId, createdAt], { prepare: true });

    res.status(200).json({ shortUrl });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Redirect endpoint
app.get('/:id', async (req, res) => {
  const { id } = req.params;

  // No id provided
  if (!id || typeof id !== 'string' || id.trim() === '') {
    return res.status(400).send('Invalid or missing short URL id.');
  }

  const query = 'SELECT long_url FROM urls WHERE id = ?';
  try {
    const result = await cassandraClient.execute(query, [id], { prepare: true });

    // No record found for this id
    if (result.rowLength === 0) {
      return res.status(404).send('Short URL not found.');
    }

    const longUrl = result.rows[0].long_url;

    // long_url is missing or not a valid URL
    if (!longUrl || typeof longUrl !== 'string' || !/^https?:\/\//i.test(longUrl)) {
      return res.status(400).send('Invalid destination URL.');
    }

    // Redirect(status code: 302) to the original long URL
    res.status(302).redirect(longUrl);
  } catch (err) {
    // Database error
    console.error('Database error during redirect:', err);
    res.status(500).send('Database error');
  }
});

(async () => {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => { 
    console.log(`Backend running on port ${PORT}`)
 });

 // Connect to Cassandra client
  try {
    await cassandraClient.connect();
    console.log("Cassandra client connected");
  } catch (err) {
    console.error("Failed to connect to Cassandra:", err.message);
    process.exit(1);
  }
})(); 