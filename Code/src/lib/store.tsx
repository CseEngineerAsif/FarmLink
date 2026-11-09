import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import {
  AnimalProfile,
  AuditLog,
  ExchangeTransaction,
  Farm,
  FoodPost,
  Hall,
  Match,
  NotificationItem,
  NutritionGuideline,
  PickupVerification,
  User,
  ExchangeType
} from '../types';
import {
  INITIAL_ANIMALS,
  INITIAL_AUDIT_LOGS,
  INITIAL_FARMS,
  INITIAL_FOOD_POSTS,
  INITIAL_HALLS,
  INITIAL_MATCHES,
  INITIAL_NOTIFICATIONS,
  INITIAL_NUTRITION_GUIDELINES,
  INITIAL_TRANSACTIONS,
  INITIAL_USERS
} from './constants';
import { calculateDistanceKm, findEligibleFarmsForPost, generateAutoMatch } from './matchingEngine';
import { evaluateSurplusFoodSafety } from './safetyEngine';
import { firebaseStatus } from './firebaseConfig';
import { Language, translations } from './translations';
import { playNotificationChime } from './sound';

interface FarmLinkContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  users: User[];
  halls: Hall[];
  farms: Farm[];
  animals: AnimalProfile[];
  foodPosts: FoodPost[];
  matches: Match[];
  pickups: PickupVerification[];
  transactions: ExchangeTransaction[];
  guidelines: NutritionGuideline[];
  notifications: NotificationItem[];
  auditLogs: AuditLog[];
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.en;
  
  // Actions
  loginAsUser: (userId: string) => void;
  registerUser: (newUser: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'approvalStatus'>) => User;
  updateUserStatus: (userId: string, status: 'approved' | 'suspended') => void;
  createFoodPost: (postData: {
    hallId: string;
    foodTypes: string[];
    quantityKg: number;
    mealType: 'lunch' | 'dinner' | 'breakfast';
    storageCondition: 'cool_dry' | 'room_temp' | 'refrigerated';
    notes?: string;
  }) => { post: FoodPost; matchCount: number };
  cancelFoodPost: (postId: string) => void;
  acceptMatch: (matchId: string) => void;
  declineMatch: (matchId: string, reason?: string) => void;
  verifyPickup: (qrCodeData: string, actualQuantityKg: number, notes?: string) => { success: boolean; message: string; pickup?: PickupVerification };
  recordTransactionSettlement: (transactionId: string, amountQuantity: number, exchangeType: ExchangeType, notes?: string) => void;
  createAnimalProfile: (farmId: string, species: any, count: number, details?: string, normalFeedUsed?: string) => void;
  updateFarmPreferences: (farmId: string, acceptableFoodTypes: string[], unacceptableFoodTypes: string[], radiusKm: number, preferredReturn: ExchangeType) => void;
  updateNutritionGuideline: (guideline: NutritionGuideline) => void;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  deleteNotification: (notificationId: string) => void;
  clearReadNotifications: () => void;
  claimSurplusPost: (postId: string, farmId?: string) => { success: boolean; message: string };
  simulateSurplusFoodAlert: () => void;
  triggerManualMatchRun: (postId: string) => number;
  resetAllDataToDefault: () => void;
  userNotifications: NotificationItem[];
  unreadSurplusAlertsCount: number;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  activeToastNotification: NotificationItem | null;
  dismissToastNotification: () => void;
}

const FarmLinkContext = createContext<FarmLinkContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'farmlink_v1_';

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (err) {
    console.error(`Error loading ${key} from storage:`, err);
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving ${key} to storage:`, err);
  }
}

export const FarmLinkProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem(STORAGE_KEY_PREFIX + 'lang') as Language) || 'en';
  });

  const [users, setUsers] = useState<User[]>(() => loadFromStorage('users', INITIAL_USERS));
  const [currentUser, setCurrentUserState] = useState<User | null>(() => {
    const savedUserId = localStorage.getItem(STORAGE_KEY_PREFIX + 'active_uid');
    if (savedUserId) {
      const found = users.find(u => u.id === savedUserId);
      if (found) return found;
    }
    return INITIAL_USERS[0]; // Default to Hall Admin 01 (Md. Jahangir Alam)
  });

  const [halls, setHalls] = useState<Hall[]>(() => loadFromStorage('halls', INITIAL_HALLS));
  const [farms, setFarms] = useState<Farm[]>(() => loadFromStorage('farms', INITIAL_FARMS));
  const [animals, setAnimals] = useState<AnimalProfile[]>(() => loadFromStorage('animals', INITIAL_ANIMALS));
  const [foodPosts, setFoodPosts] = useState<FoodPost[]>(() => loadFromStorage('posts', INITIAL_FOOD_POSTS));
  const [matches, setMatches] = useState<Match[]>(() => loadFromStorage('matches', INITIAL_MATCHES));
  const [pickups, setPickups] = useState<PickupVerification[]>(() => loadFromStorage('pickups', []));
  const [transactions, setTransactions] = useState<ExchangeTransaction[]>(() => loadFromStorage('transactions', INITIAL_TRANSACTIONS));
  const [guidelines, setGuidelines] = useState<NutritionGuideline[]>(() => loadFromStorage('guidelines', INITIAL_NUTRITION_GUIDELINES));
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => loadFromStorage('notifications', INITIAL_NOTIFICATIONS));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => loadFromStorage('audit_logs', INITIAL_AUDIT_LOGS));

  // Sound and Real-time Toast Alert State
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'sound');
    return saved !== null ? saved === 'true' : true;
  });
  const [activeToastNotification, setActiveToastNotification] = useState<NotificationItem | null>(null);

  const setSoundEnabled = (enabled: boolean) => {
    setSoundEnabledState(enabled);
    localStorage.setItem(STORAGE_KEY_PREFIX + 'sound', String(enabled));
  };

  const dismissToastNotification = () => {
    setActiveToastNotification(null);
  };

  // Sync to localStorage
  useEffect(() => saveToStorage('users', users), [users]);
  useEffect(() => saveToStorage('halls', halls), [halls]);
  useEffect(() => saveToStorage('farms', farms), [farms]);
  useEffect(() => saveToStorage('animals', animals), [animals]);
  useEffect(() => saveToStorage('posts', foodPosts), [foodPosts]);
  useEffect(() => saveToStorage('matches', matches), [matches]);
  useEffect(() => saveToStorage('pickups', pickups), [pickups]);
  useEffect(() => saveToStorage('transactions', transactions), [transactions]);
  useEffect(() => saveToStorage('guidelines', guidelines), [guidelines]);
  useEffect(() => saveToStorage('notifications', notifications), [notifications]);
  useEffect(() => saveToStorage('audit_logs', auditLogs), [auditLogs]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY_PREFIX + 'lang', lang);
  };

  const setCurrentUser = (user: User | null) => {
    setCurrentUserState(user);
    if (user) {
      localStorage.setItem(STORAGE_KEY_PREFIX + 'active_uid', user.id);
    } else {
      localStorage.removeItem(STORAGE_KEY_PREFIX + 'active_uid');
    }
  };

  const loginAsUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      addAuditLog('USER_LOGIN', 'user', user.id, `User logged in with role ${user.role}`);
    }
  };

  const addAuditLog = (
    action: string,
    entityType: AuditLog['entityType'],
    entityId: string,
    details: string
  ) => {
    const newLog: AuditLog = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      userId: currentUser?.id || 'system',
      userName: currentUser?.name || 'Automated System',
      userRole: currentUser?.role || 'super_admin',
      action,
      entityType,
      entityId,
      details
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const sendNotification = (
    recipientUserId: string,
    title: string,
    message: string,
    type: NotificationItem['type'],
    relatedEntityId?: string,
    priority: NotificationItem['priority'] = 'normal',
    postDetails?: NotificationItem['postDetails']
  ) => {
    const notif: NotificationItem = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      recipientUserId,
      title,
      message,
      type,
      relatedEntityId,
      read: false,
      createdAt: new Date().toISOString(),
      priority,
      postDetails
    };
    setNotifications(prev => [notif, ...prev]);

    // If active user is the recipient or super_admin, trigger audio chime and live toast!
    if (!currentUser || currentUser.id === recipientUserId || currentUser.role === 'super_admin') {
      if (soundEnabled) {
        playNotificationChime();
      }
      setActiveToastNotification(notif);
    }
  };

  // Background holding expiration checker: marks overdue posts as 'expired'
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      let updated = false;
      const expiredPostIds: string[] = [];

      const newPosts = foodPosts.map(post => {
        if (post.status === 'open' || post.status === 'matched') {
          const deadline = new Date(post.pickupDeadline).getTime();
          if (now > deadline) {
            updated = true;
            expiredPostIds.push(post.id);
            // Send notification to hall admin
            sendNotification(
              post.hallAdminId,
              'Surplus Food Expired',
              `Post for ${post.quantityKg} kg has exceeded the maximum safe holding limit and was moved to general waste disposal.`,
              'post_expired',
              post.id,
              'urgent'
            );
            return { ...post, status: 'expired' as const };
          }
        }
        return post;
      });

      if (updated) {
        setFoodPosts(newPosts);
        if (expiredPostIds.length > 0) {
          setMatches(prevMatches =>
            prevMatches.map(m =>
              expiredPostIds.includes(m.postId) && (m.status === 'pending' || m.status === 'accepted')
                ? { ...m, status: 'expired' as const }
                : m
            )
          );
        }
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [foodPosts]);

  // Create surplus food post
  const createFoodPost = (postData: {
    hallId: string;
    foodTypes: string[];
    quantityKg: number;
    mealType: 'lunch' | 'dinner' | 'breakfast';
    storageCondition: 'cool_dry' | 'room_temp' | 'refrigerated';
    notes?: string;
  }) => {
    const hall = halls.find(h => h.id === postData.hallId);
    if (!hall) {
      throw new Error('University hall record not found');
    }

    // Default holding limit is strictly 2.0 hours unless configured
    const holdingLimit = hall.surplusHoldingWindowHours || 2.0;
    const now = new Date();
    const pickupDeadline = new Date(now.getTime() + holdingLimit * 60 * 60 * 1000);

    const postId = `post_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const qrSecret = `FARMLINK_PK_${postId.toUpperCase()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const newPost: FoodPost = {
      id: postId,
      hallId: hall.id,
      hallName: hall.hallName,
      hallAdminId: currentUser?.id || hall.adminId,
      foodTypes: postData.foodTypes,
      quantityKg: postData.quantityKg,
      mealType: postData.mealType,
      preparationTime: now.toISOString(),
      postedTime: now.toISOString(),
      maxHoldingHours: holdingLimit,
      pickupDeadline: pickupDeadline.toISOString(),
      status: 'open',
      isSeparatedFromOtherWaste: true,
      storageCondition: postData.storageCondition,
      notes: postData.notes,
      qrSecret
    };

    // Run matching engine immediately
    const eligibleCandidates = findEligibleFarmsForPost(newPost, hall, farms, animals, guidelines);
    const topCandidate = eligibleCandidates.find(c => c.isEligible);

    let createdMatch: Match | null = null;
    if (topCandidate) {
      createdMatch = generateAutoMatch(newPost, hall, topCandidate);
      newPost.status = 'matched';
      newPost.currentMatchId = createdMatch.id;

      // 1. Notify top matched farm owner with Priority Match Alert
      sendNotification(
        topCandidate.farm.ownerId,
        `🎯 Priority Match: ${hall.hallName}`,
        `${hall.hallName} logged ${newPost.quantityKg} kg of ${newPost.foodTypes.join(', ')}. Proximity: ${topCandidate.distanceKm} km. Ready for collection within ${newPost.maxHoldingHours}h holding window (deadline: ${pickupDeadline.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}).`,
        'match_available',
        createdMatch.id,
        'urgent',
        {
          postId: newPost.id,
          hallId: hall.id,
          hallName: hall.hallName,
          quantityKg: newPost.quantityKg,
          foodTypes: newPost.foodTypes,
          mealType: newPost.mealType,
          pickupDeadline: newPost.pickupDeadline,
          maxHoldingHours: newPost.maxHoldingHours,
          distanceKm: topCandidate.distanceKm,
          safetyScore: topCandidate.safetyScore
        }
      );
    }

    // 2. Alert ALL OTHER registered farm owners about this new surplus food post!
    // This fulfills the core requirement: alerting farm owners when a hall admin creates a surplus food post.
    const farmOwnersToAlert = users.filter(u =>
      u.role === 'farm_owner' &&
      (!topCandidate || u.id !== topCandidate.farm.ownerId)
    );

    farmOwnersToAlert.forEach(farmer => {
      const farmerFarm = farms.find(f => f.ownerId === farmer.id || f.id === farmer.farmId);
      const distance = farmerFarm
        ? calculateDistanceKm(hall.coordinates, farmerFarm.coordinates)
        : undefined;

      sendNotification(
        farmer.id,
        `🍲 New Surplus Food Alert: ${hall.hallName}`,
        `${hall.hallName} just logged ${newPost.quantityKg} kg of fresh ${newPost.foodTypes.join(', ')} (${newPost.mealType} service). Holding limit: ${newPost.maxHoldingHours}h. Click to view and claim.`,
        'surplus_post_created',
        newPost.id,
        'high',
        {
          postId: newPost.id,
          hallId: hall.id,
          hallName: hall.hallName,
          quantityKg: newPost.quantityKg,
          foodTypes: newPost.foodTypes,
          mealType: newPost.mealType,
          pickupDeadline: newPost.pickupDeadline,
          maxHoldingHours: newPost.maxHoldingHours,
          distanceKm: distance
        }
      );
    });

    setFoodPosts(prev => [newPost, ...prev]);
    if (createdMatch) {
      setMatches(prev => [createdMatch!, ...prev]);
    }

    addAuditLog(
      'POST_CREATED',
      'food_post',
      newPost.id,
      `Created surplus post for ${newPost.quantityKg} kg at ${hall.hallName}. Broadcasted alert to ${users.filter(u => u.role === 'farm_owner').length} registered farm owners.`
    );

    return { post: newPost, matchCount: topCandidate ? 1 : 0 };
  };

  const cancelFoodPost = (postId: string) => {
    setFoodPosts(prev =>
      prev.map(p => (p.id === postId ? { ...p, status: 'cancelled' as const } : p))
    );
    setMatches(prev =>
      prev.map(m => (m.postId === postId ? { ...m, status: 'expired' as const } : m))
    );
    addAuditLog('POST_CANCELLED', 'food_post', postId, 'Post was cancelled by hall administrator.');
  };

  // Farm Owner accepts match
  const acceptMatch = (matchId: string) => {
    const match = matches.find(m => m.id === matchId);
    if (!match) return;

    setMatches(prev =>
      prev.map(m => (m.id === matchId ? { ...m, status: 'accepted' as const } : m))
    );

    const post = foodPosts.find(p => p.id === match.postId);
    if (post) {
      // Notify hall admin that farm owner is en route for pickup
      sendNotification(
        post.hallAdminId,
        'Match Accepted by Farm Owner',
        `${match.farmName} accepted the offer for ${post.quantityKg} kg. Prepare handover QR code.`,
        'match_accepted',
        match.id
      );
    }

    addAuditLog('MATCH_ACCEPTED', 'match', matchId, `Farm ${match.farmName} accepted match for post ${match.postId}.`);
  };

  // Farm Owner declines match -> Triggers smart automated reassignment
  const declineMatch = (matchId: string, reason?: string) => {
    const match = matches.find(m => m.id === matchId);
    if (!match) return;

    setMatches(prev =>
      prev.map(m =>
        m.id === matchId ? { ...m, status: 'declined' as const, declineReason: reason || 'Declined by farm' } : m
      )
    );

    const post = foodPosts.find(p => p.id === match.postId);
    const hall = halls.find(h => h.id === match.hallId);

    if (post && hall && post.status === 'matched') {
      // Find NEXT eligible farm, excluding the declined one
      const declinedFarmIds = matches
        .filter(m => m.postId === post.id && (m.status === 'declined' || m.farmId === match.farmId))
        .map(m => m.farmId);

      const nextCandidates = findEligibleFarmsForPost(post, hall, farms, animals, guidelines, declinedFarmIds);
      const nextTop = nextCandidates.find(c => c.isEligible);

      if (nextTop) {
        const reassignedMatch = generateAutoMatch(post, hall, nextTop, match.id);
        reassignedMatch.status = 'pending';
        setMatches(prev => [reassignedMatch, ...prev]);
        setFoodPosts(prev =>
          prev.map(p => (p.id === post.id ? { ...p, currentMatchId: reassignedMatch.id } : p))
        );

        sendNotification(
          nextTop.farm.ownerId,
          'Reassigned Surplus Food Offer',
          `${hall.hallName} surplus offer of ${post.quantityKg} kg has been reassigned to your farm. Distance: ${nextTop.distanceKm} km.`,
          'match_available',
          reassignedMatch.id
        );

        addAuditLog(
          'MATCH_REASSIGNED',
          'match',
          reassignedMatch.id,
          `Declined by ${match.farmName}. Reassigned to next best candidate ${nextTop.farm.farmName}.`
        );
      } else {
        // No further eligible farms
        setFoodPosts(prev =>
          prev.map(p => (p.id === post.id ? { ...p, status: 'open' as const, currentMatchId: undefined } : p))
        );
        sendNotification(
          post.hallAdminId,
          'Offer Declined - Open for Pickup',
          `${match.farmName} declined the match. Post is currently open for other eligible farms.`,
          'match_declined',
          post.id
        );
      }
    }
  };

  // QR Verification at Pickup
  const verifyPickup = (
    qrCodeData: string,
    actualQuantityKg: number,
    notes?: string
  ): { success: boolean; message: string; pickup?: PickupVerification } => {
    // Locate post by matching qrSecret (flexible case and whitespace matching)
    const trimmedInput = qrCodeData.trim();
    const upperInput = trimmedInput.toUpperCase();
    const post = foodPosts.find(
      p =>
        (p.qrSecret && p.qrSecret.trim().toUpperCase() === upperInput) ||
        p.id.trim().toUpperCase() === upperInput ||
        p.qrSecret === trimmedInput ||
        p.id === trimmedInput
    );

    if (!post) {
      return { success: false, message: 'Invalid QR Code. No matching active surplus post found in registry.' };
    }

    if (post.status === 'collected') {
      return { success: false, message: 'Duplicate pickup error: This surplus batch has already been collected.' };
    }

    if (post.status === 'expired') {
      return { success: false, message: 'Biosecurity violation: This batch exceeded holding time and is marked expired.' };
    }

    // Identify active accepted or pending match
    const match = matches.find(m => m.id === post.currentMatchId);
    const farm = farms.find(f => (match ? f.id === match.farmId : currentUser?.farmId === f.id)) || farms[0];

    const pickupId = `pickup_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newPickup: PickupVerification = {
      id: pickupId,
      matchId: match?.id || 'direct_pickup',
      postId: post.id,
      farmId: farm?.id || 'unknown_farm',
      hallId: post.hallId,
      qrPayload: qrCodeData,
      verifiedAt: new Date().toISOString(),
      actualQuantityKg: actualQuantityKg || post.quantityKg,
      verifiedByUserId: currentUser?.id || 'verifier',
      verifiedByRole: currentUser?.role || 'farm_owner',
      storageConditionAtPickup: post.storageCondition,
      qualityCheckPassed: true,
      notes
    };

    // Update post status to 'collected' and save actual weighed quantity
    setFoodPosts(prev =>
      prev.map(p =>
        p.id === post.id
          ? { ...p, status: 'collected' as const, quantityKg: newPickup.actualQuantityKg, verifiedPickupId: pickupId }
          : p
      )
    );

    // Update match status to 'collected'
    if (match) {
      setMatches(prev =>
        prev.map(m => (m.id === match.id ? { ...m, status: 'collected' as const } : m))
      );
    }

    setPickups(prev => [newPickup, ...prev]);

    // Automatically instantiate an exchange transaction record
    const agreedType = match?.agreedExchangeType || farm?.preferredReturn || 'cash';
    let unit: ExchangeTransaction['unit'] = 'BDT';
    let defaultAmount = 0;
    let estimatedVal = 0;

    // Standard local rates:
    // Surplus feed: ~ 25 BDT/kg feed replacement value
    const feedVal = newPickup.actualQuantityKg * 25;
    if (agreedType === 'milk') {
      unit = 'liters';
      defaultAmount = Math.max(1, Math.round((feedVal / 80) * 10) / 10); // ~ 80 BDT per liter fresh raw milk
      estimatedVal = defaultAmount * 80;
    } else if (agreedType === 'eggs') {
      unit = 'pieces';
      defaultAmount = Math.max(4, Math.round(feedVal / 13)); // ~ 13 BDT per egg
      estimatedVal = defaultAmount * 13;
    } else if (agreedType === 'meat') {
      unit = 'kg';
      defaultAmount = Math.max(0.5, Math.round((feedVal / 900) * 10) / 10);
      estimatedVal = defaultAmount * 900;
    } else {
      unit = 'BDT';
      defaultAmount = Math.round(feedVal);
      estimatedVal = defaultAmount;
    }

    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newTransaction: ExchangeTransaction = {
      id: transactionId,
      matchId: match?.id || 'direct',
      postId: post.id,
      hallId: post.hallId,
      hallName: post.hallName,
      farmId: farm?.id || 'farm_01',
      farmName: farm?.farmName || 'Verified Farm',
      exchangeType: agreedType,
      amountQuantity: defaultAmount,
      unit,
      estimatedValueBdt: estimatedVal,
      foodQuantityRedistributedKg: newPickup.actualQuantityKg,
      settlementStatus: 'pending',
      date: new Date().toISOString(),
      notes: `Initiated upon QR scan verification for ${newPickup.actualQuantityKg} kg.`
    };

    setTransactions(prev => [newTransaction, ...prev]);

    // Send notifications to both Hall and Farm
    sendNotification(
      post.hallAdminId,
      'Surplus Pickup Verified via QR!',
      `${newPickup.actualQuantityKg} kg collected by ${farm?.farmName}. Transaction #${transactionId} generated for exchange settlement.`,
      'pickup_completed',
      transactionId
    );

    if (farm) {
      sendNotification(
        farm.ownerId,
        'Pickup Confirmed',
        `Collection of ${newPickup.actualQuantityKg} kg verified. Settle agreed return (${defaultAmount} ${unit}).`,
        'pickup_completed',
        transactionId
      );
    }

    addAuditLog(
      'PICKUP_VERIFIED',
      'pickup',
      pickupId,
      `QR verification confirmed: ${newPickup.actualQuantityKg} kg from ${post.hallName} to ${farm?.farmName}.`
    );

    return {
      success: true,
      message: `Pickup confirmed! ${newPickup.actualQuantityKg} kg securely transferred.`,
      pickup: newPickup
    };
  };

  // Record/Settle Exchange Return
  const recordTransactionSettlement = (
    transactionId: string,
    amountQuantity: number,
    exchangeType: ExchangeType,
    notes?: string
  ) => {
    setTransactions(prev =>
      prev.map(t => {
        if (t.id === transactionId) {
          let estimatedValue = t.estimatedValueBdt;
          if (exchangeType === 'milk') estimatedValue = amountQuantity * 80;
          else if (exchangeType === 'eggs') estimatedValue = amountQuantity * 13;
          else if (exchangeType === 'meat') estimatedValue = amountQuantity * 900;
          else estimatedValue = amountQuantity;

          let unit: ExchangeTransaction['unit'] = 'BDT';
          if (exchangeType === 'milk') unit = 'liters';
          else if (exchangeType === 'eggs') unit = 'pieces';
          else if (exchangeType === 'meat') unit = 'kg';

          return {
            ...t,
            exchangeType,
            amountQuantity,
            unit,
            estimatedValueBdt: estimatedValue,
            settlementStatus: 'settled',
            notes: notes || t.notes
          };
        }
        return t;
      })
    );

    addAuditLog(
      'TRANSACTION_SETTLED',
      'transaction',
      transactionId,
      `Exchange settled: ${amountQuantity} of ${exchangeType}.`
    );
  };

  // Register New User
  const registerUser = (newUser: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'approvalStatus'>) => {
    const id = `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    let farmId = newUser.farmId;

    if (newUser.role === 'farm_owner' && !farmId) {
      farmId = `farm_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
      const newFarm: Farm = {
        id: farmId,
        farmName: newUser.institution || 'New Livestock Holding',
        ownerId: id,
        ownerName: newUser.name,
        location: 'Saidpur, Nilphamari',
        coordinates: { lat: 25.7720 + (Math.random() - 0.5) * 0.03, lng: 88.9050 + (Math.random() - 0.5) * 0.03 },
        willingDistanceKm: 5.0,
        acceptableFoodTypes: ['Cooked rice', 'Vegetable scraps', 'Fruit peels', 'Unseasoned grains'],
        unacceptableFoodTypes: ['Cooked curry', 'Spicy foods', 'Moldy foods'],
        preferredReturn: 'cash',
        feedPurchasedDailyKg: 40,
        dailyFeedCostBdt: 4500,
        phone: newUser.phone,
        status: 'approved',
        createdAt: new Date().toISOString()
      };
      setFarms(prev => [...prev, newFarm]);

      // Seed starter livestock group for this farm
      const newAnimal: AnimalProfile = {
        id: `anim_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        farmId,
        species: 'cattle',
        count: 10,
        details: '10 dairy cattle (Friesian / Sahiwal crosses)',
        healthStatus: 'healthy',
        normalFeedUsed: 'Grass, fodder & cooked rice',
        updatedAt: new Date().toISOString()
      };
      setAnimals(prev => [...prev, newAnimal]);
    }

    const user: User = {
      ...newUser,
      id,
      farmId: newUser.role === 'farm_owner' ? farmId : newUser.farmId,
      approvalStatus: newUser.role === 'super_admin' ? 'approved' : 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setUsers(prev => [user, ...prev]);
    setCurrentUser(user);

    addAuditLog(
      'USER_REGISTERED',
      'user',
      id,
      `Registered user ${user.name} (${user.email}) with role ${user.role}. Status: ${user.approvalStatus}.`
    );

    return user;
  };

  // User Approval by Super Admin
  const updateUserStatus = (userId: string, status: 'approved' | 'suspended') => {
    setUsers(prev => prev.map(u => (u.id === userId ? { ...u, approvalStatus: status } : u)));
    sendNotification(
      userId,
      `Account Status: ${status.toUpperCase()}`,
      `Your FarmLink account access has been updated to ${status}.`,
      'user_approved'
    );
    addAuditLog('USER_STATUS_CHANGE', 'user', userId, `Updated user status to ${status}.`);
  };

  // Manage Animal Profiles
  const createAnimalProfile = (
    farmId: string,
    species: any,
    count: number,
    details?: string,
    normalFeedUsed?: string
  ) => {
    const newAnimal: AnimalProfile = {
      id: `anim_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      farmId,
      species,
      count,
      details,
      healthStatus: 'healthy',
      normalFeedUsed: normalFeedUsed || 'Green grass & grain mash',
      updatedAt: new Date().toISOString()
    };
    setAnimals(prev => [newAnimal, ...prev]);
    addAuditLog('ANIMAL_PROFILE_ADDED', 'farm', farmId, `Added ${count} ${species} to farm inventory.`);
  };

  // Farm Preferences
  const updateFarmPreferences = (
    farmId: string,
    acceptableFoodTypes: string[],
    unacceptableFoodTypes: string[],
    radiusKm: number,
    preferredReturn: ExchangeType
  ) => {
    setFarms(prev =>
      prev.map(f =>
        f.id === farmId
          ? {
              ...f,
              acceptableFoodTypes,
              unacceptableFoodTypes,
              willingDistanceKm: radiusKm,
              preferredReturn
            }
          : f
      )
    );
    addAuditLog('FARM_UPDATED', 'farm', farmId, `Updated feeding preferences and pickup radius.`);
  };

  // Nutrition Guidelines update (Super Admin)
  const updateNutritionGuideline = (updatedGuide: NutritionGuideline) => {
    setGuidelines(prev => prev.map(g => (g.id === updatedGuide.id ? updatedGuide : g)));
    addAuditLog(
      'GUIDELINE_UPDATED',
      'guideline',
      updatedGuide.id,
      `Updated nutrition guideline for ${updatedGuide.species}. Strict holding limit: ${updatedGuide.maxHoldingTimeHours} hrs.`
    );
  };

  // Notification Actions
  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const clearReadNotifications = () => {
    setNotifications(prev => prev.filter(n => !n.read));
  };

  // Farm Owner direct claim on an open surplus post
  const claimSurplusPost = (postId: string, farmIdParam?: string) => {
    const post = foodPosts.find(p => p.id === postId);
    if (!post) return { success: false, message: 'Surplus food batch not found' };
    if (post.status !== 'open') return { success: false, message: 'This surplus post is already matched or completed' };

    const targetFarmId = farmIdParam || currentUser?.farmId;
    const farm = farms.find(f => f.id === targetFarmId) || farms.find(f => f.ownerId === currentUser?.id) || farms[0];
    const hall = halls.find(h => h.id === post.hallId);
    if (!farm || !hall) return { success: false, message: 'Farm or Hall record not found' };

    const distance = calculateDistanceKm(hall.coordinates, farm.coordinates);
    const safety = evaluateSurplusFoodSafety(post.foodTypes, new Date(post.preparationTime), guidelines, undefined, post.maxHoldingHours);

    const matchId = `match_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newMatch: Match = {
      id: matchId,
      postId: post.id,
      farmId: farm.id,
      farmName: farm.farmName,
      farmOwnerId: farm.ownerId,
      hallId: hall.id,
      hallName: hall.hallName,
      matchedTime: new Date().toISOString(),
      expiresAt: post.pickupDeadline,
      status: 'accepted',
      distanceKm: distance,
      safetyScore: safety.score,
      safetyWarnings: safety.warnings,
      agreedExchangeType: farm.preferredReturn || 'cash'
    };

    setMatches(prev => [newMatch, ...prev]);
    setFoodPosts(prev => prev.map(p => (p.id === postId ? { ...p, status: 'matched', currentMatchId: matchId } : p)));

    // Notify hall admin
    sendNotification(
      post.hallAdminId,
      'Surplus Post Claimed!',
      `${farm.farmName} has claimed the surplus food post (${post.quantityKg} kg). Ready for kitchen dock handover.`,
      'match_accepted',
      matchId,
      'urgent'
    );

    // Notify claiming farm owner
    sendNotification(
      farm.ownerId,
      'Surplus Claim Confirmed!',
      `You successfully claimed ${post.quantityKg} kg from ${hall.hallName}. Proximity: ${distance} km. Proceed to kitchen dock for QR verification.`,
      'match_accepted',
      matchId,
      'urgent'
    );

    addAuditLog('POST_CLAIMED', 'food_post', postId, `${farm.farmName} claimed surplus food post from ${hall.hallName}.`);
    return { success: true, message: `Successfully claimed ${post.quantityKg} kg from ${hall.hallName}!` };
  };

  // Helper to trigger realistic simulation of dining hall posting surplus food
  const simulateSurplusFoodAlert = () => {
    const hall = halls[Math.floor(Math.random() * halls.length)] || INITIAL_HALLS[0];
    const foodCombinations = [
      ['Steamed rice', 'Mixed seasonal vegetables', 'Cooked dal'],
      ['Cooked rice', 'Vegetable trimmings', 'Lentil soup'],
      ['Vegetable khichuri', 'Cooked potato mash'],
      ['Unseasoned boiled rice', 'Gourd vegetable scraps']
    ];
    const foods = foodCombinations[Math.floor(Math.random() * foodCombinations.length)];
    const qty = Math.round((14 + Math.random() * 16) * 10) / 10;
    const meal = (['lunch', 'dinner', 'breakfast'] as const)[Math.floor(Math.random() * 2)];

    createFoodPost({
      hallId: hall.id,
      foodTypes: foods,
      quantityKg: qty,
      mealType: meal,
      storageCondition: 'cool_dry',
      notes: `Freshly logged surplus from ${hall.hallName} kitchen dock.`
    });
  };

  // Manual Trigger for Matching Run
  const triggerManualMatchRun = (postId: string): number => {
    const post = foodPosts.find(p => p.id === postId);
    if (!post || post.status !== 'open') return 0;

    const hall = halls.find(h => h.id === post.hallId);
    if (!hall) return 0;

    const candidates = findEligibleFarmsForPost(post, hall, farms, animals, guidelines);
    const top = candidates.find(c => c.isEligible);

    if (top) {
      const newMatch = generateAutoMatch(post, hall, top);
      setMatches(prev => [newMatch, ...prev]);
      setFoodPosts(prev =>
        prev.map(p => (p.id === post.id ? { ...p, status: 'matched', currentMatchId: newMatch.id } : p))
      );
      sendNotification(
        top.farm.ownerId,
        'Surplus Food Matched',
        `Matched with ${hall.hallName} (${post.quantityKg} kg). Proximity: ${top.distanceKm} km.`,
        'match_available',
        newMatch.id,
        'urgent'
      );
      addAuditLog('MANUAL_MATCH_RUN', 'match', newMatch.id, `Manual trigger matched post with ${top.farm.farmName}.`);
      return 1;
    }
    return 0;
  };

  // Reset to default seed
  const resetAllDataToDefault = () => {
    setUsers(INITIAL_USERS);
    setHalls(INITIAL_HALLS);
    setFarms(INITIAL_FARMS);
    setAnimals(INITIAL_ANIMALS);
    setFoodPosts(INITIAL_FOOD_POSTS);
    setMatches(INITIAL_MATCHES);
    setPickups([]);
    setTransactions(INITIAL_TRANSACTIONS);
    setGuidelines(INITIAL_NUTRITION_GUIDELINES);
    setNotifications(INITIAL_NOTIFICATIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setCurrentUser(INITIAL_USERS[0]);
    localStorage.clear();
  };

  const userNotifications = useMemo(() => {
    if (!currentUser) return [];
    return notifications.filter(n => n.recipientUserId === currentUser.id || currentUser.role === 'super_admin');
  }, [notifications, currentUser]);

  const unreadSurplusAlertsCount = useMemo(() => {
    return userNotifications.filter(
      n => !n.read && (n.type === 'surplus_post_created' || n.type === 'match_available')
    ).length;
  }, [userNotifications]);

  const t = translations[language];

  return (
    <FarmLinkContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        users,
        halls,
        farms,
        animals,
        foodPosts,
        matches,
        pickups,
        transactions,
        guidelines,
        notifications,
        auditLogs,
        language,
        setLanguage,
        t,
        loginAsUser,
        registerUser,
        updateUserStatus,
        createFoodPost,
        cancelFoodPost,
        acceptMatch,
        declineMatch,
        verifyPickup,
        recordTransactionSettlement,
        createAnimalProfile,
        updateFarmPreferences,
        updateNutritionGuideline,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,
        clearReadNotifications,
        claimSurplusPost,
        simulateSurplusFoodAlert,
        triggerManualMatchRun,
        resetAllDataToDefault,
        userNotifications,
        unreadSurplusAlertsCount,
        soundEnabled,
        setSoundEnabled,
        activeToastNotification,
        dismissToastNotification
      }}
    >
      {children}
    </FarmLinkContext.Provider>
  );
};

export const useFarmLink = () => {
  const context = useContext(FarmLinkContext);
  if (!context) {
    throw new Error('useFarmLink must be used within a FarmLinkProvider');
  }
  return context;
};
