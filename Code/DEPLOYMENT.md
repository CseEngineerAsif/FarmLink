# FarmLink — Production Architecture & Deployment Guide

## 1. Executive Summary
**FarmLink** connects university student residential dining halls (e.g., BAUST Abbas Uddin Ahmed Hall and Shaheed Dr. Zikrul Haque Hall in Saidpur, Nilphamari) with nearby livestock farms (e.g., Sabuj Bangla Dairy Farm and Hosan Farm).

It transforms surplus cooked food from general municipal waste into high-nutrient livestock feed, while securing tangible food returns (fresh milk, poultry eggs, meat) or direct cash for the university halls.

---

## 2. Implemented Core Modules
1. **User Management & RBAC Authentication**:
   - Three distinct roles: **Hall Admin**, **Farm Owner**, and **Super Admin**.
   - Biosecurity authorization check: New accounts require Super Admin verification before accessing food distribution.
   - 1-click test profiles for instant role verification matching the field research respondents.

2. **Surplus Food Posting & Scheduling Engine**:
   - Records quantity in kg, meal service timing (Lunch, Dinner, Breakfast), and storage conditions.
   - Live pre-check against animal nutrition guidelines.

3. **Animal Health & Biosecurity Engine**:
   - Species-specific dietary validation for Cattle, Goats, Sheep, Poultry, and Aquaculture.
   - Enforces the **strictest 2.0-hour holding limit** derived from BLRI (Bangladesh Livestock Research Institute) and independent veterinary expert findings.
   - Rejects spoiled, moldy, or curried/spicy foods that trigger rumen acidosis.

4. **Distance & Proximity-Based Smart Matching Engine**:
   - Evaluates eligible farms within a 2–5 km radius using the Haversine distance formula.
   - Composite ranking combining geographic proximity and dietary safety compatibility.
   - **Automated Reassignment**: If a match is declined or expires, automatically reassigns to the next qualified candidate.

5. **QR Code Handover Verification**:
   - Dynamic QR generation for hall managers.
   - On-site scanning with verification of timestamp, actual quantity weighed, and biosecurity check.
   - Atomic state update preventing duplicate pickups.

6. **Exchange Ledger (Circular Economy Tracking)**:
   - Records returns in Fresh Milk (Liters), Poultry Eggs (Pieces), Meat (Kg), and Cash (BDT).
   - Tracks settlement status and cumulative savings.

7. **Institutional Analytics & Audit Logs**:
   - Visual charts (Recharts) for hall-wise surplus reduction and return product ratios.
   - Estimated CO2eq emissions diverted.
   - Immutable audit trail recording every state mutation.
   - CSV export for university sustainability reporting.

8. **Localization**:
   - Full bilingual support in English and Bengali (বাংলা).

---

## 3. Configuration & Cloud Firestore Setup

### Environment Variables (`.env`)
```bash
# Optional AI key
GEMINI_API_KEY="your-gemini-key"

# Application URL
APP_URL="https://your-domain.app"

# Firebase Cloud Firestore & Auth
VITE_FIREBASE_API_KEY="AIzaSy..."
VITE_FIREBASE_AUTH_DOMAIN="farmlink-baust.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="farmlink-baust"
VITE_FIREBASE_STORAGE_BUCKET="farmlink-baust.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="45167572403"
VITE_FIREBASE_APP_ID="1:45167572403:web:7ab92c..."

# Strictest holding limit default in hours
VITE_DEFAULT_HOLDING_HOURS=2.0
```

### Firestore Security Rules Deployment
The `firestore.rules` file in the project root defines role-based access rules:
```bash
firebase deploy --only firestore:rules
```

---

## 4. Known Limitations & Future Roadmap
- **SMS Notifications**: System currently issues in-app push notifications. In low-connectivity environments, a Twilio / Infobip SMS webhook can be attached to the Cloud Function trigger.
- **Mobile Hardware Scanner**: Web camera scanning is fully supported via standard WebRTC camera APIs. In offline rural environments without camera access, manual code entry is provided.
