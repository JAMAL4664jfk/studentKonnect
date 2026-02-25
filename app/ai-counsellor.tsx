import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useState, useRef, useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { supabase } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

type CounsellorType = "mental" | "financial" | "academic";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// ─── Counsellor Config ────────────────────────────────────────────────────────

const COUNSELLORS: Record<CounsellorType, {
  name: string;
  emoji: string;
  color: string;
  gradient: [string, string];
  description: string;
  placeholder: string;
  systemPrompt: string;
  welcome: string;
}> = {
  mental: {
    name: "MindMate",
    emoji: "🧠",
    color: "#8B5CF6",
    gradient: ["#7C3AED", "#A78BFA"],
    description: "Mental Health & Emotional Support",
    placeholder: "Share what's on your mind...",
    systemPrompt: `You are MindMate, a compassionate mental health counsellor for South African university students. You provide:
- Empathetic listening and emotional support
- Evidence-based coping strategies for stress, anxiety, and depression
- Study-life balance advice
- Crisis support and referrals when needed
- Culturally sensitive guidance for South African students

Be warm, non-judgmental, and professional. Keep responses concise and supportive. If the student mentions self-harm or suicidal thoughts, immediately provide crisis hotlines: Lifeline SA: 0800 567 567, SADAG: 0800 456 789.`,
    welcome: "Hi there! 👋 I'm MindMate, your mental wellness companion. This is a safe, confidential space where you can talk about stress, anxiety, depression, or anything else on your mind. How are you feeling today?",
  },
  financial: {
    name: "FinanceGuru",
    emoji: "💰",
    color: "#10B981",
    gradient: ["#059669", "#34D399"],
    description: "Financial Coaching & Budgeting",
    placeholder: "Ask about budgeting, NSFAS, saving...",
    systemPrompt: `You are FinanceGuru, an expert financial coach for South African university students. You provide:
- Practical budgeting advice for limited student income
- NSFAS fund management strategies
- Debt management and avoiding predatory loans (mashonisas)
- Savings strategies for students
- Smart spending habits and financial literacy
- Advice on student bursaries and funding

Be practical, encouraging, and realistic about student finances. Use Rand (R) currency and understand South African financial context. Keep responses concise and actionable.`,
    welcome: "Hello! 💰 I'm FinanceGuru, your AI financial coach. I'm here to help you manage your student finances, create budgets, make the most of your NSFAS, and build smart money habits. What would you like help with today?",
  },
  academic: {
    name: "StudyBuddy",
    emoji: "📚",
    color: "#F59E0B",
    gradient: ["#D97706", "#FCD34D"],
    description: "Academic Support & Study Planning",
    placeholder: "Ask about studying, time management...",
    systemPrompt: `You are StudyBuddy, an academic support counsellor for South African university students. You provide:
- Study planning and time management strategies
- Exam preparation techniques (including for UNISA distance learning)
- Assignment organization tips
- Work-study-life balance advice
- Academic stress management
- Goal setting and motivation
- Understanding South African university systems (UNISA, Wits, UCT, UJ, etc.)

Be supportive, practical, and understand the pressure students face. Provide actionable strategies. Keep responses concise and helpful.`,
    welcome: "Welcome! 📚 I'm StudyBuddy, your academic support companion. I'm here to help you with study planning, time management, exam prep, and balancing your workload. What's on your mind regarding your studies?",
  },
};

// ─── AI API Call ──────────────────────────────────────────────────────────────

async function callAI(
  messages: { role: string; content: string }[],
  counsellorType: CounsellorType
): Promise<string> {
  const counsellor = COUNSELLORS[counsellorType];

  // Try Supabase Edge Function first (if deployed)
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "https://ortjjekmexmyvkkotioo.supabase.co";
      const response = await fetch(`${supabaseUrl}/functions/v1/ai-counsellor`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ messages, counsellorType }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.reply) return data.reply;
      }
    }
  } catch {
    // Fall through to direct API call
  }

  // Direct OpenAI-compatible API call as fallback
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return "I'm currently unable to connect to the AI service. Please check your internet connection and try again. For urgent support, call Lifeline SA: 0800 567 567.";
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: counsellor.systemPrompt },
        ...messages,
      ],
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "I'm having trouble responding right now. Please try again.";
}

// ─── Session Management ───────────────────────────────────────────────────────

async function getOrCreateSession(userId: string, counsellorType: CounsellorType): Promise<string | null> {
  try {
    // Get most recent active session
    const { data: existing } = await supabase
      .from("counsellor_sessions")
      .select("id")
      .eq("user_id", userId)
      .eq("counsellor_type", counsellorType)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing) return existing.id;

    // Create new session
    const counsellorNames: Record<CounsellorType, string> = {
      mental: "MindMate",
      financial: "FinanceGuru",
      academic: "StudyBuddy",
    };

    const { data: newSession } = await supabase
      .from("counsellor_sessions")
      .insert({
        user_id: userId,
        counsellor_type: counsellorType,
        title: `New ${counsellorNames[counsellorType]} Session`,
      })
      .select("id")
      .maybeSingle();

    return newSession?.id || null;
  } catch {
    return null;
  }
}

async function saveMessage(sessionId: string, role: "user" | "assistant", content: string) {
  try {
    await supabase.from("counsellor_messages").insert({ session_id: sessionId, role, content });
    await supabase
      .from("counsellor_sessions")
      .update({ last_message: content, updated_at: new Date().toISOString() })
      .eq("id", sessionId);
  } catch {
    // Non-critical — message still shown in UI
  }
}

async function loadSessionHistory(sessionId: string): Promise<Message[]> {
  try {
    const { data } = await supabase
      .from("counsellor_messages")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true })
      .limit(50);

    return (data || []).map((m: any) => ({
      id: m.id,
      role: m.role as "user" | "assistant",
      content: m.content,
      timestamp: new Date(m.created_at),
    }));
  } catch {
    return [];
  }
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function AICounsellorScreen() {
  const colors = useColors();
  const router = useRouter();
  const params = useLocalSearchParams<{ type?: string }>();
  const counsellorType: CounsellorType = (params.type as CounsellorType) || "mental";
  const counsellor = COUNSELLORS[counsellorType];

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    initSession();
  }, [counsellorType]);

  const initSession = async () => {
    setLoadingHistory(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // No auth — show welcome message only
        setMessages([{
          id: "welcome",
          role: "assistant",
          content: counsellor.welcome,
          timestamp: new Date(),
        }]);
        return;
      }

      const sid = await getOrCreateSession(user.id, counsellorType);
      setSessionId(sid);

      if (sid) {
        const history = await loadSessionHistory(sid);
        if (history.length > 0) {
          setMessages(history);
        } else {
          const welcomeMsg: Message = {
            id: "welcome",
            role: "assistant",
            content: counsellor.welcome,
            timestamp: new Date(),
          };
          setMessages([welcomeMsg]);
          await saveMessage(sid, "assistant", counsellor.welcome);
        }
      }
    } catch {
      setMessages([{
        id: "welcome",
        role: "assistant",
        content: counsellor.welcome,
        timestamp: new Date(),
      }]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    if (sessionId) await saveMessage(sessionId, "user", text);

    try {
      // Build conversation history for AI (last 10 messages)
      const history = [...messages, userMsg]
        .slice(-10)
        .map((m) => ({ role: m.role, content: m.content }));

      const reply = await callAI(history, counsellorType);

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: reply,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      if (sessionId) await saveMessage(sessionId, "assistant", reply);
    } catch (error) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm having trouble connecting right now. Please check your internet and try again. For urgent support: Lifeline SA 0800 567 567.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const startNewSession = () => {
    Alert.alert(
      "New Session",
      "Start a fresh conversation? Your current chat history will be saved.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "New Session",
          onPress: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            // Create a new session
            const { data } = await supabase
              .from("counsellor_sessions")
              .insert({ user_id: user.id, counsellor_type: counsellorType, title: `New ${counsellor.name} Session` })
              .select("id")
              .maybeSingle();
            if (data) {
              setSessionId(data.id);
              const welcomeMsg: Message = { id: "welcome", role: "assistant", content: counsellor.welcome, timestamp: new Date() };
              setMessages([welcomeMsg]);
              await saveMessage(data.id, "assistant", counsellor.welcome);
            }
          },
        },
      ]
    );
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === "user";
    return (
      <View
        className={`flex-row mb-4 ${isUser ? "justify-end" : "justify-start"}`}
      >
        {!isUser && (
          <View
            className="w-9 h-9 rounded-full items-center justify-center mr-2 flex-shrink-0 mt-1"
            style={{ backgroundColor: counsellor.color + "22" }}
          >
            <Text style={{ fontSize: 18 }}>{counsellor.emoji}</Text>
          </View>
        )}
        <View
          className={`rounded-2xl px-4 py-3 max-w-[80%] ${
            isUser ? "rounded-tr-sm" : "rounded-tl-sm"
          }`}
          style={{
            backgroundColor: isUser ? counsellor.color : colors.surface,
          }}
        >
          <Text
            className="text-sm leading-5"
            style={{ color: isUser ? "#fff" : colors.foreground }}
          >
            {item.content}
          </Text>
          <Text
            className="text-xs mt-1"
            style={{ color: isUser ? "rgba(255,255,255,0.6)" : colors.muted }}
          >
            {item.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </Text>
        </View>
        {isUser && (
          <View
            className="w-9 h-9 rounded-full items-center justify-center ml-2 flex-shrink-0 mt-1"
            style={{ backgroundColor: counsellor.color }}
          >
            <IconSymbol name="person.fill" size={18} color="#fff" />
          </View>
        )}
      </View>
    );
  };

  return (
    <ScreenContainer edges={["top", "left", "right"]} className="flex-1">
      {/* Header */}
      <View
        className="px-4 py-4 flex-row items-center gap-3"
        style={{ backgroundColor: counsellor.color }}
      >
        <TouchableOpacity onPress={() => router.back()} className="mr-1">
          <IconSymbol name="chevron.left" size={24} color="#fff" />
        </TouchableOpacity>
        <View
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
        >
          <Text style={{ fontSize: 22 }}>{counsellor.emoji}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-white font-bold text-lg">{counsellor.name}</Text>
          <Text className="text-white/70 text-xs">{counsellor.description}</Text>
        </View>
        <TouchableOpacity onPress={startNewSession}>
          <IconSymbol name="square.and.pencil" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Confidentiality Banner */}
      <View
        className="px-4 py-2 flex-row items-center gap-2"
        style={{ backgroundColor: counsellor.color + "15" }}
      >
        <IconSymbol name="lock.fill" size={12} color={counsellor.color} />
        <Text className="text-xs" style={{ color: counsellor.color }}>
          Confidential AI counselling • Available 24/7 • Not a substitute for professional help
        </Text>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={0}
      >
        {loadingHistory ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={counsellor.color} />
            <Text className="text-muted text-sm mt-3">Loading your session...</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
            showsVerticalScrollIndicator={false}
            ListFooterComponent={
              loading ? (
                <View className="flex-row items-center gap-2 mb-4">
                  <View
                    className="w-9 h-9 rounded-full items-center justify-center"
                    style={{ backgroundColor: counsellor.color + "22" }}
                  >
                    <Text style={{ fontSize: 18 }}>{counsellor.emoji}</Text>
                  </View>
                  <View
                    className="rounded-2xl rounded-tl-sm px-4 py-3"
                    style={{ backgroundColor: colors.surface }}
                  >
                    <View className="flex-row gap-1 items-center">
                      <View
                        className="w-2 h-2 rounded-full animate-bounce"
                        style={{ backgroundColor: counsellor.color }}
                      />
                      <View
                        className="w-2 h-2 rounded-full animate-bounce"
                        style={{ backgroundColor: counsellor.color, opacity: 0.7 }}
                      />
                      <View
                        className="w-2 h-2 rounded-full animate-bounce"
                        style={{ backgroundColor: counsellor.color, opacity: 0.4 }}
                      />
                    </View>
                  </View>
                </View>
              ) : null
            }
          />
        )}

        {/* Input Bar */}
        <View
          className="px-4 py-3 border-t flex-row items-end gap-3"
          style={{ borderColor: colors.border, backgroundColor: colors.background }}
        >
          <TextInput
            className="flex-1 rounded-2xl px-4 py-3 text-sm"
            style={{
              backgroundColor: colors.surface,
              color: colors.foreground,
              maxHeight: 120,
              borderWidth: 1,
              borderColor: colors.border,
            }}
            placeholder={counsellor.placeholder}
            placeholderTextColor={colors.muted}
            value={input}
            onChangeText={setInput}
            multiline
            returnKeyType="send"
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity
            onPress={sendMessage}
            disabled={loading || !input.trim()}
            className="w-11 h-11 rounded-full items-center justify-center"
            style={{
              backgroundColor: loading || !input.trim() ? colors.muted : counsellor.color,
            }}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <IconSymbol name="arrow.up" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>

        {/* Emergency Banner */}
        <View
          className="px-4 py-2 flex-row items-center gap-2"
          style={{ backgroundColor: colors.surface }}
        >
          <IconSymbol name="exclamationmark.triangle.fill" size={12} color={colors.muted} />
          <Text className="text-xs text-muted flex-1">
            For emergencies: Lifeline SA 0800 567 567 • SADAG 0800 456 789
          </Text>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
