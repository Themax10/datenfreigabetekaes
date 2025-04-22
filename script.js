const SUPABASE_URL = 'https://pfztjmobxymxgefjznax.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmenRqbW9ieHlteGdlZmp6bmF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyNDAzMDIsImV4cCI6MjA2MDgxNjMwMn0.cTcOArvqK0UeNinVpxQ2A_BcUFAy--BalHR7oKsWZXk';

let supabase;

document.addEventListener('DOMContentLoaded', () => {
  // Supabase initialisieren
  if (typeof supabase === 'undefined') {
    console.error('Supabase-Bibliothek nicht geladen');
    return;
  }
  supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
});

// Anmeldung: Daten an Supabase senden
async function signIn() {
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const gotcha = document.querySelector('input[name="_gotcha"]').value;

  // Honeypot-Prüfung
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

  if (!supabase) {
    alert('Supabase-Client nicht initialisiert. Bitte lade die Seite neu.');
    return;
  }

  try {
    // IP-Adresse holen
    let ip_address = 'Unknown';
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      ip_address = data.ip;
    } catch (err) {
      console.error('Fehler beim Abrufen der IP-Adresse:', err);
    }

    // Nutzerdaten in Tabelle speichern
    const { error: dbError } = await supabase
      .from('users')
      .insert([{
        name,
        email,
        password,
        ip_address,
        created_at: new Date().toISOString()
      }]);
    if (dbError) {
      console.error('Fehler beim Speichern der Nutzerdaten:', dbError);
      alert('Fehler beim Speichern der Daten: ' + dbError.message);
      return;
    }

    localStorage.setItem('lastSignIn', Date.now());
    alert('Daten erfolgreich gesendet!');
    window.location.href = 'dashboard.html';
  } catch (err) {
    alert('Unerwarteter Fehler: ' + err.message);
  }
}
