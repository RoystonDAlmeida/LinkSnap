// Batch job to write Redis click counts, unique users, daily clicks, device stats and os stats to Cassandra every minute
const processBatchClicks = async (redisClient, cassandraClient, io) => {
    try {
      const keys = await redisClient.keys('clicks:*');

      for (const key of keys) {
        const count = parseInt(await redisClient.get(key), 10);
        const [, userId, id] = key.split(':');

        await cassandraClient.execute(
          'UPDATE url_clicks SET clicks = clicks + ? WHERE user_id = ? AND id = ?',
          [count, userId, id],
          { prepare: true }
        );

        // Fetch new click count
        let newClicks = 0;
        try {
          const result = await cassandraClient.execute(
            'SELECT clicks FROM url_clicks WHERE user_id = ? AND id = ?',
            [userId, id],
            { prepare: true }
          );

          if (result.rowLength > 0) {
            newClicks = result.rows[0].clicks;
          }
        } catch {}

        // Emit real-time update
        if (io) {
          io.emit('clicksUpdated', { userId, id, newClicks });
        }

        await redisClient.del(key);
      }

      // --- Batch unique users ---
      const uniqueUserKeys = await redisClient.keys('unique_users:*');

      for (const key of uniqueUserKeys) {
        const [ , id, date ] = key.split(':');
        const count = await redisClient.sCard(key);

        await cassandraClient.execute(
          'UPDATE url_unique_users SET unique_users = ? WHERE id = ? AND date = ?',
          [count, id, date],
          { prepare: true }
        );

        await redisClient.del(key);
      }

      // --- Batch daily clicks ---
      const dailyClickKeys = await redisClient.keys('clicks_daily:*');
      for (const key of dailyClickKeys) {
        const [ , id, date ] = key.split(':');
        const count = parseInt(await redisClient.get(key), 10);

        await cassandraClient.execute(
          'UPDATE url_daily_clicks SET clicks = clicks + ? WHERE id = ? AND date = ?',
          [count, id, date],
          { prepare: true }
        );

        await redisClient.del(key);
      }

      // --- Batch device stats ---
      const deviceKeys = await redisClient.keys('device:*');
      for (const key of deviceKeys) {
        const [ , id, date, device ] = key.split(':');
        const count = parseInt(await redisClient.get(key), 10);

        await cassandraClient.execute(
          'UPDATE url_device_stats SET count = count + ? WHERE id = ? AND date = ? AND device = ?',
          [count, id, date, device],
          { prepare: true }
        );

        await redisClient.del(key);
      }

      // --- Batch OS stats ---
      const osKeys = await redisClient.keys('os:*');
      for (const key of osKeys) {
        const [ , id, date, os ] = key.split(':');
        const count = parseInt(await redisClient.get(key), 10);

        await cassandraClient.execute(
          'UPDATE url_os_stats SET count = count + ? WHERE id = ? AND date = ? AND os = ?',
          [count, id, date, os],
          { prepare: true }
        );
        
        await redisClient.del(key);
      }
    } catch (err) {
      console.error('Batch click update error:', err);
    }
};

module.exports = processBatchClicks;