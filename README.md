# Skill Sprout

Tools for growing readers. A suite of simple elementary-education tools for parents, teachers, tutors, and students. Version 1 focuses on reading fluency measurement.

## Features

### Fluency Timer
Measure oral reading speed (WPM) and accuracy with a simple workflow:
1. Set up student, passage, and word count
2. Start the timer while the child reads aloud
3. Tap the large Error button for each mistake
4. Stop, review, edit if needed, and calculate results
5. Save and track progress over time

### Running Record
Calculate reading accuracy percentage and self-correction ratio from total words, errors, and self-corrections.

### Quick Grader
Instant percentage calculator — enter total questions and incorrect answers to get the score.

### Students & History
Create student profiles, save passages with word counts, and track fluency progress over time.

## Tech Stack

- **React Native** with **Expo SDK 57**
- **TypeScript** (strict mode)
- **Expo Router** (file-based navigation)
- **SQLite** (expo-sqlite) for local persistence
- **Zustand** for state management
- **Expo Haptics** for tactile feedback

## Requirements

- Node.js >= 18
- npm >= 9
- Expo CLI (`npx expo`)
- For iOS builds: macOS with Xcode
- For Android builds: Android Studio (or EAS Build)

## Setup

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android
```

## Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Type check
npm run lint
```

## Building for Production

### Prerequisites

1. Install EAS CLI: `npm install -g eas-cli`
2. Log in: `eas login`
3. Configure your Apple/Google credentials in `eas.json`

### iOS (App Store)

```bash
# Preview build (internal testing)
eas build --platform ios --profile preview

# Production build
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios --profile production
```

### Android (Google Play)

```bash
# Preview build (internal testing)
eas build --platform android --profile preview

# Production AAB build
eas build --platform android --profile production

# Submit to Google Play
eas submit --platform android --profile production
```

## Project Structure

```
src/
├── constants/     App-wide constants (name, version, IDs)
├── types/         TypeScript interfaces
├── utils/         Pure calculation functions
├── db/            SQLite database layer
├── state/         Zustand stores
├── hooks/         React hooks
├── theme/         Design tokens (colors, spacing)
├── components/    Reusable UI components
└── features/      Feature-specific modules

app/
├── (tabs)/        Tab navigation screens
├── fluency/       Fluency workflow screens
├── students/      Student detail screens
├── passages/      Passage management
└── privacy.tsx    Privacy policy
```

## Privacy

- All data stored locally on-device
- No account required
- No analytics, tracking, or advertising
- No data transmitted to external servers
- Designed for use with children

## Roadmap

- [ ] Simple progress charts per student
- [ ] Data export (CSV)
- [ ] Math practice tools
- [ ] Sight words practice
- [ ] Optional cloud sync (with explicit consent)
- [ ] iPad/tablet optimized layouts
