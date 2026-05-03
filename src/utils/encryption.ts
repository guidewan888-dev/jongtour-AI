import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default_secret_key_needs_to_be_32_bytes!'; // Must be 32 bytes
const IV_LENGTH = 16; // For AES, this is always 16

/**
 * Encrypts a plain text string
 */
export function encrypt(text: string): string {
  if (!text) return text;
  
  // Ensure key is 32 bytes
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  const iv = crypto.randomBytes(IV_LENGTH);
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * Decrypts an encrypted string
 */
export function decrypt(text: string): string | null {
  if (!text) return null;
  
  try {
    const textParts = text.split(':');
    const ivHex = textParts.shift();
    const encryptedText = textParts.join(':');
    
    if (!ivHex || !encryptedText) return null;
    
    const iv = Buffer.from(ivHex, 'hex');
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
}
