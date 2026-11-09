export type Language = 'en' | 'bn';

export const translations = {
  en: {
    appTitle: 'FarmLink',
    tagline: 'Bridging University Halls & Local Livestock Farms',
    subtitle: 'Safe, species-validated surplus food redistribution and sustainable resource exchange in Saidpur.',
    nav: {
      dashboard: 'Dashboard',
      foodPosts: 'Surplus Posts',
      matching: 'Smart Matching',
      pickups: 'QR Pickups',
      transactions: 'Exchange Ledger',
      nutrition: 'Nutrition & Safety',
      analytics: 'Analytics',
      adminPanel: 'Super Admin',
      auditLogs: 'Audit Logs',
      firebaseStatus: 'Cloud Config'
    },
    roles: {
      hall_admin: 'Hall Admin',
      farm_owner: 'Farm Owner',
      super_admin: 'Super Admin',
      switchRole: 'Switch Role Profile',
      currentRole: 'Active Session'
    },
    status: {
      open: 'Open for Matching',
      matched: 'Matched',
      collected: 'Collected',
      expired: 'Expired',
      cancelled: 'Cancelled',
      pending: 'Pending Acceptance',
      accepted: 'Accepted',
      declined: 'Declined',
      reassigned: 'Reassigned',
      approved: 'Approved',
      suspended: 'Suspended',
      settled: 'Settled'
    },
    exchangeTypes: {
      cash: 'Cash (BDT)',
      milk: 'Fresh Milk (Liters)',
      eggs: 'Eggs (Pieces)',
      meat: 'Meat (Kg)'
    },
    species: {
      cattle: 'Cattle (Cows/Bulls)',
      goat: 'Goat',
      sheep: 'Sheep',
      poultry: 'Poultry (Hens/Ducks)',
      fish: 'Aquaculture (Pond Fish)'
    },
    actions: {
      createPost: 'Post Surplus Food',
      acceptMatch: 'Accept Offer',
      declineMatch: 'Decline Offer',
      scanQR: 'Scan Pickup QR',
      showQR: 'Show Collection QR',
      recordSettlement: 'Record Exchange Return',
      approveUser: 'Approve User',
      suspendUser: 'Suspend Access',
      filter: 'Filter',
      search: 'Search...',
      cancel: 'Cancel',
      confirm: 'Confirm',
      save: 'Save Changes',
      exportReport: 'Export Institutional CSV',
      logout: 'Logout',
      login: 'Sign In',
      register: 'Register Account',
      viewDetails: 'View Details',
      testMatch: 'Trigger Auto-Match'
    },
    safety: {
      safe: 'Safe For Feeding',
      warning: 'Caution Required',
      prohibited: 'Strictly Prohibited',
      holdingWindow: 'Max Holding Limit',
      strictestStandard: 'Strictest 2-Hour Holding Limit Active',
      hoursRemaining: 'hours remaining before automatic disposal',
      spoilageCheck: 'Required Spoilage Inspection',
      storageAlert: 'Storage Condition Must Be Verified',
      spicyWarning: 'Spicy/Curried food is toxic or harmful for livestock'
    },
    metrics: {
      totalRedistributed: 'Total Surplus Redistributed',
      co2Prevented: 'Estimated CO2eq Prevented',
      exchangeValue: 'Total Exchange Value',
      activeParticipants: 'Active Halls & Farms',
      wasteReductionRate: 'Campus Waste Diverted',
      dailyAverage: 'Daily Redistribution'
    }
  },
  bn: {
    appTitle: 'ফার্মলিঙ্ক',
    tagline: 'বিশ্ববিদ্যালয় হল এবং স্থানীয় গবাদি খামারের সংযোগ সেতু',
    subtitle: 'সৈয়দপুরে খাদ্য উদ্বৃত্ত হ্রাস, প্রাণীর পুষ্টি নিরাপত্তা যাচাই ও টেকসই চক্রাকার সম্পদ বিনিময়।',
    nav: {
      dashboard: 'ড্যাশবোর্ড',
      foodPosts: 'উদ্বৃত্ত খাদ্য পোস্ট',
      matching: 'স্মার্ট ম্যাচিং',
      pickups: 'কিউআর পিকআপ',
      transactions: 'বিনিময় লেজার',
      nutrition: 'পুষ্টি ও নিরাপত্তা বিধি',
      analytics: 'পরিসংখ্যান ও বিশ্লেষণ',
      adminPanel: 'সুপার অ্যাডমিন',
      auditLogs: 'অডিট লগ',
      firebaseStatus: 'ক্লাউড কনফিগারেশন'
    },
    roles: {
      hall_admin: 'হল প্রশাসন',
      farm_owner: 'খামারী / ফার্ম মালিক',
      super_admin: 'সুপার অ্যাডমিন',
      switchRole: 'রোল পরিবর্তন করুন',
      currentRole: 'বর্তমান প্রোফাইল'
    },
    status: {
      open: 'ম্যাচিংয়ের জন্য উন্মুক্ত',
      matched: 'ম্যাচ হয়েছে',
      collected: 'সংগৃহীত',
      expired: 'মেয়াদোত্তীর্ণ',
      cancelled: 'বাতিল',
      pending: 'অনুমোদনের অপেক্ষায়',
      accepted: 'গৃহীত',
      declined: 'প্রত্যাখ্যাত',
      reassigned: 'পুনঃবরাদ্দকৃত',
      approved: 'অনুমোদিত',
      suspended: 'স্থগিত',
      settled: 'নিষ্পত্তিকৃত'
    },
    exchangeTypes: {
      cash: 'নগদ টাকা (টাকা)',
      milk: 'খাঁটি দুধ (লিটার)',
      eggs: 'ডিম (হালি / পিস)',
      meat: 'মাংস (কেজি)'
    },
    species: {
      cattle: 'গরু / গবাদিপশু',
      goat: 'ছাগল',
      sheep: 'ভেড়া',
      poultry: 'মুরগি / হাঁস',
      fish: 'মৎস্য খামার'
    },
    actions: {
      createPost: 'উদ্বৃত্ত খাবার পোস্ট করুন',
      acceptMatch: 'অফার গ্রহণ করুন',
      declineMatch: 'প্রত্যাখ্যান করুন',
      scanQR: 'পিকআপ কিউআর স্ক্যান করুন',
      showQR: 'সংগ্রহের কিউআর দেখান',
      recordSettlement: 'পণ্য বিনিময় লিপিবদ্ধ করুন',
      approveUser: 'ব্যবহারকারী অনুমোদন',
      suspendUser: 'স্থগিত করুন',
      filter: 'ফিল্টার',
      search: 'অনুসন্ধান করুন...',
      cancel: 'বাতিল',
      confirm: 'নিশ্চিত করুন',
      save: 'সংরক্ষণ করুন',
      exportReport: 'প্রতিবেদন এক্সপোর্ট (CSV)',
      logout: 'লগআউট',
      login: 'লগইন করুন',
      register: 'নিবন্ধন করুন',
      viewDetails: 'বিস্তারিত দেখুন',
      testMatch: 'অটো-ম্যাচিং চালান'
    },
    safety: {
      safe: 'পশু খাদ্যের জন্য নিরাপদ',
      warning: 'সতর্কতা প্রয়োজন',
      prohibited: 'কঠোরভাবে নিষিদ্ধ',
      holdingWindow: 'সর্বোচ্চ সংরক্ষণের সময়সীমা',
      strictestStandard: 'পশু চিকিৎসকদের কঠোর ২ ঘণ্টার সময়সীমা সক্রিয়',
      hoursRemaining: 'ঘণ্টা বাকি নষ্ট হওয়ার আগে',
      spoilageCheck: 'খাদ্যের গুণগত মান পরীক্ষা আবশ্যক',
      storageAlert: 'সংরক্ষণের শর্ত যাচাই করা বাধ্যতামূলক',
      spicyWarning: 'অতিরিক্ত মসলাযুক্ত বা ঝাল খাবার গবাদি পশুর জন্য মারাত্মক ক্ষতিকর'
    },
    metrics: {
      totalRedistributed: 'মোট পুনর্বণ্টিত খাদ্য',
      co2Prevented: 'কার্বন নির্গমন প্রতিরোধ',
      exchangeValue: 'মোট বিনিময় মূল্য',
      activeParticipants: 'সক্রিয় হল ও খামার',
      wasteReductionRate: 'বর্জ্য হ্রাস হার',
      dailyAverage: 'দৈনিক গড় সংগ্রহ'
    }
  }
};
