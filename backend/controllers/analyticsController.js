const cassandraClient = require('../cassandra');
const redisClient = require('../redis');

// Handler function to get all links analytics
async function getAllLinksAnalytics(req, res) {
  const userId = req.user.uid;
  const cacheKey = `analytics:${userId}`;

  try {
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    const query = 'SELECT id, created_at, long_url, short_url, status FROM urls WHERE user_id = ?';
    const result = await cassandraClient.execute(query, [userId], { prepare: true });

    const links = await Promise.all(result.rows.map(async (row) => {
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
      } catch {}
      let redisClicks = 0;
      try {
        const redisVal = await redisClient.get(`clicks:${userId}:${row.id}`);
        if (redisVal) redisClicks = Number(redisVal) || 0;
      } catch {}
      const clicksNum = Number(clicks) || 0;
      const redisClicksNum = Number(redisClicks) || 0;
      return {
        ...row,
        clicks: clicksNum + redisClicksNum,
      };
    }));

    // Cache `analytics:${userId}` as the key along with user links 
    await redisClient.setEx(cacheKey, 30, JSON.stringify({ links }));

    res.status(200).json({ links });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
}

// Handler function to get link analytics
async function getLinkAnalytics(req, res) {
  const userId = req.user.uid;
  const { id } = req.params;

  let { startDate, endDate } = req.query;
  if (!startDate) {
    try {
      const result = await cassandraClient.execute(
        'SELECT created_at FROM urls WHERE id = ?',
        [id],
        { prepare: true }
      );

      if (result.rowLength > 0) {
        const createdAt = result.rows[0].created_at;
        startDate = createdAt.toISOString().slice(0, 10);
      } 
      else {
        const d = new Date();
        d.setDate(d.getDate() - 6);
        startDate = d.toISOString().slice(0, 10);
      }
    } catch (err) {
      const d = new Date();
      d.setDate(d.getDate() - 6);
      startDate = d.toISOString().slice(0, 10);
    }
  }
  if (!endDate) {
    endDate = new Date().toISOString().slice(0, 10);
  }

  const dates = []; // dates array stores dates from date when url was created upto current date
  let d = new Date(startDate);
  const end = new Date(endDate);
  while (d <= end) {
    dates.push(d.toISOString().slice(0, 10));
    d.setDate(d.getDate() + 1);
  }

  // Set userId cache key for analytics of short url:id between startDate and endDate
  const cacheKey = `analytics:${userId}:${id}:${startDate}:${endDate}`;

  try {
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    // Get the daily clicks for each date
    const dailyClicks = [];
    for (const date of dates) {
      const result = await cassandraClient.execute(
        'SELECT clicks FROM url_daily_clicks WHERE id = ? AND date = ?',
        [id, date],
        { prepare: true }
      );

      dailyClicks.push({ date, clicks: result.rowLength > 0 ? Number(result.rows[0].clicks) || 0 : 0 });
    }

    // Get the unique users for each date of the short url(id)
    const uniqueUsers = [];
    for (const date of dates) {
      const result = await cassandraClient.execute(
        'SELECT unique_users FROM url_unique_users WHERE id = ? AND date = ?',
        [id, date],
        { prepare: true }
      );

      uniqueUsers.push({ date, unique_users: result.rowLength > 0 ? Number(result.rows[0].unique_users) || 0 : 0 });
    }

    // Get the device map(device type and count) for each date of 'id'
    const deviceMap = {};
    for (const date of dates) {
      const result = await cassandraClient.execute(
        'SELECT device, count FROM url_device_stats WHERE id = ? AND date = ?',
        [id, date],
        { prepare: true }
      );

      result.rows.forEach(row => {
        const device = row.device || 'Unknown';
        deviceMap[device] = (deviceMap[device] || 0) + Number(row.count) || 0;
      });
    }
    const deviceStats = Object.entries(deviceMap).map(([device, count]) => ({ device, count }));
    
    // Get the OS map(Windows, Linux, Android etc) of id by date
    const osMap = {};
    for (const date of dates) {
      const result = await cassandraClient.execute(
        'SELECT os, count FROM url_os_stats WHERE id = ? AND date = ?',
        [id, date],
        { prepare: true }
      );

      result.rows.forEach(row => {
        const os = row.os || 'Unknown';
        osMap[os] = (osMap[os] || 0) + Number(row.count) || 0;
      });
    }
    const osStats = Object.entries(osMap).map(([os, count]) => ({ os, count }));
    
    // Combine dailyClicks, uniqueUsers, deviceStats and osStats as a JSON object
    const analyticsResult = { dailyClicks, uniqueUsers, deviceStats, osStats };

    // Cache the string-JSON object for a period of 30 seconds
    await redisClient.setEx(cacheKey, 30, JSON.stringify(analyticsResult));
    res.status(200).json(analyticsResult);
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
}

module.exports = { getAllLinksAnalytics, getLinkAnalytics }; 