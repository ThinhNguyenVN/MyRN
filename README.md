# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Branch naming

Use branch names in this format:

- `feat/<description>`
- `fix/<description>`
- `issue/<description>`

Examples:

- `feat/auth-login`
- `fix/token-refresh`
- `issue/123-login-error`

The repository validates branch names locally on `git push` and again in GitHub Actions.

You can also generate a valid branch name from the CLI:

```bash
yarn branch:create feat auth login
yarn branch:create fix token refresh
yarn branch:create issue 123 login error
```

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

## Environments (test/staging/production)

This project supports three runtime environments via root env files:

- `.env.test`
- `.env.staging`
- `.env.production`

Only `EXPO_PUBLIC_*` variables are available in app runtime.

### Run commands

```bash
# Start metro
npm run start:test
npm run start:staging
npm run start:production

# Android / iOS / Web
npm run android:test
npm run ios:staging
npm run web:production
```

### Reset Metro cache when switching env

```bash
npm run start:test:clean
npm run start:staging:clean
npm run start:production:clean
```

Use `:clean` variants after frequent env switches or when Metro appears to cache stale values.

### Build-ready for EAS (later)

`eas.json` already defines `test`, `staging`, `production` build profiles and maps `EXPO_PUBLIC_APP_ENV` for each profile.

When ready, use:

```bash
eas build -p android --profile test
eas build -p android --profile staging
eas build -p android --profile production
```

Never store real secrets in `EXPO_PUBLIC_*` variables because they are bundled into client apps.

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
