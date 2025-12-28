import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

// 1. User Profile (Stored in 'users' collection)
export interface UserProfile {
  uid: string;
  phoneNumber: string;
  displayName: string;
  about?: string;
  avatarUrl?: string | null;
  pushToken?: string;
  isOnline?: boolean; // Online status
  lastSeen?: FirebaseFirestoreTypes.FieldValue; // Last active timestamp
  createdAt: FirebaseFirestoreTypes.FieldValue;
}

// 2. Chat Room (Stored in 'chats' collection)
export interface ChatRoom {
  id: string; // The doc ID (e.g. "uid1_uid2")
  participants: string[]; // [uid1, uid2] for querying
  
  // Denormalized data for list performance
  participantData: {
    [uid: string]: {
      displayName: string;
      avatarUrl?: string | null;
    };
  };

  lastMessage?: {
    text: string;
    createdAt: number | Date; // Javascript timestamp
    user: {
      _id: string;
      name: string;
    };
  };

  // Track unread messages per user
  unreadCount?: {
    [uid: string]: number;
  };

  updatedAt: any; // FieldValue.serverTimestamp()
}

// 3. Messages (Stored in 'chats/{chatId}/messages' subcollection)
// Matching React-Native-Gifted-Chat structure
export interface Message {
  _id: string;
  text: string;
  createdAt: number | Date;
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
  image?: string;
  sent?: boolean;
  received?: boolean;
  read?: boolean; // Read receipt status
}