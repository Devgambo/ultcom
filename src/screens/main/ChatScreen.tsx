import React, { useState, useCallback, useEffect, useLayoutEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { GiftedChat, IMessage } from 'react-native-gifted-chat';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Chat'>;

const ChatScreen = ({ route, navigation }: Props) => {
  const { chatId, otherUserId, otherUserName } = route.params;
  const [messages, setMessages] = useState<IMessage[]>([]);
  const currentUser = auth().currentUser;

  // Set navigation header title
  useLayoutEffect(() => {
    navigation.setOptions({
      title: otherUserName,
      headerShown: true,
    });
  }, [navigation, otherUserName]);

  // 1. Listen to messages in real-time
  useEffect(() => {
    if (!chatId) return;

    const unsubscribe = firestore()
      .collection('chats')
      .doc(chatId)
      .collection('messages')
      .orderBy('createdAt', 'desc')
      .onSnapshot(querySnapshot => {
        const msgs: IMessage[] = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            _id: doc.id,
            text: data.text,
            createdAt: data.createdAt instanceof Date ? data.createdAt : new Date(data.createdAt),
            user: data.user,
            sent: data.sent,
            received: data.received,
            read: data.read,
          };
        });
        setMessages(msgs);
      });

    return () => unsubscribe();
  }, [chatId]);

  // 2. Reset unread count when entering chat
  useEffect(() => {
    if (!chatId || !currentUser) return;

    firestore()
      .collection('chats')
      .doc(chatId)
      .update({
        [`unreadCount.${currentUser.uid}`]: 0,
      })
      .catch(err => console.log('Error resetting unread count:', err));
  }, [chatId, currentUser]);

  // 3. Send message
  const onSend = useCallback(
    async (newMessages: IMessage[] = []) => {
      if (!currentUser || newMessages.length === 0) return;

      const message = newMessages[0];
      const messageData = {
        _id: message._id,
        text: message.text,
        createdAt: Date.now(),
        user: {
          _id: currentUser.uid,
          name: currentUser.displayName || 'Unknown',
          avatar: currentUser.photoURL || undefined,
        },
        sent: true,
        received: false,
        read: false,
      };

      try {
        // Add message to subcollection
        await firestore()
          .collection('chats')
          .doc(chatId)
          .collection('messages')
          .add(messageData);

        // Update chat room with last message & increment unread count for other user
        await firestore()
          .collection('chats')
          .doc(chatId)
          .update({
            lastMessage: {
              text: message.text,
              createdAt: Date.now(),
              user: {
                _id: currentUser.uid,
                name: currentUser.displayName || 'Unknown',
              },
            },
            updatedAt: firestore.FieldValue.serverTimestamp(),
            [`unreadCount.${otherUserId}`]: firestore.FieldValue.increment(1),
          });
      } catch (error) {
        console.error('Error sending message:', error);
      }
    },
    [chatId, currentUser, otherUserId]
  );

  if (!currentUser) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <GiftedChat
      messages={messages}
      onSend={messages => onSend(messages)}
      user={{
        _id: currentUser.uid,
        name: currentUser.displayName || 'Unknown',
        avatar: currentUser.photoURL || undefined,
      }}
      placeholder="Type a message..."
      alwaysShowSend
      showAvatarForEveryMessage
      scrollToBottom
    />
  );
};

export default ChatScreen;