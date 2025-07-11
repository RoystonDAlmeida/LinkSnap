const { extractClientIP } = require('./extractClientIP');

async function logGeodata(req, cassandraClient, linkId, userId) {
  try {
    const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
    
    // Get the IP address of the client using extractClientIp method
    const ip = extractClientIP(req);
    if (!ip) {
      // Debug logging for troubleshooting
      console.error('Could not determine client IP');
      return;
    }
    
    // Use a free IP geolocation API (ipapi.co)
    const geo = await fetch(`https://ipapi.co/${ip}/json/`).then(res => res.json());

    // Extract country, city, latitude, longitude and clickTime
    const country = geo.country_name || null;
    const city = geo.city || null;
    const latitude = geo.latitude || null;
    const longitude = geo.longitude || null;
    const clickTime = new Date();

    // Insert into link_click_geodata table (now with user_id)
    await cassandraClient.execute(
      'INSERT INTO link_click_geodata (user_id, link_id, click_time, country, city, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, linkId, clickTime, country, city, latitude, longitude],
      { prepare: true }
    );
  } catch (err) {
    console.error('Failed to log geodata:', err);
  }
}

module.exports = logGeodata; 