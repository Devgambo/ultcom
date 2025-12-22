import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const LoginScreen = ({ navigation }: Props) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState<any>(null);
  const [code, setCode] = useState('');

  // 1. Send SMS Logic
  const signInWithPhoneNumber = async () => {
    if (phoneNumber.length < 10) {
      Alert.alert("Invalid Phone", "Please enter a valid number.");
      return;
    }
    
    setLoading(true);
    try {
      // Append country code if missing (Hardcoded to +91 or +1 for now)
      const formattedNum = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
      const confirmation = await auth().signInWithPhoneNumber(formattedNum);
      setConfirm(confirmation);
    } catch (error: any) {
      console.log('Error sending code:', error);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. Verify Code Logic
  const confirmCode = async () => {
    try {
      setLoading(true);
      await confirm.confirm(code);
      // Auth listener in App.tsx (or manual check) usually handles the redirect,
      // but for now, let's manually go to Home upon success
      Alert.alert("Success", "You are logged in!");
      navigation.replace('Home'); 
    } catch (error) {
      Alert.alert('Invalid Code', 'The code you entered is incorrect.');
    } finally {
      setLoading(false);
    }
  };

  if (confirm) {
    // ---------------- OTP INPUT UI ----------------
    return (
      <View className="flex-1 bg-white justify-center px-6">
        <Text className="text-2xl font-bold text-slate-800 mb-2">Verify OTP</Text>
        <Text className="text-slate-500 mb-8">Enter the code sent to {phoneNumber}</Text>

        <TextInput
          className="bg-slate-100 p-4 rounded-xl text-lg text-slate-900 mb-6 border border-slate-200"
          placeholder="123456"
          keyboardType="number-pad"
          value={code}
          onChangeText={setCode}
          maxLength={6}
        />

        <TouchableOpacity 
          onPress={confirmCode}
          disabled={loading}
          className="bg-green-600 py-4 rounded-xl items-center shadow-lg shadow-green-200"
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">Verify & Login</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  // ---------------- PHONE INPUT UI ----------------
  return (
    <View className="flex-1 bg-white justify-center px-6">
      <View className="items-center mb-10">
        <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-4">
          <Text className="text-3xl">💬</Text>
        </View>
        <Text className="text-3xl font-bold text-slate-800">Welcome</Text>
        <Text className="text-slate-500 mt-2 text-center">Enter your phone number to continue</Text>
      </View>

      <View className="mb-6">
        <Text className="text-slate-700 font-semibold mb-2 ml-1">Phone Number</Text>
        <TextInput
          className="bg-slate-50 p-4 rounded-xl text-lg text-slate-900 border border-slate-200 focus:border-green-500"
          placeholder="9876543210"
          keyboardType="phone-pad"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
        />
      </View>

      <TouchableOpacity 
        onPress={signInWithPhoneNumber}
        disabled={loading}
        className="bg-slate-900 py-4 rounded-xl items-center shadow-lg shadow-slate-300 active:scale-95 transition-transform"
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-bold text-lg">Send Code</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;