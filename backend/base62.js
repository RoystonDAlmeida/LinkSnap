// backend/base62.js - base62 encoding of id generated from long URL

require('dotenv').config();

const BASE62_CHARS = process.env.BASE62_CHARS;
const MIN_BASE62_LENGTH = parseInt(process.env.MIN_BASE62_LENGTH, 10) || 5;

// Base 62 encoding to generate unique ID for long URL, with minimum length
function base62Encode(num) {
  if (num === 0) return BASE62_CHARS[0].repeat(MIN_BASE62_LENGTH);
  let encoding = '';
  while (num > 0) {
    const remainder = num % BASE62_CHARS.length;
    encoding = BASE62_CHARS[remainder] + encoding;
    num = Math.floor(num / BASE62_CHARS.length);
  }
  // Pad with leading BASE62_CHARS[0] to ensure minimum length
  while (encoding.length < MIN_BASE62_LENGTH) {
    encoding = BASE62_CHARS[0] + encoding;
  }
  return encoding;
}

module.exports = { base62Encode, BASE62_CHARS }; 