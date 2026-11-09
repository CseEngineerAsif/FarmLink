import {
  AnimalProfile,
  Farm,
  FoodPost,
  Hall,
  Match,
  NutritionGuideline,
  User,
  ExchangeTransaction,
  AuditLog,
  NotificationItem
} from '../types';

export const HERO_IMAGE_URL = '/src/assets/images/farmlink_hero_banner_1792245413782.jpg';
export const HALL_IMAGE_URL = '/src/assets/images/university_hall_dining_1792245414711.jpg';
export const LIVESTOCK_IMAGE_URL = '/src/assets/images/farm_cattle_livestock_1792245415046.jpg';
export const DAIRY_EXCHANGE_IMAGE_URL = '/src/assets/images/dairy_produce_exchange_1794164367283.jpg';
export const FEED_INSPECTION_IMAGE_URL = '/src/assets/images/livestock_feed_inspection_1794164368505.jpg';
export const AVATAR_HALL_ADMIN_URL = '/src/assets/images/avatar_hall_admin_1794164369177.jpg';
export const AVATAR_FARM_OWNER_URL = '/src/assets/images/avatar_farm_owner_1794164368979.jpg';

// Pre-seeded Users matching surveyed stakeholders
export const INITIAL_USERS: User[] = [
  {
    id: 'user_admin_01',
    name: 'Md. Jahangir Alam',
    email: 'jahangir.alam@baust.edu.bd',
    phone: '+880 1711-234567',
    role: 'hall_admin',
    approvalStatus: 'approved',
    hallId: 'hall_01',
    institution: 'BAUST',
    designation: 'Assistant Provost & Lecturer (Civil)',
    createdAt: '2026-08-31T09:00:00Z',
    updatedAt: '2026-08-31T09:00:00Z'
  },
  {
    id: 'user_admin_02',
    name: 'Masud Parves',
    email: 'masud.parves@baust.edu.bd',
    phone: '+880 1712-345678',
    role: 'hall_admin',
    approvalStatus: 'approved',
    hallId: 'hall_02',
    institution: 'BAUST',
    designation: 'Assistant Provost & Lecturer (ME)',
    createdAt: '2026-08-31T09:30:00Z',
    updatedAt: '2026-08-31T09:30:00Z'
  },
  {
    id: 'user_farm_01',
    name: 'Ziaul Haque',
    email: 'ziaul.dairy@gmail.com',
    phone: '+880 1723-456789',
    role: 'farm_owner',
    approvalStatus: 'approved',
    farmId: 'farm_01',
    institution: 'Sabuj Bangla Dairy Farm',
    designation: 'Managing Owner',
    createdAt: '2026-08-31T10:00:00Z',
    updatedAt: '2026-08-31T10:00:00Z'
  },
  {
    id: 'user_farm_02',
    name: 'Hosan',
    email: 'hosan.pirgang@gmail.com',
    phone: '+880 1734-567890',
    role: 'farm_owner',
    approvalStatus: 'approved',
    farmId: 'farm_02',
    institution: 'Hosan Livestock & Poultry',
    designation: 'Farm Owner',
    createdAt: '2026-08-31T10:30:00Z',
    updatedAt: '2026-08-31T10:30:00Z'
  },
  {
    id: 'user_super_01',
    name: 'Dr. Md. Sirajul Islam',
    email: 'admin.farmlink@baust.edu.bd',
    phone: '+880 1799-887766',
    role: 'super_admin',
    approvalStatus: 'approved',
    institution: 'BAUST / FarmLink Oversight Council',
    designation: 'Chief Platform Administrator & Faculty',
    createdAt: '2026-08-01T08:00:00Z',
    updatedAt: '2026-08-01T08:00:00Z'
  }
];

// Surveyed University Halls from BAUST Saidpur
export const INITIAL_HALLS: Hall[] = [
  {
    id: 'hall_01',
    hallName: 'Abbas Uddin Ahmed Hall',
    institution: 'BAUST',
    location: 'Saidpur Cantonment, Nilphamari',
    coordinates: { lat: 25.7788, lng: 88.9056 },
    adminId: 'user_admin_01',
    adminName: 'Md. Jahangir Alam',
    provostName: 'Md. Mahbub Rahman',
    assistantProvostName: 'Md. Jahangir Alam',
    hallType: 'male',
    totalStudents: 351,
    avgStudentsEatingDaily: 269,
    mealsPreparedPerDay: 295,
    breakfastLunchDinnerSplit: '102 / 290 / 275',
    foodServiceStaffCount: 14,
    commonFoodTypes: ['Cooked rice', 'Cooked dal', 'Vegetables', 'Fish', 'Chicken', 'Meat', 'Khichuri', 'Mashed potatoes/food'],
    peakSurplusWindows: ['3:20 PM', '10:00 PM'],
    surplusHoldingWindowHours: 2.5,
    preferredExchangeMethods: ['milk', 'eggs', 'meat', 'cash'],
    phone: '+880 1711-234567',
    isActive: true
  },
  {
    id: 'hall_02',
    hallName: 'Shaheed Dr. Zikrul Haque Hall',
    institution: 'BAUST',
    location: 'Saidpur Cantonment, Nilphamari',
    coordinates: { lat: 25.7765, lng: 88.9078 },
    adminId: 'user_admin_02',
    adminName: 'Masud Parves',
    provostName: 'Dr. Md. Anower Hossain',
    assistantProvostName: 'Masud Parves',
    hallManagerName: 'Al Hasen',
    hallType: 'male',
    totalStudents: 277,
    avgStudentsEatingDaily: 220,
    mealsPreparedPerDay: 660,
    breakfastLunchDinnerSplit: '93 / 220 / 220',
    foodServiceStaffCount: 8,
    commonFoodTypes: ['Cooked rice', 'Cooked dal', 'Vegetables', 'Fish', 'Chicken', 'Meat', 'Khichuri'],
    peakSurplusWindows: ['3:00 PM', '10:00 PM'],
    surplusHoldingWindowHours: 2.0,
    preferredExchangeMethods: ['milk', 'eggs', 'meat', 'cash'],
    phone: '+880 1712-345678',
    isActive: true
  }
];

// Surveyed Livestock Farms
export const INITIAL_FARMS: Farm[] = [
  {
    id: 'farm_01',
    farmName: 'Sabuj Bangla Dairy Farm',
    ownerId: 'user_farm_01',
    ownerName: 'Ziaul Haque',
    location: 'Nayamatpur, Saidpur, Nilphamari',
    coordinates: { lat: 25.7692, lng: 88.8924 },
    willingDistanceKm: 4.5,
    acceptableFoodTypes: ['Cooked rice', 'Vegetable scraps', 'Fruit peels', 'Unseasoned grains'],
    unacceptableFoodTypes: ['Cooked curry', 'Spicy foods', 'Moldy foods'],
    preferredReturn: 'cash',
    feedPurchasedDailyKg: 85,
    dailyFeedCostBdt: 6500,
    phone: '+880 1723-456789',
    status: 'approved',
    createdAt: '2026-08-31T10:00:00Z'
  },
  {
    id: 'farm_02',
    farmName: 'Hosan Farm Pirgang',
    ownerId: 'user_farm_02',
    ownerName: 'Hosan',
    location: 'Pirgang, Nilphamari',
    coordinates: { lat: 25.7951, lng: 88.9189 },
    willingDistanceKm: 5.0,
    acceptableFoodTypes: ['Cooked rice', 'Cooked vegetables', 'Plain grains'],
    unacceptableFoodTypes: ['Mixed spicy food', 'Curried sauces', 'Bones'],
    preferredReturn: 'milk',
    feedPurchasedDailyKg: 50,
    dailyFeedCostBdt: 7500,
    phone: '+880 1734-567890',
    status: 'approved',
    createdAt: '2026-08-31T10:30:00Z'
  }
];

// Animal inventories for surveyed farms
export const INITIAL_ANIMALS: AnimalProfile[] = [
  {
    id: 'anim_01',
    farmId: 'farm_01',
    species: 'cattle',
    count: 28,
    details: '28 high-yield dairy cows (Friesian / Sahiwal crosses)',
    healthStatus: 'healthy',
    normalFeedUsed: 'Corn, bran, rice (bhutta, bhushi, bhat)',
    updatedAt: '2026-09-01T08:00:00Z'
  },
  {
    id: 'anim_02',
    farmId: 'farm_01',
    species: 'goat',
    count: 16,
    details: '16 Jamunapari & Black Bengal goats',
    healthStatus: 'healthy',
    normalFeedUsed: 'Surplus forage, crop residues, rice bran',
    updatedAt: '2026-09-01T08:00:00Z'
  },
  {
    id: 'anim_03',
    farmId: 'farm_02',
    species: 'cattle',
    count: 20,
    details: '20 cattle (7 male, 13 female)',
    healthStatus: 'healthy',
    normalFeedUsed: 'Grass, fodder, rice',
    updatedAt: '2026-09-01T08:15:00Z'
  },
  {
    id: 'anim_04',
    farmId: 'farm_02',
    species: 'goat',
    count: 13,
    details: '13 local Bengal goats',
    healthStatus: 'healthy',
    normalFeedUsed: 'Vegetable peelings, soft forage',
    updatedAt: '2026-09-01T08:15:00Z'
  },
  {
    id: 'anim_05',
    farmId: 'farm_02',
    species: 'poultry',
    count: 150,
    details: '150 Sonali hens',
    healthStatus: 'healthy',
    normalFeedUsed: 'Poultry feed mash, broken cooked rice',
    updatedAt: '2026-09-01T08:15:00Z'
  }
];

// Veterinary / Animal Nutrition Guidelines based on BLRI and Independent Vet Expert
// Strictest conservative holding threshold defaults to 2.0 hours
export const INITIAL_NUTRITION_GUIDELINES: NutritionGuideline[] = [
  {
    id: 'guide_cattle',
    species: 'cattle',
    safeFoodTypes: ['Plain cooked rice', 'Vegetable scraps', 'Crop residues', 'Fruit peels'],
    disallowedFoodTypes: ['Spicy curries', 'Chili powder residue', 'Moldy food', 'Oily curries', 'Meat scrap bones'],
    maxHoldingTimeHours: 2.0, // Strictest threshold enforced
    storageRequirements: 'Cool, clean covered containers; immediate consumption recommended',
    spoilageIndicators: ['Sour odor', 'Mold growth', 'Surface sliminess', 'Bubbling fermentation'],
    recommendedPrecaution: 'Inspect batch for excessive chili/spices; serve within 2 hours of prep in warm climate.',
    sourceExpert: 'BLRI & Independent Veterinary Expert (B.Sc. Vet)',
    lastUpdated: '2026-09-01T12:00:00Z'
  },
  {
    id: 'guide_goat',
    species: 'goat',
    safeFoodTypes: ['Cooked rice', 'Vegetable peelings', 'Surplus forage', 'Clean grains'],
    disallowedFoodTypes: ['Spicy curried dishes', 'Moldy leftover food', 'Citrus peels in large quantity', 'Toxins'],
    maxHoldingTimeHours: 2.0,
    storageRequirements: 'Dry and cool storage; clean non-metallic or food-grade containers',
    spoilageIndicators: ['Sour smell', 'Visible fungus', 'Rancid taste', 'Insect contact'],
    recommendedPrecaution: 'Goats have sensitive rumens; avoid any fermented or oily food residue.',
    sourceExpert: 'BLRI Animal Nutrition Division',
    lastUpdated: '2026-09-01T12:00:00Z'
  },
  {
    id: 'guide_sheep',
    species: 'sheep',
    safeFoodTypes: ['Cooked rice', 'Soft vegetable trimmings', 'Clean bran mash'],
    disallowedFoodTypes: ['Spicy curries', 'Heavy copper/mineral excesses', 'Rotten food'],
    maxHoldingTimeHours: 2.0,
    storageRequirements: 'Shaded, ventilated area; do not store in airtight sunlit bins',
    spoilageIndicators: ['Off-putting sour stench', 'Fungal filaments', 'Sticky texture'],
    recommendedPrecaution: 'Feed only clean non-spicy vegetable remnants alongside routine forage.',
    sourceExpert: 'Independent Veterinary Expert (B.Sc. Vet)',
    lastUpdated: '2026-09-01T12:00:00Z'
  },
  {
    id: 'guide_poultry',
    species: 'poultry',
    safeFoodTypes: ['Cooked rice', 'Cooked vegetables', 'Protein scraps', 'Cooked grains'],
    disallowedFoodTypes: ['Raw potato peels', 'Overly salty foods', 'Moldy bread/rice', 'Spicy curry paste'],
    maxHoldingTimeHours: 2.0,
    storageRequirements: 'Store in covered trays; serve promptly to prevent bacterial proliferation',
    spoilageIndicators: ['Bacterial slime', 'Mold spots', 'Putrid smell'],
    recommendedPrecaution: 'Ensure grain size is easily consumable; avoid spoiled starches that harbor mycotoxins.',
    sourceExpert: 'BLRI Poultry Research Group',
    lastUpdated: '2026-09-01T12:00:00Z'
  },
  {
    id: 'guide_fish',
    species: 'fish',
    safeFoodTypes: ['Cooked rice', 'Soft vegetable waste', 'Rice bran mash', 'Small vegetable parts'],
    disallowedFoodTypes: ['Oily spices', 'Large bone fragments', 'Chemical contaminants', 'Decomposed matter'],
    maxHoldingTimeHours: 2.0,
    storageRequirements: 'Aerate and disperse evenly in water immediately after collection',
    spoilageIndicators: ['Foul aquatic odor', 'Greasy surface sheen', 'Discoloration'],
    recommendedPrecaution: 'Avoid overfeeding to prevent oxygen depletion in pond aquaculture.',
    sourceExpert: 'BLRI & Aquaculture Advisory',
    lastUpdated: '2026-09-01T12:00:00Z'
  }
];

// Initial active food posts representing actual meal service outputs
export const INITIAL_FOOD_POSTS: FoodPost[] = [
  {
    id: 'post_01',
    hallId: 'hall_01',
    hallName: 'Abbas Uddin Ahmed Hall',
    hallAdminId: 'user_admin_01',
    foodTypes: ['Cooked rice', 'Vegetable trimmings'],
    quantityKg: 16.5,
    mealType: 'lunch',
    preparationTime: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    postedTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    maxHoldingHours: 2.0,
    pickupDeadline: new Date(Date.now() + 75 * 60 * 1000).toISOString(),
    status: 'matched',
    isSeparatedFromOtherWaste: true,
    storageCondition: 'cool_dry',
    notes: 'Segregated into clean 25kg stainless tubs right after 2:30 PM lunch service.',
    currentMatchId: 'match_01',
    qrSecret: 'FARMLINK_PK_POST01_A8723B'
  },
  {
    id: 'post_02',
    hallId: 'hall_02',
    hallName: 'Shaheed Dr. Zikrul Haque Hall',
    hallAdminId: 'user_admin_02',
    foodTypes: ['Cooked rice', 'Cooked vegetables'],
    quantityKg: 12.0,
    mealType: 'lunch',
    preparationTime: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    postedTime: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    maxHoldingHours: 2.0,
    pickupDeadline: new Date(Date.now() + 105 * 60 * 1000).toISOString(),
    status: 'open',
    isSeparatedFromOtherWaste: true,
    storageCondition: 'cool_dry',
    notes: 'Clean excess rice and non-spicy gourd curry. Kept warm in food trays.',
    qrSecret: 'FARMLINK_PK_POST02_9F112C'
  }
];

export const INITIAL_MATCHES: Match[] = [
  {
    id: 'match_01',
    postId: 'post_01',
    farmId: 'farm_01',
    farmName: 'Sabuj Bangla Dairy Farm',
    farmOwnerId: 'user_farm_01',
    hallId: 'hall_01',
    hallName: 'Abbas Uddin Ahmed Hall',
    matchedTime: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 75 * 60 * 1000).toISOString(),
    status: 'pending',
    distanceKm: 2.1,
    safetyScore: 98,
    safetyWarnings: [],
    agreedExchangeType: 'cash'
  }
];

export const INITIAL_TRANSACTIONS: ExchangeTransaction[] = [
  {
    id: 'txn_01',
    matchId: 'match_hist_01',
    postId: 'post_hist_01',
    hallId: 'hall_01',
    hallName: 'Abbas Uddin Ahmed Hall',
    farmId: 'farm_01',
    farmName: 'Sabuj Bangla Dairy Farm',
    exchangeType: 'milk',
    amountQuantity: 8,
    unit: 'liters',
    estimatedValueBdt: 640,
    foodQuantityRedistributedKg: 18,
    settlementStatus: 'settled',
    date: '2026-10-15T16:30:00Z',
    notes: 'Surplus lunch rice exchanged for 8 liters of fresh morning dairy milk.'
  },
  {
    id: 'txn_02',
    matchId: 'match_hist_02',
    postId: 'post_hist_02',
    hallId: 'hall_02',
    hallName: 'Shaheed Dr. Zikrul Haque Hall',
    farmId: 'farm_02',
    farmName: 'Hosan Farm Pirgang',
    exchangeType: 'eggs',
    amountQuantity: 36,
    unit: 'pieces',
    estimatedValueBdt: 468,
    foodQuantityRedistributedKg: 14,
    settlementStatus: 'settled',
    date: '2026-10-16T11:00:00Z',
    notes: 'Dinner rice surplus exchanged for 3 dozen poultry farm eggs.'
  },
  {
    id: 'txn_03',
    matchId: 'match_hist_03',
    postId: 'post_hist_03',
    hallId: 'hall_01',
    hallName: 'Abbas Uddin Ahmed Hall',
    farmId: 'farm_01',
    farmName: 'Sabuj Bangla Dairy Farm',
    exchangeType: 'cash',
    amountQuantity: 450,
    unit: 'BDT',
    estimatedValueBdt: 450,
    foodQuantityRedistributedKg: 20,
    settlementStatus: 'settled',
    date: '2026-10-16T17:15:00Z',
    notes: 'Direct cash settlement for dairy feed supplementation.'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'audit_01',
    timestamp: '2026-10-17T06:00:00Z',
    userId: 'user_super_01',
    userName: 'Dr. Md. Sirajul Islam',
    userRole: 'super_admin',
    action: 'POLICY_UPDATE',
    entityType: 'guideline',
    entityId: 'guide_cattle',
    details: 'Enforced strict 2-hour maximum holding threshold per veterinary research consensus.'
  },
  {
    id: 'audit_02',
    timestamp: '2026-10-17T06:15:00Z',
    userId: 'user_admin_01',
    userName: 'Md. Jahangir Alam',
    userRole: 'hall_admin',
    action: 'POST_CREATED',
    entityType: 'food_post',
    entityId: 'post_01',
    details: 'Created surplus food post: 16.5 kg of Cooked rice & Vegetable trimmings.'
  },
  {
    id: 'audit_03',
    timestamp: '2026-10-17T06:20:00Z',
    userId: 'system',
    userName: 'FarmLink Matching Engine',
    userRole: 'super_admin',
    action: 'MATCH_DISPATCHED',
    entityType: 'match',
    entityId: 'match_01',
    details: 'Matched post post_01 with Sabuj Bangla Dairy Farm (2.1 km distance, 98% safety match).'
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_init_01',
    recipientUserId: 'user_farm_01', // Ziaul Haque
    title: '🎯 Priority Match: Abbas Uddin Ahmed Hall',
    message: 'Abbas Uddin Ahmed Hall posted 16.5 kg of Cooked rice & Vegetable trimmings. Proximity: 2.1 km. Ready for collection within 2-hour holding window.',
    type: 'match_available',
    relatedEntityId: 'match_01',
    read: false,
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    priority: 'urgent',
    postDetails: {
      postId: 'post_01',
      hallId: 'hall_01',
      hallName: 'Abbas Uddin Ahmed Hall',
      quantityKg: 16.5,
      foodTypes: ['Cooked rice', 'Vegetable trimmings'],
      mealType: 'lunch',
      pickupDeadline: new Date(Date.now() + 75 * 60 * 1000).toISOString(),
      maxHoldingHours: 2.0,
      distanceKm: 2.1,
      safetyScore: 98
    }
  },
  {
    id: 'notif_init_02',
    recipientUserId: 'user_farm_01', // Ziaul Haque
    title: '🍲 New Surplus Food Alert: Shaheed Dr. Zikrul Haque Hall',
    message: 'Shaheed Dr. Zikrul Haque Hall logged 12.0 kg of Cooked rice & Cooked vegetables. Holding window: 2 hours. Available for immediate pickup.',
    type: 'surplus_post_created',
    relatedEntityId: 'post_02',
    read: false,
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    priority: 'high',
    postDetails: {
      postId: 'post_02',
      hallId: 'hall_02',
      hallName: 'Shaheed Dr. Zikrul Haque Hall',
      quantityKg: 12.0,
      foodTypes: ['Cooked rice', 'Cooked vegetables'],
      mealType: 'lunch',
      pickupDeadline: new Date(Date.now() + 105 * 60 * 1000).toISOString(),
      maxHoldingHours: 2.0,
      distanceKm: 2.8,
      safetyScore: 95
    }
  },
  {
    id: 'notif_init_03',
    recipientUserId: 'user_farm_02', // Hosan
    title: '🍲 New Surplus Food Alert: Abbas Uddin Ahmed Hall',
    message: 'Abbas Uddin Ahmed Hall logged 16.5 kg of Cooked rice & Vegetable trimmings. Available for collection.',
    type: 'surplus_post_created',
    relatedEntityId: 'post_01',
    read: false,
    createdAt: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
    priority: 'high',
    postDetails: {
      postId: 'post_01',
      hallId: 'hall_01',
      hallName: 'Abbas Uddin Ahmed Hall',
      quantityKg: 16.5,
      foodTypes: ['Cooked rice', 'Vegetable trimmings'],
      mealType: 'lunch',
      pickupDeadline: new Date(Date.now() + 75 * 60 * 1000).toISOString(),
      maxHoldingHours: 2.0,
      distanceKm: 4.2
    }
  },
  {
    id: 'notif_init_04',
    recipientUserId: 'user_admin_01',
    title: 'Surplus Pickup Verified via QR!',
    message: '18 kg collected by Sabuj Bangla Dairy Farm. Transaction #txn_01 generated for exchange settlement.',
    type: 'pickup_completed',
    relatedEntityId: 'txn_01',
    read: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    priority: 'normal'
  }
];
