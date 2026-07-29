import type { OutcomeKind } from '../core/types';

export const OCCUPATIONS = [
  'Lighthouse Keeper', 'Software Developer', 'Cheese Sommelier', 'Bus Driver', 'Falconer',
  'Wedding Planner', 'Submarine Cook', 'Piano Tuner', 'Park Ranger', 'Mattress Tester',
  'Stunt Double', 'Beekeeper', 'Radio Host', 'Crossword Setter', 'Ferry Captain',
  'Museum Guard', 'Balloon Artist', 'Locksmith', 'Weather Presenter', 'Chocolatier',
  'Tram Conductor', 'Antique Dealer', 'Yoga Instructor', 'Voice Actor'
];

export const QUIRKS = [
  'collects novelty spoons', 'is training for a marathon', 'owns eleven cats',
  'once met a famous astronaut', 'grows prize-winning pumpkins', 'is learning the theremin',
  'has never seen the sea', 'writes poetry about bridges', 'can juggle five oranges',
  'is banned from the local quiz night', 'restores vintage typewriters',
  'speaks fluent Esperanto', 'keeps a diary of interesting clouds',
  'is building a canoe in the garage', 'won a regional whistling contest',
  'names every houseplant they own', 'has a twin nobody has ever seen',
  'does crosswords in pen', 'brews questionable kombucha', 'knows every flag in the world'
];

/**
 * Post-treatment patient quotes for non-standard outcomes, picked at random.
 * (Deliberately a small starter set — expand freely.)
 */
export const PATIENT_QUOTES: Partial<Record<OutcomeKind, string[]>> = {
  excellent: [
    "That was incredible — I didn't feel a thing!",
    'Done already? You must be some kind of wizard.'
  ],
  good: [
    'That went better than I expected!',
    "You've got steady hands, doc."
  ],
  poor: [
    "That took a bit longer than I'd hoped…",
    "Ow. I'm going to feel that one tomorrow."
  ],
  bad: [
    'I think I need to sit down for a minute.',
    'My cousin said this would happen. I should have listened.'
  ]
};
