export type Tier = 1 | 2 | 3 | 4 | 5;
export type OutcomeKind = 'excellent' | 'good' | 'standard' | 'poor' | 'bad';
export type Severity = 'mild' | 'moderate' | 'severe';
export type TrainingKind = 'research' | 'video' | 'halfDay' | 'fullDay';

// ---------- Content definitions (static, in data/) ----------

export interface TreatmentDef {
  id: string;
  name: string;
  tier: Tier;
  basePrice: number;
  baseHours: number;
  xpReward: number;
}

export interface ConditionDef {
  id: string;
  name: string;
  treatmentId: string;
  blurb: string;
}

export interface SeverityDef {
  severity: Severity;
  label: string;
  priceMult: number;
  extraHours: number;
  weight: number;
}

export interface TrainingDef {
  kind: TrainingKind;
  name: string;
  hours: number;
  baseCost: number;
  xp: number;
}

export interface ClinicLevelDef {
  level: number;
  name: string;
  hoursPerDay: number;
  dailyFee: number;
  upgradeCost: number;
}

export interface FellowshipDef {
  id: string;
  tier: 3 | 4 | 5;
  name: string;
  hoursPerDay: number;
  days: number;
  tuition: number;
  grantsSkillLevel: number;
}

export interface CertificationDef {
  tier: Tier;
  totalHours: number;
  fee: number;
}

export interface OutcomeConfig {
  kind: OutcomeKind;
  label: string;
  color: string;
  incomeMult: number;
  hoursDelta: number;
}

// ---------- Dynamic state (persisted) ----------

export interface Patient {
  id: string;
  name: string;
  conditionId: string;
  severity: Severity;
  price: number;
  hours: number;
  locked: boolean;
  lockReason?: string;
  // Generated flavour; optional so pre-existing saves stay loadable.
  age?: number;
  occupation?: string;
  quirk?: string;
  heightCm?: number;
  weightKg?: number;
  bloodPressure?: string;
  restingPulse?: number;
  /** Player chose to send this patient elsewhere; card disabled for the day. */
  referred?: boolean;
}

export interface SkillState {
  xp: number;
}

export interface CertificationProgress {
  treatmentId: string;
  hoursDone: number;
  totalHours: number;
}

export interface FellowshipState {
  defId: string;
  treatmentId: string;
  daysDone: number;
}

export interface DaySummary {
  day: number;
  income: number;
  fee: number;
  treatments: number;
  xpGained: number;
  fellowshipDay: string | null;
}

export interface GameStats {
  totalEarned: number;
  totalTreated: number;
  outcomeCounts: Record<OutcomeKind, number>;
}

export interface GameState {
  day: number;
  hoursRemaining: number;
  money: number;
  clinicLevel: number;
  skills: Record<string, SkillState>;
  certsInProgress: CertificationProgress[];
  activeFellowship: FellowshipState | null;
  completedFellowships: string[];
  patients: Patient[];
  patientCounter: number;
  lastDaySummary: DaySummary | null;
  todayIncome: number;
  todayTreatments: number;
  todayXp: number;
  winShown: boolean;
  stats: GameStats;
}

// ---------- Transient (never persisted) ----------

export interface TreatmentResolution {
  patientId: string;
  treatmentId: string;
  outcome: OutcomeKind;
  goodEffect?: 'income' | 'time';
  income: number;
  baseIncome: number;
  skillLevel: number;
  hoursSpent: number;
  baseHours: number;
  xp: number;
  landingFraction: number;
  weights: Record<OutcomeKind, number>;
}
