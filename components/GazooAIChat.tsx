import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { IconSymbol } from './ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface GazooAIChatProps {
  visible: boolean;
  onClose: () => void;
}

export function GazooAIChat({ visible, onClose }: GazooAIChatProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hey there! 👋\n\nI'm Gazoo AI\n\nYour intelligent student companion. I can help with studying, budgeting, career advice, wellness tips, and much more.\n\nType a message or upload a document to get started",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // API key should be set in environment variables
  const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || 'your-api-key-here';

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are Gazoo AI, an intelligent student companion. You help students with studying, budgeting, career advice, wellness tips, and academic support. Be friendly, encouraging, and provide practical advice. Keep responses concise and helpful.',
            },
            ...messages.map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
            {
              role: 'user',
              content: userMessage.content,
            },
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from Gazoo AI');
      }

      const data = await response.json();
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.choices[0].message.content,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const startNewChat = () => {
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: "Hey there! 👋\n\nI'm Gazoo AI\n\nYour intelligent student companion. I can help with studying, budgeting, career advice, wellness tips, and much more.\n\nType a message or upload a document to get started",
        timestamp: new Date(),
      },
    ]);
    setInputText('');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, backgroundColor: '#1a0b2e' }}
      >
        {/* Header */}
        <View
          style={{
            paddingTop: Platform.OS === 'ios' ? 50 : 20,
            paddingHorizontal: 16,
            paddingBottom: 16,
            backgroundColor: '#1a0b2e',
            borderBottomWidth: 1,
            borderBottomColor: '#ffffff20',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <TouchableOpacity
              onPress={onClose}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: '#ffffff10',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconSymbol name="chevron.left" size={20} color="#fff" />
            </TouchableOpacity>

            <View style={{ flex: 1, alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: '#7c3aed',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                  }}
                >
                  <IconSymbol name="sparkles" size={24} color="#fff" />
                </View>
                <View>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#fff' }}>
                    Gazoo AI
                  </Text>
                  <Text style={{ fontSize: 12, color: '#ffffff80' }}>
                    Your intelligent student companion
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              onPress={startNewChat}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: '#ffffff10',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconSymbol name="plus" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={{
                marginBottom: 16,
                alignItems: message.role === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              {message.role === 'assistant' && (
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: '#7c3aed',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 8,
                  }}
                >
                  <IconSymbol name="sparkles" size={18} color="#fff" />
                </View>
              )}
              <View
                style={{
                  maxWidth: '80%',
                  padding: 12,
                  borderRadius: 16,
                  backgroundColor: message.role === 'user' ? '#7c3aed' : '#ffffff15',
                }}
              >
                <Text
                  style={{
                    color: '#fff',
                    fontSize: 15,
                    lineHeight: 22,
                  }}
                >
                  {message.content}
                </Text>
              </View>
            </View>
          ))}
          {isLoading && (
            <View style={{ alignItems: 'flex-start', marginBottom: 16 }}>
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: '#7c3aed',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 8,
                }}
              >
                <IconSymbol name="sparkles" size={18} color="#fff" />
              </View>
              <View
                style={{
                  padding: 12,
                  borderRadius: 16,
                  backgroundColor: '#ffffff15',
                }}
              >
                <ActivityIndicator color="#7c3aed" />
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 12,
            paddingBottom: Platform.OS === 'ios' ? 34 : 12,
            backgroundColor: '#1a0b2e',
            borderTopWidth: 1,
            borderTopColor: '#ffffff20',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#ffffff15',
              borderRadius: 24,
              paddingHorizontal: 16,
              paddingVertical: 8,
            }}
          >
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask Gazoo anything..."
              placeholderTextColor="#ffffff60"
              style={{
                flex: 1,
                color: '#fff',
                fontSize: 15,
                paddingVertical: 8,
              }}
              multiline
              maxLength={500}
              onSubmitEditing={sendMessage}
              editable={!isLoading}
            />
            <TouchableOpacity
              onPress={sendMessage}
              disabled={!inputText.trim() || isLoading}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: inputText.trim() && !isLoading ? '#7c3aed' : '#ffffff20',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: 8,
              }}
            >
              <IconSymbol
                name="arrow.up"
                size={20}
                color={inputText.trim() && !isLoading ? '#fff' : '#ffffff60'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
