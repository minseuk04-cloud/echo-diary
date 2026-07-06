export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }

  try {
    const { system, user, isSvg } = req.body;

    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: isSvg ? 'claude-sonnet-4-5' : 'claude-haiku-4-5',
        max_tokens: isSvg ? 2000 : 1000,
        system,
        messages: [{ role: 'user', content: user }]
      })
    });

    if (!r.ok) {
      const err = await r.text();
      res.status(r.status).json({ error: err });
      return;
    }

    const d = await r.json();
    res.status(200).json({ result: d.content[0].text });

  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}
