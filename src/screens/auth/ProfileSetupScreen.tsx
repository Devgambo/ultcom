import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ProfileSetup'>;

const ProfileSetupScreen = ({ navigation }: Props) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const saveProfile = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter your name.");
      return;
    }

    setLoading(true);
    try {
      const user = auth().currentUser;
      if (!user) throw new Error("No user found");

      // 1. Update Auth Profile (Internal Firebase Auth)
      await user.updateProfile({ displayName: name });

      // 2. Create Firestore Document
      await firestore().collection('users').doc(user.uid).set({
        uid: user.uid,
        phoneNumber: user.phoneNumber,
        displayName: name,
        avatarUrl: null, // We can add image upload later
        createdAt: firestore.FieldValue.serverTimestamp(),
        about: "Hey there! I am using UltCom.",
      });

      // AppNavigator will automatically detect profile creation and navigate to Home
      
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white justify-center px-6">
      <Text className="text-3xl font-bold text-slate-800 mb-2">Profile Info</Text>
      <Text className="text-slate-500 mb-8">Please provide your name and an optional profile photo.</Text>

      <View className="mb-6">
        <Text className="text-slate-700 font-semibold mb-2 ml-1">Full Name</Text>
        <TextInput
          className="bg-slate-50 p-4 rounded-xl text-lg text-slate-900 border border-slate-200"
          placeholder="John Doe"
          value={name}
          onChangeText={setName}
        />
      </View>

      <TouchableOpacity 
        onPress={saveProfile}
        disabled={loading}
        className="bg-slate-900 py-4 rounded-xl items-center"
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-bold text-lg">Next</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default ProfileSetupScreen;