export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const response = await fetch('https://webhook.site/3ec114ae-513b-412c-8b0c-64af65eb946a', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body),
      });

      const result = await response.text();
      res.status(200).send(result);
    } catch (error) {
      res.status(500).json({ error: 'Fehler beim Weiterleiten' });
    }
  } else {
    res.status(405).json({ error: 'Nur POST erlaubt' });
  }
}
