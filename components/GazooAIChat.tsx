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
  FlatList,
} from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { supabase, safeGetUser } from '@/lib/supabase';
import Toast from 'react-native-toast-message';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  last_message: string;
  created_at: Date;
  updated_at: Date;
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
  
  // Conversation history
  const [showHistory, setShowHistory] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [askedTopics, setAskedTopics] = useState<Set<string>>(new Set());

  // Using OpenAI API with provided key
  const USE_MOCK_RESPONSES = false;

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  useEffect(() => {
    if (visible) {
      loadConversations();
    }
  }, [visible]);

  const loadConversations = async () => {
    try {
      const { data: { user } } = await safeGetUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('gazoo_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(20);

      if (!error && data) {
        setConversations(data.map(conv => ({
          ...conv,
          created_at: new Date(conv.created_at),
          updated_at: new Date(conv.updated_at),
        })));
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const saveConversation = async () => {
    try {
      const { data: { user } } = await safeGetUser();
      if (!user || messages.length <= 1) return;

      const title = messages[1]?.content.substring(0, 50) || 'New Chat';
      const lastMessage = messages[messages.length - 1]?.content.substring(0, 100) || '';

      const conversationData = {
        user_id: user.id,
        title,
        last_message: lastMessage,
        messages: JSON.stringify(messages),
        updated_at: new Date().toISOString(),
      };

      if (currentConversationId) {
        await supabase
          .from('gazoo_conversations')
          .update(conversationData)
          .eq('id', currentConversationId);
      } else {
        const { data } = await supabase
          .from('gazoo_conversations')
          .insert({ ...conversationData, created_at: new Date().toISOString() })
          .select()
          .single();
        
        if (data) {
          setCurrentConversationId(data.id);
        }
      }
    } catch (error) {
      console.error('Error saving conversation:', error);
    }
  };

  const loadConversation = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('gazoo_conversations')
        .select('*')
        .eq('id', conversationId)
        .single();

      if (!error && data) {
        const loadedMessages = JSON.parse(data.messages);
        setMessages(loadedMessages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })));
        setCurrentConversationId(conversationId);
        setShowHistory(false);
        Toast.show({
          type: 'success',
          text1: 'Conversation Loaded',
          text2: data.title,
        });
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  const deleteConversation = async (conversationId: string) => {
    try {
      await supabase
        .from('gazoo_conversations')
        .delete()
        .eq('id', conversationId);
      
      setConversations(prev => prev.filter(c => c.id !== conversationId));
      
      if (currentConversationId === conversationId) {
        startNewChat();
      }

      Toast.show({
        type: 'success',
        text1: 'Conversation Deleted',
      });
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const getContextAwareResponse = (userContent: string, previousMessages: Message[]): string => {
    const lowerContent = userContent.toLowerCase();
    
    // Check conversation context
    const recentMessages = previousMessages.slice(-4);
    const conversationContext = recentMessages.map(m => m.content.toLowerCase()).join(' ');
    
    // Detect if user is asking a follow-up question
    const isFollowUp = lowerContent.match(/^(what about|how about|and|also|tell me more|more|continue|yes|yeah|ok|okay)/);
    
    // Study-related responses with variety
    if (lowerContent.includes('study') || lowerContent.includes('exam') || lowerContent.includes('homework')) {
      if (askedTopics.has('study')) {
        // Follow-up response
        if (lowerContent.includes('math') || lowerContent.includes('calculus') || lowerContent.includes('algebra')) {
          return "Math can be challenging! Here's my approach:\n\n🔢 Practice problems daily - consistency is key\n📐 Understand the 'why' behind formulas\n🎯 Start with easier problems, then progress\n👨‍🏫 Watch Khan Academy or YouTube tutorials\n✍️ Write out solutions step-by-step\n\nNeed help with a specific topic?";
        } else if (lowerContent.includes('science') || lowerContent.includes('physics') || lowerContent.includes('chemistry')) {
          return "Science subjects need a mix of theory and practice!\n\n🔬 Do lab work or simulations\n📊 Create visual diagrams and flowcharts\n🧪 Relate concepts to real-world examples\n📝 Summarize each chapter in your own words\n🎥 Watch educational videos\n\nWhich science subject are you studying?";
        } else {
          return "Let me share some advanced study techniques:\n\n🎯 Active Recall: Test yourself without notes\n🔄 Spaced Repetition: Review at increasing intervals\n🗂️ Feynman Technique: Explain concepts simply\n📱 Use apps like Anki or Quizlet\n👥 Teach someone else what you learned\n\nWhich technique would you like to try?";
        }
      }
      setAskedTopics(prev => new Set(prev).add('study'));
      return "I can help you with studying! Here are some tips:\n\n📚 Break your study sessions into 25-minute focused blocks (Pomodoro technique)\n✍️ Create summary notes and mind maps\n👥 Form study groups with classmates\n📝 Practice with past papers\n🎯 Focus on understanding concepts, not just memorizing\n\nWhat subject are you working on?";
    }
    
    // Budget-related responses with variety
    if (lowerContent.includes('budget') || lowerContent.includes('money') || lowerContent.includes('finance') || lowerContent.includes('save')) {
      if (askedTopics.has('budget')) {
        if (lowerContent.includes('app') || lowerContent.includes('tool')) {
          return "Great question! Here are some budgeting apps:\n\n📱 22Seven - South African, free, automatic tracking\n💳 Yoco - For tracking expenses\n📊 Mint - Comprehensive budgeting\n🏦 Your bank's app - Often has built-in tools\n📝 Google Sheets - DIY budget tracker\n\nWould you like a budget template?";
        } else {
          return "Let me share some money-saving hacks for students:\n\n🎓 Student discounts - Ask everywhere!\n🍳 Meal prep on Sundays\n📚 Buy second-hand textbooks (check Student Konnect Marketplace!)\n🚌 Use student transport passes\n☕ Make coffee at home\n💡 Share subscriptions with friends\n\nWhat's your biggest expense?";
        }
      }
      setAskedTopics(prev => new Set(prev).add('budget'));
      return "Let me help you with budgeting! 💰\n\n1. Track your expenses for a month\n2. Use the 50/30/20 rule: 50% needs, 30% wants, 20% savings\n3. Look for student discounts\n4. Cook meals instead of eating out\n5. Use the Student Konnect marketplace for affordable items\n\nWould you like help creating a budget plan?";
    }
    
    // Career-related responses with variety
    if (lowerContent.includes('career') || lowerContent.includes('job') || lowerContent.includes('internship') || lowerContent.includes('cv') || lowerContent.includes('resume')) {
      if (askedTopics.has('career')) {
        if (lowerContent.includes('interview')) {
          return "Interview prep is crucial! Here's how to ace it:\n\n👔 Research the company thoroughly\n💬 Practice STAR method (Situation, Task, Action, Result)\n❓ Prepare questions to ask them\n👗 Dress appropriately\n⏰ Arrive 10 minutes early\n😊 Show enthusiasm and confidence\n\nWant me to share common interview questions?";
        } else {
          return "Let me help you stand out:\n\n✨ Build a portfolio or GitHub profile\n🌐 Create a personal website\n📧 Send follow-up emails after applications\n🤝 Connect with alumni in your field\n💼 Volunteer or freelance for experience\n🎯 Tailor each application\n\nWhat industry are you targeting?";
        }
      }
      setAskedTopics(prev => new Set(prev).add('career'));
      return "Great question about careers! 🚀\n\n✨ Update your LinkedIn profile\n📄 Tailor your CV for each application\n🤝 Network at campus events\n💼 Apply for internships early\n📚 Build relevant skills\n🎯 Use the Career Hub in Student Konnect\n\nWhat field are you interested in?";
    }
    
    // Wellness-related responses with variety
    if (lowerContent.includes('stress') || lowerContent.includes('anxiety') || lowerContent.includes('mental') || lowerContent.includes('wellness') || lowerContent.includes('tired') || lowerContent.includes('overwhelm')) {
      if (askedTopics.has('wellness')) {
        return "I hear you. Here are some quick stress-relief techniques:\n\n🫁 Box breathing: 4 counts in, hold 4, out 4, hold 4\n🚶 Take a 10-minute walk outside\n🎵 Listen to calming music\n📱 Put your phone away for an hour\n🛁 Take a warm shower\n📞 Call a friend or family member\n\nRemember: You're not alone. Campus counseling is free and confidential. Want the contact info?";
      }
      setAskedTopics(prev => new Set(prev).add('wellness'));
      return "I'm here to support you! 🌟\n\n🧘 Practice mindfulness and meditation\n💪 Exercise regularly\n😴 Get 7-8 hours of sleep\n🗣️ Talk to friends or counselors\n📱 Use the Wellness Hub in Student Konnect\n⏰ Take regular breaks\n\nRemember: It's okay to ask for help. Would you like me to share more wellness resources?";
    }
    
    // Accommodation responses
    if (lowerContent.includes('accommodation') || lowerContent.includes('housing') || lowerContent.includes('room') || lowerContent.includes('rent')) {
      return "Looking for accommodation? 🏠\n\nCheck out the Accommodation section in Student Konnect!\n\n✅ Browse verified listings\n📍 Filter by location and price\n🔒 Safe and secure platform\n💬 Chat directly with landlords\n⭐ Read reviews from other students\n\nNeed help finding something specific?";
    }
    
    // Greetings with variety
    if (lowerContent.match(/^(hello|hi|hey|good morning|good afternoon|good evening|sup|yo)/)) {
      const greetings = [
        "Hey! 👋 Great to chat with you!\n\nI'm Gazoo AI, your student companion. I can help with:\n\n📚 Studying & exam prep\n💰 Budgeting & finances\n🚀 Career advice\n🧘 Wellness & mental health\n🏠 Accommodation\n🎯 Campus life\n\nWhat would you like to know about?",
        "Hi there! 😊 How can I help you today?\n\nI'm here to assist with:\n\n📖 Study tips and strategies\n💵 Money management\n💼 Career planning\n🌟 Wellness support\n🏘️ Finding accommodation\n\nWhat's on your mind?",
        "Hello! 🌟 Nice to see you!\n\nI'm Gazoo AI, and I'm ready to help with:\n\n🎓 Academic success\n💳 Financial planning\n🚀 Career development\n💚 Mental health\n🏠 Housing search\n\nHow can I assist you today?"
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }
    
    // Thanks responses
    if (lowerContent.includes('thank')) {
      const thanks = [
        "You're very welcome! 😊\n\nI'm always here to help. Feel free to ask me anything about student life, academics, or campus resources.\n\nHave a great day! ✨",
        "My pleasure! 🌟\n\nDon't hesitate to reach out if you need anything else. I'm here 24/7!\n\nTake care! 💙",
        "Anytime! 😄\n\nRemember, I'm just a message away whenever you need support or advice.\n\nAll the best! 🚀"
      ];
      return thanks[Math.floor(Math.random() * thanks.length)];
    }
    
    // Default response
    return `I understand you're asking about: "${userContent}"\n\nI'm Gazoo AI, and I'm here to help students with:\n\n📚 Study tips & exam strategies\n💰 Budget planning & money management\n🚀 Career guidance & job hunting\n🧘 Wellness & stress management\n🏠 Accommodation search\n🎯 Campus life advice\n\nCould you tell me more about what you need help with? I'll do my best to provide useful guidance!`;
  };

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
        // Context-aware mock responses
        assistantContent = getContextAwareResponse(userMessage.content, messages);
      } else {
        // Call Supabase Edge Function (secure server-side OpenAI API call)
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          throw new Error('Please log in to use Gazoo AI');
        }

        const response = await fetch(
          `${supabase.supabaseUrl}/functions/v1/gazoo-chat`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              messages: [
                ...messages.map((msg) => ({
                  role: msg.role,
                  content: msg.content,
                })),
                {
                  role: 'user',
                  content: userMessage.content,
                },
              ],
              conversationId: currentConversationId,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to get response from Gazoo AI');
        }

        const data = await response.json();
        if (!data.success || !data.message) {
          throw new Error('Invalid response from Gazoo AI');
        }
        assistantContent = data.message;
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      
      // Auto-save conversation after each exchange
      setTimeout(() => saveConversation(), 500);
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
    setCurrentConversationId(null);
    setAskedTopics(new Set());
    setShowHistory(false);
  };

  if (showHistory) {
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
                onPress={() => setShowHistory(false)}
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

              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#fff' }}>
                Chat History
              </Text>

              <TouchableOpacity
                onPress={startNewChat}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: '#7c3aed',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IconSymbol name="plus" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Conversations List */}
          <FlatList
            data={conversations}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16 }}
            ListEmptyComponent={
              <View style={{ alignItems: 'center', paddingTop: 60 }}>
                <IconSymbol name="message.fill" size={64} color="#ffffff30" />
                <Text style={{ color: '#ffffff60', marginTop: 16, fontSize: 16 }}>
                  No conversations yet
                </Text>
                <Text style={{ color: '#ffffff40', marginTop: 8, textAlign: 'center', paddingHorizontal: 32 }}>
                  Start a new chat to begin your conversation history
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => loadConversation(item.id)}
                style={{
                  backgroundColor: '#ffffff10',
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: '#ffffff20',
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1, marginRight: 12 }}>
                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
                      {item.title}
                    </Text>
                    <Text style={{ color: '#ffffff80', fontSize: 14 }} numberOfLines={2}>
                      {item.last_message}
                    </Text>
                    <Text style={{ color: '#ffffff40', fontSize: 12, marginTop: 8 }}>
                      {new Date(item.updated_at).toLocaleDateString()} at {new Date(item.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => deleteConversation(item.id)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: '#ef444420',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <IconSymbol name="trash.fill" size={16} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            )}
          />
        </KeyboardAvoidingView>
      </Modal>
    );
  }

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

            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity
                onPress={() => setShowHistory(true)}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: '#ffffff10',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IconSymbol name="clock.fill" size={20} color="#fff" />
              </TouchableOpacity>
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
