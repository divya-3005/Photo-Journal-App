# 📔 Photo Journal

A mobile journal app built with **Expo (React Native)** where you can log daily entries with photos, read a fresh motivational quote, and stay logged in between sessions.

---

## Screenshots

| Login | Journal List | Add Entry | Quote |
|-------|-------------|-----------|-------|
| _(add screenshot)_ | _(add screenshot)_ | _(add screenshot)_ | _(add screenshot)_ |

> **To add screenshots:** Run the app in Expo Go, take phone screenshots, and drag them into the `assets/screenshots/` folder. Then replace the placeholder text above with `![Login](assets/screenshots/login.png)` etc.

---

## Concepts Covered

| Concept | Where it's used |
|---------|----------------|
| React Navigation (Stack + Bottom Tabs) | `src/navigation/` — Tab contains its own Stack |
| Context API | `AuthContext` (auth state), `EntriesContext` (journal data) |
| AsyncStorage | Persisting user login and journal entries across app restarts |
| Auto-login | `AuthContext` reads saved user on mount; spinner shown during check |
| `useQuery` | Fetching a random quote from `dummyjson.com` with caching |
| `useMutation` | POSTing (sharing) the quote to the server |
| `expo-image-picker` | Camera + gallery photo selection with permission handling |
| Permission flow | Requests permission → denied → shows Settings redirect prompt |
| FlatList + pull-to-refresh | `EntriesScreen` with `RefreshControl` |
| Full-screen photo viewer | Modal overlay in `PhotoViewerModal` |
| Params between screens | `navigation.navigate('EntryDetails', { id, title })` |
| KeyboardAvoidingView | `AddEntryScreen` so keyboard doesn't cover inputs |

---

## How to Run

### Prerequisites
- [Node.js](https://nodejs.org) (v18+)
- [Expo Go](https://expo.dev/go) app on your Android or iOS phone

### Steps

```bash
git clone https://github.com/divya-3005/Journal-App.git
cd Journal-App
npm install
npx expo start
```

Scan the QR code shown in the terminal with **Expo Go** on your phone.

---

## Download APK

> _(Attach the APK file to a GitHub Release after running `eas build -p android --profile preview`)_

[**Download APK → Releases**](https://github.com/divya-3005/Journal-App/releases)

---

## Project Structure

```
src/
├── screens/          # One file per screen
│   ├── LoginScreen.js
│   ├── EntriesScreen.js
│   ├── AddEntryScreen.js
│   ├── EntryDetailsScreen.js
│   ├── ProfileScreen.js
│   └── QuoteScreen.js
├── navigation/       # Stack + Tab navigators + RootNavigator
├── context/          # AuthContext, EntriesContext
├── components/       # EntryCard, PhotoViewerModal
├── utils/            # photo.js (camera/gallery helpers)
└── constants/        # colors.js
```

---

## Tech Stack

- **Expo SDK 58** / React Native 0.88
- **Expo Router** (file-based navigation) + React Navigation 7
- **TanStack React Query** v5 (`useQuery`, `useMutation`)
- **AsyncStorage** for local persistence
- **expo-image-picker** for camera & gallery
