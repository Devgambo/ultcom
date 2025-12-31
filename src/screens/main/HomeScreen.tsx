import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { ChatRoom } from '../../types/models'; // Ensure you created this file earlier

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen = ({ navigation }: Props) => {
  const [loading, setLoading] = useState(true);
  const [chats, setChats] = useState<ChatRoom[]>([]);
  const currentUser = auth().currentUser;

  useEffect(() => {
    if (!currentUser) return;

    // 1. Listen for chats where 'participants' array includes my UID
    const unsubscribe = firestore()
      .collection('chats')
      .where('participants', 'array-contains', currentUser.uid)
      .orderBy('updatedAt', 'desc') // Show newest chats first
      .onSnapshot(querySnapshot => {
        const chatList: any[] = [];
        
        querySnapshot.forEach(doc => {
          chatList.push({ id: doc.id, ...doc.data() });
        });

        setChats(chatList);
        setLoading(false);
      }, error => {
        console.error("Home Screen Error:", error);
        setLoading(false);
      });

    return () => unsubscribe();
  }, []);

  // 2. Helper to get the OTHER user's name/avatar from the denormalized data
  const getOtherUser = (item: ChatRoom) => {
    const otherUid = item.participants.find(uid => uid !== currentUser?.uid);
    // If for some reason data is missing, fallback to "Unknown"
    if (!otherUid || !item.participantData || !item.participantData[otherUid]) {
        return { displayName: 'Unknown User', uid: 'unknown' };
    }
    return { ...item.participantData[otherUid], uid: otherUid };
  };

  const renderItem = ({ item }: { item: ChatRoom }) => {
    const otherUser = getOtherUser(item);
    
    // Formatting date (Simple version)
    const date = item.updatedAt ? new Date(item.updatedAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
    
    // Get unread count for current user
    const unreadCount = item.unreadCount && currentUser ? item.unreadCount[currentUser.uid] || 0 : 0;

    return (
      <TouchableOpacity 
        className="flex-row items-center p-4 bg-white border-b border-slate-100 active:bg-slate-50"
        onPress={() => navigation.navigate('Chat', { 
            chatId: item.id, 
            otherUserId: otherUser.uid, 
            otherUserName: otherUser.displayName 
        })}
      >
        {/* Avatar Placeholder */}
        <View className="w-12 h-12 rounded-full bg-blue-500 items-center justify-center mr-4">
            <Text className="text-white font-bold text-lg">
                {otherUser.displayName.charAt(0).toUpperCase()}
            </Text>
        </View>

        {/* Text Content */}
        <View className="flex-1">
            <View className="flex-row justify-between mb-1">
                <Text className="font-bold text-slate-800 text-lg">{otherUser.displayName}</Text>
                <Text className="text-xs text-slate-400">{date}</Text>
            </View>
            <View className="flex-row items-center justify-between">
                <Text className="text-slate-500 flex-1" numberOfLines={1}>
                    {item.lastMessage?.text || "Start a conversation"}
                </Text>
                {unreadCount > 0 && (
                    <View className="bg-green-500 rounded-full w-6 h-6 items-center justify-center ml-2">
                        <Text className="text-white text-xs font-bold">{unreadCount}</Text>
                    </View>
                )}
            </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
        {/* Header */}
        <View className="p-4 border-b border-slate-100 bg-white pt-12 flex-row items-center justify-between">
            <Text className="text-3xl font-bold text-slate-800">Chats</Text>
            <TouchableOpacity
                onPress={() => navigation.navigate('Profile')}
                className="w-10 h-10 rounded-full bg-purple-500 items-center justify-center"
            >
                <Text className="text-white font-bold text-lg">
                    {currentUser?.displayName?.charAt(0).toUpperCase() || '?'}
                </Text>
            </TouchableOpacity>
        </View>

        {chats.length === 0 ? (
            <View className="flex-1 justify-center items-center p-8 opacity-50">
                <Text className="text-6xl mb-4">💬</Text>
                <Text className="text-xl font-semibold text-slate-800">No chats yet</Text>
                <Text className="text-center text-slate-500 mt-2">
                    Tap the + button to start messaging your friends.
                </Text>
            </View>
        ) : (
            <FlatList
                data={chats}
                keyExtractor={item => item.id}
                renderItem={renderItem}
            />
        )}

        {/* Floating Action Button (FAB) */}
        <TouchableOpacity
            className="absolute bottom-8 right-6 w-14 h-14 bg-green-500 rounded-full items-center justify-center shadow-lg shadow-green-300"
            onPress={() => navigation.navigate('SearchUser')}
        >
            <Text className="text-white text-3xl font-light pb-1">+</Text>
        </TouchableOpacity>
    </View>
  );
};

export default HomeScreen;