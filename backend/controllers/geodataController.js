const cassandraClient = require('../cassandra');
const redisClient = require('../redis');

// Handler function to get geodata grouped by link_id for all links of a user
async function getUserGeodataByLink(req, res) {
  const userId = req.user.uid;
  const cacheKey = `geodataByLink:${userId}`;

  try {
    // Check cache first
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    // Get all link ids for this user
    const linksResult = await cassandraClient.execute(
      'SELECT id FROM urls WHERE user_id = ?',
      [userId],
      { prepare: true }
    );

    const linkIds = linksResult.rows.map(row => row.id);
    if (linkIds.length === 0) {
      return res.status(200).json({ geodataByLink: {} });
    }
    
    // For each link id, get geodata and group by link_id
    const geodataByLink = {};
    for (const linkId of linkIds) {
      const geoResult = await cassandraClient.execute(
        'SELECT * FROM link_click_geodata WHERE user_id = ? AND link_id = ?',
        [userId, linkId],
        { prepare: true }
      );
      geodataByLink[linkId] = geoResult.rows;
    }
    
    // Cache the result for 30 seconds
    await redisClient.setEx(cacheKey, 30, JSON.stringify({ geodataByLink }));
    res.status(200).json({ geodataByLink });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
}

module.exports = { getUserGeodataByLink }; 