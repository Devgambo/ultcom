import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'SearchUser'>;

const SearchUserScreen = ({ navigation }: Props) => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    // Basic validation
    if (phone.length < 10) return;
    
    // Add country code if missing (Basic Logic)
    const formattedPhone = phone.includes('+') ? phone : `+91${phone}`; 
    const currentUser = auth().currentUser;

    setLoading(true);
    try {
        // 1. Search User
        const querySnapshot = await firestore()
            .collection('users')
            .where('phoneNumber', '==', formattedPhone)
            .get();

        if (querySnapshot.empty) {
            Alert.alert("User not found", "No user found with this phone number.");
            setLoading(false);
            return;
        }

        const otherUser = querySnapshot.docs[0].data();
        
        if (otherUser.uid === currentUser?.uid) {
            Alert.alert("Error", "You cannot chat with yourself.");
            setLoading(false);
            return;
        }

        // 2. Logic to create/find chat room ID
        const participants = [currentUser?.uid, otherUser.uid].sort();
        const chatId = `${participants[0]}_${participants[1]}`;

        const chatRef = firestore().collection('chats').doc(chatId);
        const chatDoc = await chatRef.get();

        if (!chatDoc.exists) {
            // Create new Chat Room
            await chatRef.set({
                id: chatId,
                participants,
                participantData: {
                    [currentUser!.uid]: { displayName: currentUser?.displayName, avatarUrl: null },
                    [otherUser.uid]: { displayName: otherUser.displayName, avatarUrl: otherUser.avatarUrl }
                },
                lastMessage: { text: "Chat created", createdAt: Date.now(), user: { _id: 'system', name: 'System' } },
                unreadCount: {
                    [currentUser!.uid]: 0,
                    [otherUser.uid]: 0,
                },
                updatedAt: firestore.FieldValue.serverTimestamp(),
            });
        }

        // 3. Navigate to Chat
        setLoading(false);
        navigation.replace('Chat', { 
            chatId, 
            otherUserId: otherUser.uid, 
            otherUserName: otherUser.displayName 
        });

    } catch (error) {
        console.error(error);
        Alert.alert("Error", "Something went wrong searching for user.");
        setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white p-6 pt-12">
        <Text className="text-2xl font-bold text-slate-800 mb-6">New Chat</Text>
        
        <Text className="text-slate-600 mb-2 font-medium">Search by Phone Number</Text>
        <TextInput 
            className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-lg mb-6"
            placeholder="+91 98765 43210"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            autoFocus
        />

        <TouchableOpacity
            className="bg-slate-900 py-4 rounded-xl items-center"
            onPress={handleSearch}
            disabled={loading}
        >
            {loading ? <ActivityIndicator color="white"/> : <Text className="text-white font-bold text-lg">Start Chat</Text>}
        </TouchableOpacity>
    </View>
  );
};

export default SearchUserScreen;