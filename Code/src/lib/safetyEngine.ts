import { AnimalSpecies, NutritionGuideline } from '../types';

export interface SafetyCheckResult {
  isSafe: boolean;
  score: number; // 0 to 100
  warnings: string[];
  hardBlockReasons: string[];
  compatibleSpecies: AnimalSpecies[];
  incompatibleSpecies: AnimalSpecies[];
  strictestHoldingLimitHours: number;
  timeElapsedHours: number;
  isExpired: boolean;
}

// Strictest baseline holding limit derived from Independent Veterinary Expert & BLRI research
export const DEFAULT_STRICT_HOLDING_HOURS = 2.0;

// High-risk keywords that signify immediate bio-hazard for ruminants and livestock
const TOXIC_OR_FORBIDDEN_KEYWORDS = [
  'spicy',
  'curry',
  'chili',
  'chilli',
  'masala',
  'pepper',
  'sour',
  'mold',
  'mould',
  'spoiled',
  'rotten',
  'rancid',
  'fermented',
  'foul',
  'smelly',
  'bone',
  'plastic',
  'waste',
  'chemical'
];

/**
 * Validates a surplus food batch against expert veterinary nutrition rules and timestamps
 */
export function evaluateSurplusFoodSafety(
  foodTypes: string[],
  preparationTimestamp: string | Date,
  guidelines: NutritionGuideline[],
  targetSpeciesList?: AnimalSpecies[],
  customHoldingHours?: number
): SafetyCheckResult {
  const prepDate = new Date(preparationTimestamp);
  const now = new Date();
  const diffMs = now.getTime() - prepDate.getTime();
  const timeElapsedHours = Math.max(0, diffMs / (1000 * 60 * 60));

  // Determine strictest holding time: lowest of guidelines or default strict 2.0 hrs
  const expertLimits = guidelines.map(g => g.maxHoldingTimeHours).filter(h => typeof h === 'number' && h > 0);
  const strictestHoldingLimitHours = customHoldingHours
    ? customHoldingHours
    : expertLimits.length > 0
    ? Math.min(...expertLimits)
    : DEFAULT_STRICT_HOLDING_HOURS;

  const warnings: string[] = [];
  const hardBlockReasons: string[] = [];
  let score = 100;

  // 1. Holding Time Check (strictest conservative threshold)
  const isExpired = timeElapsedHours > strictestHoldingLimitHours;
  if (isExpired) {
    hardBlockReasons.push(
      `Holding time expired: Food was prepared ${timeElapsedHours.toFixed(1)} hrs ago, exceeding the strictest safe limit of ${strictestHoldingLimitHours} hrs.`
    );
    score -= 60;
  } else if (timeElapsedHours > strictestHoldingLimitHours * 0.75) {
    warnings.push(
      `Critical holding window: Less than ${((strictestHoldingLimitHours - timeElapsedHours) * 60).toFixed(0)} minutes remaining before safe feeding expiry.`
    );
    score -= 15;
  }

  // 2. Toxic/Forbidden Ingredients Check
  const combinedFoodText = foodTypes.join(' ').toLowerCase();
  for (const keyword of TOXIC_OR_FORBIDDEN_KEYWORDS) {
    if (combinedFoodText.includes(keyword)) {
      hardBlockReasons.push(
        `Biosecurity risk detected: Contains '${keyword}' which is hazardous/toxic to livestock and cause acidosis or death.`
      );
      score -= 50;
    }
  }

  // 3. Species Compatibility Validation
  const compatibleSpecies: AnimalSpecies[] = [];
  const incompatibleSpecies: AnimalSpecies[] = [];

  const allSpecies: AnimalSpecies[] = ['cattle', 'goat', 'sheep', 'poultry', 'fish'];
  const testSpecies = targetSpeciesList && targetSpeciesList.length > 0 ? targetSpeciesList : allSpecies;

  for (const sp of testSpecies) {
    const guide = guidelines.find(g => g.species === sp);
    if (!guide) {
      compatibleSpecies.push(sp);
      continue;
    }

    // Check if any food matches disallowed
    const hasDisallowed = foodTypes.some(ft =>
      guide.disallowedFoodTypes.some(dft => ft.toLowerCase().includes(dft.toLowerCase()))
    );

    // Check if food matches safe types
    const hasSafe = foodTypes.some(ft =>
      guide.safeFoodTypes.some(sft => ft.toLowerCase().includes(sft.toLowerCase()))
    );

    if (hasDisallowed) {
      incompatibleSpecies.push(sp);
      warnings.push(`Not suitable for ${sp.toUpperCase()}: contains ingredient flagged in ${guide.sourceExpert} safety registry.`);
      score -= 10;
    } else if (hasSafe) {
      compatibleSpecies.push(sp);
    } else {
      // Unspecified neutral
      compatibleSpecies.push(sp);
      warnings.push(`Uncommon feed for ${sp}: manual veterinary inspection advised before bulk consumption.`);
      score -= 5;
    }
  }

  const finalScore = Math.max(0, Math.min(100, score));
  const isSafe = hardBlockReasons.length === 0 && finalScore >= 50;

  return {
    isSafe,
    score: finalScore,
    warnings,
    hardBlockReasons,
    compatibleSpecies,
    incompatibleSpecies,
    strictestHoldingLimitHours,
    timeElapsedHours,
    isExpired
  };
}
