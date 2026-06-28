/**
 * Types métier partagés.
 */

export interface ExEntry {
  id: string;
  pseudo: string;
  /** URL de la photo (placeholder pour la maquette). */
  photoUrl: string;
  indice?: string;
  /** Pseudo de la personne qui a ajouté cet ex (pour le mode « devine de qui »). */
  ajoutePar?: string;
  /** Couleur d'accent du segment dans la roue. */
  couleur: string;
}

export interface Room {
  id: string;
  nom: string;
  createdAt: string;
  entries: ExEntry[];
}
