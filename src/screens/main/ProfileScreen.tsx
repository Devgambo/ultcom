import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { UserProfile } from '../../types/models';

const ProfileScreen = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Editable fields
  const [displayName, setDisplayName] = useState('');
  const [about, setAbout] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const currentUser = auth().currentUser;

  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = firestore()
      .collection('users')
      .doc(currentUser.uid)
      .onSnapshot(
        (doc) => {
          if (doc.exists()) {
            const data = doc.data() as UserProfile;
            setProfile(data);
            setDisplayName(data.displayName || '');
            setAbout(data.about || '');
          }
          setLoading(false);
        },
        (error) => {
          console.error('Error fetching profile:', error);
          setLoading(false);
        }
      );

    return () => unsubscribe();
  }, [currentUser]);

  const handleSave = async () => {
    if (!displayName.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    setSaving(true);
    try {
      // Update Firestore document
      await firestore().collection('users').doc(currentUser?.uid).update({
        displayName: displayName.trim(),
        about: about.trim(),
      });

      // Update Auth profile
      await currentUser?.updateProfile({ displayName: displayName.trim() });

      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset to original values
    setDisplayName(profile?.displayName || '');
    setAbout(profile?.about || '');
    setIsEditing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await auth().signOut();
              // AppNavigator will automatically handle navigation to Login
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#1e293b" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="bg-slate-900 pt-14 pb-8 px-6 rounded-b-3xl">
          <Text className="text-white text-2xl font-bold">My Profile</Text>
          <Text className="text-slate-400 mt-1">Manage your account</Text>
        </View>

        {/* Avatar Section */}
        <View className="items-center -mt-12">
          <View className="w-24 h-24 bg-slate-200 rounded-full items-center justify-center border-4 border-white shadow-lg">
            {profile?.avatarUrl ? (
              <Text className="text-4xl">👤</Text>
            ) : (
              <Text className="text-4xl">
                {profile?.displayName?.charAt(0).toUpperCase() || '?'}
              </Text>
            )}
          </View>
        </View>

        {/* Profile Details */}
        <View className="px-6 mt-6">
          {/* Name Field */}
          <View className="mb-5">
            <Text className="text-slate-500 text-sm font-medium mb-2 ml-1">
              Full Name
            </Text>
            {isEditing ? (
              <TextInput
                className="bg-slate-50 p-4 rounded-xl text-lg text-slate-900 border border-slate-200"
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Enter your name"
                autoFocus
              />
            ) : (
              <View className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <Text className="text-lg text-slate-900">
                  {profile?.displayName || 'Not set'}
                </Text>
              </View>
            )}
          </View>

          {/* Phone Field (Read-only) */}
          <View className="mb-5">
            <Text className="text-slate-500 text-sm font-medium mb-2 ml-1">
              Phone Number
            </Text>
            <View className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex-row items-center">
              <Text className="text-lg text-slate-900 flex-1">
                {profile?.phoneNumber || 'Not available'}
              </Text>
              <View className="bg-slate-200 px-2 py-1 rounded">
                <Text className="text-xs text-slate-500">Verified</Text>
              </View>
            </View>
          </View>

          {/* About/Bio Field */}
          <View className="mb-5">
            <Text className="text-slate-500 text-sm font-medium mb-2 ml-1">
              About
            </Text>
            {isEditing ? (
              <TextInput
                className="bg-slate-50 p-4 rounded-xl text-lg text-slate-900 border border-slate-200"
                value={about}
                onChangeText={setAbout}
                placeholder="Write something about yourself..."
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                style={{ minHeight: 100 }}
              />
            ) : (
              <View className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <Text className="text-lg text-slate-600">
                  {profile?.about || 'Hey there! I am using UltCom.'}
                </Text>
              </View>
            )}
          </View>

          {/* Member Since */}
          <View className="mb-6">
            <Text className="text-slate-500 text-sm font-medium mb-2 ml-1">
              Member Since
            </Text>
            <View className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <Text className="text-lg text-slate-600">
                {profile?.createdAt
                  ? new Date((profile.createdAt as any).toDate()).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'Unknown'}
              </Text>
            </View>
          </View>

          {/* Edit / Save Buttons */}
          {isEditing ? (
            <View className="flex-row gap-3 mb-4">
              <TouchableOpacity
                onPress={handleCancel}
                className="flex-1 bg-slate-200 py-4 rounded-xl items-center"
              >
                <Text className="text-slate-700 font-bold text-lg">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                disabled={saving}
                className="flex-1 bg-slate-900 py-4 rounded-xl items-center"
              >
                {saving ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-bold text-lg">Save</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => setIsEditing(true)}
              className="bg-slate-900 py-4 rounded-xl items-center mb-4"
            >
              <Text className="text-white font-bold text-lg">Edit Profile</Text>
            </TouchableOpacity>
          )}

          {/* Logout Button */}
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-red-50 py-4 rounded-xl items-center border border-red-200 mb-10"
          >
            <Text className="text-red-600 font-bold text-lg">Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ProfileScreen;
