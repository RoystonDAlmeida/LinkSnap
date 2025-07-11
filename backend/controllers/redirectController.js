const cassandraClient = require('../cassandra');
const redisClient = require('../redis');
const UAParser = require('ua-parser-js');
const logGeodata = require('../logGeodata');

// Handler function for redirect route
async function handleRedirect(req, res) {
  const { id } = req.params;

  if (!id || typeof id !== 'string' || id.trim() === '') {
    return res.status(400).send('Invalid or missing short URL id.');
  }

  try {
    // Check the cache first for existence of short url(id)
    const cachedUrl = await redisClient.get(id);
    let userId;

    if (cachedUrl) {
      try {
        const userIdResult = await cassandraClient.execute(
          'SELECT user_id FROM urls WHERE id = ? ALLOW FILTERING',
          [id],
          { prepare: true }
        );

        if (userIdResult.rowLength > 0) {
          userId = userIdResult.rows[0].user_id;
          await redisClient.incr(`clicks:${userId}:${id}`); // Increment the clicks associated with id

          const today = new Date().toISOString().slice(0, 10);
          
          // Track unique visitors
          let visitorId;
          if (req.user && req.user.uid) {
            visitorId = req.user.uid;
          } else {
            // For unauthenticated users
            visitorId = req.ip;
          }

          // Add unique visitors to the set and increment clicks 
          await redisClient.sAdd(`unique_users:${id}:${today}`, visitorId);
          await redisClient.incr(`clicks_daily:${id}:${today}`);

          const parser = new UAParser(req.headers['user-agent']);
          const deviceType = parser.getDevice().type || 'desktop';
          const osName = parser.getOS().name || 'Unknown';

          await redisClient.incr(`device:${id}:${today}:${deviceType}`);
          await redisClient.incr(`os:${id}:${today}:${osName}`);
          
          if (global.io) {
            const redisClicks = Number(await redisClient.get(`clicks:${userId}:${id}`)) || 0;
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
            global.io.emit('clicksUpdated', { userId, id, newClicks: cassandraClicks + redisClicks });
          }
          // Log geodata for this click
          await logGeodata(req, cassandraClient, id, userId);
        }
      } catch (err) {
        console.error('Failed to increment clicks in Redis:', err);
      }

      return res.status(302).redirect(cachedUrl);
    }

    // If id is not found in cache
    const query = 'SELECT long_url FROM urls_by_id WHERE id = ?';
    const result = await cassandraClient.execute(query, [id], { prepare: true });

    if (result.rowLength === 0) {
      return res.status(404).send('Short URL not found.');
    }

    // Get the long URL corresponding to short url(id)
    const longUrl = result.rows[0].long_url;
    if (!longUrl || typeof longUrl !== 'string' || !/^https?:\/\//i.test(longUrl)) {
      return res.status(400).send('Invalid destination URL.');
    }

    // Cache (id: longURL) for 24 hours
    await redisClient.setEx(id, 86400, longUrl);

    // If id is not found in cache
    try {
      const userIdResult = await cassandraClient.execute(
        'SELECT user_id FROM urls WHERE id = ? ALLOW FILTERING',
        [id],
        { prepare: true }
      );

      if (userIdResult.rowLength > 0) {
        userId = userIdResult.rows[0].user_id;
        await redisClient.incr(`clicks:${userId}:${id}`);

        const today2 = new Date().toISOString().slice(0, 10);

        let visitorId;
        if (req.user && req.user.uid) {
          visitorId = req.user.uid;
        } else {
          visitorId = req.ip;
        }

        await redisClient.sAdd(`unique_users:${id}:${today2}`, visitorId);
        await redisClient.incr(`clicks_daily:${id}:${today2}`);

        const parser2 = new UAParser(req.headers['user-agent']);
        const deviceType2 = parser2.getDevice().type || 'desktop';
        const osName2 = parser2.getOS().name || 'Unknown';

        await redisClient.incr(`device:${id}:${today2}:${deviceType2}`);
        await redisClient.incr(`os:${id}:${today2}:${osName2}`);

        if (global.io) {
          const redisClicks = Number(await redisClient.get(`clicks:${userId}:${id}`)) || 0;
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
          global.io.emit('clicksUpdated', { userId, id, newClicks: cassandraClicks + redisClicks });
        }
        // Log geodata for this click
        await logGeodata(req, cassandraClient, id, userId);
      }
    } catch (err) {
      console.error('Failed to increment clicks in Redis:', err);
    }
    
    res.status(302).redirect(longUrl);
  } catch (err) {
    console.error('Error during redirect:', err);
    res.status(500).send('Server error');
  }
}

module.exports = { handleRedirect }; 