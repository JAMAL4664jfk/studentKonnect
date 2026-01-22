import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import Toast from "react-native-toast-message";

interface Tutor {
  id: string;
  user_id: string;
  subjects: string[];
  bio: string | null;
  rating: number;
  total_sessions: number;
  is_available: boolean;
  hourly_rate?: number;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
    institution_name: string | null;
    course_program: string | null;
  };
}

// Demo tutors
const demoTutors: Tutor[] = [
  {
    id: "demo-1",
    user_id: "demo-user-1",
    subjects: ["Mathematics", "Calculus", "Statistics", "Linear Algebra"],
    bio: "3rd year Engineering student with a passion for making complex math concepts simple. I've helped over 50 students ace their exams!",
    rating: 4.9,
    total_sessions: 127,
    is_available: true,
    hourly_rate: 0,
    profile: {
      full_name: "Thabo Mokoena",
      avatar_url:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      institution_name: "University of Pretoria",
      course_program: "BSc Mechanical Engineering",
    },
  },
  {
    id: "demo-2",
    user_id: "demo-user-2",
    subjects: ["Computer Science", "Python", "Java", "Data Structures"],
    bio: "Software developer and CS tutor. I break down programming concepts into bite-sized pieces. Let's code together! 💻",
    rating: 4.8,
    total_sessions: 89,
    is_available: true,
    hourly_rate: 0,
    profile: {
      full_name: "Naledi Dlamini",
      avatar_url:
        "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150&h=150&fit=crop&crop=face",
      institution_name: "University of Cape Town",
      course_program: "BSc Computer Science",
    },
  },
  {
    id: "demo-3",
    user_id: "demo-user-3",
    subjects: ["Accounting", "Financial Management", "Economics", "Business Studies"],
    bio: "Honours Accounting student with CTA. Former Deloitte intern. I'll help you understand debits, credits, and everything in between!",
    rating: 4.7,
    total_sessions: 156,
    is_available: true,
    hourly_rate: 0,
    profile: {
      full_name: "Sipho Ndlovu",
      avatar_url:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
      institution_name: "University of Johannesburg",
      course_program: "BCom Accounting Honours",
    },
  },
  {
    id: "demo-4",
    user_id: "demo-user-4",
    subjects: ["Physics", "Chemistry", "Physical Science"],
    bio: "Making science fun and understandable! MSc Physics candidate specializing in quantum mechanics. Patient and thorough teaching style.",
    rating: 4.9,
    total_sessions: 203,
    is_available: true,
    hourly_rate: 0,
    profile: {
      full_name: "Lerato Khumalo",
      avatar_url:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
      institution_name: "Stellenbosch University",
      course_program: "MSc Physics",
    },
  },
  {
    id: "demo-5",
    user_id: "demo-user-5",
    subjects: ["English", "Literature", "Essay Writing", "Academic Writing"],
    bio: "English Literature graduate with a love for words. I'll help you craft compelling essays and master the art of academic writing.",
    rating: 4.8,
    total_sessions: 142,
    is_available: true,
    hourly_rate: 0,
    profile: {
      full_name: "Zanele Mthembu",
      avatar_url:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
      institution_name: "Rhodes University",
      course_program: "BA English Literature",
    },
  },
  {
    id: "demo-6",
    user_id: "demo-user-6",
    subjects: ["Biology", "Life Sciences", "Anatomy", "Physiology"],
    bio: "Medical student passionate about biology. I use mnemonics and visual aids to make complex biological processes memorable!",
    rating: 4.9,
    total_sessions: 178,
    is_available: true,
    hourly_rate: 0,
    profile: {
      full_name: "Mandla Sithole",
      avatar_url:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
      institution_name: "University of the Witwatersrand",
      course_program: "MBBCh Medicine",
    },
  },
];

type TabType = "find" | "become" | "sessions" | "dashboard";

export default function TutoringScreen() {
  const router = useRouter();
  const colors = useColors();
  const [activeTab, setActiveTab] = useState<TabType>("find");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [becomeTutorModal, setBecomeTutorModal] = useState(false);

  // Become a Tutor form state
  const [tutorForm, setTutorForm] = useState({
    subjects: "",
    bio: "",
    hourlyRate: "",
    availability: "",
  });

  const subjects = [
    "All",
    "Mathematics",
    "Computer Science",
    "Accounting",
    "Physics",
    "English",
    "Biology",
  ];

  const filteredTutors = demoTutors.filter((tutor) => {
    const matchesSearch =
      searchQuery === "" ||
      tutor.profile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutor.subjects.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      tutor.profile?.institution_name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSubject =
      !selectedSubject ||
      selectedSubject === "All" ||
      tutor.subjects.some((s) => s.toLowerCase().includes(selectedSubject.toLowerCase()));

    return matchesSearch && matchesSubject;
  });

  const handleBecomeTutor = () => {
    if (!tutorForm.subjects || !tutorForm.bio) {
      Toast.show({
        type: "error",
        text1: "Missing Information",
        text2: "Please fill in all required fields",
      });
      return;
    }

    Toast.show({
      type: "success",
      text1: "Application Submitted",
      text2: "We'll review your application and get back to you soon!",
    });
    setBecomeTutorModal(false);
    setTutorForm({ subjects: "", bio: "", hourlyRate: "", availability: "" });
  };

  const renderFindTutor = () => (
    <View className="flex-1">
      {/* Search Bar */}
      <View className="px-4 py-2 -mt-2">
        <View
          className="flex-row items-center px-4 py-3 rounded-xl"
          style={{ backgroundColor: colors.surface }}
        >
          <IconSymbol name="magnifyingglass" size={20} color={colors.muted} />
          <TextInput
            className="flex-1 ml-3 text-base"
            style={{ color: colors.foreground }}
            placeholder="Search tutors, subjects, institutions..."
            placeholderTextColor={colors.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Subject Filter */}
      <View className="px-4 py-2">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
        >
        {subjects.map((subject) => (
          <TouchableOpacity
            key={subject}
            onPress={() => setSelectedSubject(subject === "All" ? null : subject)}
            className="mr-2 px-3 py-1.5 rounded-full"
            style={{
              backgroundColor:
                (selectedSubject === subject || (!selectedSubject && subject === "All"))
                  ? colors.primary
                  : colors.surface,
            }}
          >
            <Text
              className="text-sm font-medium"
              style={{
                color:
                  (selectedSubject === subject || (!selectedSubject && subject === "All"))
                    ? "#fff"
                    : colors.foreground,
              }}
            >
              {subject}
            </Text>
          </TouchableOpacity>
        ))}
        </ScrollView>
      </View>

      {/* Tutors List */}
      <FlatList
        data={filteredTutors}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              setSelectedTutor(item);
              setShowBookingModal(true);
            }}
            className="mb-4 p-4 rounded-2xl"
            style={{ backgroundColor: colors.surface }}
          >
            <View className="flex-row">
              <Image
                source={{ uri: item.profile?.avatar_url || "" }}
                className="w-16 h-16 rounded-full"
              />
              <View className="flex-1 ml-4">
                <Text className="text-lg font-bold" style={{ color: colors.foreground }}>
                  {item.profile?.full_name}
                </Text>
                <Text className="text-sm mt-1" style={{ color: colors.muted }}>
                  {item.profile?.institution_name}
                </Text>
                <View className="flex-row items-center mt-2">
                  <IconSymbol name="star.fill" size={16} color="#FFB800" />
                  <Text className="ml-1 font-semibold" style={{ color: colors.foreground }}>
                    {item.rating}
                  </Text>
                  <Text className="ml-2" style={{ color: colors.muted }}>
                    • {item.total_sessions} sessions
                  </Text>
                </View>
              </View>
            </View>
            <View className="flex-row flex-wrap mt-3">
              {item.subjects.slice(0, 3).map((subject, idx) => (
                <View
                  key={idx}
                  className="mr-2 mb-2 px-3 py-1 rounded-full"
                  style={{ backgroundColor: colors.background }}
                >
                  <Text className="text-xs" style={{ color: colors.primary }}>
                    {subject}
                  </Text>
                </View>
              ))}
            </View>
            {item.bio && (
              <Text className="mt-2 text-sm" style={{ color: colors.muted }} numberOfLines={2}>
                {item.bio}
              </Text>
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  );

  const renderBecomeTutor = () => (
    <ScrollView className="flex-1 px-4 py-6">
      <View className="items-center mb-6">
        <View
          className="w-20 h-20 rounded-full items-center justify-center mb-4"
          style={{ backgroundColor: colors.primary + "20" }}
        >
          <IconSymbol name="graduationcap.fill" size={40} color={colors.primary} />
        </View>
        <Text className="text-2xl font-bold text-center" style={{ color: colors.foreground }}>
          Become a Tutor
        </Text>
        <Text className="text-center mt-2" style={{ color: colors.muted }}>
          Share your knowledge and earn while helping fellow students succeed
        </Text>
      </View>

      <TouchableOpacity
        onPress={() => setBecomeTutorModal(true)}
        className="py-4 rounded-xl items-center"
        style={{ backgroundColor: colors.primary }}
      >
        <Text className="text-white font-semibold text-base">Apply to Become a Tutor</Text>
      </TouchableOpacity>

      <View className="mt-8">
        <Text className="text-lg font-bold mb-4" style={{ color: colors.foreground }}>
          Benefits of Tutoring
        </Text>
        
        {[
          { icon: "dollarsign.circle.fill", title: "Earn Money", desc: "Set your own rates and schedule" },
          { icon: "person.2.fill", title: "Help Others", desc: "Make a difference in students' lives" },
          { icon: "chart.line.uptrend.xyaxis", title: "Build Skills", desc: "Develop teaching and communication skills" },
          { icon: "star.fill", title: "Gain Recognition", desc: "Build your reputation and portfolio" },
        ].map((benefit, idx) => (
          <View key={idx} className="flex-row items-start mb-4">
            <View
              className="w-12 h-12 rounded-full items-center justify-center"
              style={{ backgroundColor: colors.primary + "20" }}
            >
              <IconSymbol name={benefit.icon as any} size={24} color={colors.primary} />
            </View>
            <View className="flex-1 ml-4">
              <Text className="font-semibold text-base" style={{ color: colors.foreground }}>
                {benefit.title}
              </Text>
              <Text className="mt-1" style={{ color: colors.muted }}>
                {benefit.desc}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderMySessions = () => (
    <ScrollView className="flex-1 px-4 py-6">
      <View className="items-center mb-6">
        <View
          className="w-20 h-20 rounded-full items-center justify-center mb-4"
          style={{ backgroundColor: colors.primary + "20" }}
        >
          <IconSymbol name="calendar" size={40} color={colors.primary} />
        </View>
        <Text className="text-2xl font-bold text-center" style={{ color: colors.foreground }}>
          My Sessions
        </Text>
        <Text className="text-center mt-2" style={{ color: colors.muted }}>
          View and manage your booked tutoring sessions
        </Text>
      </View>

      <View
        className="p-6 rounded-2xl items-center"
        style={{ backgroundColor: colors.surface }}
      >
        <IconSymbol name="calendar" size={48} color={colors.muted} />
        <Text className="mt-4 text-lg font-semibold" style={{ color: colors.foreground }}>
          No Sessions Yet
        </Text>
        <Text className="mt-2 text-center" style={{ color: colors.muted }}>
          Book a session with a tutor to get started
        </Text>
        <TouchableOpacity
          onPress={() => setActiveTab("find")}
          className="mt-4 px-6 py-3 rounded-xl"
          style={{ backgroundColor: colors.primary }}
        >
          <Text className="text-white font-semibold">Find a Tutor</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderMyTutoring = () => (
    <ScrollView className="flex-1 px-4 py-6">
      <View className="items-center mb-6">
        <View
          className="w-20 h-20 rounded-full items-center justify-center mb-4"
          style={{ backgroundColor: colors.primary + "20" }}
        >
          <IconSymbol name="chart.bar.fill" size={40} color={colors.primary} />
        </View>
        <Text className="text-2xl font-bold text-center" style={{ color: colors.foreground }}>
          My Tutoring Dashboard
        </Text>
        <Text className="text-center mt-2" style={{ color: colors.muted }}>
          Manage your tutoring sessions and track your progress
        </Text>
      </View>

      <View
        className="p-6 rounded-2xl items-center"
        style={{ backgroundColor: colors.surface }}
      >
        <IconSymbol name="person.crop.circle.badge.xmark" size={48} color={colors.muted} />
        <Text className="mt-4 text-lg font-semibold" style={{ color: colors.foreground }}>
          Not a Tutor Yet
        </Text>
        <Text className="mt-2 text-center" style={{ color: colors.muted }}>
          Apply to become a tutor to access this dashboard
        </Text>
        <TouchableOpacity
          onPress={() => setActiveTab("become")}
          className="mt-4 px-6 py-3 rounded-xl"
          style={{ backgroundColor: colors.primary }}
        >
          <Text className="text-white font-semibold">Become a Tutor</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <ScreenContainer>
      {/* Header */}
      <View className="px-4 py-4 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <View>
            <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
              Tutoring
            </Text>
            <Text style={{ color: colors.muted }}>Find tutors or offer tutoring</Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View className="px-4 py-3">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
        >
        {[
          { key: "find", label: "Find a Tutor", icon: "magnifyingglass" },
          { key: "become", label: "Become a Tutor", icon: "graduationcap.fill" },
          { key: "sessions", label: "My Sessions", icon: "calendar" },
          { key: "dashboard", label: "My Tutoring", icon: "chart.bar.fill" },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key as TabType)}
            className="mr-2 px-4 py-2 rounded-full"
            style={{
              backgroundColor: activeTab === tab.key ? colors.primary : colors.surface,
            }}
          >
            <View className="flex-row items-center">
              <IconSymbol
                name={tab.icon as any}
                size={16}
                color={activeTab === tab.key ? "#FFFFFF" : colors.muted}
              />
              <Text
                className="ml-2 text-sm font-medium"
                style={{
                  color: activeTab === tab.key ? "#FFFFFF" : colors.muted,
                }}
              >
                {tab.label}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
        </ScrollView>
      </View>

      {/* Tab Content */}
      {activeTab === "find" && renderFindTutor()}
      {activeTab === "become" && renderBecomeTutor()}
      {activeTab === "sessions" && renderMySessions()}
      {activeTab === "dashboard" && renderMyTutoring()}

      {/* Booking Modal */}
      <Modal visible={showBookingModal} animationType="slide" transparent>
        <View className="flex-1 justify-end" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <View
            className="rounded-t-3xl p-6"
            style={{ backgroundColor: colors.background, maxHeight: "80%" }}
          >
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold" style={{ color: colors.foreground }}>
                Book Session
              </Text>
              <TouchableOpacity onPress={() => setShowBookingModal(false)}>
                <IconSymbol name="xmark" size={24} color={colors.foreground} />
              </TouchableOpacity>
            </View>

            {selectedTutor && (
              <ScrollView>
                <View className="flex-row items-center mb-6">
                  <Image
                    source={{ uri: selectedTutor.profile?.avatar_url || "" }}
                    className="w-16 h-16 rounded-full"
                  />
                  <View className="flex-1 ml-4">
                    <Text className="text-lg font-bold" style={{ color: colors.foreground }}>
                      {selectedTutor.profile?.full_name}
                    </Text>
                    <Text style={{ color: colors.muted }}>
                      {selectedTutor.profile?.institution_name}
                    </Text>
                    <View className="flex-row items-center mt-1">
                      <IconSymbol name="star.fill" size={14} color="#FFB800" />
                      <Text className="ml-1 font-semibold" style={{ color: colors.foreground }}>
                        {selectedTutor.rating}
                      </Text>
                    </View>
                  </View>
                </View>

                <View className="mb-4">
                  <Text className="font-semibold mb-2" style={{ color: colors.foreground }}>
                    Select Date & Time
                  </Text>
                  <TouchableOpacity
                    className="p-4 rounded-xl"
                    style={{ backgroundColor: colors.surface }}
                  >
                    <Text style={{ color: colors.muted }}>Choose date and time</Text>
                  </TouchableOpacity>
                </View>

                <View className="mb-4">
                  <Text className="font-semibold mb-2" style={{ color: colors.foreground }}>
                    Session Topic
                  </Text>
                  <TextInput
                    className="p-4 rounded-xl"
                    style={{ backgroundColor: colors.surface, color: colors.foreground }}
                    placeholder="What do you need help with?"
                    placeholderTextColor={colors.muted}
                    multiline
                    numberOfLines={3}
                  />
                </View>

                <TouchableOpacity
                  onPress={() => {
                    Toast.show({
                      type: "success",
                      text1: "Session Booked",
                      text2: `Your session with ${selectedTutor.profile?.full_name} has been booked!`,
                    });
                    setShowBookingModal(false);
                  }}
                  className="py-4 rounded-xl items-center"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Text className="text-white font-semibold text-base">Confirm Booking</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Become Tutor Modal */}
      <Modal visible={becomeTutorModal} animationType="slide" transparent>
        <View className="flex-1 justify-end" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <View
            className="rounded-t-3xl p-6"
            style={{ backgroundColor: colors.background, maxHeight: "80%" }}
          >
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold" style={{ color: colors.foreground }}>
                Tutor Application
              </Text>
              <TouchableOpacity onPress={() => setBecomeTutorModal(false)}>
                <IconSymbol name="xmark" size={24} color={colors.foreground} />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <View className="mb-4">
                <Text className="font-semibold mb-2" style={{ color: colors.foreground }}>
                  Subjects *
                </Text>
                <TextInput
                  className="p-4 rounded-xl"
                  style={{ backgroundColor: colors.surface, color: colors.foreground }}
                  placeholder="e.g., Mathematics, Physics, Chemistry"
                  placeholderTextColor={colors.muted}
                  value={tutorForm.subjects}
                  onChangeText={(text) => setTutorForm({ ...tutorForm, subjects: text })}
                />
              </View>

              <View className="mb-4">
                <Text className="font-semibold mb-2" style={{ color: colors.foreground }}>
                  Bio *
                </Text>
                <TextInput
                  className="p-4 rounded-xl"
                  style={{ backgroundColor: colors.surface, color: colors.foreground }}
                  placeholder="Tell students about your experience and teaching style"
                  placeholderTextColor={colors.muted}
                  multiline
                  numberOfLines={4}
                  value={tutorForm.bio}
                  onChangeText={(text) => setTutorForm({ ...tutorForm, bio: text })}
                />
              </View>

              <View className="mb-4">
                <Text className="font-semibold mb-2" style={{ color: colors.foreground }}>
                  Hourly Rate (Optional)
                </Text>
                <TextInput
                  className="p-4 rounded-xl"
                  style={{ backgroundColor: colors.surface, color: colors.foreground }}
                  placeholder="Leave blank for free tutoring"
                  placeholderTextColor={colors.muted}
                  keyboardType="numeric"
                  value={tutorForm.hourlyRate}
                  onChangeText={(text) => setTutorForm({ ...tutorForm, hourlyRate: text })}
                />
              </View>

              <View className="mb-6">
                <Text className="font-semibold mb-2" style={{ color: colors.foreground }}>
                  Availability
                </Text>
                <TextInput
                  className="p-4 rounded-xl"
                  style={{ backgroundColor: colors.surface, color: colors.foreground }}
                  placeholder="e.g., Weekdays 5-8pm, Weekends anytime"
                  placeholderTextColor={colors.muted}
                  value={tutorForm.availability}
                  onChangeText={(text) => setTutorForm({ ...tutorForm, availability: text })}
                />
              </View>

              <TouchableOpacity
                onPress={handleBecomeTutor}
                className="py-4 rounded-xl items-center"
                style={{ backgroundColor: colors.primary }}
              >
                <Text className="text-white font-semibold text-base">Submit Application</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Toast />
    </ScreenContainer>
  );
}
