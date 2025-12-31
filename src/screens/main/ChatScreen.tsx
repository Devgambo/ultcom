import React, { useState, useCallback, useEffect, useLayoutEffect } from 'react';
import { View, Text, Platform, SafeAreaView, StyleSheet } from 'react-native';
import { GiftedChat, IMessage, Bubble, InputToolbar, Send } from 'react-native-gifted-chat';
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
            user: {
              _id: data.user._id,
              name: data.user.name,
              ...(data.user.avatar && { avatar: data.user.avatar }),
            },
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
      
      // Build user object without undefined values (Firestore doesn't accept undefined)
      const userObj: { _id: string; name: string; avatar?: string } = {
        _id: currentUser.uid,
        name: currentUser.displayName || 'Unknown',
      };
      if (currentUser.photoURL) {
        userObj.avatar = currentUser.photoURL;
      }

      const messageData = {
        _id: message._id,
        text: message.text,
        createdAt: Date.now(),
        user: userObj,
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

  // Custom bubble styling
  const renderBubble = (props: any) => {
    const { key, ...restProps } = props;
    return (
      <Bubble
        {...restProps}
        wrapperStyle={{
          right: {
            backgroundColor: '#1e293b',
            borderRadius: 16,
            padding: 2,
          },
          left: {
            backgroundColor: '#f1f5f9',
            borderRadius: 16,
            padding: 2,
          },
        }}
        textStyle={{
          right: {
            color: '#fff',
          },
          left: {
            color: '#1e293b',
          },
        }}
      />
    );
  };

  // Custom input toolbar
  const renderInputToolbar = (props: any) => {
    const { key, ...restProps } = props;
    return (
      <InputToolbar
        {...restProps}
        containerStyle={{
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e2e8f0',
          paddingHorizontal: 8,
          paddingVertical: 6,
        }}
        primaryStyle={{
          alignItems: 'center',
        }}
      />
    );
  };

  // Custom send button
  const renderSend = (props: any) => {
    const { key, ...restProps } = props;
    return (
      <Send
        {...restProps}
        containerStyle={{
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 12,
        }}
      >
        <Text style={{ color: '#1e293b', fontWeight: 'bold', fontSize: 16 }}>Send</Text>
      </Send>
    );
  };

  if (!currentUser) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // Build user object for GiftedChat
  const giftedChatUser: { _id: string; name: string; avatar?: string } = {
    _id: currentUser.uid,
    name: currentUser.displayName || 'Unknown',
  };
  if (currentUser.photoURL) {
    giftedChatUser.avatar = currentUser.photoURL;
  }

  return (
    <SafeAreaView style={styles.container}>
      <GiftedChat
        messages={messages}
        onSend={messages => onSend(messages)}
        user={giftedChatUser}
        placeholder="Type a message..."
        alwaysShowSend
        scrollToBottom
        renderBubble={renderBubble}
        renderInputToolbar={renderInputToolbar}
        renderSend={renderSend}
        bottomOffset={Platform.OS === 'ios' ? 34 : 0}
        minInputToolbarHeight={56}
        textInputProps={{
          style: {
            flex: 1,
            backgroundColor: '#f1f5f9',
            borderRadius: 20,
            paddingHorizontal: 16,
            paddingVertical: 10,
            marginRight: 8,
            fontSize: 16,
            maxHeight: 100,
          },
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChatScreen;