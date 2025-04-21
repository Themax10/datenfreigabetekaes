// Supabase Initialisierung
const SUPABASE_URL = 'https://pfztjmobxymxgefjznax.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmenRqbW9ieHlteGdlZmp6bmF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyNDAzMDIsImV4cCI6MjA2MDgxNjMwMn0.cTcOArvqK0UeNinVpxQ2A_BcUFAy--BalHR7oKsWZXk';
const supabase = Supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Simulierte Anmeldung
function simulateSignIn() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  if (email && password) {
    localStorage.setItem('user', JSON.stringify({ email }));
    alert('Anmeldung erfolgreich!');
    window.location.href = 'dashboard.html';
  } else {
    alert('Bitte gib E-Mail und Passwort ein.');
  }
}

// Simulierte Registrierung
function simulateSignUp() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  if (email && password) {
    localStorage.setItem('user', JSON.stringify({ email }));
    alert('Registrierung erfolgreich! Du bist angemeldet.');
    window.location.href = 'dashboard.html';
  } else {
    alert('Bitte gib E-Mail und Passwort ein.');
  }
}

// Abmeldung
function signOut() {
  localStorage.removeItem('user');
  window.location.href = 'index.html';
}

// Datei hochladen zu Supabase
async function uploadFile() {
  const fileInput = document.getElementById('fileInput');
  const file = fileInput.files[0];
  if (!file) {
    alert('Bitte wähle eine Datei aus.');
    return;
  }

  try {
    const { data, error } = await supabase.storage
      .from('uploads')
      .upload(`${Date.now()}_${file.name}`, file);
    
    if (error) {
      console.error('Upload-Fehler:', error);
      alert('Fehler beim Hochladen der Datei: ' + error.message);
      return;
    }

    alert('Datei erfolgreich hochgeladen!');
    listFiles();
  } catch (err) {
    console.error('Unerwarteter Fehler:', err);
    alert('Ein unerwarteter Fehler ist aufgetreten.');
  }
}

// Dateien auflisten
async function listFiles() {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) {
    window.location.href = 'index.html';
    return;
  }

  const fileList = document.getElementById('fileList');
  fileList.innerHTML = '';

  try {
    const { data, error } = await supabase.storage.from('uploads').list();
    if (error) {
      console.error('Fehler beim Abrufen der Dateien:', error);
      alert('Fehler beim Abrufen der Dateien: ' + error.message);
      return;
    }

    data.forEach(file => {
      const li = document.createElement('li');
      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/uploads/${file.name}`;
      li.innerHTML = `<a href="${publicUrl}" target="_blank">${file.name}</a>`;
      fileList.appendChild(li);
    });
  } catch (err) {
    console.error('Unerwarteter Fehler:', err);
    alert('Ein unerwarteter Fehler ist aufgetreten.');
  }
}

// Auth-Status prüfen und Dateien laden
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.includes('dashboard.html')) {
    listFiles();
  }
});
