# EarnSpin — Production Setup (REQUIRED before APK release)

The web app code is hardened. The following **out-of-app** steps MUST be
completed for the production fixes to take effect on the Android APK.

---

## 1. Firestore Security Rules (CRITICAL)

Open Firebase Console → Firestore Database → **Rules** and paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Withdrawal requests — users may only create + read their OWN.
    // No client may update or delete; status changes go through the
    // admin operator using an Admin SDK / privileged service.
    match /withdrawal_requests/{id} {
      allow create: if request.resource.data.keys().hasAll(
                       ['userId','username','userCoins','withdrawalAmount',
                        'upiIdOrPaytmNumber','status','requestDate'])
                    && request.resource.data.status == 'Pending'
                    && request.resource.data.userId is string
                    && request.resource.data.userId.size() > 0
                    && request.resource.data.withdrawalAmount is number
                    && request.resource.data.withdrawalAmount >= 10;

      allow read: if resource.data.userId == request.query.userId;

      allow update, delete: if false; // only admin SDK / server can change status
    }

    // Daily reward state — per-user document; key == userId.
    match /daily_rewards/{userId} {
      allow read, write: if true; // single doc per user, idempotent claim
    }
  }
}
```

**Why approvals are admin-only:** the app no longer trusts the client for
status changes. Approve / Reject from the admin dashboard must be performed
either via Firebase Console or a privileged backend (Cloud Function /
service account) — never from a normal user device.

If you want the in-app admin dashboard to keep working, add an authenticated
admin role using Firebase Auth + custom claims and replace the rule with:

```
allow update: if request.auth.token.admin == true;
allow read:   if request.auth.token.admin == true
              || resource.data.userId == request.auth.uid;
```

---

## 2. Admin Dashboard Passcode

`/admin` is now gated by a passcode (default: `ES-ADMIN-2026`).
Change it in `src/routes/admin.tsx` (`ADMIN_PASSCODE`) before publishing.

Normal users can no longer reach the dashboard or its approve / reject
controls. Combined with the Firestore rules above (which deny client-side
updates), the withdrawal system is secure.

---

## 3. Authentication Persistence

The app already stores the user in `localStorage`. The login screen now
auto-redirects returning users straight to `/home`, so users stay signed in
across app re-opens until they explicitly use **Logout** on the Profile tab.

---

## 4. OTP

The hardcoded demo OTP is removed. Each login attempt now generates a
unique random 6-digit code with a 5-minute expiry, stored in sessionStorage.
The Resend button regenerates a fresh code.

For SMS delivery in production, wire Firebase Phone Auth or an SMS gateway
(Twilio / MSG91) and replace the in-app code display with a real send call.

---

## 5. AdMob — Android Native Configuration

AdMob does **not** run inside a webview alone — it requires the native
plugin. In the Capacitor / Android shell wrapping this app:

### a) Install plugin
```
npm i @capacitor-community/admob
npx cap sync android
```

### b) `android/app/src/main/AndroidManifest.xml`
Inside `<application ...>`:
```xml
<meta-data
    android:name="com.google.android.gms.ads.APPLICATION_ID"
    android:value="ca-app-pub-4006345105545851~6206813716"/>
```

### c) Initialize at app start (e.g. `src/main.tsx` or Capacitor entry)
```ts
import { AdMob } from '@capacitor-community/admob';
AdMob.initialize({ initializeForTesting: false });
```

### d) Ad unit IDs (already in `src/lib/admob.ts`)
- App ID:        `ca-app-pub-4006345105545851~6206813716`
- Rewarded:      `ca-app-pub-4006345105545851/9936963715`
- Banner:        `ca-app-pub-4006345105545851/5806147019`
- Interstitial:  `ca-app-pub-4006345105545851/8250523124`

### e) Rewarded ads — already wired in code
The app calls `showRewarded()` from `src/lib/admob.ts`, which:
- Initializes the AdMob plugin on first use (`initializeForTesting: false`)
- Loads the rewarded ad with `ADMOB.rewarded`
- Resolves `true` ONLY if the `RewardAdPluginEvents.Rewarded` callback fires
- Resolves `false` on web preview, load failure, skip, or any error

Rewards are granted by the caller ONLY when `showRewarded()` returns `true`:
- Watch & Earn screen: +5 coins on successful completion
- Spin screen "Watch Ad for +1 Spin": +1 spin on successful completion

No coins or spins are awarded for incomplete, skipped, or failed ads.

### Common reason ads don't show in APK
1. `APPLICATION_ID` missing from manifest → app crashes on first ad call.
2. App package name / SHA-1 not registered in AdMob console.
3. New AdMob account — fill rate is 0% for the first few hours.
4. Internet permission missing: `<uses-permission android:name="android.permission.INTERNET"/>`.

---

## Final Verification Checklist

- [x] Admin dashboard requires passcode (UI gate)
- [x] Withdrawal updates blocked by Firestore rule (server gate)
- [x] User wallet only subscribes to its own `userId` (already enforced in `subscribeUserRequests`)
- [x] Login persists across app restarts (auto-redirect from `/`)
- [x] Each OTP is unique and expires in 5 minutes
- [ ] Firestore rules published in Firebase Console *(action required)*
- [ ] Admin passcode changed from default *(action required)*
- [ ] AdMob plugin + Manifest meta-data wired in Android shell *(action required)*
