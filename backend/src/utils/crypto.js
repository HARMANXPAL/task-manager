const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16; // AES block size

/**
 * Returns a 32-byte key buffer derived from the ENCRYPTION_KEY env variable.
 * If the key is shorter than 32 chars it is padded; longer keys are truncated.
 */
const getKey = () => {
  const raw = process.env.ENCRYPTION_KEY || '';
  return Buffer.from(raw.padEnd(32, '0').slice(0, 32), 'utf8');
};

/**
 * Encrypts a plain-text string.
 * Returns a string in the format: <iv_hex>:<encrypted_hex>
 */
const encrypt = (text) => {
  if (!text) return text;
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
    let encrypted = cipher.update(String(text), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
  } catch {
    // If encryption fails (e.g., bad key), return text as-is rather than crash
    return text;
  }
};

/**
 * Decrypts a string produced by encrypt().
 * Returns the original plain text.
 */
const decrypt = (text) => {
  if (!text || typeof text !== 'string' || !text.includes(':')) return text;
  try {
    const [ivHex, encryptedHex] = text.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch {
    // Return the raw value if decryption fails (e.g., unencrypted legacy data)
    return text;
  }
};

module.exports = { encrypt, decrypt };
