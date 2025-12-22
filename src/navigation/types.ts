// src/navigation/types.ts
export type RootStackParamList = {
  Login: undefined; 
  Home: undefined;
  Chat: { 
    chatId: string; 
    otherUserId: string;
    otherUserName: string 
  };
};