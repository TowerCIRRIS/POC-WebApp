const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SUBMISSIONS_FILE = path.join(DATA_DIR, 'submissions.json');

// Créer le dossier data s'il n'existe pas
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialiser les fichiers de données
function initializeDataFiles() {
  if (!fs.existsSync(USERS_FILE)) {
    const defaultUsers = {
      users: [
        {
          id: 'pro1',
          username: 'therapiste',
          password: 'password123',
          role: 'professional',
          name: 'Dr. Marie Dupont',
          patients: ['patient1', 'patient2']
        },
        {
          id: 'patient1',
          username: 'jean',
          password: 'password123',
          role: 'patient',
          name: 'Jean Martin',
          professionalId: 'pro1',
          createdAt: new Date().toISOString()
        },
        {
          id: 'patient2',
          username: 'marie',
          password: 'password123',
          role: 'patient',
          name: 'Marie Bouchard',
          professionalId: 'pro1',
          createdAt: new Date().toISOString()
        }
      ]
    };
    fs.writeFileSync(USERS_FILE, JSON.stringify(defaultUsers, null, 2));
  }

  if (!fs.existsSync(SUBMISSIONS_FILE)) {
    fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify({ submissions: [] }, null, 2));
  }
}

function readUsers() {
  return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
}

function writeUsers(data) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2));
}

function readSubmissions() {
  return JSON.parse(fs.readFileSync(SUBMISSIONS_FILE, 'utf8'));
}

function writeSubmissions(data) {
  fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(data, null, 2));
}

initializeDataFiles();

// Routes

// Login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const usersData = readUsers();
  const user = usersData.users.find(u => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).json({ error: 'Identifiants invalides' });
  }

  res.json({
    id: user.id,
    username: user.username,
    role: user.role,
    name: user.name,
    professionalId: user.professionalId,
    patients: user.patients || []
  });
});

// Créer un nouveau patient (pro seulement)
app.post('/api/patients', (req, res) => {
  const { professionalId, username, password, name } = req.body;
  
  const usersData = readUsers();
  const pro = usersData.users.find(u => u.id === professionalId && u.role === 'professional');
  
  if (!pro) {
    return res.status(401).json({ error: 'Professionnel non autorisé' });
  }

  const newPatientId = 'patient_' + Date.now();
  const newPatient = {
    id: newPatientId,
    username,
    password,
    role: 'patient',
    name,
    professionalId,
    createdAt: new Date().toISOString()
  };

  usersData.users.push(newPatient);
  if (!pro.patients) pro.patients = [];
  pro.patients.push(newPatientId);

  writeUsers(usersData);
  res.json(newPatient);
});

// Soumettre questionnaire (patient)
app.post('/api/submissions', (req, res) => {
  const { patientId, pain, fatigue, functionality, completedExercises } = req.body;

  const submission = {
    id: 'sub_' + Date.now(),
    patientId,
    timestamp: new Date().toISOString(),
    pain: parseInt(pain),
    fatigue: parseInt(fatigue),
    functionality: parseInt(functionality),
    completedExercises: parseInt(completedExercises) || 0
  };

  const submissions = readSubmissions();
  submissions.submissions.push(submission);
  writeSubmissions(submissions);

  res.json(submission);
});

// Récupérer submissions d'un patient
app.get('/api/patients/:patientId/submissions', (req, res) => {
  const { patientId } = req.params;
  const submissions = readSubmissions();
  const patientSubmissions = submissions.submissions
    .filter(s => s.patientId === patientId)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  res.json(patientSubmissions);
});

// Récupérer tous les patients d'un professionnel
app.get('/api/professionals/:professionalId/patients', (req, res) => {
  const { professionalId } = req.params;
  const usersData = readUsers();
  
  const pro = usersData.users.find(u => u.id === professionalId && u.role === 'professional');
  if (!pro) {
    return res.status(401).json({ error: 'Professionnel non trouvé' });
  }

  const patientIds = pro.patients || [];
  const patients = usersData.users.filter(u => patientIds.includes(u.id));

  // Pour chaque patient, ajouter ses dernières soumissions
  const submissions = readSubmissions();
  const patientsWithData = patients.map(patient => {
    const patientSubs = submissions.submissions
      .filter(s => s.patientId === patient.id)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return {
      ...patient,
      totalSubmissions: patientSubs.length,
      lastSubmission: patientSubs[0] || null,
      weeklyData: patientSubs.slice(0, 7)
    };
  });

  res.json(patientsWithData);
});

// Réception des données ESP32
app.post('/api/device-data', (req, res) => {
  const { deviceToken, movements, duration } = req.body;

  if (!deviceToken) {
    return res.status(400).json({ error: 'deviceToken requis' });
  }

  const usersData = readUsers();
  const patient = usersData.users.find(u => u.deviceToken === deviceToken && u.role === 'patient');

  if (!patient) {
    return res.status(404).json({ error: 'Appareil non associé à un patient' });
  }

  const submissions = readSubmissions();
  const entry = {
    id: 'device_' + Date.now(),
    patientId: patient.id,
    timestamp: new Date().toISOString(),
    source: 'esp32',
    movements: parseInt(movements) || 0,
    duration: parseInt(duration) || 0
  };

  submissions.submissions.push(entry);
  writeSubmissions(submissions);

  res.json({ ok: true, patientId: patient.id });
});

// Associer un appareil ESP32 à un patient (pro seulement)
app.post('/api/patients/:patientId/device', (req, res) => {
  const { patientId } = req.params;
  const { deviceToken, professionalId } = req.body;

  const usersData = readUsers();
  const pro = usersData.users.find(u => u.id === professionalId && u.role === 'professional');
  if (!pro) return res.status(401).json({ error: 'Non autorisé' });

  const patient = usersData.users.find(u => u.id === patientId);
  if (!patient) return res.status(404).json({ error: 'Patient non trouvé' });

  if (deviceToken) {
    patient.deviceToken = deviceToken;
  } else {
    delete patient.deviceToken;
  }
  writeUsers(usersData);

  res.json({ ok: true, deviceToken });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Serveur de réadaptation lancé sur http://localhost:${PORT}`);
  console.log(`📱 Accessible sur le WiFi: http://[ton-ip-locale]:${PORT}`);
  console.log('\n📝 Comptes de test:');
  console.log('   Thérapeute: therapiste / password123');
  console.log('   Patient 1: jean / password123');
  console.log('   Patient 2: marie / password123');
});
