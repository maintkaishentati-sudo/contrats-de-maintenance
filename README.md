# Contrats de maintenance — guide de déploiement

Cette application est une vraie application web : une fois déployée, elle est accessible via un lien, depuis n'importe quel PC ou téléphone, avec une connexion par email et mot de passe.

Elle utilise deux services gratuits (pour un usage personnel) :
- **Supabase** : la base de données (où sont stockés vos contrats) et l'authentification
- **Vercel** : l'hébergement du site web

Aucune compétence technique poussée n'est nécessaire — suivez les étapes dans l'ordre. Comptez 15 à 20 minutes la première fois.

---

## Étape 1 — Créer le projet Supabase (base de données + connexion)

1. Allez sur **https://supabase.com** et créez un compte (gratuit).
2. Cliquez sur **"New project"**.
   - Donnez-lui un nom, par exemple `contrats-maintenance`.
   - Choisissez un mot de passe pour la base de données (notez-le de côté, vous n'en aurez pas besoin au quotidien mais gardez-le).
   - Choisissez une région proche de vous (ex : Europe).
3. Attendez 1 à 2 minutes que le projet soit prêt.

## Étape 2 — Créer la table des contrats

1. Dans le menu de gauche de Supabase, cliquez sur **"SQL Editor"**.
2. Cliquez sur **"New query"**.
3. Ouvrez le fichier `supabase/schema.sql` fourni avec ce projet, copiez tout son contenu, collez-le dans l'éditeur SQL.
4. Cliquez sur **"Run"**.
5. Vous devriez voir un message de succès. Vous pouvez vérifier en allant dans **"Table Editor"** (menu de gauche) : la table `contracts` doit apparaître.

**C'est ici que vous pourrez toujours consulter ou modifier vos données directement, sous forme de tableau, à tout moment** (menu "Table Editor" de Supabase) — indépendamment de l'application elle-même.

## Étape 3 — Créer votre compte de connexion

Cette application n'a pas de page d'inscription publique (par sécurité) : vous créez votre compte vous-même dans Supabase.

1. Menu de gauche → **"Authentication"** → onglet **"Users"**.
2. Cliquez sur **"Add user"** → **"Create new user"**.
3. Renseignez votre email et un mot de passe.
4. Cochez **"Auto Confirm User"** si l'option est proposée (pour ne pas avoir à confirmer par email).
5. Validez.

C'est cet email et ce mot de passe que vous utiliserez pour vous connecter à l'application. Vous pourrez ajouter d'autres utilisateurs plus tard de la même façon (par exemple pour un collègue).

## Étape 4 — Récupérer vos clés Supabase

1. Menu de gauche → **"Project Settings"** (roue crantée) → **"API"**.
2. Notez deux valeurs :
   - **Project URL** (ressemble à `https://xxxxxxxx.supabase.co`)
   - **anon public key** (une longue chaîne de caractères)

Vous en aurez besoin à l'étape 6.

## Étape 5 — Préparer le code

1. Décompressez le fichier `contrats-maintenance-app.zip` fourni.
2. Créez un compte GitHub si vous n'en avez pas (https://github.com), gratuit.
3. Créez un nouveau dépôt (repository) vide, par exemple nommé `contrats-maintenance`.
4. Mettez le contenu du dossier décompressé dans ce dépôt (via l'interface web de GitHub — "uploading an existing file" — ou en ligne de commande avec `git` si vous êtes à l'aise).

## Étape 6 — Déployer sur Vercel

1. Allez sur **https://vercel.com** et créez un compte (vous pouvez vous connecter directement avec votre compte GitHub).
2. Cliquez sur **"Add New..."** → **"Project"**.
3. Choisissez d'importer votre dépôt GitHub `contrats-maintenance`.
4. Avant de cliquer sur "Deploy", ouvrez la section **"Environment Variables"** et ajoutez :
   - `NEXT_PUBLIC_SUPABASE_URL` → collez votre Project URL (étape 4)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → collez votre anon public key (étape 4)
5. Cliquez sur **"Deploy"**.
6. Après 1 à 2 minutes, Vercel vous donne un lien du type `https://contrats-maintenance-xxxx.vercel.app`.

**C'est ce lien que vous pouvez ouvrir depuis n'importe quel PC ou téléphone.** Ajoutez-le à vos favoris ou à l'écran d'accueil de votre téléphone pour y accéder comme une application.

## Étape 7 — Se connecter

Ouvrez le lien, entrez l'email et le mot de passe créés à l'étape 3. Vous arrivez sur le tableau de bord.

---

## Fonctionnalités de l'application

- **Tableau de bord** : compteurs par statut (à jour / à surveiller / urgent / expiré), jauge d'échéance par contrat
- **Reconduction tacite** : calcul automatique de la date limite de préavis (pas seulement la date de fin)
- **Visites périodiques** : renseignez le nombre de visites par an, l'application calcule la prochaine date et alerte en amont
- **Cycle de vie des contrats** : bouton "renouveler / résilier / changer de prestataire" sur chaque contrat, avec motif enregistré
- **Historique** : tous les contrats clôturés restent consultables avec leur motif de fin
- **Impression** : page dédiée listant l'état des contrats et les visites à venir, avec mise en page adaptée à l'impression papier
- **Connexion protégée** : accès réservé aux comptes que vous créez vous-même dans Supabase

## Limites à connaître

- Chaque utilisateur ne voit que ses propres contrats (isolation par compte). Si plusieurs personnes doivent partager les mêmes contrats, il faudra adapter les règles de sécurité (RLS) dans Supabase — dites-le-moi si besoin.
- Les plans gratuits de Supabase et Vercel sont largement suffisants pour un usage personnel ou une petite structure. Si le projet Supabase reste inactif plus d'une semaine, il peut se mettre en pause automatiquement (il suffit de le relancer depuis le tableau de bord Supabase).

## Pour aller plus loin

Dites-moi si vous voulez que j'ajoute : export PDF, notifications par email avant une échéance, plusieurs comptes avec des rôles différents (administrateur / lecteur), champ pour les documents joints (PDF du contrat), etc.
