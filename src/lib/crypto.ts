import crypto from 'crypto'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 32) || '0123456789abcdef0123456789abcdef' // Must be 32 characters
const IV_LENGTH = 16 // For AES, this is always 16

/**
 * Encrypts a given text using AES-256-CBC.
 */
export function encrypt(text: string): string {
  if (!text) return text
  
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv)
  
  let encrypted = cipher.update(text)
  encrypted = Buffer.concat([encrypted, cipher.final()])
  
  return iv.toString('hex') + ':' + encrypted.toString('hex')
}

/**
 * Decrypts a given encrypted string using AES-256-CBC.
 */
export function decrypt(text: string): string | null {
  if (!text) return null
  
  try {
    const textParts = text.split(':')
    const ivHex = textParts.shift()
    if (!ivHex) return null
    
    const iv = Buffer.from(ivHex, 'hex')
    const encryptedText = Buffer.from(textParts.join(':'), 'hex')
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv)
    
    let decrypted = decipher.update(encryptedText)
    decrypted = Buffer.concat([decrypted, decipher.final()])
    
    return decrypted.toString()
  } catch (error) {
    console.error('Decryption failed:', error)
    return null
  }
}
