export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-vitasync-secret');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const REDIS = process.env.UPSTASH_REDIS_REST_URL;
  const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
  const headers = { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' };

  if (req.method === 'POST') {
    const secret = req.headers['x-vitasync-secret'];
    if (secret !== process.env.VITASYNC_SECRET) return res.status(401).json({ error: 'Unauthorized' });
    await fetch(`${REDIS}/set/vitasync:health`, {
      method: 'POST', headers,
      body: JSON.stringify([JSON.stringify(req.body)]),
    });
    return res.status(200).json({ ok: true });
  }

  const r = await fetch(`${REDIS}/get/vitasync:health`, { headers });
  const { result } = await r.json();
  if (!result) return res.status(404).json({ error: 'No data yet' });
  try {
    const parsed = JSON.parse(result);
    const data = Array.isArray(parsed) ? JSON.parse(parsed[0]) : parsed;
    return res.status(200).json(data);
  } catch(e) {
    return res.status(500).json({ error: 'Parse error', raw: result.slice(0,100) });
  }
}
