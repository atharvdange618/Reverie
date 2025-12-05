# ✨ Reverie

> _A quiet place made just for you. Where stories come alive and every page feels like home._

**Reverie** is a personalized PDF reader app crafted with love as a birthday gift. It features a soft, romantic aesthetic with dark red and lavender accents, designed to make reading feel intimate and special.

[![React Native](https://img.shields.io/badge/React%20Native-0.83.0-61DAFB?style=flat&logo=react)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Platform](https://img.shields.io/badge/Platform-Android-3DDC84?style=flat&logo=android&logoColor=white)](https://developer.android.com/)

## 📖 Features

- **Beautiful PDF Reading** - Clean, distraction-free reading experience
- **Highlights & Annotations** - Mark your favorite passages with customizable colors
- **Emoji Reactions** - React to moments that move you 💕
- **Bookmarks** - Never lose your place in the story
- **Text-to-Speech** - Listen to pages read aloud
- **Ambient Music** - Soft background music to set the mood
- **Dark Romance Theme** - Elegant dark red (#8B2635) with lavender (#D4B8E0) accents
- **Personal Library** - Organize and track your reading journey

## 🎨 Design

Reverie uses a carefully crafted color palette:

| Element          | Color                  |
| ---------------- | ---------------------- |
| Primary Accent   | `#8B2635` (Dark Red)   |
| Secondary Accent | `#D4B8E0` (Lavender)   |
| Background       | `#FAF8F5` (Warm Cream) |
| Text             | `#2D2A26` (Soft Black) |

**Typography:**

- **Reading:** Literata (elegant serif for immersive reading)
- **UI:** Inter (clean sans-serif for interface elements)

## 🛠️ Tech Stack

- **React Native 0.82.1** - Cross-platform mobile framework
- **TypeScript** - Type-safe development
- **Zustand** - Lightweight state management
- **React Navigation** - Native navigation with bottom tabs
- **react-native-quick-sqlite** - Fast, synchronous SQLite database
- **react-native-pdf** - PDF rendering
- **@shopify/react-native-skia** - Canvas drawing for freehand highlights
- **react-native-reanimated** - Smooth animations
- **react-native-track-player** - Background audio for ambient music
- **react-native-tts** - Text-to-speech functionality

## 📁 Project Structure

```text
src/
├── assets/          # Fonts, images, and audio files
├── components/      # Reusable UI components
├── db/              # SQLite database & queries
├── hooks/           # Custom React hooks
├── navigation/      # React Navigation setup
├── screens/         # App screens
│   ├── HomeScreen.tsx
│   ├── LibraryScreen.tsx
│   ├── SettingsScreen.tsx
│   ├── ReaderScreen.tsx
│   └── OnboardingScreen.tsx
├── store/           # Zustand state stores
├── theme/           # Colors, typography, spacing
├── types/           # TypeScript type definitions
└── utils/           # Helper functions
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- React Native development environment ([Setup Guide](https://reactnative.dev/docs/set-up-your-environment))
- Android Studio with an emulator or physical device

### Installation

```bash
# Clone the repository
git clone https://github.com/atharvdange618/Reverie.git
cd Reverie

# Install dependencies
npm install

# Apply patches for deprecated dependencies
npx patch-package

# Link fonts
npx react-native-asset
```

### Running the App

```bash
# Start Metro bundler
npm start

# Run on Android (in a new terminal)
npm run android
```

## 💝 Made with Love

This app was created as a gift — a small piece of my heart wrapped in code. Every feature, every color choice, and every gentle animation was crafted with one person in mind.

_"Some books are to be tasted, others to be swallowed, and some few to be chewed and digested."_
— Francis Bacon

---

**Author:** Atharv Dange  
**Email:** atharvdange.dev@gmail.com
