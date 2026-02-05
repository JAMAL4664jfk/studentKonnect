import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  ScrollView,
  RefreshControl,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { supabase } from "@/lib/supabase";
import Toast from "react-native-toast-message";

type Lecturer = {
  id: string;
  full_name: string;
  email: string;
  faculty: string;
  department: string;
  specialization: string;
  avatar_url: string | null;
  office_location: string;
  consultation_hours: string;
  bio: string | null;
};

type BookingRequest = {
  id: string;
  lecturer_id: string;
  student_id: string;
  date: string;
  time_slot: string;
  reason: string;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
};

const FACULTIES = [
  "All",
  "Engineering",
  "Business",
  "Science",
  "Arts & Humanities",
  "Health Sciences",
  "Law",
  "Education",
  "Agriculture",
];

const TIME_SLOTS = [
  "08:00 - 09:00",
  "09:00 - 10:00",
  "10:00 - 11:00",
  "11:00 - 12:00",
  "12:00 - 13:00",
  "13:00 - 14:00",
  "14:00 - 15:00",
  "15:00 - 16:00",
  "16:00 - 17:00",
];

export default function LecturesScreen() {
  const colors = useColors();
  const router = useRouter();
  
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [filteredLecturers, setFilteredLecturers] = useState<Lecturer[]>([]);
  const [selectedFaculty, setSelectedFaculty] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Chat Modal
  const [showChatModal, setShowChatModal] = useState(false);
  const [selectedLecturer, setSelectedLecturer] = useState<Lecturer | null>(null);
  const [chatMessage, setChatMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  
  // Booking Modal
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingDate, setBookingDate] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [bookingReason, setBookingReason] = useState("");
  const [submittingBooking, setSubmittingBooking] = useState(false);
  
  // Faculty Dropdown
  const [showFacultyDropdown, setShowFacultyDropdown] = useState(false);
  
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);

  useEffect(() => {
    fetchCurrentUser();
    fetchLecturers();
  }, []);

  useEffect(() => {
    filterLecturers();
  }, [selectedFaculty, searchQuery, lecturers]);

  const fetchCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  const fetchLecturers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "lecturer")
        .order("full_name", { ascending: true });

      if (error) throw error;
      setLecturers(data || []);
    } catch (error: any) {
      console.error("Error fetching lecturers:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load lecturers",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterLecturers = () => {
    let filtered = lecturers;

    // Filter by faculty
    if (selectedFaculty !== "All") {
      filtered = filtered.filter((l) => l.faculty === selectedFaculty);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (l) =>
          l.full_name?.toLowerCase().includes(query) ||
          l.department?.toLowerCase().includes(query) ||
          l.specialization?.toLowerCase().includes(query)
      );
    }

    setFilteredLecturers(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchLecturers();
  };

  const openChatModal = (lecturer: Lecturer) => {
    if (!currentUser) {
      Toast.show({
        type: "info",
        text1: "Sign In Required",
        text2: "Please sign in to chat with lecturers",
      });
      return;
    }
    setSelectedLecturer(lecturer);
    setShowChatModal(true);
  };

  const openBookingModal = (lecturer: Lecturer) => {
    if (!currentUser) {
      Toast.show({
        type: "info",
        text1: "Sign In Required",
        text2: "Please sign in to book consultations",
      });
      return;
    }
    setSelectedLecturer(lecturer);
    setShowBookingModal(true);
  };

  const sendChatMessage = async () => {
    if (!chatMessage.trim() || !selectedLecturer || !currentUser) return;

    setSendingMessage(true);
    try {
      // In a real app, this would send a message to the chat system
      // For now, we'll just show a success message
      Toast.show({
        type: "success",
        text1: "Message Sent",
        text2: `Your message to ${selectedLecturer.full_name} has been sent`,
      });
      setChatMessage("");
      setShowChatModal(false);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to send message",
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const submitBookingRequest = async () => {
    if (!bookingDate || !selectedTimeSlot || !bookingReason.trim() || !selectedLecturer || !currentUser) {
      Toast.show({
        type: "error",
        text1: "Missing Information",
        text2: "Please fill in all fields",
      });
      return;
    }

    setSubmittingBooking(true);
    try {
      const { error } = await supabase.from("lecturer_bookings").insert({
        lecturer_id: selectedLecturer.id,
        student_id: currentUser.id,
        date: bookingDate,
        time_slot: selectedTimeSlot,
        reason: bookingReason,
        status: "pending",
      });

      if (error) throw error;

      Toast.show({
        type: "success",
        text1: "Booking Request Sent",
        text2: `Your request to ${selectedLecturer.full_name} has been submitted`,
      });

      setBookingDate("");
      setSelectedTimeSlot("");
      setBookingReason("");
      setShowBookingModal(false);
    } catch (error: any) {
      console.error("Error submitting booking:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to submit booking request",
      });
    } finally {
      setSubmittingBooking(false);
    }
  };

  const renderLecturer = ({ item }: { item: Lecturer }) => (
    <View className="bg-surface rounded-2xl p-4 mb-4 border border-border">
      <View className="flex-row">
        {/* Avatar */}
        {item.avatar_url ? (
          <Image
            source={{ uri: item.avatar_url }}
            className="w-20 h-20 rounded-xl mr-4"
            contentFit="cover"
          />
        ) : (
          <View className="w-20 h-20 rounded-xl mr-4 bg-primary/20 items-center justify-center">
            <IconSymbol name="person.fill" size={32} color={colors.primary} />
          </View>
        )}

        {/* Info */}
        <View className="flex-1">
          <Text className="text-base font-semibold text-foreground mb-1">
            {item.full_name}
          </Text>
          <Text className="text-sm text-muted mb-1">{item.department}</Text>
          <View className="flex-row items-center gap-2 mb-2">
            <View
              className="px-2 py-1 rounded-full"
              style={{ backgroundColor: colors.primary + "20" }}
            >
              <Text className="text-xs font-medium" style={{ color: colors.primary }}>
                {item.faculty}
              </Text>
            </View>
          </View>
          {item.specialization && (
            <Text className="text-xs text-muted" numberOfLines={1}>
              {item.specialization}
            </Text>
          )}
        </View>
      </View>

      {/* Office & Hours */}
      {(item.office_location || item.consultation_hours) && (
        <View className="mt-3 pt-3 border-t border-border">
          {item.office_location && (
            <View className="flex-row items-center gap-2 mb-1">
              <IconSymbol name="mappin.circle.fill" size={14} color={colors.muted} />
              <Text className="text-xs text-muted">{item.office_location}</Text>
            </View>
          )}
          {item.consultation_hours && (
            <View className="flex-row items-center gap-2">
              <IconSymbol name="clock.fill" size={14} color={colors.muted} />
              <Text className="text-xs text-muted">{item.consultation_hours}</Text>
            </View>
          )}
        </View>
      )}

      {/* Action Buttons */}
      <View className="flex-row gap-3 mt-4">
        <TouchableOpacity
          onPress={() => openChatModal(item)}
          className="flex-1 bg-surface border border-border rounded-xl py-3 items-center justify-center"
        >
          <View className="flex-row items-center gap-2">
            <IconSymbol name="message.fill" size={16} color={colors.primary} />
            <Text className="text-sm font-semibold text-primary">Chat</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => openBookingModal(item)}
          className="flex-1 bg-primary rounded-xl py-3 items-center justify-center"
        >
          <View className="flex-row items-center gap-2">
            <IconSymbol name="calendar.badge.plus" size={16} color="white" />
            <Text className="text-sm font-semibold text-white">Book</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      <View className="flex-1">
        {/* Header */}
        <View className="px-4 pt-4 pb-2">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-foreground">Lectures & Timetable</Text>
              <Text className="text-sm text-muted">Connect with your lecturers</Text>
            </View>
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-surface items-center justify-center"
            >
              <IconSymbol name="chevron.left" size={20} color={colors.foreground} />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View className="bg-surface border border-border rounded-2xl px-4 py-3 flex-row items-center mb-3">
            <IconSymbol name="magnifyingglass" size={20} color={colors.muted} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search lecturers..."
              placeholderTextColor={colors.muted}
              className="flex-1 ml-2 text-foreground"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <IconSymbol name="xmark.circle.fill" size={20} color={colors.muted} />
              </TouchableOpacity>
            )}
          </View>

          {/* Faculty Dropdown */}
          <View>
            <TouchableOpacity
              onPress={() => setShowFacultyDropdown(!showFacultyDropdown)}
              className="bg-surface border border-border rounded-xl px-4 py-3 flex-row items-center justify-between"
            >
              <Text className="text-foreground font-medium">{selectedFaculty}</Text>
              <IconSymbol
                name={showFacultyDropdown ? "chevron.up" : "chevron.down"}
                size={20}
                color={colors.foreground}
              />
            </TouchableOpacity>
            {showFacultyDropdown && (
              <View className="bg-surface border border-border rounded-xl mt-2 overflow-hidden">
                {FACULTIES.map((faculty) => (
                  <TouchableOpacity
                    key={faculty}
                    onPress={() => {
                      setSelectedFaculty(faculty);
                      setShowFacultyDropdown(false);
                    }}
                    className={`px-4 py-3 ${
                      selectedFaculty === faculty ? "bg-primary/10" : ""
                    }`}
                  >
                    <Text
                      className={`font-medium ${
                        selectedFaculty === faculty ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {faculty}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Lecturers List */}
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-muted">Loading lecturers...</Text>
          </View>
        ) : filteredLecturers.length === 0 ? (
          <View className="flex-1 items-center justify-center px-4">
            <IconSymbol name="person.2.slash" size={64} color={colors.muted} />
            <Text className="text-lg font-semibold text-foreground mt-4">No Lecturers Found</Text>
            <Text className="text-sm text-muted mt-2 text-center">
              Try adjusting your search or filter
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredLecturers}
            renderItem={renderLecturer}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.primary}
              />
            }
          />
        )}

        {/* Chat Modal */}
        <Modal
          visible={showChatModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowChatModal(false)}
        >
          <ScreenContainer>
            <View className="flex-1 p-4">
              <View className="flex-row items-center justify-between mb-6">
                <Text className="text-2xl font-bold text-foreground">
                  Chat with {selectedLecturer?.full_name}
                </Text>
                <TouchableOpacity onPress={() => setShowChatModal(false)}>
                  <IconSymbol name="xmark" size={24} color={colors.foreground} />
                </TouchableOpacity>
              </View>

              <ScrollView className="flex-1 mb-4">
                <View className="bg-surface rounded-2xl p-4 border border-border">
                  <View className="flex-row items-center gap-3 mb-4">
                    {selectedLecturer?.avatar_url ? (
                      <Image
                        source={{ uri: selectedLecturer.avatar_url }}
                        className="w-16 h-16 rounded-xl"
                        contentFit="cover"
                      />
                    ) : (
                      <View className="w-16 h-16 rounded-xl bg-primary/20 items-center justify-center">
                        <IconSymbol name="person.fill" size={28} color={colors.primary} />
                      </View>
                    )}
                    <View className="flex-1">
                      <Text className="text-lg font-semibold text-foreground">
                        {selectedLecturer?.full_name}
                      </Text>
                      <Text className="text-sm text-muted">{selectedLecturer?.department}</Text>
                    </View>
                  </View>

                  {selectedLecturer?.bio && (
                    <View className="mb-4">
                      <Text className="text-sm text-foreground">{selectedLecturer.bio}</Text>
                    </View>
                  )}

                  <View className="pt-4 border-t border-border">
                    <Text className="text-sm font-medium text-foreground mb-2">
                      Send a message
                    </Text>
                    <TextInput
                      value={chatMessage}
                      onChangeText={setChatMessage}
                      placeholder="Type your message or question..."
                      placeholderTextColor={colors.muted}
                      className="bg-background border border-border rounded-xl px-4 py-3 text-foreground"
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                    />
                  </View>
                </View>
              </ScrollView>

              <TouchableOpacity
                onPress={sendChatMessage}
                disabled={sendingMessage || !chatMessage.trim()}
                className="bg-primary rounded-xl py-4 items-center"
                style={{ opacity: sendingMessage || !chatMessage.trim() ? 0.5 : 1 }}
              >
                <Text className="text-white font-semibold text-base">
                  {sendingMessage ? "Sending..." : "Send Message"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScreenContainer>
        </Modal>

        {/* Booking Modal */}
        <Modal
          visible={showBookingModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowBookingModal(false)}
        >
          <ScreenContainer>
            <View className="flex-1 p-4">
              <View className="flex-row items-center justify-between mb-6">
                <Text className="text-2xl font-bold text-foreground">Book Consultation</Text>
                <TouchableOpacity onPress={() => setShowBookingModal(false)}>
                  <IconSymbol name="xmark" size={24} color={colors.foreground} />
                </TouchableOpacity>
              </View>

              <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <View className="gap-4">
                  {/* Lecturer Info */}
                  <View className="bg-surface rounded-2xl p-4 border border-border">
                    <View className="flex-row items-center gap-3">
                      {selectedLecturer?.avatar_url ? (
                        <Image
                          source={{ uri: selectedLecturer.avatar_url }}
                          className="w-16 h-16 rounded-xl"
                          contentFit="cover"
                        />
                      ) : (
                        <View className="w-16 h-16 rounded-xl bg-primary/20 items-center justify-center">
                          <IconSymbol name="person.fill" size={28} color={colors.primary} />
                        </View>
                      )}
                      <View className="flex-1">
                        <Text className="text-lg font-semibold text-foreground">
                          {selectedLecturer?.full_name}
                        </Text>
                        <Text className="text-sm text-muted">{selectedLecturer?.department}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Date */}
                  <View>
                    <Text className="text-sm font-medium text-foreground mb-2">Date *</Text>
                    <TextInput
                      value={bookingDate}
                      onChangeText={setBookingDate}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor={colors.muted}
                      className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
                    />
                  </View>

                  {/* Time Slot */}
                  <View>
                    <Text className="text-sm font-medium text-foreground mb-2">Time Slot *</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
                      {TIME_SLOTS.map((slot) => (
                        <TouchableOpacity
                          key={slot}
                          onPress={() => setSelectedTimeSlot(slot)}
                          className={`px-4 py-2 rounded-full ${
                            selectedTimeSlot === slot ? "bg-primary" : "bg-surface"
                          }`}
                          style={{ borderWidth: 1, borderColor: colors.border }}
                        >
                          <Text
                            className={`text-sm font-medium ${
                              selectedTimeSlot === slot ? "text-white" : "text-foreground"
                            }`}
                          >
                            {slot}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>

                  {/* Reason */}
                  <View>
                    <Text className="text-sm font-medium text-foreground mb-2">Reason *</Text>
                    <TextInput
                      value={bookingReason}
                      onChangeText={setBookingReason}
                      placeholder="Briefly explain why you need this consultation..."
                      placeholderTextColor={colors.muted}
                      className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                    />
                  </View>
                </View>
              </ScrollView>

              <TouchableOpacity
                onPress={submitBookingRequest}
                disabled={submittingBooking}
                className="bg-primary rounded-xl py-4 items-center mt-4"
                style={{ opacity: submittingBooking ? 0.5 : 1 }}
              >
                <Text className="text-white font-semibold text-base">
                  {submittingBooking ? "Submitting..." : "Submit Request"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScreenContainer>
        </Modal>
      </View>
    </ScreenContainer>
  );
}
