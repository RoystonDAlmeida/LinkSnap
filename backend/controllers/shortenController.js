const cassandraClient = require('../cassandra');
const { base62Encode } = require('../base62');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

// Helper to generate a varied integer from longUrl and timestamp
function hashUrlToInt(url, timestamp) {
  const hash = crypto.createHash('sha256').update(url + timestamp).digest('hex');
  return parseInt(hash.slice(0, 12), 16); // Use first 12 hex digits for a large int
}

// Handler function for shortening longUrl
async function shortenUrl(req, res) {
  const { longUrl, password, expiresAt } = req.body;
  if (!longUrl) return res.status(400).json({ error: 'No URL provided' });

  try {
    // Validate password if provided
    let password_hash = null;
    if (password) {
      if (typeof password !== 'string' || password.length < 4)
        return res.status(400).json({ error: 'Password must be at least 4 characters.' });
      password_hash = await bcrypt.hash(password, 10);
    }

    // Validate expiration date if provided
    let expires_at = null;
    if (expiresAt) {
      const date = new Date(expiresAt);
      if (isNaN(date.getTime()) || date < new Date())
        return res.status(400).json({ error: 'Expiration date must be a valid future date.' });
      expires_at = date;
    }

    const counterQuery = "UPDATE url_counter SET seq = seq + 1 WHERE id = 'global';";
    const selectQuery = "SELECT seq FROM url_counter WHERE id = 'global';";

    // Execute the counter query
    await cassandraClient.execute(counterQuery);
    const result = await cassandraClient.execute(selectQuery);

    const createdAt = new Date();
    const userId = req.user.uid;

    // Collision-safe shortId generation using urls_by_id
    let shortId, hashInt, exists, salt = 0;
    const checkQuery = 'SELECT id FROM urls_by_id WHERE id = ?';

    do {
      // Add a random salt to timestamp for extra uniqueness
      hashInt = hashUrlToInt(longUrl, createdAt.getTime() + salt);
      shortId = base62Encode(hashInt);

      const checkResult = await cassandraClient.execute(checkQuery, [shortId], { prepare: true });
      exists = checkResult.rowLength > 0;

      salt = Math.floor(Math.random() * 1000000); // new salt for next try
    } while (exists);

    // Generate the short URL using shortId
    const shortUrl = `${process.env.BASE_URL}/${shortId}`;
    
    // Insert the new short_url generated into 'urls' table
    const insertQuery = 'INSERT INTO urls (id, created_at, long_url, short_url, status, user_id, password_hash, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    await cassandraClient.execute(
      insertQuery,
      [shortId, createdAt, longUrl, shortUrl, 'active', userId, password_hash, expires_at],
      { prepare: true }
    );

    // Insert the (id, long_url) combination into 'urls_by_id' table, with password_hash and expires_at
    const insertByIdQuery = 'INSERT INTO urls_by_id (id, long_url, password_hash, expires_at) VALUES (?, ?, ?, ?)';
    await cassandraClient.execute(
      insertByIdQuery,
      [shortId, longUrl, password_hash, expires_at],
      { prepare: true }
    );

    res.status(200).json({ shortUrl });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
}

module.exports = { shortenUrl }; 