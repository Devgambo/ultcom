# UltCom 💬

**Ultimate Communication** - A modern, real-time chat application built with React Native and Firebase.

## 🚀 Features

- ✅ Phone number authentication with OTP verification
- ✅ Real-time messaging with instant delivery
- ✅ User profile management
- ✅ Search users by phone number
- ✅ Unread message badges
- ✅ Last message preview
- ✅ Clean, modern UI with TailwindCSS (NativeWind)
- ✅ Offline support
- ✅ Type-safe with TypeScript

## 🎯 Upcoming Features (V2)

- 🔔 Push notifications
- 🟢 Online/offline indicators
- 📸 Profile picture upload
- ✅ Read receipts
- 📍 Location sharing
- 🔒 End-to-end encryption
- 📹 Video calling (Stream.io integration)
- 👥 Group chats

## 📋 Prerequisites

> **Note**: Make sure you have completed the [React Native Environment Setup](https://reactnative.dev/docs/set-up-your-environment) before proceeding.

- Node.js >= 20
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development)
- Firebase project with Authentication & Firestore enabled

## 📦 Installation

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Install Required Package

```bash
npm install react-native-gifted-chat --legacy-peer-deps
```

### Step 3: Firebase Setup

1. **Create a Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create a new project or use an existing one

2. **Enable Authentication**
   - Navigate to Authentication → Sign-in method
   - Enable "Phone" authentication

3. **Create Firestore Database**
   - Navigate to Firestore Database
   - Create database in production mode
   - Set up security rules (see `SETUP_INSTRUCTIONS.md`)

4. **Create Composite Index**
   - Collection: `chats`
   - Fields: `participants` (Array-contains) + `updatedAt` (Descending)
   - Or wait for the error link when running the app

5. **Download Config Files**
   - **Android**: Download `google-services.json` → Place in `android/app/`
   - **iOS**: Download `GoogleService-Info.plist` → Place in `ios/UltCom/`

### Step 4: iOS Setup (iOS only)

```bash
cd ios
bundle install
bundle exec pod install
cd ..
```

## 🏃 Running the App

### Start Metro Bundler

```bash
npm start
```

### Run on Android

```bash
npm run android
```

### Run on iOS

```bash
npm run ios
```

If everything is set up correctly, you should see UltCom running in your emulator/simulator or connected device.

## 📁 Project Structure

```
UltCom/
├── src/
│   ├── navigation/
│   │   ├── AppNavigator.tsx    # Main navigation logic
│   │   └── types.ts            # Navigation types
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx         # Phone auth + OTP
│   │   │   └── ProfileSetupScreen.tsx  # New user profile
│   │   └── main/
│   │       ├── HomeScreen.tsx          # Chat list
│   │       ├── ChatScreen.tsx          # Real-time messaging
│   │       └── SearchUserScreen.tsx    # Find users
│   ├── services/
│   │   └── userServices.ts     # Presence & notifications
│   └── types/
│       └── models.ts            # TypeScript interfaces
├── android/                    # Android native code
├── ios/                        # iOS native code
├── SETUP_INSTRUCTIONS.md       # Detailed setup guide
└── SCHEMA_DOCUMENTATION.md     # Firestore schema docs
```

## 🎮 How to Use

1. **Sign Up/Login**
   - Enter your phone number with country code
   - Verify the OTP sent to your phone
   - Set up your profile (first-time users only)

2. **Start Chatting**
   - Tap the **+** button on the home screen
   - Search for a user by phone number
   - Start messaging instantly!

3. **View Conversations**
   - All your chats appear on the home screen
   - Unread messages show badges
   - Tap any chat to continue the conversation

## 🐛 Troubleshooting

### Issue: Composite Index Error
**Solution:** Click the error link or create index manually in Firebase Console
- Collection: `chats`
- Fields: `participants` (array-contains) + `updatedAt` (descending)

### Issue: OTP Not Received
**Solution:** 
- Check Firebase Console → Authentication → Phone is enabled
- Verify your phone number is correct with country code
- Check Firebase usage limits

### Issue: "Missing or insufficient permissions"
**Solution:** Update Firestore security rules (see `SETUP_INSTRUCTIONS.md`)

### Issue: Build Failures
**Solution:**
- Clean build: `cd android && ./gradlew clean && cd ..`
- iOS: `cd ios && pod deintegrate && pod install && cd ..`
- Clear Metro cache: `npm start -- --reset-cache`

## 📚 Documentation

- 📄 [SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md) - Detailed setup guide
- 📊 [SCHEMA_DOCUMENTATION.md](./SCHEMA_DOCUMENTATION.md) - Database schema reference

## 🛠️ Tech Stack

- **Framework:** React Native 0.83.1
- **Language:** TypeScript
- **Backend:** Firebase (Auth + Firestore)
- **Navigation:** React Navigation
- **Styling:** NativeWind (TailwindCSS)
- **Chat UI:** React Native Gifted Chat

## 📝 License

MIT License - feel free to use this project for learning or commercial purposes.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

---

**Built with ❤️ using React Native and Firebase**
