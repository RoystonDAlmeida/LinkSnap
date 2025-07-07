// Batch job to write Redis click counts to Cassandra every minute
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
    } catch (err) {
      console.error('Batch click update error:', err);
    }
};

module.exports = processBatchClicks;