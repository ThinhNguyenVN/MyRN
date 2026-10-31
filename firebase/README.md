# Firebase native config

One Firebase project per env. Put the files downloaded from the Firebase console here:

```text
firebase/
├ test/        google-services.json   GoogleService-Info.plist
├ staging/     google-services.json   GoogleService-Info.plist
└ production/  google-services.json   GoogleService-Info.plist
```

- `app.config.ts` picks the folder from `EXPO_PUBLIC_APP_ENV` (`yarn start` = `test`, EAS profiles set it).
- The apps registered in Firebase must use `template.config.json` → `bundleId` (iOS) and `packageName` (Android).
- These files are client config, not secrets — commit them so EAS builds find them.
- No files = Firebase off for that env (native builds fine, the service is a no-op). Both files = on. Only one = warning, still off.
- Rebuild native after adding/removing files: `npx expo prebuild --clean`.

Full guide: `.docs/firebase-standard.md`.
