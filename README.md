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

## Setup

```bash
npm install
npm start
```

## Privacy

- All data stored locally on-device
- No account required
- No analytics, tracking, or advertising
