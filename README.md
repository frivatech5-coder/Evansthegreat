# PROJECT REBIRTH

**JISHINDE USHINDE — CONQUER YOURSELF TO CONQUER.**

A full-stack, offline-capable personal development operating system built with React, TypeScript, Tailwind CSS, Express, Gemini AI (`@google/genai`), Firebase Authentication, Cloud Firestore, Vite PWA, and Capacitor Android.

---

## Project Structure

- `server.ts` — Express + Vite server hosting the verified `/api/mentor/chat` SSE streaming endpoint (`gemini-4-hydrogen`) with Firebase ID token verification.
- `firebase-blueprint.json` — Data entity schema and collection mapping.
- `firestore.rules` — Hardened user-isolated Firestore security rules.
- `capacitor.config.ts` — Capacitor configuration (`com.projectrebirth.app`) for Android APK builds.
- `src/lib/firebase.ts` — Firebase Auth & offline-persistent Firestore initialization.
- `src/context/RebirthContext.tsx` — Real-time Firestore state synchronization, XP/Rank calculation, and notification reminders.
- `src/components/` — Dashboard, Pillar 1 (Builder), Pillar 2 (Man of God), Pillar 3 (Thinker), The Mentor, Battle Room + Emergency Help Modal, Daily Planner, Analytics, Knowledge Vault, Ranks & XP, and Settings.

---

## Environment Variables

Configure via `.env` (or AI Studio **Settings > Secrets**):

- `GEMINI_API_KEY` — Server-side Gemini API key (never exposed to browser bundles).
- `APP_URL` — Public application URL.
- `PORT` — Optional server port (defaults to `3000`).

---

## Firebase Setup

1. Ensure `firebase-applet-config.json` is populated with your Firebase project config and `firestoreDatabaseId`.
2. Deploy security rules:
   ```bash
   firebase deploy --only firestore:rules
   ```
3. Enable **Google Sign-In** in Firebase Authentication Console.

---

## Development & Deployment

```bash
npm install
npm run dev       # Starts Express + Vite on port 3000
npm run lint      # TypeScript check
npm run build     # Builds production dist/ + PWA service worker
npm start         # Serves production build with node server.ts
```

---

## Android APK Packaging (Capacitor)

1. Build the production web bundle:
   ```bash
   npm run build
   ```
2. Add and sync the Android native project:
   ```bash
   npx cap add android
   npx cap sync android
   ```
3. Open in Android Studio to sign and build your APK/AAB:
   ```bash
   npx cap open android
   ```
   Or build a debug APK directly with Gradle:
   ```bash
   cd android && ./gradlew assembleDebug
   ```
