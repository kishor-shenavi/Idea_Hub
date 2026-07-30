const crypto = require('crypto');
const config = require('../config');

const ALGORITHM = 'aes-256-gcm';
const KEY = Buffer.from(config.messageEncryptionKey, 'hex');

function encrypt(text) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted.toString('base64')}`;
}

function decrypt(payload) {
  // legacy safety net — messages stored before encryption was added won't match this format,
  // so we pass them through as plain text instead of crashing on old data
  const parts = payload.split(':');
  if (parts.length !== 3) return payload;

  try {
    const [ivB64, tagB64, dataB64] = parts;
    const iv = Buffer.from(ivB64, 'base64');
    const authTag = Buffer.from(tagB64, 'base64');
    const encrypted = Buffer.from(dataB64, 'base64');
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString('utf8');
  } catch {
    return payload; // malformed/foreign data — same fallback, never crash a chat over one bad row
  }
}

module.exports = { encrypt, decrypt };