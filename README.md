# 🏥 Application de Suivi de Réadaptation - Membre Supérieur Post-AVC

Application web multi-utilisateurs pour suivre la réadaptation des patients post-AVC.

## 🚀 Démarrage Rapide

### 1. Installation des dépendances

```bash
npm install
```

### 2. Lancer le serveur

```bash
npm start
```

Vous devriez voir :
```
🚀 Serveur de réadaptation lancé sur http://localhost:3000
📱 Accessible sur le WiFi: http://[ton-ip-locale]:3000
```

### 3. Accéder à l'application

- Sur votre ordinateur : http://localhost:3000
- Sur téléphone/iPad sur le même WiFi : http://[votre-ip-locale]:3000

**Trouvez votre IP locale :**
- macOS/Linux : `ifconfig | grep "inet "`
- Windows : `ipconfig` (cherchez IPv4 Address)
- Exemple : http://192.168.1.100:3000

## 👥 Comptes de Test

### Thérapeute
- **Utilisateur** : `therapiste`
- **Mot de passe** : `password123`
- Peut voir 2 patients de test

### Patient 1
- **Utilisateur** : `jean`
- **Mot de passe** : `password123`

### Patient 2
- **Utilisateur** : `marie`
- **Mot de passe** : `password123`

## 📋 Fonctionnalités

### Pour les Patients
✅ Remplir un questionnaire quotidien (1-2x/jour)
- Évaluation de la douleur (0-10)
- Évaluation de la fatigue (0-10)
- Évaluation de la capacité fonctionnelle (4 niveaux)

✅ Voir son progrès
- Nombre total de soumissions
- Moyenne hebdomadaire
- Douleur moyenne

✅ Consulter l'historique
- Toutes les soumissions datées
- Détails de chaque évaluation

### Pour les Thérapeutes
✅ Gérer ses patients
- Vue d'ensemble de tous les patients
- Dernier score de douleur visible
- Nombre de soumissions

✅ Suivre chaque patient en détail
- Graphique d'évolution (douleur + fatigue)
- Statistiques : total, hebdomadaire, moyennes
- Historique complet des soumissions

✅ Ajouter de nouveaux patients
- Création de compte directement dans l'app

## 🗂️ Structure des Fichiers

```
.
├── server.js              # Backend Express
├── package.json           # Dépendances
├── public/
│   └── index.html        # Interface web (tout-en-un)
├── data/
│   ├── users.json        # Comptes utilisateurs
│   └── submissions.json   # Réponses aux questionnaires
└── README.md             # Ce fichier
```

## 💾 Stockage des Données

Toutes les données sont sauvegardées en **JSON local** sur votre ordinateur dans le dossier `data/`.

- `users.json` : comptes patients et thérapeutes
- `submissions.json` : réponses aux questionnaires

**Sauvegarde** : vos données sont persistantes entre les redémarrages du serveur.

## 🔒 Sécurité pour la PoC

⚠️ Cette version n'est **PAS chiffrée** ni sécurisée pour la production.

Pour une version production, ajoutez :
- Hachage des mots de passe (bcrypt)
- JWT pour l'authentification
- HTTPS/SSL
- Conformité PIPEDA/RGPD
- Chiffrement en base de données

## 🐛 Dépannage

### "Cannot find module 'express'"
```bash
npm install
```

### Port 3000 déjà en utilisation
Modifiez le port dans `server.js` ligne à la fin :
```javascript
const PORT = 3001; // changez 3000 en 3001
```

### Impossible de se connecter sur téléphone
- Vérifiez que téléphone et ordi sont sur le **même WiFi**
- Utilisez votre **adresse IP locale** (ex: 192.168.1.100) pas localhost
- Vérifiez le pare-feu : autorisez le port 3000

### Les données ne se sauvegardent pas
Vérifiez que le dossier `data/` existe et est accessible en écriture.

## 📈 Développements Futurs

Pour passer à la production :
- [ ] Intégrer Firebase/Supabase
- [ ] Ajouter hachage des mots de passe
- [ ] Ajouter JWT tokens
- [ ] Ajouter tests unitaires
- [ ] Intégrer scales cliniques (Berg Balance, Fugl-Meyer)
- [ ] Export PDF des rapports
- [ ] Notifications/rappels pour compliance
- [ ] Synchronisation cloud

## 📞 Support

Besoin d'aide ? Vérifiez :
1. Le serveur est-il lancé ? (vous voyez le message 🚀)
2. Êtes-vous sur le même WiFi ?
3. Avez-vous la bonne adresse IP ?

---

Bonne chance avec votre PoC ! 🚀
