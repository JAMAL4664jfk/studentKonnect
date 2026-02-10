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
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';

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
  const colors = useColors();
  
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

  // Using mock responses for now - can be replaced with actual API later
  const USE_MOCK_RESPONSES = true;

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
      let assistantContent = '';

      if (USE_MOCK_RESPONSES) {
        // Mock intelligent responses based on keywords
        const lowerContent = userMessage.content.toLowerCase();
        
        if (lowerContent.includes('study') || lowerContent.includes('exam') || lowerContent.includes('homework')) {
          assistantContent = "I can help you with studying! Here are some tips:\n\n📚 Break your study sessions into 25-minute focused blocks (Pomodoro technique)\n✍️ Create summary notes and mind maps\n👥 Form study groups with classmates\n📝 Practice with past papers\n🎯 Focus on understanding concepts, not just memorizing\n\nWhat subject are you working on?";
        } else if (lowerContent.includes('budget') || lowerContent.includes('money') || lowerContent.includes('finance')) {
          assistantContent = "Let me help you with budgeting! 💰\n\n1. Track your expenses for a month\n2. Use the 50/30/20 rule: 50% needs, 30% wants, 20% savings\n3. Look for student discounts\n4. Cook meals instead of eating out\n5. Use the Student Konnect marketplace for affordable items\n\nWould you like help creating a budget plan?";
        } else if (lowerContent.includes('career') || lowerContent.includes('job') || lowerContent.includes('internship')) {
          assistantContent = "Great question about careers! 🚀\n\n✨ Update your LinkedIn profile\n📄 Tailor your CV for each application\n🤝 Network at campus events\n💼 Apply for internships early\n📚 Build relevant skills\n🎯 Use the Career Hub in Student Konnect\n\nWhat field are you interested in?";
        } else if (lowerContent.includes('stress') || lowerContent.includes('anxiety') || lowerContent.includes('mental') || lowerContent.includes('wellness')) {
          assistantContent = "I'm here to support you! 🌟\n\n🧘 Practice mindfulness and meditation\n💪 Exercise regularly\n😴 Get 7-8 hours of sleep\n🗣️ Talk to friends or counselors\n📱 Use the Wellness Hub in Student Konnect\n⏰ Take regular breaks\n\nRemember: It's okay to ask for help. Would you like me to share more wellness resources?";
        } else if (lowerContent.includes('accommodation') || lowerContent.includes('housing') || lowerContent.includes('room')) {
          assistantContent = "Looking for accommodation? 🏠\n\nCheck out the Accommodation section in Student Konnect!\n\n✅ Browse verified listings\n📍 Filter by location and price\n🔒 Safe and secure platform\n💬 Chat directly with landlords\n⭐ Read reviews from other students\n\nNeed help finding something specific?";
        } else if (lowerContent.includes('hello') || lowerContent.includes('hi') || lowerContent.includes('hey')) {
          assistantContent = "Hey! 👋 Great to chat with you!\n\nI'm Gazoo AI, your student companion. I can help with:\n\n📚 Studying & exam prep\n💰 Budgeting & finances\n🚀 Career advice\n🧘 Wellness & mental health\n🏠 Accommodation\n🎯 Campus life\n\nWhat would you like to know about?";
        } else if (lowerContent.includes('thank')) {
          assistantContent = "You're very welcome! 😊\n\nI'm always here to help. Feel free to ask me anything about student life, academics, or campus resources.\n\nHave a great day! ✨";
        } else {
          assistantContent = `I understand you're asking about: "${userMessage.content}"\n\nI'm Gazoo AI, and I'm here to help students with:\n\n📚 Study tips & exam strategies\n💰 Budget planning & money management\n🚀 Career guidance & job hunting\n🧘 Wellness & stress management\n🏠 Accommodation search\n🎯 Campus life advice\n\nCould you tell me more about what you need help with? I'll do my best to provide useful guidance!`;
        }
      } else {
        // Actual API call (for future implementation)
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'gpt-4.1-mini',
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
        assistantContent = data.choices[0].message.content;
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantContent,
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
