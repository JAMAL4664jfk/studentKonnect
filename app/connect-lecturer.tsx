import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import Toast from "react-native-toast-message";

const FACULTIES = [
  { id: "engineering", name: "Engineering", icon: "gearshape.fill", color: "#3b82f6" },
  { id: "science", name: "Science", icon: "atom", color: "#10b981" },
  { id: "commerce", name: "Commerce", icon: "chart.bar.fill", color: "#f59e0b" },
  { id: "humanities", name: "Humanities", icon: "book.fill", color: "#8b5cf6" },
  { id: "health", name: "Health Sciences", icon: "cross.case.fill", color: "#ef4444" },
  { id: "law", name: "Law", icon: "scale.3d", color: "#6366f1" },
  { id: "education", name: "Education", icon: "graduationcap.fill", color: "#ec4899" },
  { id: "arts", name: "Arts & Design", icon: "paintpalette.fill", color: "#f43f5e" },
];

const SAMPLE_LECTURERS = [
  {
    id: "1",
    name: "Prof. Sarah Nkosi",
    faculty: "engineering",
    department: "Computer Science",
    subjects: ["Data Structures", "Algorithms", "AI"],
    availability: "Mon-Fri, 9AM-5PM",
    photo: "https://i.pravatar.cc/150?img=1",
    rating: 4.8,
  },
  {
    id: "2",
    name: "Dr. Michael van der Merwe",
    faculty: "science",
    department: "Physics",
    subjects: ["Quantum Mechanics", "Thermodynamics"],
    availability: "Tue-Thu, 10AM-4PM",
    photo: "https://i.pravatar.cc/150?img=12",
    rating: 4.9,
  },
  {
    id: "3",
    name: "Dr. Thandiwe Dlamini",
    faculty: "commerce",
    department: "Accounting",
    subjects: ["Financial Accounting", "Auditing"],
    availability: "Mon-Wed, 8AM-2PM",
    photo: "https://i.pravatar.cc/150?img=5",
    rating: 4.7,
  },
  {
    id: "4",
    name: "Prof. James Smith",
    faculty: "humanities",
    department: "Psychology",
    subjects: ["Cognitive Psychology", "Research Methods"],
    availability: "Mon-Fri, 11AM-3PM",
    photo: "https://i.pravatar.cc/150?img=15",
    rating: 4.6,
  },
];

export default function ConnectLecturerScreen() {
  const colors = useColors();
  const router = useRouter();
  
  const [selectedFaculty, setSelectedFaculty] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [lecturers, setLecturers] = useState(SAMPLE_LECTURERS);
  const [loading, setLoading] = useState(false);

  const filteredLecturers = lecturers.filter((lecturer) => {
    const matchesFaculty = !selectedFaculty || lecturer.faculty === selectedFaculty;
    const matchesSearch =
      !searchQuery ||
      lecturer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lecturer.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lecturer.subjects.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFaculty && matchesSearch;
  });

  const handleConnect = (lecturer: typeof SAMPLE_LECTURERS[0]) => {
    Toast.show({
      type: "success",
      text1: "Connection Request Sent",
      text2: `${lecturer.name} will respond soon`,
    });
  };

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={["#6366f1", "#4f46e5", "#4338ca"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={24} color="white" />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text style={styles.headerEmoji}>👨‍🏫</Text>
            <Text style={styles.headerTitle}>Connect to Lecturer</Text>
            <Text style={styles.headerSubtitle}>
              Get help from your faculty lecturers
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Search */}
          <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
            <IconSymbol name="magnifyingglass" size={20} color={colors.mutedForeground} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by name, department, or subject..."
              placeholderTextColor={colors.mutedForeground}
              style={[styles.searchInput, { color: colors.foreground }]}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <IconSymbol name="xmark.circle.fill" size={20} color={colors.mutedForeground} />
              </TouchableOpacity>
            )}
          </View>

          {/* Faculties */}
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Select Faculty
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.facultiesScroll}>
            <TouchableOpacity
              onPress={() => setSelectedFaculty(null)}
              style={[
                styles.facultyChip,
                {
                  backgroundColor: !selectedFaculty ? "#6366f1" : colors.surface,
                  borderColor: !selectedFaculty ? "#6366f1" : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.facultyText,
                  { color: !selectedFaculty ? "white" : colors.foreground },
                ]}
              >
                All
              </Text>
            </TouchableOpacity>

            {FACULTIES.map((faculty) => (
              <TouchableOpacity
                key={faculty.id}
                onPress={() => setSelectedFaculty(faculty.id)}
                style={[
                  styles.facultyChip,
                  {
                    backgroundColor:
                      selectedFaculty === faculty.id ? faculty.color : colors.surface,
                    borderColor:
                      selectedFaculty === faculty.id ? faculty.color : colors.border,
                  },
                ]}
              >
                <IconSymbol
                  name={faculty.icon as any}
                  size={16}
                  color={selectedFaculty === faculty.id ? "white" : colors.foreground}
                />
                <Text
                  style={[
                    styles.facultyText,
                    {
                      color: selectedFaculty === faculty.id ? "white" : colors.foreground,
                    },
                  ]}
                >
                  {faculty.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Lecturers */}
          <View style={styles.lecturersHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Available Lecturers
            </Text>
            <Text style={[styles.countBadge, { color: colors.mutedForeground }]}>
              {filteredLecturers.length} found
            </Text>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6366f1" />
            </View>
          ) : filteredLecturers.length === 0 ? (
            <View style={styles.emptyContainer}>
              <IconSymbol name="person.crop.circle.badge.xmark" size={64} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                No lecturers found
              </Text>
            </View>
          ) : (
            filteredLecturers.map((lecturer) => (
              <View
                key={lecturer.id}
                style={[styles.lecturerCard, { backgroundColor: colors.card }]}
              >
                <View style={styles.lecturerHeader}>
                  <Image source={{ uri: lecturer.photo }} style={styles.lecturerPhoto} />
                  <View style={styles.lecturerInfo}>
                    <Text style={[styles.lecturerName, { color: colors.foreground }]}>
                      {lecturer.name}
                    </Text>
                    <Text style={[styles.lecturerDept, { color: colors.mutedForeground }]}>
                      {lecturer.department}
                    </Text>
                    <View style={styles.ratingContainer}>
                      <IconSymbol name="star.fill" size={14} color="#f59e0b" />
                      <Text style={[styles.ratingText, { color: colors.foreground }]}>
                        {lecturer.rating}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.lecturerDetails}>
                  <View style={styles.detailRow}>
                    <IconSymbol name="book.fill" size={16} color="#6366f1" />
                    <Text style={[styles.detailText, { color: colors.foreground }]}>
                      {lecturer.subjects.join(", ")}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <IconSymbol name="clock.fill" size={16} color="#10b981" />
                    <Text style={[styles.detailText, { color: colors.foreground }]}>
                      {lecturer.availability}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => handleConnect(lecturer)}
                  style={styles.connectButton}
                >
                  <LinearGradient
                    colors={["#6366f1", "#4f46e5"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.connectGradient}
                  >
                    <IconSymbol name="message.fill" size={18} color="white" />
                    <Text style={styles.connectText}>Connect</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ))
          )}

          {/* Info Box */}
          <View style={[styles.infoBox, { backgroundColor: "#3b82f620" }]}>
            <IconSymbol name="info.circle.fill" size={20} color="#3b82f6" />
            <View style={{ flex: 1 }}>
              <Text style={[styles.infoTitle, { color: "#3b82f6" }]}>
                How It Works
              </Text>
              <Text style={[styles.infoText, { color: "#3b82f6" }]}>
                1. Select your faculty{"\n"}
                2. Browse available lecturers{"\n"}
                3. Send a connection request{"\n"}
                4. Start chatting once accepted
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 24,
    position: "relative",
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerContent: {
    alignItems: "center",
  },
  headerEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.9)",
  },
  content: {
    padding: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  facultiesScroll: {
    marginBottom: 24,
  },
  facultyChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  facultyText: {
    fontSize: 14,
    fontWeight: "500",
  },
  lecturersHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  countBadge: {
    fontSize: 14,
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
  },
  lecturerCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lecturerHeader: {
    flexDirection: "row",
    marginBottom: 16,
  },
  lecturerPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  lecturerInfo: {
    flex: 1,
  },
  lecturerName: {
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 4,
  },
  lecturerDept: {
    fontSize: 14,
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "600",
  },
  lecturerDetails: {
    gap: 10,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  detailText: {
    flex: 1,
    fontSize: 14,
  },
  connectButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  connectGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 8,
  },
  connectText: {
    color: "white",
    fontSize: 15,
    fontWeight: "bold",
  },
  infoBox: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 32,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 20,
  },
});
