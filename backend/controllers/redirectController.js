const cassandraClient = require('../cassandra');
const redisClient = require('../redis');
const UAParser = require('ua-parser-js');
const logGeodata = require('../logGeodata');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const cassandra = require('cassandra-driver');

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
    let passwordAttempt = req.method === 'POST' ? (req.body.password || req.query.password) : undefined;
    let showForm = false;
    let formError = '';

    // --- Password/Expiration checks for cachedUrl ---
    if (cachedUrl) {
      // Fetch password_hash and expires_at from DB
      const metaResult = await cassandraClient.execute(
        'SELECT password_hash, expires_at, user_id, status FROM urls WHERE id = ? ALLOW FILTERING',
        [id],
        { prepare: true, consistency: cassandra.types.consistencies.quorum } // Use QUORUM for strong consistency
      );
      if (metaResult.rowLength > 0) {
        const { password_hash, expires_at, user_id, status } = metaResult.rows[0];
        userId = user_id;
        if (status !== 'active') {
          return res.status(403).send('The link is disabled');
        }
        if (expires_at && new Date() > expires_at) {
          return res.status(410).send('This link has expired.');
        }
        if (password_hash) {
          if (!passwordAttempt) {
            showForm = true;
          } else {
            const match = await bcrypt.compare(passwordAttempt, password_hash);
            if (!match) {
              showForm = true;
              formError = 'Incorrect password. Please try again.';
            }
          }
        }
      }
      if (showForm) {
        const formPath = formError
          ? path.join(__dirname, '../views/PasswordFormError.html')
          : path.join(__dirname, '../views/PasswordForm.html');
        return res.send(fs.readFileSync(formPath, 'utf8'));
      }
      // ... existing click tracking and redirect logic ...
      try {
        // Fetch user_id and status
        const userResult = await cassandraClient.execute(
          'SELECT user_id, status FROM urls WHERE id = ? ALLOW FILTERING',
          [id],
          { prepare: true, consistency: cassandra.types.consistencies.quorum } // Use QUORUM for strong consistency
        );
        if (userResult.rowLength > 0) {
          userId = userResult.rows[0].user_id;
          const status = userResult.rows[0].status;
          if (status !== 'active') {
            return res.status(403).send('The link is disabled');
          }
          await redisClient.incr(`clicks:${userId}:${id}`); // Increment the clicks associated with id
          const today = new Date().toISOString().slice(0, 10);
          let visitorId;
          if (req.user && req.user.uid) {
            visitorId = req.user.uid;
          } else {
            visitorId = req.ip;
          }
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
                { prepare: true, consistency: cassandra.types.consistencies.quorum } // Use QUORUM for strong consistency
              );
              if (clicksResult.rowLength > 0) {
                cassandraClicks = Number(clicksResult.rows[0].clicks) || 0;
              }
            } catch {}
            global.io.emit('clicksUpdated', { userId, id, newClicks: cassandraClicks + redisClicks });
          }
          await logGeodata(req, cassandraClient, id, userId);
        }
      } catch (err) {
        console.error('Failed to increment clicks in Redis:', err);
      }
      return res.status(302).redirect(cachedUrl);
    }

    // If id is not found in cache
    const query = 'SELECT long_url, password_hash, expires_at FROM urls_by_id WHERE id = ?';
    const result = await cassandraClient.execute(query, [id], { prepare: true, consistency: cassandra.types.consistencies.quorum }); // Use QUORUM for strong consistency
    if (result.rowLength === 0) {
      return res.status(404).send('Short URL not found.');
    }
    const statusResult = await cassandraClient.execute(
      'SELECT user_id, status FROM urls WHERE id = ? ALLOW FILTERING',
      [id],
      { prepare: true, consistency: cassandra.types.consistencies.quorum } // Use QUORUM for strong consistency
    );
    if (statusResult.rowLength > 0) {
      userId = statusResult.rows[0].user_id;
      const status = statusResult.rows[0].status;
      if (status !== 'active') {
        return res.status(403).send('The link is disabled');
      }
    }
    const longUrl = result.rows[0].long_url;
    const password_hash = result.rows[0].password_hash;
    const expires_at = result.rows[0].expires_at;
    if (!longUrl || typeof longUrl !== 'string' || !/^https?:\/\//i.test(longUrl)) {
      return res.status(400).send('Invalid destination URL.');
    }
    if (expires_at && new Date() > expires_at) {
      return res.status(410).send('This link has expired.');
    }
    if (password_hash) {
      let formError = '';
      if (!passwordAttempt) {
        const formPath = path.join(__dirname, '../views/PasswordForm.html');
        return res.send(fs.readFileSync(formPath, 'utf8'));
      } else {
        const match = await bcrypt.compare(passwordAttempt, password_hash);
        if (!match) {
          formError = 'Incorrect password. Please try again.';
          const formPath = path.join(__dirname, '../views/PasswordFormError.html');
          return res.send(fs.readFileSync(formPath, 'utf8'));
        }
      }
    }
    await redisClient.setEx(id, 86400, longUrl);
    try {
      const userIdResult = await cassandraClient.execute(
        'SELECT user_id FROM urls WHERE id = ? ALLOW FILTERING',
        [id],
        { prepare: true, consistency: cassandra.types.consistencies.quorum } // Use QUORUM for strong consistency
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
              { prepare: true, consistency: cassandra.types.consistencies.quorum } // Use QUORUM for strong consistency
            );
            if (clicksResult.rowLength > 0) {
              cassandraClicks = Number(clicksResult.rows[0].clicks) || 0;
            }
          } catch {}
          global.io.emit('clicksUpdated', { userId, id, newClicks: cassandraClicks + redisClicks });
        }
        await logGeodata(req, cassandraClient, id, userId);
      }
    } catch (err) {
      console.error('Failed to increment clicks in Redis:', err);
    }
    return res.status(302).redirect(longUrl);
  } catch (err) {
    console.error('Error during redirect:', err);
    res.status(500).send('Server error');
  }
}

module.exports = { handleRedirect }; 