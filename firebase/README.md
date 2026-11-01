# Firebase native config

One Firebase project per env. Put the files downloaded from the Firebase console here:

```text
firebase/
├ test/        google-services.json   GoogleService-Info.plist   firebase-web.json
├ staging/     google-services.json   GoogleService-Info.plist   firebase-web.json
└ production/  google-services.json   GoogleService-Info.plist   firebase-web.json
```

- `app.config.ts` picks the folder from `EXPO_PUBLIC_APP_ENV` (`yarn start` = `test`, EAS profiles set it).
- The apps registered in Firebase must use `template.config.json` → `bundleId` (iOS) and `packageName` (Android).
- These files are client config, not secrets — commit them so EAS builds find them.
- Native: no files = Firebase off for that env (native builds fine, the service is a no-op). Both files = on. Only one = warning, still off.
- Web: `firebase-web.json` = the web app's `firebaseConfig` from the console (`apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`, `measurementId`), plus optional `vapidKey` (Cloud Messaging → Web Push certificates). No file = web no-op.
- Rebuild native after adding/removing files: `npx expo prebuild --clean`. Web: restart with `npx expo start --clear` (the config is inlined into the bundle).

Full guide: `.docs/firebase-standard.md`.
