import { AnimalProfile, Coordinates, Farm, FoodPost, Hall, Match, NutritionGuideline } from '../types';
import { evaluateSurplusFoodSafety } from './safetyEngine';

/**
 * Calculates Great-Circle distance between two coordinates in kilometers using Haversine formula
 */
export function calculateDistanceKm(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const dLng = ((coord2.lng - coord1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.lat * Math.PI) / 180) *
      Math.cos((coord2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export interface MatchCandidate {
  farm: Farm;
  distanceKm: number;
  safetyScore: number;
  warnings: string[];
  isEligible: boolean;
  rejectionReason?: string;
  matchedSpecies: string[];
}

/**
 * Evaluates all registered farms for a given Food Post, ranking by distance and nutritional suitability
 */
export function findEligibleFarmsForPost(
  post: FoodPost,
  hall: Hall,
  farms: Farm[],
  animals: AnimalProfile[],
  guidelines: NutritionGuideline[],
  excludedFarmIds: string[] = []
): MatchCandidate[] {
  const candidates: MatchCandidate[] = [];

  for (const farm of farms) {
    if (farm.status !== 'approved') {
      continue;
    }
    if (excludedFarmIds.includes(farm.id)) {
      continue;
    }

    const distanceKm = calculateDistanceKm(hall.coordinates, farm.coordinates);
    const farmAnimals = animals.filter(a => a.farmId === farm.id);

    // 1. Distance filter (must be within farm's configured collection radius)
    const maxRadius = farm.willingDistanceKm || 5.0;
    if (distanceKm > maxRadius) {
      candidates.push({
        farm,
        distanceKm,
        safetyScore: 0,
        warnings: [`Distance (${distanceKm} km) exceeds farm maximum pickup radius (${maxRadius} km)`],
        isEligible: false,
        rejectionReason: `Outside collection radius (${distanceKm} km > ${maxRadius} km)`,
        matchedSpecies: []
      });
      continue;
    }

    // 2. Farm unaccepted foods check
    const postFoodsLower = post.foodTypes.map(f => f.toLowerCase());
    const hasExplicitlyRejectedFood = farm.unacceptableFoodTypes.some(unacc =>
      postFoodsLower.some(pf => pf.includes(unacc.toLowerCase()))
    );

    if (hasExplicitlyRejectedFood) {
      candidates.push({
        farm,
        distanceKm,
        safetyScore: 10,
        warnings: [`Post contains food types listed in farm's unacceptable items list`],
        isEligible: false,
        rejectionReason: 'Contains farm-unacceptable ingredients',
        matchedSpecies: []
      });
      continue;
    }

    // 3. Animal species safety check
    const farmSpecies = farmAnimals.map(a => a.species);
    const safetyCheck = evaluateSurplusFoodSafety(
      post.foodTypes,
      post.preparationTime,
      guidelines,
      farmSpecies,
      post.maxHoldingHours
    );

    if (!safetyCheck.isSafe) {
      candidates.push({
        farm,
        distanceKm,
        safetyScore: safetyCheck.score,
        warnings: safetyCheck.hardBlockReasons.concat(safetyCheck.warnings),
        isEligible: false,
        rejectionReason: safetyCheck.hardBlockReasons[0] || 'Veterinary safety validation failed',
        matchedSpecies: []
      });
      continue;
    }

    // Farm is eligible! Calculate composite score favoring proximity and safety
    // Distance penalty: 1 km ~ -4 pts
    const proximityScore = Math.max(0, 100 - distanceKm * 8);
    const compositeScore = Math.round(safetyCheck.score * 0.6 + proximityScore * 0.4);

    candidates.push({
      farm,
      distanceKm,
      safetyScore: compositeScore,
      warnings: safetyCheck.warnings,
      isEligible: true,
      matchedSpecies: safetyCheck.compatibleSpecies
    });
  }

  // Rank eligible candidates first by composite score and proximity
  return candidates.sort((a, b) => {
    if (a.isEligible && !b.isEligible) return -1;
    if (!a.isEligible && b.isEligible) return 1;
    return b.safetyScore - a.safetyScore || a.distanceKm - b.distanceKm;
  });
}

/**
 * Creates a formal Match record between a food post and the top eligible farm
 */
export function generateAutoMatch(
  post: FoodPost,
  hall: Hall,
  candidate: MatchCandidate,
  reassignedFromMatchId?: string
): Match {
  const now = new Date();
  // Match expires when pickup deadline expires or within 45 minutes
  const deadlineDate = new Date(post.pickupDeadline);
  const matchExpiryDate = new Date(Math.min(now.getTime() + 45 * 60 * 1000, deadlineDate.getTime()));

  return {
    id: `match_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    postId: post.id,
    farmId: candidate.farm.id,
    farmName: candidate.farm.farmName,
    farmOwnerId: candidate.farm.ownerId,
    hallId: hall.id,
    hallName: hall.hallName,
    matchedTime: now.toISOString(),
    expiresAt: matchExpiryDate.toISOString(),
    status: 'pending',
    distanceKm: candidate.distanceKm,
    safetyScore: candidate.safetyScore,
    safetyWarnings: candidate.warnings,
    agreedExchangeType: candidate.farm.preferredReturn || 'cash',
    reassignedToFarmId: reassignedFromMatchId
  };
}
