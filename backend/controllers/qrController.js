// backend/controllers/qrController.js - Handler function for generating QR Code
const QRCode = require('qrcode');
const redisClient = require('../redis');

// GET /api/shorten/:id/qrcode
async function getQRCode(req, res) {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: 'No link id provided' });

  try {
    const cacheKey = `qr:${id}`;

    // Check is QR code URI exists in cache
    let qr = await redisClient.get(cacheKey);

    if (!qr) {
      // Generate QR code using shortUrl
      const shortUrl = `${process.env.BASE_URL}/${id}`;
      qr = await QRCode.toDataURL(shortUrl);
      await redisClient.setEx(cacheKey, 86400, qr); // Cache for 24 hours
    }
    res.json({ qr });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
}

module.exports = { getQRCode }; 