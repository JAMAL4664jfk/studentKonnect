import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { supabase } from "@/lib/supabase";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AICounselorChatProps {
  counselorType: "mental" | "financial" | "academic" | "bereavement";
  title: string;
  sessionId?: string;
  onClose: () => void;
}

const getWelcomeMessage = (type: string): string => {
  const messages = {
    mental: "Hello! I'm your AI Mental Health Counselor. I'm here to listen and provide support. How are you feeling today?",
    financial: "Hi! I'm your AI Financial Counselor. I can help you with budgeting, savings, and financial planning. What would you like to discuss?",
    academic: "Welcome! I'm your AI Academic Counselor. I can assist with study strategies, time management, and academic goals. How can I help you today?",
    bereavement: "I'm here for you during this difficult time. I'm your AI Bereavement Counselor, providing support and understanding. Please share what's on your mind.",
  };
  return messages[type as keyof typeof messages] || messages.mental;
};

export function AICounselorChat({
  counselorType,
  title,
  sessionId,
  onClose,
}: AICounselorChatProps) {
  const colors = useColors();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadMessages();
  }, [sessionId, counselorType]);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const loadMessages = async () => {
    if (!sessionId) {
      setMessages([
        {
          role: "assistant",
          content: getWelcomeMessage(counselorType),
        },
      ]);
      setLoadingHistory(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("counsellor_messages")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setMessages(
          data.map((msg) => ({
            role: msg.role as "user" | "assistant",
            content: msg.content,
          }))
        );
      } else {
        setMessages([
          {
            role: "assistant",
            content: getWelcomeMessage(counselorType),
          },
        ]);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
      setMessages([
        {
          role: "assistant",
          content: getWelcomeMessage(counselorType),
        },
      ]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    const messageText = input;
    setInput("");
    setLoading(true);

    try {
      // Save user message to database if we have a session
      if (sessionId) {
        await supabase.from("counsellor_messages").insert({
          session_id: sessionId,
          role: "user",
          content: messageText,
        });
      }

      const { data, error } = await supabase.functions.invoke("ai-counsellor", {
        body: {
          messages: [...messages, userMessage],
          counsellorType: counselorType,
        },
      });

      if (error) {
        throw error;
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: data.reply,
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // Save assistant message and update session
      if (sessionId) {
        await supabase.from("counsellor_messages").insert({
          session_id: sessionId,
          role: "assistant",
          content: data.reply,
        });

        await supabase
          .from("counsellor_sessions")
          .update({
            last_message: data.reply,
            updated_at: new Date().toISOString(),
          })
          .eq("id", sessionId);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I apologize, but I'm having trouble responding right now. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loadingHistory) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="text-muted mt-4">Loading conversation...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-background"
      keyboardVerticalOffset={90}
    >
      {/* Header */}
      <View
        className="flex-row items-center gap-3 px-4 py-3 border-b"
        style={{ borderBottomColor: colors.border }}
      >
        <TouchableOpacity onPress={onClose}>
          <IconSymbol name="xmark" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-lg font-bold text-foreground">{title}</Text>
          <Text className="text-xs text-muted">AI-Powered Support</Text>
        </View>
        <View className="bg-success/10 rounded-full p-2">
          <IconSymbol name="checkmark.circle.fill" size={20} color={colors.success} />
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        className="flex-1 px-4 py-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {messages.map((message, index) => (
          <View
            key={index}
            className={`flex-row gap-3 mb-4 ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {message.role === "assistant" && (
              <View className="bg-primary/10 rounded-full p-2 self-start">
                <IconSymbol name="brain" size={20} color={colors.primary} />
              </View>
            )}
            <View
              className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                message.role === "user"
                  ? "bg-primary"
                  : "bg-surface border"
              }`}
              style={
                message.role === "assistant"
                  ? { borderColor: colors.border }
                  : undefined
              }
            >
              <Text
                className={`text-sm leading-relaxed ${
                  message.role === "user" ? "text-white" : "text-foreground"
                }`}
              >
                {message.content}
              </Text>
            </View>
            {message.role === "user" && (
              <View className="bg-primary/10 rounded-full p-2 self-start">
                <IconSymbol name="person.fill" size={20} color={colors.primary} />
              </View>
            )}
          </View>
        ))}
        {loading && (
          <View className="flex-row gap-3 mb-4">
            <View className="bg-primary/10 rounded-full p-2">
              <IconSymbol name="brain" size={20} color={colors.primary} />
            </View>
            <View className="bg-surface border rounded-2xl px-4 py-3" style={{ borderColor: colors.border }}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <View
        className="flex-row items-center gap-3 px-4 py-3 border-t bg-background"
        style={{ borderTopColor: colors.border }}
      >
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Type your message..."
          placeholderTextColor={colors.muted}
          className="flex-1 bg-surface rounded-full px-4 py-3 text-foreground"
          multiline
          maxLength={500}
          editable={!loading}
          onSubmitEditing={sendMessage}
          returnKeyType="send"
        />
        <TouchableOpacity
          onPress={sendMessage}
          disabled={!input.trim() || loading}
          className="bg-primary rounded-full p-3"
          style={{
            opacity: !input.trim() || loading ? 0.5 : 1,
          }}
        >
          <IconSymbol name="paperplane.fill" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
