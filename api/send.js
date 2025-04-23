export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const payload = req.body;

  try {
    const response = await fetch('https://webhook.site/3ec114ae-513b-412c-8b0c-64af65eb946a', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      res.status(200).json({ message: 'Erfolgreich gesendet!' });
    } else {
      res.status(500).json({ message: 'Webhook-Fehler' });
    }
  } catch (error) {
    console.error('API Fehler:', error);
    res.status(500).json({ message: 'Serverfehler' });
  }
}
