import type { ConditionDef, SeverityDef } from '../core/types';

export const CONDITIONS: ConditionDef[] = [
  { id: 'plaque', name: 'Plaque Buildup', treatmentId: 'scalePolish', blurb: 'Hardened deposits need professional cleaning.' },
  { id: 'cavity', name: 'Cavity', treatmentId: 'filling', blurb: 'Tooth decay has formed a hole that needs filling.' },
  { id: 'chipped', name: 'Chipped Tooth', treatmentId: 'bonding', blurb: 'A chipped edge restored with composite resin.' },
  { id: 'severeDecay', name: 'Severe Decay', treatmentId: 'extraction', blurb: 'This tooth is beyond saving and must come out.' },
  { id: 'gumDisease', name: 'Gum Disease', treatmentId: 'deepCleaning', blurb: 'Infection below the gumline calls for root planing.' },
  { id: 'crackedTooth', name: 'Cracked Tooth', treatmentId: 'crown', blurb: 'A structural crack needs a protective crown.' },
  { id: 'impactedWisdom', name: 'Impacted Wisdom Tooth', treatmentId: 'surgicalExtraction', blurb: 'A wisdom tooth trapped in the jaw requires surgery.' },
  { id: 'infectedPulp', name: 'Infected Pulp', treatmentId: 'rootCanal', blurb: 'Infected nerve tissue must be cleared and sealed.' },
  { id: 'missingTeeth', name: 'Missing Teeth', treatmentId: 'bridge', blurb: 'A gap spanned by a fixed bridge on neighbouring teeth.' },
  { id: 'damagedEnamel', name: 'Damaged Enamel', treatmentId: 'veneers', blurb: 'Worn, discoloured enamel restored with veneers.' },
  { id: 'missingTooth', name: 'Missing Tooth', treatmentId: 'implant', blurb: 'A titanium implant replaces the lost root and crown.' },
  { id: 'misaligned', name: 'Misaligned Teeth', treatmentId: 'orthodontics', blurb: 'A full course of braces to straighten the bite.' },
  { id: 'fullArchLoss', name: 'Full-Arch Tooth Loss', treatmentId: 'allOn4', blurb: 'An entire arch restored on four implants.' },
  { id: 'jawDisorder', name: 'Chronic Jaw Disorder', treatmentId: 'tmjSurgery', blurb: 'Surgical correction of the temporomandibular joint.' },
  { id: 'totalDegradation', name: 'Total Degradation', treatmentId: 'fullMouth', blurb: 'Every tooth rebuilt in a full-mouth reconstruction.' }
];

export const CONDITIONS_BY_ID: Record<string, ConditionDef> = Object.fromEntries(
  CONDITIONS.map((c) => [c.id, c])
);

export const CONDITIONS_BY_TREATMENT: Record<string, ConditionDef> = Object.fromEntries(
  CONDITIONS.map((c) => [c.treatmentId, c])
);

export const SEVERITIES: SeverityDef[] = [
  { severity: 'mild', label: 'Mild', priceMult: 1.0, extraHours: 0, weight: 45 },
  { severity: 'moderate', label: 'Moderate', priceMult: 1.4, extraHours: 1, weight: 35 },
  { severity: 'severe', label: 'Severe', priceMult: 1.9, extraHours: 2, weight: 20 }
];

export const SEVERITIES_BY_KEY: Record<string, SeverityDef> = Object.fromEntries(
  SEVERITIES.map((s) => [s.severity, s])
);

export const PATIENT_FIRST_NAMES = [
  'Alex', 'Sam', 'Jordan', 'Casey', 'Morgan', 'Riley', 'Jamie', 'Taylor', 'Robin', 'Quinn',
  'Avery', 'Harper', 'Rowan', 'Elliot', 'Frankie', 'Charlie', 'Dana', 'Jesse', 'Kai', 'Marion'
];

export const PATIENT_LAST_NAMES = [
  'Smith', 'Patel', 'Nguyen', 'Garcia', 'Okafor', 'Kim', 'Novak', 'Rossi', 'Dubois', 'Tanaka',
  'Andersson', 'Kowalski', 'Silva', 'Haddad', 'Ivanov', 'Murphy', 'Chen', 'Ali', 'Berg', 'Costa'
];
