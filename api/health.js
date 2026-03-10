export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method === 'POST') {
    const secret = req.headers['x-vitasync-secret'];
    if (secret !== process.env.VITASYNC_SECRET) return res.status(401).json({ error: 'Unauthorized' });
    await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/set/vitasync:health`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify([JSON.stringify(req.body)]),
    });
    return res.status(200).json({ ok: true });
  }
  const response = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/get/vitasync:health`, {
    headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` },
  });
  const data = await response.json();
  if (!data.result) return res.status(404).json({ error: 'No data yet' });
  res.status(200).json(JSON.parse(data.result));
}
