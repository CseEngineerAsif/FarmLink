export type UserRole = 'hall_admin' | 'farm_owner' | 'super_admin';
export type ApprovalStatus = 'pending' | 'approved' | 'suspended';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  approvalStatus: ApprovalStatus;
  hallId?: string;
  farmId?: string;
  institution?: string;
  designation?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export type ExchangeType = 'cash' | 'milk' | 'eggs' | 'meat';

export interface Hall {
  id: string;
  hallName: string;
  institution: string; // e.g., BAUST (Bangladesh Army University of Science & Technology)
  location: string;    // e.g., Saidpur, Nilphamari
  coordinates: Coordinates;
  adminId: string;
  adminName: string;
  provostName: string;
  assistantProvostName: string;
  hallManagerName?: string;
  hallType: 'male' | 'female';
  totalStudents: number;
  avgStudentsEatingDaily: number;
  mealsPreparedPerDay: number;
  breakfastLunchDinnerSplit: string; // e.g., "102 / 290 / 275"
  foodServiceStaffCount: number;
  commonFoodTypes: string[];
  peakSurplusWindows: string[]; // e.g., ["3:20 PM", "10:00 PM"]
  surplusHoldingWindowHours: number; // e.g., 2 to 4 hours
  preferredExchangeMethods: ExchangeType[];
  phone: string;
  isActive: boolean;
}

export type AnimalSpecies = 'cattle' | 'goat' | 'sheep' | 'poultry' | 'fish';

export interface AnimalProfile {
  id: string;
  farmId: string;
  species: AnimalSpecies;
  count: number;
  details?: string; // e.g. "13 female, 7 male" or "Jamunapari breed"
  healthStatus: 'healthy' | 'monitoring' | 'quarantine';
  normalFeedUsed: string;
  updatedAt: string;
}

export interface Farm {
  id: string;
  farmName: string;
  ownerId: string;
  ownerName: string;
  location: string; // e.g. Nayamatpur, Saidpur / Pirgang, Nilphamari
  coordinates: Coordinates;
  willingDistanceKm: number; // e.g., 5 km
  acceptableFoodTypes: string[];
  unacceptableFoodTypes: string[];
  preferredReturn: ExchangeType;
  feedPurchasedDailyKg?: number;
  dailyFeedCostBdt?: number;
  phone: string;
  status: ApprovalStatus;
  createdAt: string;
}

export type FoodPostStatus = 'open' | 'matched' | 'collected' | 'expired' | 'cancelled';

export interface FoodPost {
  id: string;
  hallId: string;
  hallName: string;
  hallAdminId: string;
  foodTypes: string[]; // e.g. ["Cooked rice", "Cooked dal", "Mixed vegetables"]
  quantityKg: number;
  mealType: 'lunch' | 'dinner' | 'breakfast';
  preparationTime: string; // ISO
  postedTime: string;      // ISO
  maxHoldingHours: number; // strict veterinary threshold e.g. 2.0
  pickupDeadline: string;  // ISO
  status: FoodPostStatus;
  isSeparatedFromOtherWaste: boolean;
  storageCondition: 'cool_dry' | 'room_temp' | 'refrigerated';
  notes?: string;
  currentMatchId?: string;
  qrSecret?: string;
  verifiedPickupId?: string;
}

export type MatchStatus = 'pending' | 'accepted' | 'declined' | 'expired' | 'reassigned' | 'collected';

export interface Match {
  id: string;
  postId: string;
  farmId: string;
  farmName: string;
  farmOwnerId: string;
  hallId: string;
  hallName: string;
  matchedTime: string;
  expiresAt: string;
  status: MatchStatus;
  distanceKm: number;
  safetyScore: number; // 0-100
  safetyWarnings: string[];
  agreedExchangeType: ExchangeType;
  declineReason?: string;
  reassignedToFarmId?: string;
}

export interface PickupVerification {
  id: string;
  matchId: string;
  postId: string;
  farmId: string;
  hallId: string;
  qrPayload: string;
  verifiedAt: string;
  actualQuantityKg: number;
  verifiedByUserId: string;
  verifiedByRole: UserRole;
  storageConditionAtPickup: string;
  qualityCheckPassed: boolean;
  notes?: string;
}

export interface ExchangeTransaction {
  id: string;
  matchId: string;
  postId: string;
  hallId: string;
  hallName: string;
  farmId: string;
  farmName: string;
  exchangeType: ExchangeType;
  amountQuantity: number; // e.g., 500 (BDT) or 8 (Liters) or 30 (Eggs) or 3 (Kg meat)
  unit: 'BDT' | 'liters' | 'pieces' | 'kg';
  estimatedValueBdt: number;
  foodQuantityRedistributedKg: number;
  settlementStatus: 'pending' | 'settled';
  date: string;
  notes?: string;
}

export interface NutritionGuideline {
  id: string;
  species: AnimalSpecies;
  safeFoodTypes: string[];
  disallowedFoodTypes: string[];
  maxHoldingTimeHours: number;
  storageRequirements: string;
  spoilageIndicators: string[];
  recommendedPrecaution: string;
  sourceExpert: string; // e.g. "BLRI (Bangladesh Livestock Research Institute)" or "Independent Veterinary Expert (B.Sc. Vet)"
  lastUpdated: string;
}

export type NotificationType =
  | 'surplus_post_created'
  | 'match_available'
  | 'match_accepted'
  | 'match_declined'
  | 'pickup_ready'
  | 'pickup_completed'
  | 'post_expired'
  | 'user_approved'
  | 'system_alert';

export interface NotificationItem {
  id: string;
  recipientUserId: string;
  title: string;
  message: string;
  type: NotificationType;
  relatedEntityId?: string;
  read: boolean;
  createdAt: string;
  priority?: 'urgent' | 'high' | 'normal';
  postDetails?: {
    postId: string;
    hallId: string;
    hallName: string;
    quantityKg: number;
    foodTypes: string[];
    mealType: string;
    pickupDeadline: string;
    maxHoldingHours: number;
    distanceKm?: number;
    safetyScore?: number;
  };
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entityType: 'food_post' | 'match' | 'pickup' | 'transaction' | 'user' | 'farm' | 'guideline';
  entityId: string;
  details: string;
}
