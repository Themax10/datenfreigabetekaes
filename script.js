const firebaseConfig = {
  // Füge hier deine Firebase-Konfiguration ein
  apiKey: "DEIN_API_KEY",
  authDomain: "DEIN_PROJEKT.firebaseapp.com",
  projectId: "DEIN_PROJEKT",
  storageBucket: "DEIN_PROJEKT.appspot.com",
  messagingSenderId: "DEINE_ID",
  appId: "DEINE_APP_ID"
};

// Firebase initialisieren
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const storage = firebase.storage();

// Anmeldung
function signIn() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      window.location.href = 'dashboard.html';
    })
    .catch(error => alert('Fehler: ' + error.message));
}

// Registrierung
function signUp() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  auth.createUserWithEmailAndPassword(email, password)
    .then(() => alert('Registrierung erfolgreich! Bitte anmelden.'))
    .catch(error => alert('Fehler: ' + error.message));
}

// Abmeldung
function signOut() {
  auth.signOut().then(() => {
    window.location.href = 'index.html';
  });
}

// Datei hochladen
function uploadFile() {
  const file = document.getElementById('fileInput').files[0];
  if (!file) {
    alert('Bitte wähle eine Datei aus.');
    return;
  }
  const user = auth.currentUser;
  if (!user) {
    alert('Nicht angemeldet!');
    return;
  }
  const storageRef = storage.ref(`files/${user.uid}/${file.name}`);
  storageRef.put(file).then(() => {
    alert('Datei hochgeladen!');
    listFiles();
  });
}

// Dateien auflisten
function listFiles() {
  const user = auth.currentUser;
  if (!user) return;
  const listRef = storage.ref(`files/${user.uid}`);
  const fileList = document.getElementById('fileList');
  fileList.innerHTML = '';
  listRef.listAll().then(res => {
    res.items.forEach(item => {
      item.getDownloadURL().then(url => {
        const li = document.createElement('li');
        li.innerHTML = `<a href="${url}" download>${item.name}</a>`;
        fileList.appendChild(li);
      });
    });
  });
}

// Auth-Status prüfen
auth.onAuthStateChanged(user => {
  if (user && window.location.pathname.includes('dashboard.html')) {
    listFiles();
  } else if (!user && window.location.pathname.includes('dashboard.html')) {
    window.location.href = 'index.html';
  }
});
