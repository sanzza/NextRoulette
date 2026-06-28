# Documentation fonctionnelle — NextRoulette

Ce document décrit **le jeu, les règles et les parcours utilisateur**, côté produit
(sans jargon technique).

## 1. Le concept

NextRoulette est un **jeu de soirée entre potes**. Le principe :

1. Quelqu'un crée une **partie** et partage un **lien**.
2. Chaque participant ajoute, de façon (semi-)anonyme, **la photo d'un ex** avec un
   pseudo et un petit **indice** rigolo.
3. Une fois tout le monde prêt, on lance la **roulette** : elle désigne un ex au
   hasard.
4. Le groupe doit deviner : **« c'est l'ex de qui ? »**
5. On **révèle** l'auteur — fous rires garantis.

## 2. Les rôles

| Rôle | Qui | Ce qu'il peut faire |
|------|-----|---------------------|
| **Joueur** | N'importe qui avec le lien | Rejoindre une partie, ajouter un ex, lancer la roue, deviner |
| **Hôte** | Le créateur de la partie | Démarrer/clôturer la partie (à venir) |
| **Admin** | Sanzza / Lisly | Espace d'administration : superviser, modérer (à venir) |

## 3. Parcours utilisateur (cible)

### 3.1 Créer une partie *(à venir)*
- L'hôte saisit un nom de soirée → reçoit un **lien partageable**.

### 3.2 Rejoindre & ajouter un ex *(à venir)*
- Le joueur ouvre le lien, choisit un pseudo, **ajoute une photo + indice**.
- La photo de chaque ex est visible, mais **l'auteur reste caché** jusqu'à la
  révélation.

### 3.3 Jouer à la roulette *(maquette disponible)*
- N'importe qui peut **lancer la roue**.
- La roue tourne (suspense !) puis s'arrête sur un ex.
- Le groupe **devine**, puis on clique sur **« Révéler l'ex de qui ? »**.

> ✅ **Disponible aujourd'hui** : la roulette est jouable en démonstration sur la
> page d'accueil, avec des données fictives.

### 3.4 Espace admin *(disponible : connexion + tableau de bord)*
- Connexion sécurisée sur `/admin/login`.
- Tableau de bord listant les ex d'une partie de démonstration.
- Modération réelle (suppression, signalement) : à venir avec la base de données.

## 4. Règles du jeu

- **1 ex = 1 segment** sur la roue.
- Le tirage est **aléatoire et équiprobable**.
- L'**indice** est facultatif mais conseillé (pimente les devinettes).
- L'**auteur** d'un ex n'est révélé qu'après le tirage, sur action explicite.

## 5. Ton & ambiance

- **Festif, coloré, fun** : palette acidulée (rose, violet, cyan, jaune), emojis,
  animations.
- Bienveillant : jeu **entre potes consentants**. Voir les considérations RGPD /
  consentement dans [`SECURITY.md`](SECURITY.md) (ce sont des photos de tiers).

## 6. Idées d'évolution produit

- Modes de jeu : *« deviner l'ex »*, *« note l'ex »*, *« quiz »*.
- Scores & classement de soirée.
- Réactions / chat en direct pendant la partie.
- Thèmes visuels déblocables (piste de monétisation).

Le découpage technique de ces évolutions est dans [`ROADMAP.md`](ROADMAP.md).
