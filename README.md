# CactusClub — CRM & Dashboard d'Agence pour Créateurs

Plateforme SaaS haute performance et pixel-perfect conçue pour les agences de gestion de créateurs (OnlyFans, Fanvue, Fansly). Elle réunit dans un même écosystème un **Dashboard Business Intelligence Administrateur** et une **Station Live Chat Professionnelle pour Chatters**.

![CactusClub Agency](https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80)

---

## 🧭 Deux Interfaces Dédiées

| Interface | URL d'Accès Direct | Rôle Principal |
| :--- | :--- | :--- |
| **Dashboard Admin** | **`http://localhost:5173/admin`** | Pilotage financier, performance des chatters, planning des shifts & configuration globale |
| **Messages Pro Workstation** | **`http://localhost:5173/`** ou **`/messages`** | Cockpit 3 colonnes pour chatters en direct, scripts, PPV & CRM fans |

---

## 🚀 Fonctionnalités Détaillées

### 1. Dashboard Administrateur (`/admin`)
* **Vue d'ensemble des revenus créateurs (*Creator Earnings Overview*)** :
  * Filtre temporel instantané : *Hier*, *Aujourd'hui*, *Cette semaine* ($6,739.07), *Ce mois*.
  * Décomposition détaillée sur 6 flux de revenus :
    * 📑 Abonnements (*Subscriptions*) : $352.70
    * 📝 Publications (*Posts*) : $356.79
    * 💬 Messages privés (*Messages*) : $4,165.56
    * 💡 Pourboires (*Tips*) : $1,864.02
    * 👥 Parrainages (*Referrals*) : $0.00
    * 🎛️ Diffusions en direct (*Streams*) : $0.00
  * Bascule Net / Brut (*Net earnings ⌄*).
  * Célébration interactive au clic avec explosion de confettis dorés et effet sonore d'encaissement.
* **Graphique de ventes des employés (*Employee Sales*)** :
  * **Mode Courbe de Bézier SVG** : Tracé fluide avec anneau radar pulsant sur le jour record (26 oct., $350), réticule de suivi vertical et infobulle holographique au survol.
  * **Mode Classement (Leaderboard)** : Tableau comparatif des chatters (Simon, Nella, Florent, Heron) avec chiffre d'affaires généré, volume de conversions et scores de satisfaction.
* **Gestion des plannings & quarts (*Scheduled Hours & Shifts*)** :
  * Grille hebdomadaire de la brigade de chatters avec statut en direct (En poste, À venir, Planifié, Repos).
  * Indicateur radar vert pulsant sur les opérateurs actuellement en ligne.
* **Sélecteur multi-plateformes** : Bascule en un clic entre *OnlyFans*, *Fanvue* et *Fansly*.
* **Tiroir de notifications en temps réel** : Suivi des ventes PPV, pourboires reçus et alertes du moteur de sécurité Shield AI.
* **Paramètres opérationnels d'agence** : Modal de configuration pour régler les pourcentages de commission (Créateur / Agence / Chatter), l'auto-traduction des messages fans et les seuils anti-fraude.

### 2. Station Live Chat Messages Pro (`/` ou `/messages`)
* **Architecture Cockpit en 3 Colonnes** :
  * **Colonne Gauche (Boîte de réception & Queue)** :
    * Badges de dépenses fans instantanés ($0, $80, $125, $860+).
    * Filtres par onglets : *Tous*, *Épinglés*, *Priorité*, *Non lus*, *Avec Tips*.
    * Dictaphone intégré pour l'enregistrement et l'envoi de mémos vocaux.
    * Recherche rapide de conversations en direct.
  * **Colonne Centrale (Flux de discussion en direct)** :
    * En-tête avec raccourcis galerie, scripts et profil fan.
    * Identification visuelle de l'opérateur en charge (*SIMON*, *Nella*).
    * Cartes de campagnes broadcast citées dans la conversation.
    * Média verrouillé PPV avec déverrouillage interactif et lecteur de forme d'onde audio.
    * Moteur de scripts instantané : tapez `/` dans la zone de texte pour rechercher et insérer une réponse type en 1 seconde.
  * **Colonne Droite (CRM Insights Fan)** :
    * Métriques comportementales : Pouvoir d'achat (*Top 5%*), risque de chargeback faible (*Low risk*).
    * Historique d'abonnement et statut de renouvellement automatique.
    * Système de tags interactifs (`#whale`, `#vip`, etc.).
    * Bloc-notes interne partagé entre les chatters de l'agence.
    * Bouton d'envoi de pourboire simulé avec confettis.

### 3. Productivité & Outils Système
* **Mode SFW (Safe For Work)** : Floutage gaussien matériel instantané de tous les visuels sensibles d'un simple clic sur le cadenas SFW.
* **Moteur Multilingue (i18n)** : Prise en charge native du Français (🇫🇷), Anglais (🇬🇧), Espagnol (🇪🇸) et Allemand (🇩🇪) avec mémorisation des préférences.
* **Thèmes Sombre & Clair** : Transitions soignées et contrastes étudiés pour le travail de jour comme de nuit.
* **Synthétiseur Audio Natif (Web Audio API)** : Effets sonores générés en temps réel par fréquences (aucun fichier MP3 lourd à charger, latence de 0 ms).
* **Simulateur d'événements Live** : Bouton dans la barre supérieure pour simuler l'arrivée d'un message fan ou d'un pourboire en direct lors de vos démos.
* **Boîte à outils de modales** :
  * Coffre de médias Vault Pro avec aperçus
  * Générateur de PPV avec tarification personnalisée
  * Campagnes de messages de masse (Mass DM)
  * Sélecteur de GIF animés
  * Planificateur de messages programmés
  * Connecteur de nouveaux comptes créateurs

---

## 🛠️ Stack Technique

* **Framework Frontend** : [React 19](https://react.dev/)
* **Outil de Build** : [Vite](https://vitejs.dev/)
* **Typage** : [TypeScript](https://www.typescriptlang.org/) (mode `verbatimModuleSyntax`)
* **Feuilles de Style** : [Tailwind CSS v4](https://tailwindcss.com/)
* **Bibliothèque d'Icônes** : [Lucide React](https://lucide.dev/)
* **Moteur Audio** : API Web Audio native du navigateur
* **Micro-Interactions** : Canvas Confetti

---

## 💻 Installation & Démarrage Rapide

### Prérequis
* [Node.js](https://nodejs.org/) (version 18+ ou 20+ recommandée)
* npm, pnpm ou yarn

### 1. Cloner le dépôt

```bash
git clone https://github.com/businessofsmc-dev/Cactusclub.git
cd Cactusclub
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Lancer le serveur de développement

```bash
npm run dev
```

L'application est immédiatement accessible sur votre machine locale :
* 📊 **Dashboard Admin** : [http://localhost:5173/admin](http://localhost:5173/admin)
* 💬 **Messages Pro (Live Chat)** : [http://localhost:5173/](http://localhost:5173/)

### 4. Compiler pour la production

```bash
npm run build
```

Pour prévisualiser le build de production localement :
```bash
npm run preview
```

---

## 🚀 Déploiement en Production

Le projet est configuré pour un déploiement direct sans aucune manipulation supplémentaire :

* **Vercel** : Le fichier [`vercel.json`](vercel.json) gère automatiquement la réécriture d'URL SPA vers `index.html` pour que les accès directs à `/admin` et `/messages` ne produisent aucune erreur 404.
* **Netlify / Cloudflare Pages** : Le fichier [`public/_redirects`](public/_redirects) assure les mêmes redirections natives.

Il vous suffit de connecter votre dépôt GitHub **`businessofsmc-dev/Cactusclub`** à votre compte Vercel ou Netlify pour lancer le déploiement continu.

---

## 📁 Architecture Technique

Une documentation détaillée sur l'organisation des composants, les flux de données et le cycle de vie des interactions est disponible dans le fichier [`ARCHITECTURE.md`](ARCHITECTURE.md).

---

## 📜 Licence

Logiciel privé développé pour l'agence **CactusClub**. Tous droits réservés.
