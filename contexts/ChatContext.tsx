import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read_at: string | null;
  created_at: string;
}

interface Conversation {
  id: string;
  participant1_id: string;
  participant2_id: string;
  last_message: string | null;
  last_message_at: string | null;
  other_user_id: string;
  other_user_name: string;
  other_user_photo: string | null;
  unread_count: number;
}

interface ChatContextType {
  conversations: Conversation[];
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
  messages: Record<string, Message[]>;
  typingUsers: Record<string, string[]>;
  loadConversations: (userId: string) => Promise<void>;
  loadMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, content: string, senderId: string) => Promise<void>;
  markAsRead: (conversationId: string, userId: string) => Promise<void>;
  createConversation: (participant1Id: string, participant2Id: string) => Promise<string | null>;
  subscribeToMessages: (conversationId: string) => void;
  unsubscribeFromMessages: () => void;
  sendTypingIndicator: (conversationId: string, userId: string, isTyping: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [typingUsers, setTypingUsers] = useState<Record<string, string[]>>({});
  const [messageSubscription, setMessageSubscription] = useState<any>(null);
  const [typingSubscription, setTypingSubscription] = useState<any>(null);

  const loadConversations = async (userId: string) => {
    try {
      // Get user's conversations
      const { data: conversationsData, error: conversationsError } = await supabase
        .from('conversations')
        .select('*')
        .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
        .order('last_message_at', { ascending: false, nullsFirst: false });

      if (conversationsError) {
        console.error('Error loading conversations:', conversationsError);
        return;
      }

      if (!conversationsData || conversationsData.length === 0) {
        setConversations([]);
        return;
      }

      // Get other user IDs
      const otherUserIds = conversationsData.map((conv: any) =>
        conv.participant1_id === userId ? conv.participant2_id : conv.participant1_id
      );

      // Fetch profiles for other users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', otherUserIds);

      if (profilesError) {
        console.error('Error loading profiles:', profilesError);
      }

      const profilesMap: Record<string, any> = {};
      profilesData?.forEach((profile: any) => {
        profilesMap[profile.id] = profile;
      });

      // Get unread counts for each conversation
      const formattedConversations: Conversation[] = await Promise.all(
        conversationsData.map(async (conv: any) => {
          const otherUserId = conv.participant1_id === userId ? conv.participant2_id : conv.participant1_id;
          const otherUser = profilesMap[otherUserId] || {};

          // Count unread messages
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .neq('sender_id', userId)
            .is('read_at', null);

          return {
            id: conv.id,
            participant1_id: conv.participant1_id,
            participant2_id: conv.participant2_id,
            last_message: conv.last_message,
            last_message_at: conv.last_message_at,
            other_user_id: otherUserId,
            other_user_name: otherUser.full_name || 'Unknown User',
            other_user_photo: otherUser.avatar_url || null,
            unread_count: count || 0,
          };
        })
      );

      setConversations(formattedConversations);
    } catch (error) {
      console.error('Error in loadConversations:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load conversations',
      });
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading messages:', error);
        return;
      }

      setMessages((prev) => ({
        ...prev,
        [conversationId]: data || [],
      }));
    } catch (error) {
      console.error('Error in loadMessages:', error);
    }
  };

  const sendMessage = async (conversationId: string, content: string, senderId: string) => {
    try {
      // Insert message
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          content,
        })
        .select()
        .single();

      if (messageError) {
        console.error('Error sending message:', messageError);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to send message',
        });
        return;
      }

      // Update conversation with last message
      await supabase
        .from('conversations')
        .update({
          last_message: content,
          last_message_at: new Date().toISOString(),
        })
        .eq('id', conversationId);

      // Add message to local state
      setMessages((prev) => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] || []), messageData],
      }));

      Toast.show({
        type: 'success',
        text1: 'Message sent',
      });
    } catch (error) {
      console.error('Error in sendMessage:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to send message',
      });
    }
  };

  const markAsRead = async (conversationId: string, userId: string) => {
    try {
      await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .neq('sender_id', userId)
        .is('read_at', null);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const createConversation = async (participant1Id: string, participant2Id: string): Promise<string | null> => {
    try {
      // Check if conversation already exists
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .or(
          `and(participant1_id.eq.${participant1Id},participant2_id.eq.${participant2Id}),and(participant1_id.eq.${participant2Id},participant2_id.eq.${participant1Id})`
        )
        .single();

      if (existingConv) {
        return existingConv.id;
      }

      // Create new conversation
      const { data: newConv, error } = await supabase
        .from('conversations')
        .insert({
          participant1_id: participant1Id,
          participant2_id: participant2Id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating conversation:', error);
        return null;
      }

      return newConv.id;
    } catch (error) {
      console.error('Error in createConversation:', error);
      return null;
    }
  };

  const sendTypingIndicator = (conversationId: string, userId: string, isTyping: boolean) => {
    const channel = supabase.channel(`typing:${conversationId}`);
    channel.send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId, isTyping },
    });
  };

  const subscribeToMessages = (conversationId: string) => {
    // Unsubscribe from previous subscriptions
    if (messageSubscription) {
      supabase.removeChannel(messageSubscription);
    }
    if (typingSubscription) {
      supabase.removeChannel(typingSubscription);
    }

    // Subscribe to new messages
    const messageChannel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prev) => ({
            ...prev,
            [conversationId]: [...(prev[conversationId] || []), newMessage],
          }));
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const updatedMessage = payload.new as Message;
          setMessages((prev) => ({
            ...prev,
            [conversationId]: (prev[conversationId] || []).map((msg) =>
              msg.id === updatedMessage.id ? updatedMessage : msg
            ),
          }));
        }
      )
      .subscribe();

    // Subscribe to typing indicators
    const typingChannel = supabase
      .channel(`typing:${conversationId}`)
      .on('broadcast', { event: 'typing' }, (payload: any) => {
        const { userId, isTyping } = payload.payload;
        setTypingUsers((prev) => {
          const current = prev[conversationId] || [];
          if (isTyping && !current.includes(userId)) {
            return { ...prev, [conversationId]: [...current, userId] };
          } else if (!isTyping) {
            return { ...prev, [conversationId]: current.filter((id) => id !== userId) };
          }
          return prev;
        });
      })
      .subscribe();

    setMessageSubscription(messageChannel);
    setTypingSubscription(typingChannel);
  };

  const unsubscribeFromMessages = () => {
    if (messageSubscription) {
      supabase.removeChannel(messageSubscription);
      setMessageSubscription(null);
    }
    if (typingSubscription) {
      supabase.removeChannel(typingSubscription);
      setTypingSubscription(null);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        conversations,
        setConversations,
        messages,
        typingUsers,
        loadConversations,
        loadMessages,
        sendMessage,
        markAsRead,
        createConversation,
        subscribeToMessages,
        unsubscribeFromMessages,
        sendTypingIndicator,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
