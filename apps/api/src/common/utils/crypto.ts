import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  createHash,
  scryptSync,
} from 'crypto';

const ALGORITHM = 'aes-256-gcm';

function getKey(): Buffer {
  const secret = process.env.AUTH_SECRET ?? 'fallback-secret-change-in-prod';
  return scryptSync(secret, 'ensocial-salt', 32) as Buffer;
}

export function encrypt(text: string): string {
  const key = getKey();
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [iv.toString('hex'), authTag.toString('hex'), encrypted.toString('hex')].join(':');
}

export function decrypt(encoded: string): string {
  const key = getKey();
  const [ivHex, authTagHex, encryptedHex] = encoded.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  return decipher.update(encrypted) + decipher.final('utf8');
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
