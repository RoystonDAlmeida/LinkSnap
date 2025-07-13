const bcrypt = require('bcrypt');
const cassandraClient = require('../cassandra');
const redisClient = require('../redis');
const cassandra = require('cassandra-driver'); // For consistency levels

// PATCH /api/links/:id/settings(Update link expiry or password if set)
async function updateLinkExpiryAndPassword(req, res) {
  const { id } = req.params;
  const { expiry_date, password } = req.body;
  const userId = req.user.uid;

  // Build update query dynamically
  const updates = [];
  const params = [];

  let expiryValue = undefined;
  let passwordHashOrNull = undefined;

  if (expiry_date !== undefined) {
    updates.push('expires_at = ?');
    expiryValue = expiry_date ? new Date(expiry_date) : null;
    params.push(expiryValue);
  }

  if (password !== undefined) {
    updates.push('password_hash = ?');
    if (password) {
      const saltRounds = 10;
      passwordHashOrNull = await bcrypt.hash(password, saltRounds);
      params.push(passwordHashOrNull);
    } else {
      passwordHashOrNull = null;
      params.push(null);
    }
  }
  if (updates.length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }

  params.push(id, userId);

  try {
    // Update urls table with QUORUM consistency
    await cassandraClient.execute(
      `UPDATE urls SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`,
      params,
      { prepare: true, consistency: cassandra.types.consistencies.quorum }
    );

    // Also update urls_by_id table with the same values, using QUORUM consistency
    await cassandraClient.execute(
      'UPDATE urls_by_id SET expires_at = ?, password_hash = ? WHERE id = ?',
      [expiryValue, passwordHashOrNull, id],
      { prepare: true, consistency: cassandra.types.consistencies.quorum }
    );
    
    // Invalidate all relevant cache keys after DB update
    const analyticsKey = `analytics:${userId}`;
    const perLinkKey = id;
    await redisClient.del(analyticsKey);
    await redisClient.del(perLinkKey);

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
}

module.exports = { updateLinkExpiryAndPassword }; 