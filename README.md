# Mevet Melodies

Build a full-featured cross-platform mobile music player app called **Mevet Player** using React Native (compatible with both iOS and Android). Below are the complete requirements:

---

## App Name
**Mevet Player**

---

## Core Features

### Music Library Access & Organization
- Request and access the device's local storage to scan and load all audio files
- Automatically classify and display music by:
  - **Songs** (all tracks)
  - **Playlists** (user-created)
  - **Folders** (directory-based grouping)
  - **Albums** (metadata-based)
  - **Artists** (metadata-based)
- Display album art, track duration, and metadata where available

---

### Authentication (Sign In / Sign Up)
- Implement a full authentication system with:
  - Email/password Sign Up and Sign In
  - Secure session management
  - User-specific data storage so playlists, preferences, and settings are tied to each account
- Support both **local storage** and **cloud sync** for user data (playlists, themes, settings)
- When a user creates a playlist, it is saved to their account and persists across sessions and devices (via cloud sync)

---

### Music Playback
- Full-featured audio player with:
  - Play, Pause, Skip, Previous, Seek
  - Shuffle and Repeat modes
  - Background playback support
  - Lock screen and notification controls (media session)

---

### Lyrics Feature
- **Automatic lyrics fetching**: When a song plays, automatically attempt to fetch lyrics using a lyrics API (e.g., Musixmatch, Genius, or LRClib)
- **Manual lyrics import**: If automatic fetch fails or the user prefers, allow importing a `.lrc` or `.txt` lyrics file manually
- Display synced (scrolling) lyrics when LRC format is available, or static lyrics otherwise

#### Lyrics Fullscreen Mode ("Clear Screen")
- A dedicated fullscreen lyrics view that:
  - Hides all player buttons and UI chrome
  - Displays only the lyrics in a clean, immersive layout
  - Allows the user to set a **background image or video** (chosen from their device) behind the lyrics
  - Tap to toggle UI visibility

---

### Theme Customization
- Allow users to fully customize the app's appearance:
  - **Pre-built templates** (e.g., Dark, Light, Amoled, Sunset, Ocean, etc.)
  - **Custom color picker** for accent colors, backgrounds, and text
  - **Device wallpaper sync**: Option to pull the current device wallpaper as the app background
- Theme preferences are saved per user account and synced across devices

---

### Sleep Timer
- Implement a sleep timer with the following options:
  - 5, 10, 15, 20, 25, 30, 35, 40 minutes
  - **"Until current song ends"** option
- Show a visible countdown indicator when the timer is active
- Gracefully fade out and stop playback when the timer expires

---

## Technical Requirements
- **Framework**: React Native (Expo or bare workflow) — target iOS and Android
- **Audio**: Use `react-native-track-player` for reliable background audio and media controls
- **Storage**: AsyncStorage or MMKV for local data; Firebase or Supabase for cloud sync and authentication
- **Lyrics API**: Integrate LRClib (free) as primary source; fallback to manual import
- **Media picker**: Use `expo-document-picker` and `expo-image-picker` for lyric file and background media imports
- **File system access**: Use `expo-media-library` or `react-native-fs` to scan device audio files
- **Navigation**: React Navigation with bottom tab navigator for Songs, Playlists, Folders, Albums, Artists
- **State management**: Zustand or Redux Toolkit

---

## UI/UX Guidelines
- Modern, clean mobile UI with smooth animations
- Mini player bar visible at the bottom when a song is playing (except in fullscreen lyrics mode)
- Fullscreen player view with album art, controls, and lyrics toggle
- Onboarding flow for new users (Sign Up → grant permissions → scan library)
- Responsive design for various screen sizes

---

## Deliverables
- Complete project structure with all screens: Home, Library (Songs/Albums/Artists/Folders), Playlists, Now Playing, Fullscreen Lyrics, Settings (Theme, Sleep Timer, Account)
- Authentication screens: Sign In, Sign Up, Forgot Password
- All features listed above implemented and functional

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://mevetmusic.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/10567841-7389-4b91-b024-9acf5fc2df6b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
