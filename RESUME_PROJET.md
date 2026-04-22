# 🏢 Oriafilia Partners — Résumé du Projet

## 📋 Le Besoin

**Oriafilia** (marque commerciale d'Integra Partners) est un cabinet de courtage en assurance qui travaille avec un **réseau de courtiers partenaires**. Ces partenaires identifient et soumettent des **leads** (prospects) à Oriafilia, qui se charge ensuite de les convertir en clients assurés.

Le besoin principal est de disposer d'une **plateforme SaaS B2B** permettant de :

1. **Recruter des partenaires** via un système d'invitation sécurisé (lien unique).
2. **Centraliser la soumission de leads** — un partenaire peut soumettre un lead manuellement ou en masse via un fichier CSV.
3. **Suivre le pipeline commercial** — chaque lead passe par des étapes de traitement (Nouveau → Contacté → Qualifié → Converti et Payé).
4. **Calculer et verser les commissions** — quand un lead est converti, le partenaire touche un pourcentage sur la prime d'assurance.
5. **Administrer le réseau** — l'administrateur supervise tous les partenaires, tous les leads, et gère les paiements.

---

## 🛠️ Architecture Technique

| Couche | Technologie | Rôle |
|--------|------------|------|
| **Frontend** | React 19 + Vite 8 | Interface utilisateur SPA |
| **Routing** | React Router v7 | Navigation côté client |
| **Backend / BDD** | Supabase (PostgreSQL) | Auth, base de données, Row Level Security |
| **Graphiques** | Recharts | Visualisation des KPI et du pipeline |
| **Icônes** | Lucide React | Iconographie cohérente |
| **Import CSV** | PapaParse | Parsing de fichiers CSV côté client |
| **Hébergement** | Vercel | Déploiement automatique via `git push` sur `master` |
| **Dépôt** | GitHub (`integrassur/oriafilia-partners`) | Versionnement du code |

### Design
- **Thème sombre** cohérent sur l'ensemble de l'application
- Palette de couleurs harmonieuse avec des accents bleu/vert/orange
- Typographie moderne (Inter)
- Animations d'entrée fluides (`fade-in`, `stagger`)
- Responsive et adapté aux écrans larges (dashboard grid)

---

## ✅ Ce qui a été réalisé

### 🔐 Authentification & Gestion des Utilisateurs
- [x] Connexion sécurisée via Supabase Auth (email + mot de passe)
- [x] Système d'invitation par lien unique avec token (page `/invite/:token`)
- [x] Inscription simplifiée : nom, prénom, email, mot de passe uniquement
- [x] Suppression des champs réglementaires (SIRET, ORIAS, IBAN) — transférés sur le contrat signé en ligne
- [x] Page profil avec modification des informations personnelles
- [x] Protection des routes (accès authentifié obligatoire)
- [x] Gestion des rôles (`admin` / `partner`) avec Row Level Security (RLS) sur Supabase

### 📝 Soumission de Leads
- [x] Formulaire de soumission manuelle (nom, email, téléphone, produit, situation, source, notes)
- [x] Import en masse via CSV avec :
  - En-têtes en MAJUSCULES sans accents (`NOM`, `EMAIL`, `TELEPHONE`, etc.)
  - Normalisation intelligente des en-têtes (gestion accents, espaces, casse)
  - Gestion d'erreurs ligne par ligne (un échec ne bloque pas l'import)
  - Messages d'erreur détaillés (message Supabase réel affiché)
  - Modèle CSV téléchargeable avec BOM UTF-8 pour Excel
- [x] Fichier de démo de 35 contacts générés aléatoirement

### 📊 Dashboard Partenaire
- [x] KPIs en temps réel : nombre de leads, leads en cours, taux de conversion, gains totaux
- [x] Graphique du pipeline (répartition par statut)
- [x] Graphique des commissions (évolution sur 6 mois)
- [x] Activité récente (5 derniers leads mis à jour)
- [x] Bouton d'accès rapide pour créer un nouveau lead

### 📡 Dashboard Administrateur (Cockpit)
- [x] Vue consolidée de tout le réseau
- [x] KPIs globaux : total leads, taux de conversion, commissions dues, partenaires actifs
- [x] **Palmarès des courtiers** (Leaderboard) : classement par nombre de conversions, taux, panier moyen, CA généré
- [x] **Alertes partenaires inactifs** (0 lead soumis)
- [x] Filtrage par période (mois, trimestre, année, tout l'historique)
- [x] Graphiques : Pipeline, Mix Produits, Commissions

### 🔄 Suivi des Leads
- [x] Tableau de suivi avec recherche, filtres (statut, produit), et tri par colonnes
- [x] Export CSV des leads filtrés
- [x] Modal de détails avec toutes les informations du lead
- [x] **Statuts simplifiés** : `NOUVEAU` → `CONTACTE` → `FAUX NUMERO` → `QUALIFIE` → `CONVERTI ET PAYE`
- [x] **Restriction d'accès** : les partenaires voient le statut mais ne peuvent pas le modifier
- [x] Seuls les administrateurs peuvent changer le statut et saisir la commission

### 🏛️ Administration des Leads (Global Leads Center)
- [x] Vue **Liste** et vue **Kanban** (colonnes par statut)
- [x] Filtre par partenaire propriétaire
- [x] **Édition rapide** : changer le statut, réassigner un lead à un autre partenaire
- [x] Champ commission qui apparaît uniquement quand le statut est `CONVERTI ET PAYE`
- [x] Suppression en masse avec confirmation
- [x] Import CSV depuis l'interface admin

### 💰 Module Commissions
- [x] **Vue Admin** : centre de paiement avec commissions en attente et historique payé
- [x] Sélection multiple + export CSV + marquage "Payé" en lot
- [x] **Vue Partenaire** : commission totale gagnée, ce mois, commission potentielle, taux de conversion
- [x] Historique des leads convertis avec détail des montants
- [x] Tableau des commissions en attente

### 👥 Gestion des Partenaires (Admin)
- [x] Liste de tous les partenaires avec statut (actif/inactif)
- [x] Envoi d'invitations par email
- [x] Réinitialisation de mot de passe par l'admin
- [x] Activation/désactivation de comptes

### 🎨 Design & UX
- [x] Thème sombre professionnel et cohérent
- [x] Stylisation des éléments natifs (select, option) pour le dark mode
- [x] Animations d'entrée staggerées sur les KPI cards
- [x] Sidebar responsive avec navigation contextuelle (admin vs partner)
- [x] Badges de statut colorés
- [x] Conformité ESLint (0 erreur)

---

## 🔲 Ce qui reste à faire

### 🔴 Priorité Haute
- [ ] **Notifications email automatiques** — Alerter le partenaire quand son lead change de statut
- [ ] **Workflow de signature électronique** — Contrat entre Oriafilia et le partenaire (remplacement des champs réglementaires supprimés)
- [ ] **Sécurisation RLS complète** — Audit approfondi des politiques Supabase pour s'assurer qu'aucune donnée ne fuit entre partenaires

### 🟡 Priorité Moyenne
- [ ] **Tableau de bord analytique avancé** — Graphiques de tendances, prédictions, comparaisons mois/mois
- [ ] **Historique des actions** — Log d'audit : qui a changé quoi et quand
- [ ] **Système de rappels** — Relance automatique des leads en attente depuis X jours
- [ ] **Multi-langue** — Support FR/EN pour les partenaires internationaux
- [ ] **Export PDF** — Génération de rapports mensuels de commissions

### 🟢 Priorité Basse (Nice to Have)
- [ ] **Application mobile** (PWA ou React Native)
- [ ] **Intégration CRM externe** (HubSpot, Salesforce)
- [ ] **Chat interne** entre admin et partenaires
- [ ] **Système de gamification** — Badges, objectifs mensuels, récompenses
- [ ] **API publique** pour intégrations tierces

---

## 📈 Taux d'Avancement Global

```
████████████████████░░░░░░░░░░  65%
```

| Module | Avancement | Détail |
|--------|:----------:|--------|
| Authentification & Rôles | 🟢 95% | Manque la signature de contrat en ligne |
| Soumission de Leads | 🟢 100% | Formulaire + CSV import fonctionnels |
| Dashboard Partenaire | 🟢 90% | Fonctionnel, graphiques en place |
| Dashboard Admin | 🟢 90% | Cockpit complet avec leaderboard |
| Suivi des Leads | 🟢 95% | Tableau, filtres, modal, restrictions d'accès |
| Admin Leads Center | 🟢 90% | Liste + Kanban + édition rapide |
| Module Commissions | 🟡 80% | Manque les notifications et l'export PDF |
| Gestion Partenaires | 🟡 75% | Manque la signature de contrat |
| Notifications Email | 🔴 0% | Non commencé |
| Signature Électronique | 🔴 0% | Non commencé |
| Audit de Sécurité | 🟡 50% | RLS en place, audit approfondi à faire |
| Tests automatisés | 🔴 0% | Aucun test unitaire ou E2E |

---

## 🗂️ Structure du Projet

```
Integra_Partners/
├── src/
│   ├── components/          # 13 composants réutilisables
│   │   ├── CsvImportBtn     # Import CSV avec parsing et validation
│   │   ├── LeadForm         # Formulaire de soumission de lead
│   │   ├── LeadTable        # Tableau de suivi des leads
│   │   ├── LeadDetailModal  # Modal de détails (admin: édition statut)
│   │   ├── StatusBadge      # Badge coloré par statut
│   │   ├── KPICard          # Carte KPI animée
│   │   ├── PipelineChart    # Graphique pipeline (bar chart)
│   │   ├── CommissionChart  # Graphique commissions (area chart)
│   │   ├── ProductMixChart  # Graphique mix produits (pie chart)
│   │   ├── Sidebar          # Navigation latérale contextuelle
│   │   ├── Header           # En-tête avec profil utilisateur
│   │   ├── Layout           # Layout principal (Sidebar + Outlet)
│   │   └── ProtectedRoute   # Guard d'authentification
│   ├── pages/               # 9 pages
│   │   ├── LoginPage        # Connexion
│   │   ├── InvitePage       # Inscription via invitation
│   │   ├── DashboardPage    # Tableau de bord (Partner / Admin)
│   │   ├── SubmitLeadPage   # Soumettre un lead
│   │   ├── TrackLeadsPage   # Suivi des leads
│   │   ├── CommissionsPage  # Commissions (Partner / Admin)
│   │   ├── ProfilePage      # Profil utilisateur
│   │   ├── AdminUsersPage   # Gestion des partenaires
│   │   └── AdminLeadsPage   # Global Leads Center (Liste + Kanban)
│   ├── context/             # État global React
│   │   ├── AuthContext       # Authentification et session Supabase
│   │   └── LeadContext       # CRUD leads + mapping DB ↔ Frontend
│   ├── config/              # Configuration
│   │   ├── supabaseClient    # Client Supabase initialisé
│   │   └── setup_supabase    # Script SQL de création du schéma
│   ├── utils/               # Utilitaires
│   │   ├── helpers           # Formatage, calculs, export CSV
│   │   └── seedData          # Données de démo et constantes
│   ├── App.jsx              # Routing principal
│   ├── main.jsx             # Point d'entrée React
│   ├── index.css            # Design system (thème sombre)
│   └── admin-design.css     # Styles spécifiques admin
├── vercel.json              # Configuration Vercel (SPA rewrites)
├── package.json             # Dépendances et scripts
└── demo_35_leads.csv        # Fichier de test avec 35 leads
```

---

## 🔑 Points Techniques Clés

> [!IMPORTANT]
> **Mapping des statuts** — Le frontend utilise des noms en MAJUSCULES (`CONVERTI ET PAYE`) tandis que la base Supabase stocke des valeurs en minuscules (`gagne`). Le mapping bidirectionnel est géré dans `LeadContext.jsx` via `DB_TO_FRONTEND_STATUS` et `FRONTEND_TO_DB_STATUS`.

> [!WARNING]
> **Contrainte CHECK PostgreSQL** — La table `leads` a une contrainte `CHECK` sur la colonne `status` qui limite les valeurs autorisées. Toute modification des statuts nécessite une mise à jour de cette contrainte via le SQL Editor de Supabase.

> [!NOTE]
> **Row Level Security (RLS)** — Supabase est configuré pour que les partenaires ne voient que leurs propres leads, tandis que l'admin voit tout. Cela est géré par des politiques RLS et une fonction `is_admin()` stockée en base.

---

*Dernière mise à jour : 22 avril 2026*
