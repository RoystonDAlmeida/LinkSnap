const cassandraClient = require('../cassandra');
const { base62Encode } = require('../base62');

// Handler function for shortening longUrl
async function shortenUrl(req, res) {
  const { longUrl } = req.body;
  if (!longUrl) return res.status(400).json({ error: 'No URL provided' });

  try {
    const counterQuery = "UPDATE url_counter SET seq = seq + 1 WHERE id = 'global';";
    const selectQuery = "SELECT seq FROM url_counter WHERE id = 'global';";

    // Execute the counter query
    await cassandraClient.execute(counterQuery);
    const result = await cassandraClient.execute(selectQuery);

    const nextId = result.rows[0].seq.low || result.rows[0].seq;
    const shortId = base62Encode(nextId);
    const userId = req.user.uid;

    const createdAt = new Date();

    // Generate the short URL using shortId
    const shortUrl = `${process.env.BASE_URL}/${shortId}`;
    
    // Insert the new short_url generated into 'urls' table
    const insertQuery = 'INSERT INTO urls (id, created_at, long_url, short_url, status, user_id) VALUES (?, ?, ?, ?, ?, ?)';
    await cassandraClient.execute(
      insertQuery,
      [shortId, createdAt, longUrl, shortUrl, 'active', userId],
      { prepare: true }
    );

    // Insert the (id, long_url) combination into 'urls_by_id' table
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
}

module.exports = { shortenUrl }; 