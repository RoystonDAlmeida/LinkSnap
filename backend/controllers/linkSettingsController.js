const cassandraClient = require('../cassandra');

// PATCH /api/links/:id/status
async function updateLinkStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body; // 'active' or 'disabled'
  const userId = req.user.uid;

  if (!['active', 'disabled'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }

  try {
    await cassandraClient.execute(
      'UPDATE urls SET status = ? WHERE id = ? AND user_id = ?',
      [status, id, userId],
      { prepare: true }
    );
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
}

module.exports = { updateLinkStatus }; 