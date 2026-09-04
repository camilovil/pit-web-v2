// Shared article likes. Credentials stay in Vercel; visitors get a signed,
// anonymous cookie. Redis sets make retries idempotent and counts atomic.
const { randomBytes, createHmac, timingSafeEqual } = require('node:crypto');
const slugs = new Set(require('../lib/foro-slugs.json'));
const COOKIE = '__Host-pit-visitor';

const READ = `return {redis.call('SCARD', KEYS[1]), redis.call('SISMEMBER', KEYS[1], ARGV[1])}`;
const WRITE = `
  local rate = redis.call('INCR', KEYS[2])
  if rate == 1 then redis.call('EXPIRE', KEYS[2], 60) end
  if rate > 60 then return {-1, 0} end
  if ARGV[2] == '1' then
    redis.call('SADD', KEYS[1], ARGV[1])
  else
    redis.call('SREM', KEYS[1], ARGV[1])
  end
  return {redis.call('SCARD', KEYS[1]), redis.call('SISMEMBER', KEYS[1], ARGV[1])}
`;

function digest(value, secret) {
  return createHmac('sha256', secret).update(value).digest('hex');
}

function visitorFromCookie(header, secret) {
  const value = String(header || '').split(';').map(s => s.trim())
    .find(s => s.startsWith(COOKIE + '='));
  if (!value) return null;
  const match = value.slice(COOKIE.length + 1).match(/^([a-f0-9]{32})\.([a-f0-9]{64})$/);
  if (!match) return null;
  const expected = digest('visitor:' + match[1], secret);
  return timingSafeEqual(Buffer.from(match[2]), Buffer.from(expected)) ? match[1] : null;
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store');
  res.setHeader('Vary', 'Cookie');
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = null; }
  }
  const slug = req.method === 'GET' ? req.query?.slug : body?.slug;
  if (typeof slug !== 'string' || !slugs.has(slug)) {
    return res.status(404).json({ error: 'unknown_article' });
  }
  if (req.method === 'POST') {
    if (!/^application\/json(?:\s*;|$)/i.test(req.headers['content-type'] || '') ||
        typeof body?.liked !== 'boolean') {
      return res.status(400).json({ error: 'invalid_body' });
    }
    let crossOrigin = req.headers['sec-fetch-site'] === 'cross-site';
    if (req.headers.origin) {
      try { crossOrigin ||= new URL(req.headers.origin).host !== req.headers.host; }
      catch { crossOrigin = true; }
    }
    if (crossOrigin) return res.status(403).json({ error: 'origin_not_allowed' });
  }

  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return res.status(503).json({ error: 'likes_unavailable' });
  const secret = process.env.LIKES_COOKIE_SECRET || token;
  let visitor = visitorFromCookie(req.headers.cookie, secret);
  if (!visitor) {
    if (req.method === 'POST') return res.status(401).json({ error: 'visitor_required' });
    visitor = randomBytes(16).toString('hex');
    res.setHeader('Set-Cookie', `${COOKIE}=${visitor}.${digest('visitor:' + visitor, secret)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=31536000`);
  }

  const key = 'pit:likes:v1:' + slug;
  const member = digest('member:' + visitor, secret);
  // Only a short-lived digest is used for throttling; never store raw IPs.
  const ip = String(req.headers['x-vercel-forwarded-for'] || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || visitor).split(',')[0].trim();
  const rateKey = 'pit:likes:rate:' + digest('rate:' + ip, secret);
  const command = req.method === 'GET'
    ? ['EVAL', READ, 1, key, member]
    : ['EVAL', WRITE, 2, key, rateKey, member, body.liked ? '1' : '0'];
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify(command),
      signal: AbortSignal.timeout(5000)
    });
    if (!response.ok) throw new Error('Datastore unavailable');
    const data = await response.json();
    if (data.error || !Array.isArray(data.result)) throw new Error('Invalid datastore response');
    const [count, liked] = data.result;
    if (count === -1) {
      res.setHeader('Retry-After', '60');
      return res.status(429).json({ error: 'too_many_requests' });
    }
    if (!Number.isSafeInteger(count) || count < 0 || (liked !== 0 && liked !== 1)) {
      throw new Error('Invalid count');
    }
    return res.status(200).json({ count, liked: liked === 1 });
  } catch {
    return res.status(503).json({ error: 'likes_unavailable' });
  }
};
