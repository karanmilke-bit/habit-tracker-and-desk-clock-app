# 🌟 Cross-Platform Habit & Task Tracker

A modern, full-featured **Habit & Task Tracker** application built with **React Native** and **Expo**, designed to run identically across **iOS, Android, and Web browsers** from a single codebase.

---

## 🚀 Quick Start

### 1. Run in Browser (Web)
```bash
npm run web
```
This starts the local Metro dev server and automatically opens `http://localhost:8081` in your browser.

### 2. Run on Mobile (iOS & Android)
```bash
npm start
```
- Download the free **Expo Go** app on your phone from the Apple App Store or Google Play Store.
- Make sure your phone and computer are on the same Wi-Fi network.
- Scan the QR code displayed in your terminal using the Expo Go app (Android) or the Camera app (iOS).

---

## ✨ Features

- **📱 Cross-Platform**: True cross-platform responsive layout optimized for mobile screens and widescreen desktop browsers.
- **🔥 Habit Streaks**: Calculates consecutive active streaks and records all-time best streaks.
- **📅 Interactive 7-Day History**: One-tap completion toggle on any of the past 7 days.
- **✅ Task Management**: Organize tasks with High, Medium, and Low priorities, due date indicators, and completion filters.
- **📊 Insights & Analytics**: Visual 7-day activity bar chart, completion percentages, and category breakdown.
- **💾 Offline Persistence**: Powered by `@react-native-async-storage/async-storage` for reliable local storage across platforms.
- **🌓 Dark & Light Themes**: Seamlessly switch between dark mode and light mode with persistent user preferences.
- **🔄 Sample Data Preload**: Comes with realistic starter data and a quick "Reset Demo" button to test features immediately.

---

## 📂 Project Architecture

```
habit-tracker-app/
├── assets/                  # App icons and splash assets
├── src/
│   ├── components/
│   │   ├── AddModal.tsx     # Modal form for adding habits and tasks
│   │   ├── AnalyticsView.tsx# 7-day charts and performance metrics
│   │   ├── HabitCard.tsx    # Habit card with 7-day streak history
│   │   ├── Header.tsx       # Date, progress indicator, and theme switcher
│   │   ├── TabBar.tsx       # Bottom navigation bar
│   │   └── TaskItem.tsx     # Task row with priority badge & due date
│   ├── constants/
│   │   └── theme.ts         # Theme palettes and category styling
│   ├── context/
│   │   └── AppContext.tsx   # React Context state management
│   ├── services/
│   │   └── storage.ts       # AsyncStorage persistence service
│   ├── types/
│   │   └── index.ts         # TypeScript interfaces and models
│   └── utils/
│       └── dateUtils.ts     # Date manipulation and streak calculation
├── App.tsx                  # Main application container
├── app.json                 # Expo configuration
├── package.json
└── tsconfig.json
```
