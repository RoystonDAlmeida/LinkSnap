const bcrypt = require('bcrypt');
const cassandraClient = require('../cassandra');

// PATCH /api/links/:id/settings(Update link expiry or password if set)
async function updateLinkExpiryAndPassword(req, res) {
  const { id } = req.params;
  const { expiry_date, password } = req.body;
  const userId = req.user.uid;

  // Build update query dynamically
  const updates = [];
  const params = [];

  if (expiry_date !== undefined) {
    // Expiry date is provided
    updates.push('expires_at = ?');
    params.push(expiry_date ? new Date(expiry_date) : null);
  }

  if (password !== undefined) {
    updates.push('password_hash = ?');
    if (password) {
      // Hash the password
      const saltRounds = 10;
      const hash = await bcrypt.hash(password, saltRounds);
      params.push(hash);
    } else {
      params.push(null);
    }
  }
  if (updates.length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }

  params.push(id, userId);

  try {
    await cassandraClient.execute(
      `UPDATE urls SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`,
      params,
      { prepare: true }
    );
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
}

module.exports = { updateLinkExpiryAndPassword }; 