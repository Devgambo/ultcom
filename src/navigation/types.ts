// src/navigation/types.ts
export type RootStackParamList = {
  Login: undefined; 
  ProfileSetup: undefined;
  Home: undefined;
  Chat: { 
    chatId: string; 
    otherUserId: string;
    otherUserName: string 
  };
  SearchUser: undefined;
  Profile: undefined;
};