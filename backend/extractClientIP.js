const ipHeaders = [
  'cf-connecting-ip',     // Cloudflare
  'x-forwarded-for',      // Most common proxy header
  'x-real-ip',            // Nginx proxy
  'x-client-ip',          // Apache proxy
  'x-forwarded',          // Less common
  'forwarded-for',        // Less common
  'forwarded'             // RFC 7239 standard
];

function isValidIP(ip) {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  // Accept ::1 (IPv6 localhost) as valid
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){1,7}[0-9a-fA-F]{1,4}$|^::1$/;
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

function extractClientIP(req) {
  for (const header of ipHeaders) {
    const value = req.headers[header];
    if (value) {
      const ip = value.split(',')[0].trim();
      if (isValidIP(ip)) return ip;
    }
  }
  
  // Fallback to connection/socket IPs
  const fallbackIPs = [
    req.ip,
    req.connection?.remoteAddress,
    req.socket?.remoteAddress,
    req.connection?.socket?.remoteAddress
  ];
  for (const ip of fallbackIPs) {
    if (ip && isValidIP(ip)) return ip;
  }
  return null;
}

module.exports = { extractClientIP, isValidIP }; 