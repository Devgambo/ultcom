import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

/**
 * Service for managing user presence (online/offline status)
 * Call these methods in your App.tsx or a global provider
 */

export const PresenceService = {
  /**
   * Initialize presence tracking for the current user
   * Call this when the app becomes active
   */
  setOnline: async () => {
    const user = auth().currentUser;
    if (!user) return;

    try {
      await firestore().collection('users').doc(user.uid).update({
        isOnline: true,
        lastSeen: firestore.FieldValue.serverTimestamp(),
      });
      console.log('✅ User set to online');
    } catch (error) {
      console.error('Error setting user online:', error);
    }
  },

  /**
   * Set user as offline
   * Call this when the app goes to background or user logs out
   */
  setOffline: async () => {
    const user = auth().currentUser;
    if (!user) return;

    try {
      await firestore().collection('users').doc(user.uid).update({
        isOnline: false,
        lastSeen: firestore.FieldValue.serverTimestamp(),
      });
      console.log('✅ User set to offline');
    } catch (error) {
      console.error('Error setting user offline:', error);
    }
  },

  /**
   * Subscribe to another user's online status
   * @param userId - The UID of the user to track
   * @param callback - Function called when status changes
   * @returns Unsubscribe function
   */
  subscribeToUserStatus: (
    userId: string,
    callback: (isOnline: boolean, lastSeen?: Date) => void
  ) => {
    return firestore()
      .collection('users')
      .doc(userId)
      .onSnapshot(
        doc => {
          if (doc.exists()) {
            const data = doc.data();
            const isOnline = data?.isOnline || false;
            const lastSeen = data?.lastSeen?.toDate();
            callback(isOnline, lastSeen);
          }
        },
        error => {
          console.error('Error subscribing to user status:', error);
        }
      );
  },
};

/**
 * Service for managing push notifications
 * Integrate with Firebase Cloud Messaging (FCM)
 */

export const NotificationService = {
  /**
   * Save FCM token to user profile
   * @param token - FCM device token
   */
  savePushToken: async (token: string) => {
    const user = auth().currentUser;
    if (!user) return;

    try {
      await firestore().collection('users').doc(user.uid).update({
        pushToken: token,
      });
      console.log('✅ Push token saved');
    } catch (error) {
      console.error('Error saving push token:', error);
    }
  },

  /**
   * Remove push token (on logout)
   */
  removePushToken: async () => {
    const user = auth().currentUser;
    if (!user) return;

    try {
      await firestore().collection('users').doc(user.uid).update({
        pushToken: firestore.FieldValue.delete(),
      });
      console.log('✅ Push token removed');
    } catch (error) {
      console.error('Error removing push token:', error);
    }
  },
};
