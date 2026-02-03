import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput, ActivityIndicator, ImageBackground } from "react-native";
import { Image } from "expo-image";
import { useState } from "react";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import Toast from "react-native-toast-message";
import { LinearGradient } from "expo-linear-gradient";
import { AICounselorChat } from "@/components/AICounselorChat";
import { YogaExercisesSection } from "@/components/YogaExercisesSection";
import { WellnessLibrary } from "@/components/WellnessLibrary";

type CounselingType = "mental" | "financial" | "academic" | "bereavement";
type SectionType = "yoga" | "library" | "meditation" | "tracking" | "crisis" | null;

export default function WellnessScreen() {
  const colors = useColors();
  const router = useRouter();
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedCounseling, setSelectedCounseling] = useState<CounselingType | null>(null);
  const [bookingForm, setBookingForm] = useState({
    preferredDate: "",
    preferredTime: "",
    sessionType: "virtual",
    reason: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [showCounselor, setShowCounselor] = useState<CounselingType | null>(null);
  const [selectedSection, setSelectedSection] = useState<SectionType>(null);

  const handleBookCounseling = (type: CounselingType) => {
    setShowCounselor(type);
  };

  const handleSubmitBooking = async () => {
    if (!bookingForm.preferredDate || !bookingForm.preferredTime || !bookingForm.reason) {
      Toast.show({
        type: "error",
        text1: "Missing Information",
        text2: "Please fill in all required fields",
      });
      return;
    }

    setSubmitting(true);
    
    // Simulate booking submission
    setTimeout(() => {
      setSubmitting(false);
      setShowBookingModal(false);
      setBookingForm({
        preferredDate: "",
        preferredTime: "",
        sessionType: "virtual",
        reason: "",
      });
      
      Toast.show({
        type: "success",
        text1: "Booking Confirmed",
        text2: "Your counseling session has been scheduled",
      });
    }, 1500);
  };

  const counselingOptions = [
    {
      type: "mental" as CounselingType,
      title: "Mental Health Counseling",
      description: "Professional support for stress, anxiety, and mental wellbeing",
      icon: "heart.fill",
      color: "#ec4899",
    },
    {
      type: "financial" as CounselingType,
      title: "Financial Counseling",
      description: "Guidance on budgeting, savings, and financial planning",
      icon: "dollarsign.circle.fill",
      color: "#10b981",
    },
    {
      type: "academic" as CounselingType,
      title: "Academic Counseling",
      description: "Support for study strategies, time management, and academic success",
      icon: "graduation.cap.fill",
      color: "#3b82f6",
    },
    {
      type: "bereavement" as CounselingType,
      title: "Bereavement Support",
      description: "Compassionate support during difficult times of loss",
      icon: "heart.fill",
      color: "#8b5cf6",
    },
  ];

  const wellnessResources = [
    {
      id: "library",
      title: "Mental Health Library",
      description: "Articles and resources on mental wellness",
      icon: "book.fill",
      thumbnail: "https://via.placeholder.com/300x200/6366F1/FFFFFF?text=Library",
    },
    {
      id: "yoga",
      title: "Yoga & Exercises",
      description: "Video tutorials for stress relief and fitness",
      icon: "figure.walk",
      thumbnail: "https://via.placeholder.com/300x200/EC4899/FFFFFF?text=Yoga",
      videos: [
        {
          id: "1",
          title: "Morning Yoga Routine",
          duration: "15 min",
          thumbnail: "https://via.placeholder.com/300x200/EC4899/FFFFFF?text=Morning+Yoga",
          url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        },
        {
          id: "2",
          title: "Stress Relief Exercises",
          duration: "10 min",
          thumbnail: "https://via.placeholder.com/300x200/8B5CF6/FFFFFF?text=Stress+Relief",
          url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        },
      ],
    },
    {
      id: "meditation",
      title: "Meditation & Mindfulness",
      description: "Guided meditation and relaxation exercises",
      icon: "brain",
      thumbnail: "https://via.placeholder.com/300x200/10B981/FFFFFF?text=Meditation",
      videos: [
        {
          id: "3",
          title: "5-Minute Mindfulness",
          duration: "5 min",
          thumbnail: "https://via.placeholder.com/300x200/10B981/FFFFFF?text=Mindfulness",
          url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        },
      ],
    },
    {
      id: "tracking",
      title: "Wellness Tracking",
      description: "Track your mood and mental health progress",
      icon: "chart.bar.fill",
      thumbnail: "https://via.placeholder.com/300x200/F59E0B/FFFFFF?text=Tracking",
    },
  ];

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      <ImageBackground
        source={require("@/assets/images/mental-health-counselling.jpg")}
        className="flex-1"
        resizeMode="cover"
      >
        <LinearGradient
          colors={["rgba(0,0,0,0.7)", "rgba(0,0,0,0.85)"]}
          className="flex-1"
        >
          <ScrollView className="flex-1 p-4">
        <View className="gap-6">
          {/* Header */}
          <View className="flex-row items-center gap-4">
            <TouchableOpacity onPress={() => router.back()}>
              <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-foreground">Wellness Support</Text>
              <Text className="text-sm text-muted">Your mental health matters</Text>
            </View>
          </View>

          {/* Hero Card */}
          <View
            className="bg-primary rounded-2xl p-6"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <IconSymbol name="heart.fill" size={48} color="white" />
            <Text className="text-white text-2xl font-bold mt-4 mb-2">
              We're Here for You
            </Text>
            <Text className="text-white text-base opacity-90">
              Access professional counseling, mental health resources, and wellness support
            </Text>
          </View>

          {/* Counseling Services */}
          <View className="gap-3">
            <Text className="text-xl font-bold text-foreground">Counseling Services</Text>
            <View className="flex-row flex-wrap gap-3">
              {counselingOptions.map((option) => (
                <TouchableOpacity
                  key={option.type}
                  onPress={() => handleBookCounseling(option.type)}
                  className="bg-surface rounded-2xl p-3 border border-border active:opacity-70"
                  style={{
                    width: "48%",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                >
                  <View className="items-center gap-2">
                    <View
                      className="w-12 h-12 rounded-full items-center justify-center"
                      style={{ backgroundColor: option.color + "20" }}
                    >
                      <IconSymbol name={option.icon} size={24} color={option.color} />
                    </View>
                    <Text className="text-sm font-semibold text-foreground text-center">
                      {option.title.replace(" Counseling", "").replace(" Support", "")}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Wellness Resources */}
          <View className="gap-3">
            <Text className="text-xl font-bold text-foreground mb-2">Wellness Resources</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="-mx-4 px-4 mb-4"
              contentContainerStyle={{ gap: 12, paddingRight: 16 }}
            >
              {wellnessResources.map((resource) => (
                <TouchableOpacity
                  key={resource.id}
                  onPress={() => setSelectedSection(resource.id as SectionType)}
                  className="bg-surface rounded-2xl overflow-hidden border border-border active:opacity-70"
                  style={{
                    width: 280,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                >
                  {resource.thumbnail ? (
                    <Image
                      source={{ uri: resource.thumbnail }}
                      style={{ width: "100%", height: 140 }}
                      contentFit="cover"
                      cachePolicy="memory-disk"
                      transition={200}
                    />
                  ) : (
                    <View className="w-full h-36 bg-muted items-center justify-center">
                      <IconSymbol name={resource.icon} size={48} color={colors.mutedForeground} />
                    </View>
                  )}
                  <View className="p-4">
                    <View className="flex-row items-center gap-2 mb-2">
                      <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center">
                        <IconSymbol name={resource.icon} size={16} color={colors.primary} />
                      </View>
                      <Text className="text-base font-semibold text-foreground flex-1" numberOfLines={1}>
                        {resource.title}
                      </Text>
                    </View>
                    <Text className="text-sm text-muted-foreground" numberOfLines={2}>{resource.description}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Emergency Support */}
          <View
            className="bg-error rounded-2xl p-6"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Text className="text-white text-xl font-bold mb-2">Crisis Support</Text>
            <Text className="text-white text-base opacity-90 mb-4">
              If you're in crisis or need immediate help, please reach out:
            </Text>
            <TouchableOpacity className="bg-white rounded-xl p-4 active:opacity-70">
              <Text className="text-error text-center font-bold text-lg">
                Call 24/7 Helpline: 0800 567 567
              </Text>
            </TouchableOpacity>
          </View>
        </View>
          </ScrollView>

      {/* Booking Modal */}
      <Modal
        visible={showBookingModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowBookingModal(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View
            className="bg-background rounded-t-3xl p-6"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="gap-4">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-2xl font-bold text-foreground">
                    Book Counseling Session
                  </Text>
                  <TouchableOpacity onPress={() => setShowBookingModal(false)}>
                    <IconSymbol name="xmark.circle.fill" size={28} color={colors.muted} />
                  </TouchableOpacity>
                </View>

                <Text className="text-base text-muted mb-4">
                  {selectedCounseling &&
                    counselingOptions.find((o) => o.type === selectedCounseling)?.title}
                </Text>

                <View className="gap-3">
                  <View>
                    <Text className="text-sm font-medium text-foreground mb-2">
                      Preferred Date
                    </Text>
                    <TextInput
                      className="bg-surface border border-border rounded-xl p-4 text-foreground"
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor={colors.muted}
                      value={bookingForm.preferredDate}
                      onChangeText={(text) =>
                        setBookingForm({ ...bookingForm, preferredDate: text })
                      }
                    />
                  </View>

                  <View>
                    <Text className="text-sm font-medium text-foreground mb-2">
                      Preferred Time
                    </Text>
                    <TextInput
                      className="bg-surface border border-border rounded-xl p-4 text-foreground"
                      placeholder="HH:MM"
                      placeholderTextColor={colors.muted}
                      value={bookingForm.preferredTime}
                      onChangeText={(text) =>
                        setBookingForm({ ...bookingForm, preferredTime: text })
                      }
                    />
                  </View>

                  <View>
                    <Text className="text-sm font-medium text-foreground mb-2">
                      Session Type
                    </Text>
                    <View className="flex-row gap-2">
                      {["virtual", "in-person"].map((type) => (
                        <TouchableOpacity
                          key={type}
                          onPress={() =>
                            setBookingForm({ ...bookingForm, sessionType: type })
                          }
                          className={`flex-1 px-4 py-3 rounded-xl ${
                            bookingForm.sessionType === type
                              ? "bg-primary"
                              : "bg-surface border border-border"
                          }`}
                        >
                          <Text
                            className={`text-center font-medium ${
                              bookingForm.sessionType === type
                                ? "text-white"
                                : "text-foreground"
                            }`}
                          >
                            {type === "virtual" ? "Virtual" : "In-Person"}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View>
                    <Text className="text-sm font-medium text-foreground mb-2">
                      Reason for Session
                    </Text>
                    <TextInput
                      className="bg-surface border border-border rounded-xl p-4 text-foreground"
                      placeholder="Brief description of what you'd like to discuss"
                      placeholderTextColor={colors.muted}
                      value={bookingForm.reason}
                      onChangeText={(text) =>
                        setBookingForm({ ...bookingForm, reason: text })
                      }
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                    />
                  </View>

                  <TouchableOpacity
                    onPress={handleSubmitBooking}
                    disabled={submitting}
                    className="bg-primary rounded-xl p-4 items-center active:opacity-70 mt-2"
                    style={{ opacity: submitting ? 0.5 : 1 }}
                  >
                    {submitting ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Text className="text-white text-base font-semibold">
                        Confirm Booking
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* AI Counselor Modal */}
      <Modal
        visible={showCounselor !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCounselor(null)}
      >
        {showCounselor && (
          <AICounselorChat
            counselorType={showCounselor}
            title={
              counselingOptions.find((o) => o.type === showCounselor)?.title || ""
            }
            onClose={() => setShowCounselor(null)}
          />
        )}
      </Modal>

      {/* Yoga Exercises Modal */}
      <Modal
        visible={selectedSection === "yoga"}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedSection(null)}
      >
        <View className="flex-1 bg-background">
          <View
            className="flex-row items-center gap-3 px-4 py-3 border-b"
            style={{ borderBottomColor: colors.border }}
          >
            <TouchableOpacity onPress={() => setSelectedSection(null)}>
              <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
            </TouchableOpacity>
            <Text className="text-lg font-bold text-foreground">
              Yoga & Exercises
            </Text>
          </View>
          <YogaExercisesSection />
        </View>
      </Modal>

      {/* Wellness Library Modal */}
      <Modal
        visible={selectedSection === "library"}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedSection(null)}
      >
        <View className="flex-1 bg-background">
          <View
            className="flex-row items-center gap-3 px-4 py-3 border-b"
            style={{ borderBottomColor: colors.border }}
          >
            <TouchableOpacity onPress={() => setSelectedSection(null)}>
              <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
            </TouchableOpacity>
            <Text className="text-lg font-bold text-foreground">
              Mental Health Library
            </Text>
          </View>
          <WellnessLibrary />
        </View>
      </Modal>
        </LinearGradient>
      </ImageBackground>
    </ScreenContainer>
  );
}
