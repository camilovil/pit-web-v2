const test = require('node:test');
const assert = require('node:assert/strict');
const handler = require('../api/likes');
const slug = require('../lib/foro-slugs.json')[0];

test('likes API validates requests and never reports failed writes as saved', async (t) => {
  const previousFetch = global.fetch;
  const previousEnv = { ...process.env };
  process.env.KV_REST_API_URL = 'https://example.invalid';
  process.env.KV_REST_API_TOKEN = 'test-token';
  delete process.env.LIKES_COOKIE_SECRET;
  let calls = 0, reply = [0, 0];
  global.fetch = async () => { calls++; return { ok: true, json: async () => ({ result: reply }) }; };
  async function request(method, options = {}) {
    const req = { method, headers: { host: 'example.com', 'content-type': 'application/json', ...options.headers }, query: { slug }, body: { slug, liked: true }, ...options };
    req.headers = { host: 'example.com', 'content-type': 'application/json', ...options.headers };
    const res = { code: 200, headers: {}, setHeader(k, v) { this.headers[k] = v; }, status(code) { this.code = code; return this; }, json(value) { this.body = value; return this; } };
    await handler(req, res);
    return res;
  }
  try {
    await t.test('unsupported methods and unpublished articles do not access Redis', async () => {
      assert.equal((await request('DELETE')).code, 405);
      assert.equal((await request('GET', { query: { slug: '../../bad' } })).code, 404);
      assert.equal(calls, 0);
    });
    const first = await request('GET');
    const cookie = first.headers['Set-Cookie'].split(';')[0];
    await t.test('reads issue a signed secure cookie and cannot be cached', () => {
      assert.equal(first.headers['Cache-Control'], 'private, no-store');
      assert.match(first.headers['Set-Cookie'], /HttpOnly; Secure; SameSite=Lax/);
      assert.deepEqual(first.body, { count: 0, liked: false });
    });
    await t.test('missing or forged cookies, cross-origin writes, and malformed bodies are rejected', async () => {
      const before = calls;
      assert.equal((await request('POST')).code, 401);
      assert.equal((await request('POST', { headers: { cookie: cookie + '0' } })).code, 401);
      assert.equal((await request('POST', { headers: { cookie, origin: 'https://attacker.test' } })).code, 403);
      assert.equal((await request('POST', { headers: { cookie }, body: '{bad' })).code, 404);
      assert.equal((await request('POST', { headers: { cookie }, body: { slug, liked: 'yes' } })).code, 400);
      assert.equal(calls, before);
    });
    await t.test('confirmed count and state come from Redis', async () => {
      reply = [3, 1];
      assert.deepEqual((await request('POST', { headers: { cookie, origin: 'https://example.com' } })).body, { count: 3, liked: true });
    });
    await t.test('rate limits and outages preserve an error status', async () => {
      reply = [-1, 0];
      const limited = await request('POST', { headers: { cookie } });
      assert.equal(limited.code, 429);
      assert.equal(limited.headers['Retry-After'], '60');
      reply = [-2, 0];
      assert.equal((await request('GET')).code, 503);
      global.fetch = async () => { throw new Error('timeout'); };
      assert.equal((await request('POST', { headers: { cookie } })).code, 503);
      delete process.env.KV_REST_API_TOKEN;
      delete process.env.UPSTASH_REDIS_REST_TOKEN;
      assert.equal((await request('GET')).code, 503);
    });
  } finally {
    global.fetch = previousFetch;
    for (const name of ['KV_REST_API_URL', 'KV_REST_API_TOKEN', 'UPSTASH_REDIS_REST_TOKEN', 'LIKES_COOKIE_SECRET']) {
      if (previousEnv[name] === undefined) delete process.env[name];
      else process.env[name] = previousEnv[name];
    }
  }
});
