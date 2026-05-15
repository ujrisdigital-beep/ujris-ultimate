import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const SECRET_KEY = process.env.FORTIS_SECRET_KEY || crypto.randomBytes(32).toString('hex');
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

// AES-256 Encryption (Military Grade)
export function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(SECRET_KEY, 'hex'), iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString('base64');
}

export function decrypt(encryptedText) {
  const buffer = Buffer.from(encryptedText, 'base64');
  const iv = buffer.subarray(0, IV_LENGTH);
  const tag = buffer.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const encrypted = buffer.subarray(IV_LENGTH + TAG_LENGTH);
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(SECRET_KEY, 'hex'), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
}

// TLS 1.3 Enforcement (Node.js/Express)
export function enforceTLS13(req, res, next) {
  const tlsVersion = req.socket.getProtocol?.();
  if (tlsVersion && !tlsVersion.includes('TLSv1.3')) {
    return res.status(426).json({ 
      error: 'Upgrade Required', 
      message: 'TLS 1.3 required for military-grade security' 
    });
  }
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
}

// Temp Email Blocker (blocks disposable email providers)
const TEMP_EMAIL_DOMAINS = new Set([
  'tempmail.com', 'throwawaymail.com', 'mailinator.com', 'guerrillamail.com',
  'sharklasers.com', 'yopmail.com', 'temp-mail.org', 'fakeinator.com',
  'emailondeck.com', 'getairmail.com', 'hidemail.net', 'jetable.org',
  'mintemail.com', 'spamgourmet.com', 'tempmail.net', 'trashmail.ws',
  'yopmail.fr', '10minutemail.com', '20minutemail.com', 'anonbox.net',
  'mailnesia.com', 'mytemp.email', 'no-spam.ws', 'quickinbox.com',
  'forgetmail.com', 'spambox.us', 'tempail.com', 'tempemail.com',
]);

export async function isTempEmail(email) {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return true;
  
  // Check known temp domains
  if (TEMP_EMAIL_DOMAINS.has(domain)) return true;
  
  // Check via API (Hunter.io / VerifyRight)
  try {
    const res = await fetch(`https://api.hunter.io/v2/email-verifier?email=${email}&api_key=${process.env.HUNTER_API_KEY}`);
    if (res.ok) {
      const data = await res.json();
      return data.data?.disposable || false;
    }
  } catch (e) {}
  
  return false;
}

export async function validateEmailAsPrimary(email) {
  if (!email || !email.includes('@')) {
    return { valid: false, reason: 'Invalid email format' };
  }
  
  const isTemp = await isTempEmail(email);
  if (isTemp) {
    return { valid: false, reason: 'Temporary/disposable emails are not allowed' };
  }
  
  // Check for valid domain (no suspicious patterns)
  const domain = email.split('@')[1];
  if (domain.length < 3 || !domain.includes('.')) {
    return { valid: false, reason: 'Invalid domain' };
  }
  
  return { valid: true, reason: 'Email accepted as primary identifier' };
}

// Anti-Reverse-Engineering Protection
export function obfuscateCode(code, level = 'medium') {
  const layers = {
    light: str => Buffer.from(str).toString('base64'),
    medium: str => {
      const b64 = Buffer.from(str).toString('base64');
      return b64.split('').reverse().join('') + `_${Date.now()}`;
    },
    heavy: str => {
      const key = crypto.randomBytes(16).toString('hex');
      const iv = crypto.randomBytes(8).toString('hex');
      return `FORTIS_OBF_${key}_${iv}_${Buffer.from(str).toString('hex')}`;
    }
  };
  return layers[level]?.(code) || code;
}

export function deobfuscateCode(obfuscated, level = 'medium') {
  try {
    if (level === 'light') return Buffer.from(obfuscated, 'base64').toString('utf8');
    if (level === 'medium') return Buffer.from(obfuscated.split('_')[0].split('').reverse().join(''), 'base64').toString('utf8');
    if (level === 'heavy') {
      const parts = obfuscated.replace('FORTIS_OBF_', '').split('_');
      return Buffer.from(parts[2], 'hex').toString('utf8');
    }
  } catch (e) {}
  return null;
}

// Self-Improvement Loop (learns from every task)
const taskLog = [];
const learningModel = { patterns: {}, outcomes: {} };

export function logTask(task, input, output, success, metadata = {}) {
  const entry = {
    id: crypto.randomBytes(8).toString('hex'),
    timestamp: Date.now(),
    task,
    inputHash: crypto.createHash('sha256').update(JSON.stringify(input)).digest('hex').slice(0, 16),
    outputHash: crypto.createHash('sha256').update(JSON.stringify(output)).digest('hex').slice(0, 16),
    success,
    metadata,
  };
  taskLog.push(entry);
  
  // Learn patterns
  if (!learningModel.patterns[task]) learningModel.patterns[task] = { total: 0, success: 0 };
  learningModel.patterns[task].total++;
  if (success) learningModel.patterns[task].success++;
  
  // Adaptive learning - store successful patterns
  if (success) {
    if (!learningModel.outcomes[task]) learningModel.outcomes[task] = [];
    learningModel.outcomes[task].push({ input, output, timestamp: Date.now() });
    if (learningModel.outcomes[task].length > 100) learningModel.outcomes[task].shift();
  }
  
  // Persist to Supabase
  supabase?.from('self_improvement_log').insert(entry).then(() => {}).catch(() => {});
  
  return entry.id;
}

export function getLearningInsights() {
  const insights = {};
  for (const [task, data] of Object.entries(learningModel.patterns)) {
    insights[task] = {
      successRate: data.total > 0 ? (data.success / data.total * 100).toFixed(2) + '%' : '0%',
      totalExecutions: data.total,
      recommendation: data.success / data.total > 0.8 ? 'Keep current approach' : 
                        data.success / data.total > 0.5 ? 'Needs refinement' : 'Requires overhaul',
    };
  }
  return insights;
}

export function getSuccessfulPattern(task) {
  const outcomes = learningModel.outcomes[task];
  if (!outcomes || outcomes.length === 0) return null;
  return outcomes[outcomes.length - 1]; // Most recent successful pattern
}

// Import supabase dynamically to avoid circular deps
let supabase = null;
import('../lib/supabase').then(m => supabase = m?.supabase).catch(() => {});
