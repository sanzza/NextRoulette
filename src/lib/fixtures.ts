import type { ExEntry } from "@/types";

/**
 * Données de démonstration pour la maquette de la roulette.
 * Aucune vraie photo n'est embarquée : on affiche les initiales dans un disque
 * coloré. Ces données seront remplacées par celles d'une vraie partie.
 */
export const DEMO_ENTRIES: ExEntry[] = [
  { id: "1", pseudo: "Le Cuistot", photoUrl: "", indice: "Il brûlait même l'eau", ajoutePar: "Lisly", couleur: "#ff2e88" },
  { id: "2", pseudo: "DJ Casquette", photoUrl: "", indice: "Toujours en festival", ajoutePar: "Sanzza", couleur: "#7b2ff7" },
  { id: "3", pseudo: "La Sportive", photoUrl: "", indice: "Marathon à 6h du mat", ajoutePar: "Lisly", couleur: "#00e5ff" },
  { id: "4", pseudo: "Monsieur Crypto", photoUrl: "", indice: "« On va être riches »", ajoutePar: "Sanzza", couleur: "#ffd23f" },
  { id: "5", pseudo: "La Poète", photoUrl: "", indice: "Textos de 3 pages", ajoutePar: "Lisly", couleur: "#ff7849" },
  { id: "6", pseudo: "Le Gamer", photoUrl: "", indice: "« Encore une partie »", ajoutePar: "Sanzza", couleur: "#42e695" },
];
