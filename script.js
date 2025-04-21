let uploadedFiles = JSON.parse(localStorage.getItem('files')) || [];

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

function signOut() {
  localStorage.removeItem('user');
  window.location.href = 'index.html';
}

function uploadFile() {
  const fileInput = document.getElementById('fileInput');
  const file = fileInput.files[0];
  if (!file) {
    alert('Bitte wähle eine Datei aus.');
    return;
  }
  uploadedFiles.push({ name: file.name, type: file.type });
  localStorage.setItem('files', JSON.stringify(uploadedFiles));
  alert('Datei "hochgeladen" (simuliert)!');
  listFiles();
}

function listFiles() {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) {
    window.location.href = 'index.html';
    return;
  }
  const fileList = document.getElementById('fileList');
  fileList.innerHTML = '';
  uploadedFiles.forEach(file => {
    const li = document.createElement('li');
    li.innerHTML = `<a href="example.pdf" download>${file.name}</a>`;
    fileList.appendChild(li);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.includes('dashboard.html')) {
    listFiles();
  }
});
