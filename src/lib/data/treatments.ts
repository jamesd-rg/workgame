import type { TreatmentDef } from '../core/types';

export const TREATMENTS: TreatmentDef[] = [
  // Tier 1
  { id: 'scalePolish', name: 'Scale & Polish', tier: 1, basePrice: 45, baseHours: 1, xpReward: 15 },
  { id: 'filling', name: 'Filling', tier: 1, basePrice: 70, baseHours: 1, xpReward: 20 },
  { id: 'bonding', name: 'Composite Bonding', tier: 1, basePrice: 130, baseHours: 2, xpReward: 30 },
  // Tier 2
  { id: 'extraction', name: 'Extraction', tier: 2, basePrice: 150, baseHours: 1, xpReward: 30 },
  { id: 'deepCleaning', name: 'Deep Cleaning (Root Planing)', tier: 2, basePrice: 260, baseHours: 2, xpReward: 45 },
  { id: 'crown', name: 'Crown', tier: 2, basePrice: 420, baseHours: 3, xpReward: 60 },
  // Tier 3
  { id: 'surgicalExtraction', name: 'Surgical Extraction', tier: 3, basePrice: 520, baseHours: 2, xpReward: 70 },
  { id: 'rootCanal', name: 'Root Canal', tier: 3, basePrice: 800, baseHours: 3, xpReward: 90 },
  { id: 'bridge', name: 'Bridge', tier: 3, basePrice: 1100, baseHours: 4, xpReward: 110 },
  // Tier 4
  { id: 'veneers', name: 'Veneers', tier: 4, basePrice: 1600, baseHours: 3, xpReward: 130 },
  { id: 'implant', name: 'Implant', tier: 4, basePrice: 2300, baseHours: 4, xpReward: 160 },
  { id: 'orthodontics', name: 'Orthodontics (Braces)', tier: 4, basePrice: 3300, baseHours: 6, xpReward: 200 },
  // Tier 5
  { id: 'allOn4', name: 'All-on-4 Implants', tier: 5, basePrice: 7000, baseHours: 6, xpReward: 260 },
  { id: 'tmjSurgery', name: 'TMJ Surgery', tier: 5, basePrice: 9500, baseHours: 8, xpReward: 320 },
  { id: 'fullMouth', name: 'Full-Mouth Reconstruction', tier: 5, basePrice: 14000, baseHours: 10, xpReward: 400 }
];

export const TREATMENTS_BY_ID: Record<string, TreatmentDef> = Object.fromEntries(
  TREATMENTS.map((t) => [t.id, t])
);

export function treatmentsInTier(tier: number): TreatmentDef[] {
  return TREATMENTS.filter((t) => t.tier === tier);
}
