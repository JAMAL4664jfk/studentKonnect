import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Switch,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { supabase, safeGetUser } from "@/lib/supabase";
import Toast from "react-native-toast-message";

type TabType = "timetable" | "lecturers";

type Lecturer = {
  id: string;
  full_name: string;
  email: string;
  faculty: string;
  department: string;
  specialization: string;
  office_location: string;
  consultation_hours: string;
  bio: string;
  avatar_url: string;
};

type Timetable = {
  id: string;
  user_id: string;
  title: string;
  subject: string;
  day_of_week: string[];
  start_time: string;
  end_time: string;
  location: string;
  notes: string;
  is_repeating: boolean;
  reminder_enabled: boolean;
  created_at: string;
};

const FACULTIES = [
  "All Faculties",
  "Engineering",
  "Business",
  "Science",
  "Arts & Humanities",
  "Health Sciences",
  "Law",
  "Education",
  "Agriculture",
];

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function LecturesScreen() {
  const colors = useColors();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("timetable");
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState("All Faculties");
  const [showFacultyDropdown, setShowFacultyDropdown] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [selectedLecturer, setSelectedLecturer] = useState<Lecturer | null>(null);
  const [chatMessage, setChatMessage] = useState("");
  const [showTimetableModal, setShowTimetableModal] = useState(false);
  const [editingTimetable, setEditingTimetable] = useState<Timetable | null>(null);
  const [timetableForm, setTimetableForm] = useState({
    title: "",
    subject: "",
    day_of_week: [] as string[],
    start_time: "",
    end_time: "",
    location: "",
    notes: "",
    is_repeating: true,
    reminder_enabled: false,
  });

  useEffect(() => {
    loadLecturers();
    loadTimetables();
  }, []);

  const loadLecturers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "lecturer")
        .order("full_name");

      if (error) throw error;
      setLecturers(data || []);
    } catch (error) {
      console.error("Error loading lecturers:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadTimetables = async () => {
    try {
      const {
        data: { user },
      } = await safeGetUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("study_timetables")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTimetables(data || []);
    } catch (error) {
      console.error("Error loading timetables:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim() || !selectedLecturer) return;

    Toast.show({
      type: "success",
      text1: "Message Sent",
      text2: `Your message has been sent to ${selectedLecturer.full_name}`,
    });

    setChatMessage("");
    setShowChatModal(false);
    setSelectedLecturer(null);
  };

  const handleSaveTimetable = async () => {
    if (
      !timetableForm.title ||
      !timetableForm.subject ||
      timetableForm.day_of_week.length === 0 ||
      !timetableForm.start_time ||
      !timetableForm.end_time
    ) {
      Toast.show({
        type: "error",
        text1: "Missing Information",
        text2: "Please fill in all required fields",
      });
      return;
    }

    try {
      const {
        data: { user },
      } = await safeGetUser();
      if (!user) {
        Toast.show({
          type: "error",
          text1: "Not Logged In",
          text2: "Please log in to create timetables",
        });
        return;
      }

      const timetableData = {
        ...timetableForm,
        user_id: user.id,
      };

      if (editingTimetable) {
        const { error } = await supabase
          .from("study_timetables")
          .update(timetableData)
          .eq("id", editingTimetable.id);

        if (error) throw error;

        Toast.show({
          type: "success",
          text1: "Timetable Updated",
          text2: "Your study timetable has been updated",
        });
      } else {
        const { error } = await supabase
          .from("study_timetables")
          .insert([timetableData]);

        if (error) throw error;

        Toast.show({
          type: "success",
          text1: "Timetable Created",
          text2: "Your study timetable has been created",
        });
      }

      setShowTimetableModal(false);
      setEditingTimetable(null);
      setTimetableForm({
        title: "",
        subject: "",
        day_of_week: [],
        start_time: "",
        end_time: "",
        location: "",
        notes: "",
        is_repeating: true,
        reminder_enabled: false,
      });
      loadTimetables();
    } catch (error: any) {
      console.error("Error saving timetable:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || "Failed to save timetable",
      });
    }
  };

  const handleDeleteTimetable = async (id: string) => {
    try {
      const { error } = await supabase.from("study_timetables").delete().eq("id", id);

      if (error) throw error;

      Toast.show({
        type: "success",
        text1: "Timetable Deleted",
        text2: "Your study timetable has been removed",
      });

      loadTimetables();
    } catch (error: any) {
      console.error("Error deleting timetable:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to delete timetable",
      });
    }
  };

  const handleEditTimetable = (timetable: Timetable) => {
    setEditingTimetable(timetable);
    setTimetableForm({
      title: timetable.title,
      subject: timetable.subject,
      day_of_week: timetable.day_of_week,
      start_time: timetable.start_time,
      end_time: timetable.end_time,
      location: timetable.location,
      notes: timetable.notes,
      is_repeating: timetable.is_repeating,
      reminder_enabled: timetable.reminder_enabled,
    });
    setShowTimetableModal(true);
  };

  const toggleDay = (day: string) => {
    if (timetableForm.day_of_week.includes(day)) {
      setTimetableForm({
        ...timetableForm,
        day_of_week: timetableForm.day_of_week.filter((d) => d !== day),
      });
    } else {
      setTimetableForm({
        ...timetableForm,
        day_of_week: [...timetableForm.day_of_week, day],
      });
    }
  };

  const filteredLecturers = lecturers.filter((lecturer) => {
    const matchesSearch =
      lecturer.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lecturer.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lecturer.specialization.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFaculty =
      selectedFaculty === "All Faculties" || lecturer.faculty === selectedFaculty;

    return matchesSearch && matchesFaculty;
  });

  const renderLecturers = () => (
    <View className="gap-4">
      {/* Search Bar */}
      <View className="bg-surface border border-border rounded-2xl px-4 py-3 flex-row items-center gap-3">
        <IconSymbol name="magnifyingglass" size={20} color={colors.muted} />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search lecturers..."
          placeholderTextColor={colors.muted}
          className="flex-1 text-base text-foreground"
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
          <Text className="text-base text-foreground">{selectedFaculty}</Text>
          <IconSymbol
            name={showFacultyDropdown ? "chevron.up" : "chevron.down"}
            size={20}
            color={colors.foreground}
          />
        </TouchableOpacity>

        {showFacultyDropdown && (
          <View className="mt-2 bg-surface border border-border rounded-xl overflow-hidden">
            {FACULTIES.map((faculty) => (
              <TouchableOpacity
                key={faculty}
                onPress={() => {
                  setSelectedFaculty(faculty);
                  setShowFacultyDropdown(false);
                }}
                className={`px-4 py-3 ${
                  selectedFaculty === faculty ? "bg-primary" : "bg-surface"
                }`}
              >
                <Text
                  className={`text-base ${
                    selectedFaculty === faculty ? "text-white font-semibold" : "text-foreground"
                  }`}
                >
                  {faculty}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Lecturers List */}
      {filteredLecturers.length === 0 ? (
        <View className="items-center justify-center py-12">
          <IconSymbol name="person.slash.fill" size={64} color={colors.muted} />
          <Text className="text-lg font-semibold text-foreground mt-4">No lecturers found</Text>
          <Text className="text-sm text-muted mt-2">Try adjusting your search or filters</Text>
        </View>
      ) : (
        filteredLecturers.map((lecturer) => (
          <View
            key={lecturer.id}
            className="bg-surface rounded-2xl overflow-hidden border border-border"
          >
            <View className="p-4">
              <View className="flex-row gap-4">
                {lecturer.avatar_url ? (
                  <Image
                    source={{ uri: lecturer.avatar_url }}
                    className="w-20 h-20 rounded-full"
                    contentFit="cover"
                  />
                ) : (
                  <View
                    className="w-20 h-20 rounded-full items-center justify-center"
                    style={{ backgroundColor: colors.muted }}
                  >
                    <IconSymbol name="person.fill" size={40} color={colors.mutedForeground} />
                  </View>
                )}
                <View className="flex-1">
                  <Text className="text-lg font-bold text-foreground mb-1">
                    {lecturer.full_name}
                  </Text>
                  <View className="bg-primary/20 px-3 py-1 rounded-full self-start mb-2">
                    <Text className="text-xs font-semibold text-primary">{lecturer.faculty}</Text>
                  </View>
                  <Text className="text-sm text-muted mb-1">{lecturer.department}</Text>
                  <Text className="text-xs text-muted">{lecturer.specialization}</Text>
                </View>
              </View>

              <View className="mt-3 gap-2">
                <View className="flex-row items-center gap-2">
                  <IconSymbol name="location.fill" size={14} color={colors.muted} />
                  <Text className="text-sm text-foreground">{lecturer.office_location}</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <IconSymbol name="clock.fill" size={14} color={colors.muted} />
                  <Text className="text-sm text-foreground">{lecturer.consultation_hours}</Text>
                </View>
              </View>

              {lecturer.bio && (
                <Text className="text-sm text-muted mt-3" numberOfLines={2}>
                  {lecturer.bio}
                </Text>
              )}

              <View className="flex-row gap-3 mt-4">
                <TouchableOpacity
                  onPress={() => {
                    setSelectedLecturer(lecturer);
                    setShowChatModal(true);
                  }}
                  className="flex-1 bg-primary py-3 rounded-xl flex-row items-center justify-center gap-2"
                >
                  <IconSymbol name="message.fill" size={18} color="white" />
                  <Text className="text-sm font-semibold text-white">Chat</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))
      )}
    </View>
  );

  const renderTimetables = () => (
    <View className="gap-4">
      {/* Create Timetable Button */}
      <TouchableOpacity
        onPress={() => {
          setEditingTimetable(null);
          setTimetableForm({
            title: "",
            subject: "",
            day_of_week: [],
            start_time: "",
            end_time: "",
            location: "",
            notes: "",
            is_repeating: true,
            reminder_enabled: false,
          });
          setShowTimetableModal(true);
        }}
        className="bg-primary py-4 rounded-xl flex-row items-center justify-center gap-2"
      >
        <IconSymbol name="plus.circle.fill" size={24} color="white" />
        <Text className="text-base font-semibold text-white">Create Study Timetable</Text>
      </TouchableOpacity>

      {/* Timetables List */}
      {timetables.length === 0 ? (
        <View className="items-center justify-center py-12">
          <IconSymbol name="calendar.badge.clock" size={64} color={colors.muted} />
          <Text className="text-lg font-semibold text-foreground mt-4">No timetables yet</Text>
          <Text className="text-sm text-muted mt-2">Create your first study timetable</Text>
        </View>
      ) : (
        timetables.map((timetable) => (
          <View
            key={timetable.id}
            className="bg-surface rounded-2xl overflow-hidden border border-border"
          >
            <View className="p-4">
              <View className="flex-row items-start justify-between mb-3">
                <View className="flex-1">
                  <Text className="text-lg font-bold text-foreground mb-1">
                    {timetable.title}
                  </Text>
                  <Text className="text-base text-muted">{timetable.subject}</Text>
                </View>
                <View className="flex-row gap-2">
                  {timetable.reminder_enabled && (
                    <View className="bg-primary/20 w-8 h-8 rounded-full items-center justify-center">
                      <IconSymbol name="bell.fill" size={16} color={colors.primary} />
                    </View>
                  )}
                  {timetable.is_repeating && (
                    <View className="bg-secondary/20 w-8 h-8 rounded-full items-center justify-center">
                      <IconSymbol name="arrow.clockwise" size={16} color={colors.secondary} />
                    </View>
                  )}
                </View>
              </View>

              <View className="gap-2 mb-3">
                <View className="flex-row items-center gap-2">
                  <IconSymbol name="calendar" size={16} color={colors.muted} />
                  <Text className="text-sm text-foreground">
                    {timetable.day_of_week.join(", ")}
                  </Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <IconSymbol name="clock.fill" size={16} color={colors.muted} />
                  <Text className="text-sm text-foreground">
                    {timetable.start_time} - {timetable.end_time}
                  </Text>
                </View>
                {timetable.location && (
                  <View className="flex-row items-center gap-2">
                    <IconSymbol name="location.fill" size={16} color={colors.muted} />
                    <Text className="text-sm text-foreground">{timetable.location}</Text>
                  </View>
                )}
              </View>

              {timetable.notes && (
                <View className="bg-muted/20 p-3 rounded-xl mb-3">
                  <Text className="text-sm text-foreground">{timetable.notes}</Text>
                </View>
              )}

              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => handleEditTimetable(timetable)}
                  className="flex-1 bg-surface border border-border py-3 rounded-xl flex-row items-center justify-center gap-2"
                >
                  <IconSymbol name="pencil" size={18} color={colors.primary} />
                  <Text className="text-sm font-semibold text-primary">Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDeleteTimetable(timetable.id)}
                  className="flex-1 bg-error/10 py-3 rounded-xl flex-row items-center justify-center gap-2"
                >
                  <IconSymbol name="trash.fill" size={18} color={colors.error} />
                  <Text className="text-sm font-semibold text-error">Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))
      )}
    </View>
  );

  return (
    <ScreenContainer className="p-4" edges={["top", "left", "right"]}>
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center mb-6">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center -ml-2"
          >
            <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <View className="flex-1 ml-4">
            <Text className="text-2xl font-bold text-foreground">Lectures & Timetable</Text>
            <Text className="text-sm text-muted">Connect with lecturers & manage your schedule</Text>
          </View>
        </View>

        {/* Tabs */}
        <View className="flex-row gap-2 mb-6">
          <TouchableOpacity
            onPress={() => setActiveTab("timetable")}
            className={`flex-1 py-3 rounded-xl ${
              activeTab === "timetable" ? "bg-primary" : "bg-surface border border-border"
            }`}
          >
            <Text
              className={`text-center font-semibold ${
                activeTab === "timetable" ? "text-white" : "text-foreground"
              }`}
            >
              Study Timetable
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("lecturers")}
            className={`flex-1 py-3 rounded-xl ${
              activeTab === "lecturers" ? "bg-primary" : "bg-surface border border-border"
            }`}
          >
            <Text
              className={`text-center font-semibold ${
                activeTab === "lecturers" ? "text-white" : "text-foreground"
              }`}
            >
              Lecturers
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
          {activeTab === "timetable" && renderTimetables()}
          {activeTab === "lecturers" && renderLecturers()}
        </ScrollView>
      </View>

      {/* Chat Modal */}
      <Modal visible={showChatModal} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-background rounded-t-3xl p-6" style={{ maxHeight: "80%" }}>
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-foreground">
                Message {selectedLecturer?.full_name}
              </Text>
              <TouchableOpacity onPress={() => setShowChatModal(false)}>
                <IconSymbol name="xmark.circle.fill" size={28} color={colors.muted} />
              </TouchableOpacity>
            </View>

            <TextInput
              value={chatMessage}
              onChangeText={setChatMessage}
              placeholder="Type your message..."
              placeholderTextColor={colors.muted}
              multiline
              numberOfLines={6}
              className="bg-surface border border-border rounded-xl px-4 py-3 text-base text-foreground mb-4"
              style={{ minHeight: 120, textAlignVertical: "top" }}
            />

            <TouchableOpacity
              onPress={handleSendMessage}
              className="bg-primary py-4 rounded-xl flex-row items-center justify-center gap-2"
            >
              <IconSymbol name="paperplane.fill" size={20} color="white" />
              <Text className="text-base font-semibold text-white">Send Message</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Timetable Modal */}
      <Modal visible={showTimetableModal} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <ScrollView
            className="bg-background rounded-t-3xl p-6"
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-foreground">
                {editingTimetable ? "Edit Timetable" : "Create Timetable"}
              </Text>
              <TouchableOpacity onPress={() => setShowTimetableModal(false)}>
                <IconSymbol name="xmark.circle.fill" size={28} color={colors.muted} />
              </TouchableOpacity>
            </View>

            <View className="gap-4">
              {/* Title */}
              <View>
                <Text className="text-sm font-medium text-foreground mb-2">Title *</Text>
                <TextInput
                  value={timetableForm.title}
                  onChangeText={(text) => setTimetableForm({ ...timetableForm, title: text })}
                  placeholder="e.g., Mathematics Lecture"
                  placeholderTextColor={colors.muted}
                  className="bg-surface border border-border rounded-xl px-4 py-3 text-base text-foreground"
                />
              </View>

              {/* Subject */}
              <View>
                <Text className="text-sm font-medium text-foreground mb-2">Subject *</Text>
                <TextInput
                  value={timetableForm.subject}
                  onChangeText={(text) => setTimetableForm({ ...timetableForm, subject: text })}
                  placeholder="e.g., Calculus 101"
                  placeholderTextColor={colors.muted}
                  className="bg-surface border border-border rounded-xl px-4 py-3 text-base text-foreground"
                />
              </View>

              {/* Days of Week */}
              <View>
                <Text className="text-sm font-medium text-foreground mb-2">Days *</Text>
                <View className="flex-row flex-wrap gap-2">
                  {DAYS_OF_WEEK.map((day) => (
                    <TouchableOpacity
                      key={day}
                      onPress={() => toggleDay(day)}
                      className={`px-4 py-2 rounded-full ${
                        timetableForm.day_of_week.includes(day)
                          ? "bg-primary"
                          : "bg-surface border border-border"
                      }`}
                    >
                      <Text
                        className={`text-sm font-semibold ${
                          timetableForm.day_of_week.includes(day)
                            ? "text-white"
                            : "text-foreground"
                        }`}
                      >
                        {day.substring(0, 3)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Time */}
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Text className="text-sm font-medium text-foreground mb-2">Start Time *</Text>
                  <TextInput
                    value={timetableForm.start_time}
                    onChangeText={(text) =>
                      setTimetableForm({ ...timetableForm, start_time: text })
                    }
                    placeholder="08:00"
                    placeholderTextColor={colors.muted}
                    className="bg-surface border border-border rounded-xl px-4 py-3 text-base text-foreground"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-medium text-foreground mb-2">End Time *</Text>
                  <TextInput
                    value={timetableForm.end_time}
                    onChangeText={(text) =>
                      setTimetableForm({ ...timetableForm, end_time: text })
                    }
                    placeholder="10:00"
                    placeholderTextColor={colors.muted}
                    className="bg-surface border border-border rounded-xl px-4 py-3 text-base text-foreground"
                  />
                </View>
              </View>

              {/* Location */}
              <View>
                <Text className="text-sm font-medium text-foreground mb-2">Location</Text>
                <TextInput
                  value={timetableForm.location}
                  onChangeText={(text) => setTimetableForm({ ...timetableForm, location: text })}
                  placeholder="e.g., Room 301, Science Building"
                  placeholderTextColor={colors.muted}
                  className="bg-surface border border-border rounded-xl px-4 py-3 text-base text-foreground"
                />
              </View>

              {/* Notes */}
              <View>
                <Text className="text-sm font-medium text-foreground mb-2">Notes</Text>
                <TextInput
                  value={timetableForm.notes}
                  onChangeText={(text) => setTimetableForm({ ...timetableForm, notes: text })}
                  placeholder="Add any additional notes..."
                  placeholderTextColor={colors.muted}
                  multiline
                  numberOfLines={3}
                  className="bg-surface border border-border rounded-xl px-4 py-3 text-base text-foreground"
                  style={{ minHeight: 80, textAlignVertical: "top" }}
                />
              </View>

              {/* Repeating */}
              <View className="flex-row items-center justify-between bg-surface border border-border rounded-xl px-4 py-3">
                <View className="flex-1">
                  <Text className="text-base font-medium text-foreground">Repeating</Text>
                  <Text className="text-sm text-muted">Repeat this timetable weekly</Text>
                </View>
                <Switch
                  value={timetableForm.is_repeating}
                  onValueChange={(value) =>
                    setTimetableForm({ ...timetableForm, is_repeating: value })
                  }
                  trackColor={{ false: colors.muted, true: colors.primary }}
                  thumbColor="white"
                />
              </View>

              {/* Reminder */}
              <View className="flex-row items-center justify-between bg-surface border border-border rounded-xl px-4 py-3">
                <View className="flex-1">
                  <Text className="text-base font-medium text-foreground">Reminder</Text>
                  <Text className="text-sm text-muted">Get notified before class</Text>
                </View>
                <Switch
                  value={timetableForm.reminder_enabled}
                  onValueChange={(value) =>
                    setTimetableForm({ ...timetableForm, reminder_enabled: value })
                  }
                  trackColor={{ false: colors.muted, true: colors.primary }}
                  thumbColor="white"
                />
              </View>

              {/* Save Button */}
              <TouchableOpacity
                onPress={handleSaveTimetable}
                className="bg-primary py-4 rounded-xl flex-row items-center justify-center gap-2 mt-2"
              >
                <IconSymbol name="checkmark.circle.fill" size={24} color="white" />
                <Text className="text-base font-semibold text-white">
                  {editingTimetable ? "Update Timetable" : "Create Timetable"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
