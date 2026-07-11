# Spécifications fonctionnelles — NextRoulette

**Version :** 1.0 · **Date :** 2026-07-11 · **Statut :** livré (v0.1)
**Public :** hôtes de soirée & joueurs · **Auteurs :** Sanzza & Lisly

Ce document décrit **ce que fait le produit**, **pour qui**, et **selon quelles
règles**. Il fait référence à l'implémentation réelle. Pour le « comment
technique », voir [`ARCHITECTURE.md`](ARCHITECTURE.md) ; pour la sécurité, voir
[`SECURITY.md`](SECURITY.md).

---

## 1. Objet & vision

NextRoulette est un **jeu de soirée** en ligne. Chaque invité ajoute, **en
privé**, la ou les photo(s) d'un(e) ex via un lien partagé. Quand tout le monde a
contribué, l'hôte lance une **roulette** qui désigne au hasard une photo : le
groupe doit deviner **« c'est l'ex de qui ? »**, puis l'auteur est révélé.

**Proposition de valeur :** un fou rire collectif, zéro friction (pas de compte à
créer pour les joueurs), et la **confidentialité des contributions** jusqu'au
tirage — c'est ce qui crée la surprise.

---

## 2. Périmètre

### 2.1 Dans le périmètre (v0.1 — livré)
- Création d'une partie et génération de **deux liens** (partage + hôte).
- **Contribution privée** de photos par chaque joueur (sans compte).
- **Confidentialité** : un joueur ne voit que ses propres photos.
- **Roulette** réservée à l'hôte, révélant photo + indice + auteur.
- Garde-fous de **sécurité** (voir §8) et validation des fichiers.

### 2.2 Hors périmètre (v0.1 — voir [`ROADMAP.md`](ROADMAP.md))
- Temps réel multi-écrans synchronisé (WebSockets).
- Comptes joueurs persistants, scores, classements.
- Modération avancée, signalement, export.
- Paiement / thèmes premium.

---

## 3. Acteurs & rôles

| Acteur | Description | Authentification |
|--------|-------------|------------------|
| **Hôte** | Crée la partie et anime la roulette. | Détient le **lien secret d'hôte** (token). |
| **Joueur / Contributeur** | Ajoute ses ex via le lien de partage. | Identité **anonyme** par cookie (aucun compte). |
| **Administrateur plateforme** | (Exploitation) supervise l'instance. | Connexion e-mail + mot de passe (JWT), espace `/admin`. |

> Un même humain peut être hôte **et** joueur.

---

## 4. Parcours utilisateur (user flows)

### 4.1 Créer une partie (Hôte)
1. L'hôte ouvre l'accueil et clique **« Créer une partie »**.
2. Il saisit un **nom de soirée** (facultatif ; défaut « Soirée NextRoulette »).
3. Le système génère la partie et affiche **deux liens** :
   - **Lien de partage** `…/r/{slug}` → à envoyer à tous.
   - **Lien secret d'hôte** → donne accès à la roulette (à **ne pas** diffuser).
4. L'hôte peut **copier** chaque lien et **ouvrir la roulette** directement.

### 4.2 Ajouter ses ex (Joueur)
1. Le joueur ouvre le **lien de partage**.
2. Il renseigne son **prénom/pseudo** (mémorisé sur son appareil).
3. Il ajoute une **photo** (+ un **indice** facultatif) et valide.
4. La photo apparaît dans **« Mes ex ajoutés »** — **visible de lui seul**.
5. Il peut en ajouter d'autres (jusqu'à la limite) ou **supprimer** les siennes.

### 4.3 Lancer la roulette (Hôte)
1. L'hôte ouvre son **lien secret d'hôte** → il est reconnu et redirigé vers la
   roulette.
2. La roue affiche **un secteur coloré par photo** (sans texte : suspense).
3. L'hôte clique **« Lancer la roulette »** ; la roue tourne puis s'arrête.
4. La **photo tirée** s'affiche en grand avec son **indice**.
5. Le groupe devine ; l'hôte clique **« Révéler l'ex de qui ? »** → le **prénom de
   l'auteur** apparaît.
6. L'hôte peut **rafraîchir** (si de nouvelles photos sont arrivées) et relancer.

---

## 5. Exigences fonctionnelles (numérotées)

### 5.1 Parties
- **EF-01** Le système crée une partie avec un **identifiant public non devinable**
  (`slug`) et un **token d'hôte secret** distinct.
- **EF-02** Le nom de la partie est limité à **60 caractères** ; vide → valeur par
  défaut.
- **EF-03** Le système fournit à la création un lien de partage et un lien d'hôte.

### 5.2 Contribution & photos
- **EF-10** Tout détenteur du lien de partage peut ajouter des photos, **sans
  compte**.
- **EF-11** Une contribution comporte : **pseudo** (obligatoire, ≤ 40 car.), une
  **photo** (obligatoire), un **indice** (facultatif, ≤ 60 car.).
- **EF-12** Formats acceptés : **JPEG, PNG, WEBP, GIF**. Taille max **8 Mo**
  (configurable).
- **EF-13** Chaque joueur est limité à **12 photos** par partie.
- **EF-14** Un joueur peut **supprimer** ses propres photos.
- **EF-15** Un joueur **ne voit que ses propres** photos sur la page de
  contribution.

### 5.3 Roulette
- **EF-20** La roue comporte **un secteur de couleur par photo**, sans texte.
- **EF-21** Le tirage est **aléatoire et équiprobable**.
- **EF-22** À l'arrêt, le système affiche **la photo**, son **indice**, puis, sur
  action, **l'auteur**.
- **EF-23** La roulette est **réservée à l'hôte** (token requis).
- **EF-24** L'hôte peut **recharger** la liste des photos à tout moment.
- **EF-25** Si la partie ne contient **aucune** photo, la roue invite à partager le
  lien.

### 5.4 Administration plateforme
- **EF-30** Un administrateur peut se **connecter** (`/admin/login`) et accéder à un
  **tableau de bord** protégé.
- **EF-31** L'accès à `/admin/**` sans session valide **redirige** vers la connexion.

---

## 6. Règles de gestion

- **RG-01** *1 photo = 1 secteur* de la roue.
- **RG-02** La **couleur** d'un secteur est attribuée automatiquement, par ordre
  d'ajout, dans une palette festive (roue lisible et équilibrée).
- **RG-03** L'**auteur** d'une photo n'est **jamais** affiché avant la révélation
  explicite.
- **RG-04** Le **pseudo** est déclaratif (aucune vérification d'identité) — usage
  entre potes.
- **RG-05** Connaître un lien = disposer du droit associé (**lien-capacité**).

---

## 7. Écrans & états

| Écran | Route | Rôle | Points clés |
|-------|-------|------|-------------|
| Accueil | `/` | Public | Pitch, démo de roue, CTA « Créer une partie ». |
| Création | `/creer` | Hôte | Formulaire + affichage des 2 liens (copier). |
| Contribution | `/r/{slug}` | Joueur | Upload privé, galerie « mes ex », suppression. |
| Roulette | `/r/{slug}/roulette` | Hôte | Roue, tirage, révélation ; sinon écran « accès hôte requis ». |
| Connexion admin | `/admin/login` | Admin | Formulaire e-mail/mot de passe. |
| Tableau de bord | `/admin` | Admin | Vue de supervision (protégée). |

**États notables :**
- Contribution : *vide* / *liste de mes photos* / *erreur (format, taille, limite)*.
- Roulette : *chargement* / *prête* / *en rotation* / *résultat* / *auteur révélé* /
  *aucune photo* / *accès refusé*.

---

## 8. Confidentialité & sécurité (exigences fonctionnelles)

- **SEC-01** Les photos d'un joueur ne sont **accessibles qu'à lui** (cookie
  participant) **ou à l'hôte** (token). Un tiers reçoit une **erreur d'accès**.
- **SEC-02** La liste **globale** des photos est **réservée à l'hôte**.
- **SEC-03** Les identités (participant, hôte) reposent sur des **cookies
  httpOnly** (illisibles par le JavaScript de la page).
- **SEC-04** Les fichiers sont validés par leur **contenu réel** (signature), pas
  seulement le type déclaré ; **SVG refusé** (risque d'exécution de script).
- **SEC-05** Les liens (slug, token) sont **aléatoires et non devinables**.
- **SEC-06** Les images ne sont **pas mises en cache par des intermédiaires**
  partagés (cache privé).
- **SEC-07** L'espace `/admin` est protégé par **JWT** et redirection.

> Détails et pistes de durcissement : [`SECURITY.md`](SECURITY.md).
> Aspect RGPD (photos de tiers, consentement, effacement) : voir §11.

---

## 9. Exigences non fonctionnelles

- **NF-01 Simplicité** : un joueur doit pouvoir contribuer en **< 30 s**, sans
  installer ni créer de compte.
- **NF-02 Mobile-first** : l'upload doit fonctionner depuis un **téléphone**
  (galerie/appareil photo).
- **NF-03 Performance** : roue fluide (animation CSS), pages légères.
- **NF-04 Disponibilité** : usage « soirée » ; un seul serveur suffit.
- **NF-05 Portabilité** : déployable via **Docker** avec un simple **volume**
  (voir [`DEPLOIEMENT.md`](DEPLOIEMENT.md)).
- **NF-06 Ton** : identité visuelle **festive, colorée, « VJF »** (néons, emojis).

---

## 10. Cas limites & gestion d'erreurs

| Situation | Comportement attendu |
|-----------|----------------------|
| Lien de partie inexistant | Page **404** « Partie introuvable ». |
| Lien d'hôte invalide/expiré | Redirection vers la contribution + message d'erreur. |
| Fichier trop lourd | Refus explicite « max 8 Mo ». |
| Fichier non-image / falsifié | Refus « format non supporté ». |
| Limite de photos atteinte | Refus « limite atteinte (12) ». |
| Aucune photo dans la partie | La roue invite à partager le lien. |
| Perte des cookies (navigation privée, autre appareil) | Le joueur ne retrouve pas ses photos (identité liée à l'appareil) — comportement assumé en v0.1. |

---

## 11. Conformité & considérations éthiques (RGPD)

- Les contenus sont des **photos de tierces personnes** : l'usage suppose un
  **cadre privé et consenti** entre participants.
- Recommandations produit (à renforcer en roadmap) : **durée de vie limitée** des
  parties, **purge** des images, possibilité d'**effacement** à la demande.
- **Aucune donnée** n'est vendue ni partagée ; tout est stocké **localement** sur
  le serveur de l'hôte.

---

## 12. Critères d'acceptation (v0.1)

- [x] Créer une partie renvoie deux liens fonctionnels.
- [x] Un joueur peut ajouter une photo + indice depuis le lien de partage.
- [x] Un joueur ne voit **que ses** photos ; un autre ne peut pas y accéder.
- [x] Sans token d'hôte, l'accès à la roulette et à la liste globale est refusé.
- [x] Avec le token d'hôte, la roulette affiche toutes les photos, tire au sort,
      révèle la photo puis l'auteur.
- [x] Les fichiers non-images et trop lourds sont refusés.

> Ces critères sont couverts par le test de bout en bout `scripts/smoke-test.mjs`
> (16 vérifications, dont la confidentialité).

---

## 13. Glossaire

| Terme | Définition |
|-------|------------|
| **Partie (room)** | Une session de jeu identifiée par un `slug`. |
| **Slug** | Identifiant public non devinable d'une partie (dans le lien de partage). |
| **Token d'hôte** | Secret donnant les droits d'animation (roulette + vue globale). |
| **Contributeur / Joueur** | Personne qui ajoute des photos, identifiée par cookie. |
| **Indice** | Petit texte optionnel accompagnant une photo pour pimenter la devinette. |
| **Lien-capacité** | Lien dont la seule connaissance confère un droit. |
