import type { OutcomeConfig, OutcomeKind } from '../core/types';

export const OUTCOME_CONFIGS: Record<OutcomeKind, OutcomeConfig> = {
  excellent: { kind: 'excellent', label: 'Excellent', color: '#e8b400', incomeMult: 1.25, hoursDelta: -1 },
  good: { kind: 'good', label: 'Good', color: '#3fa34d', incomeMult: 1.15, hoursDelta: -1 },
  standard: { kind: 'standard', label: 'Standard', color: '#a8d5a2', incomeMult: 1, hoursDelta: 0 },
  poor: { kind: 'poor', label: 'Poor', color: '#e8842c', incomeMult: 0.85, hoursDelta: 1 },
  bad: { kind: 'bad', label: 'Bad', color: '#d1342f', incomeMult: 0.75, hoursDelta: 1 }
};
