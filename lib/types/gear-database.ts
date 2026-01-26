/**
 * Types pour la base de données d'équipement générée par le script Python
 */

export interface GearItem {
  id: string;
  name: string;
  texturePath: string;
  normalPath: string;
  ratio: number;
  width: number;
  height: number;
  // Props runtime pour le positionnement
  position?: [number, number, number];
  rotation?: number;
  scale?: number;
}
