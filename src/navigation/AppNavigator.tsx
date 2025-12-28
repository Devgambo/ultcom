import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { getAuth, onAuthStateChanged, FirebaseAuthTypes } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
// Import Types
import { RootStackParamList } from './types';

// Import Screens
import LoginScreen from '../screens/auth/LoginScreen';
import HomeScreen from '../screens/main/HomeScreen';
import ChatScreen from '../screens/main/ChatScreen';
import ProfileSetupScreen from '../screens/auth/ProfileSetupScreen';
import SearchUserScreen from '../screens/main/SearchUserScreen';


const Stack = createNativeStackNavigator<RootStackParamList>();


const AppNavigator = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);

  // Handle user state changes
  function handleAuthStateChanged(user: FirebaseAuthTypes.User | null) {
    setUser(user);
    console.log('🔥 Firebase: Auth state changed', user ? 'User logged in' : 'No user');
    
    // Check if user has completed profile setup
    if (user) {
      firestore()
        .collection('users')
        .doc(user.uid)
        .get()
        .then(doc => {
          setHasProfile(doc.exists);
          if (initializing) setInitializing(false);
        })
        .catch(err => {
          console.error('Error checking profile:', err);
          setHasProfile(false);
          if (initializing) setInitializing(false);
        });
    } else {
      setHasProfile(null);
      if (initializing) setInitializing(false);
    }
  }

  useEffect(() => {
    console.log('🔥 Firebase: Setting up auth listener');
    const subscriber = onAuthStateChanged(getAuth(), handleAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  if (initializing) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }
  
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : hasProfile === false ? (
          <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen
              name="Chat"
              component={ChatScreen}
              options={{ headerShown: true, title: 'Chat' }} // Show header for Chat
            />
            <Stack.Screen
              name="SearchUser"
              component={SearchUserScreen}
              options={{ presentation: 'modal', headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;