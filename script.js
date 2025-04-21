const SUPABASE_URL = 'https://pfztjmobxymxgefjznax.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmenRqbW9ieHlteGdlZmp6bmF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyNDAzMDIsImV4cCI6MjA2MDgxNjMwMn0.cTcOArvqK0UeNinVpxQ2A_BcUFAy--BalHR7oKsWZXk';

let supabase;
let isSignUpMode = false;

document.addEventListener('DOMContentLoaded', () => {
  // Supabase initialisieren
  supabase = Supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  // Dashboard-Logik
  if (window.location.pathname.includes('dashboard.html')) {
    listFiles();
  }
});

// Formular zwischen Anmeldung und Registrierung umschalten
function toggleSignUp() {
  isSignUpMode = !isSignUpMode;
  const confirmPassword = document.getElementById('confirm-password');
  const confirmLabel = document.querySelector('label[for="confirm-password"]');
  const toggleText = document.getElementById('toggle-text');
  if (isSignUpMode) {
    confirmPassword.style.display = 'block';
    confirmLabel.style.display = 'block';
    toggleText.innerHTML = 'Bereits ein Konto? <a href="#" onclick="toggleSignUp()">Anmelden</a>';
  } else {
    confirmPassword.style.display = 'none';
    confirmLabel.style.display = 'none';
    toggleText.innerHTML = 'Noch kein Konto? <a href="#" onclick="toggleSignUp()">Registrieren</a>';
  }
}

// Anmeldung
async function signIn() {
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

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert('Anmeldung fehlgeschlagen: ' + error.message);
      return;
    }
    localStorage.setItem('lastSignIn', Date.now());
    alert('Anmeldung erfolgreich!');
    window.location.href = 'dashboard.html';
  } catch (err) {
    alert('Unerwarteter Fehler: ' + err.message);
  }
}

// Registrierung
async function signUp() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirm-password').value;
  const gotcha = document.querySelector('input[name="_gotcha"]').value;

  // Honeypot-Prüfung
  if (gotcha) {
    alert('Bot erkannt!');
    return;
  }

  // Rate-Limiting
  const lastSignUp = localStorage.getItem('lastSignUp');
  if (lastSignUp && Date.now() - lastSignUp < 30000) {
    alert('Bitte warte 30 Sekunden vor der nächsten Registrierung.');
    return;
  }

  // Passwort-Bestätigung
  if (isSignUpMode && password !== confirmPassword) {
    alert('Passwörter stimmen nicht überein.');
    return;
  }

  try {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      alert('Registrierung fehlgeschlagen: ' + error.message);
      return;
    }

    // Nutzerdaten in Tabelle speichern (mit Passwort im Klartext)
    const { error: dbError } = await supabase
      .from('users')
      .insert([{ email, password, user_id: data.user.id, created_at: new Date().toISOString() }]);
    if (dbError) {
      console.error('Fehler beim Speichern der Nutzerdaten:', dbError);
      alert('Registrierung erfolgreich, aber Fehler beim Speichern der Daten.');
    }

    localStorage.setItem('lastSignUp', Date.now());
    alert('Registrierung erfolgreich!');
    window.location.href = 'dashboard.html';
  } catch (err) {
    alert('Unerwarteter Fehler: ' + err.message);
  }
}

// Abmeldung
async function signOut() {
  try {
    await supabase.auth.signOut();
    localStorage.removeItem('user');
    window.location.href = 'index.html';
  } catch (err) {
    alert('Unerwarteter Fehler: ' + err.message);
  }
}

// Datei hochladen
async function uploadFile() {
  const fileInput = document.getElementById('fileInput');
  const file = fileInput.files[0];
  if (!file) {
    alert('Bitte wähle eine Datei aus.');
    return;
  }

  try {
    const { data, error } = await supabase.storage
      .from('Uploads')
      .upload(`${Date.now()}_${file.name}`, file, {
        cacheControl: '3600',
        upsert: false
      });
    if (error) {
      alert('Fehler beim Hochladen der Datei: ' + error.message);
      return;
    }
    alert('Datei erfolgreich hochgeladen!');
    listFiles();
  } catch (err) {
    alert('Unerwarteter Fehler: ' + err.message);
  }
}

// Dateien auflisten
async function listFiles() {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) {
    window.location.href = 'index.html';
    return;
  }

  const fileList = document.getElementById('fileList');
  fileList.innerHTML = '';

  try {
    const { data, error } = await supabase.storage.from('Uploads').list();
    if (error) {
      alert('Fehler beim Abrufen der Dateien: ' + error.message);
      return;
    }

    data.forEach(file => {
      const li = document.createElement('li');
      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/Uploads/${file.name}`;
      li.innerHTML = `<a href="${publicUrl}" target="_blank">${file.name}</a>`;
      fileList.appendChild(li);
    });
  } catch (err) {
    alert('Unerwarteter Fehler: ' + err.message);
  }
}

// Nutzerdaten als CSV exportieren
async function exportUsers() {
  try {
    const { data, error } = await supabase.from('users').select('email, password, user_id, created_at');
    if (error) {
      alert('Fehler beim Abrufen der Nutzer: ' + error.message);
      return;
    }

    // CSV generieren (mit Passwort)
    const csv = ['email,password,user_id,created_at', ...data.map(row => `${row.email},${row.password},${row.user_id},${row.created_at}`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    alert('Unerwarteter Fehler: ' + err.message);
  }
}

// Passwort zurücksetzen
async function resetPassword() {
  const email = document.getElementById('email').value;
  if (!email) {
    alert('Bitte gib eine E-Mail-Adresse ein.');
    return;
  }

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://deine-github-pages-url/reset-password.html'
    });
    if (error) {
      alert('Fehler beim Senden des Zurücksetz-Links: ' + error.message);
      return;
    }
    alert('Ein Link zum Zurücksetzen des Passworts wurde an deine E-Mail gesendet.');
  } catch (err) {
    alert('Unerwarteter Fehler: ' + err.message);
  }
}

// Neues Passwort speichern
async function updatePassword() {
  const password = document.getElementById('password').value;
  try {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      alert('Fehler beim Aktualisieren des Passworts: ' + error.message);
      return;
    }
    // Optional: Passwort in users-Tabelle aktualisieren
    const { data: user } = await supabase.auth.getUser();
    const { error: dbError } = await supabase
      .from('users')
      .update({ password })
      .eq('user_id', user.user.id);
    if (dbError) {
      console.error('Fehler beim Aktualisieren des Passworts in users:', dbError);
    }
    alert('Passwort erfolgreich aktualisiert! Du kannst dich jetzt anmelden.');
    window.location.href = 'index.html';
  } catch (err) {
    alert('Unerwarteter Fehler: ' + err.message);
  }
}
