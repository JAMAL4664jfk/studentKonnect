import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import Toast from "react-native-toast-message";

const NSFAS_INFO = {
  eligibility: [
    "South African citizen",
    "SASSA grant recipient or combined household income ≤ R350,000 per year",
    "Registered at a public university or TVET college",
    "Studying towards your first qualification",
  ],
  funding: [
    "Full tuition fees",
    "Accommodation (up to R33,000/year)",
    "Transport allowance",
    "Living allowance (R15,750/year)",
    "Book and learning material allowance (R5,200/year)",
  ],
  documents: [
    "Certified copy of ID",
    "Proof of household income",
    "Proof of residence",
    "Academic records",
    "SASSA confirmation letter (if applicable)",
  ],
};

const APPLICATION_STATUS = [
  { step: 1, title: "Application Submitted", status: "completed", date: "15 Jan 2026" },
  { step: 2, title: "Documents Verified", status: "completed", date: "20 Jan 2026" },
  { step: 3, title: "Eligibility Assessment", status: "in_progress", date: "Pending" },
  { step: 4, title: "Funding Approval", status: "pending", date: "Pending" },
  { step: 5, title: "Disbursement", status: "pending", date: "Pending" },
];

export default function NSFASScreen() {
  const colors = useColors();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"info" | "apply" | "track">("info");

  const openNSFASWebsite = () => {
    Linking.openURL("https://www.nsfas.org.za");
  };

  const openNSFASPortal = () => {
    Linking.openURL("https://my.nsfas.org.za");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "#22c55e";
      case "in_progress":
        return "#f59e0b";
      default:
        return colors.mutedForeground;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return "checkmark.circle.fill";
      case "in_progress":
        return "clock.fill";
      default:
        return "circle";
    }
  };

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={["#10b981", "#059669", "#047857"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={24} color="white" />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text style={styles.headerEmoji}>🎓</Text>
            <Text style={styles.headerTitle}>NSFAS Funding</Text>
            <Text style={styles.headerSubtitle}>
              National Student Financial Aid Scheme
            </Text>
          </View>
        </LinearGradient>

        {/* Tabs */}
        <View style={[styles.tabs, { backgroundColor: colors.card }]}>
          {[
            { key: "info", label: "Information", icon: "info.circle.fill" },
            { key: "apply", label: "Apply", icon: "doc.text.fill" },
            { key: "track", label: "Track", icon: "chart.line.uptrend.xyaxis" },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key as any)}
              style={[
                styles.tab,
                activeTab === tab.key && styles.tabActive,
                { borderBottomColor: activeTab === tab.key ? "#10b981" : "transparent" },
              ]}
            >
              <IconSymbol
                name={tab.icon as any}
                size={20}
                color={activeTab === tab.key ? "#10b981" : colors.mutedForeground}
              />
              <Text
                style={[
                  styles.tabLabel,
                  { color: activeTab === tab.key ? "#10b981" : colors.mutedForeground },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.content}>
          {/* Information Tab */}
          {activeTab === "info" && (
            <View>
              {/* Eligibility */}
              <View style={[styles.section, { backgroundColor: colors.card }]}>
                <View style={styles.sectionHeader}>
                  <IconSymbol name="checkmark.shield.fill" size={24} color="#10b981" />
                  <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                    Eligibility Criteria
                  </Text>
                </View>
                {NSFAS_INFO.eligibility.map((item, index) => (
                  <View key={index} style={styles.listItem}>
                    <View style={styles.bullet} />
                    <Text style={[styles.listText, { color: colors.foreground }]}>{item}</Text>
                  </View>
                ))}
              </View>

              {/* What's Covered */}
              <View style={[styles.section, { backgroundColor: colors.card }]}>
                <View style={styles.sectionHeader}>
                  <IconSymbol name="dollarsign.circle.fill" size={24} color="#10b981" />
                  <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                    What NSFAS Covers
                  </Text>
                </View>
                {NSFAS_INFO.funding.map((item, index) => (
                  <View key={index} style={styles.listItem}>
                    <IconSymbol name="checkmark.circle" size={16} color="#10b981" />
                    <Text style={[styles.listText, { color: colors.foreground }]}>{item}</Text>
                  </View>
                ))}
              </View>

              {/* Required Documents */}
              <View style={[styles.section, { backgroundColor: colors.card }]}>
                <View style={styles.sectionHeader}>
                  <IconSymbol name="doc.text.fill" size={24} color="#10b981" />
                  <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                    Required Documents
                  </Text>
                </View>
                {NSFAS_INFO.documents.map((item, index) => (
                  <View key={index} style={styles.listItem}>
                    <View style={styles.bullet} />
                    <Text style={[styles.listText, { color: colors.foreground }]}>{item}</Text>
                  </View>
                ))}
              </View>

              {/* Important Dates */}
              <View style={[styles.section, { backgroundColor: colors.card }]}>
                <View style={styles.sectionHeader}>
                  <IconSymbol name="calendar.circle.fill" size={24} color="#10b981" />
                  <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                    Important Dates 2026
                  </Text>
                </View>
                <View style={styles.dateItem}>
                  <Text style={[styles.dateLabel, { color: colors.foreground }]}>
                    Applications Open:
                  </Text>
                  <Text style={[styles.dateValue, { color: "#10b981" }]}>1 September 2025</Text>
                </View>
                <View style={styles.dateItem}>
                  <Text style={[styles.dateLabel, { color: colors.foreground }]}>
                    Applications Close:
                  </Text>
                  <Text style={[styles.dateValue, { color: "#ef4444" }]}>30 November 2025</Text>
                </View>
                <View style={styles.dateItem}>
                  <Text style={[styles.dateLabel, { color: colors.foreground }]}>
                    Results Released:
                  </Text>
                  <Text style={[styles.dateValue, { color: colors.mutedForeground }]}>
                    January 2026
                  </Text>
                </View>
              </View>

              {/* Learn More Button */}
              <TouchableOpacity onPress={openNSFASWebsite} style={styles.button}>
                <LinearGradient
                  colors={["#10b981", "#059669"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonGradient}
                >
                  <IconSymbol name="safari.fill" size={20} color="white" />
                  <Text style={styles.buttonText}>Visit NSFAS Website</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {/* Apply Tab */}
          {activeTab === "apply" && (
            <View>
              <View style={[styles.section, { backgroundColor: colors.card }]}>
                <View style={styles.sectionHeader}>
                  <IconSymbol name="doc.text.fill" size={24} color="#10b981" />
                  <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                    How to Apply
                  </Text>
                </View>

                {[
                  {
                    step: 1,
                    title: "Create Account",
                    desc: "Register on the NSFAS portal with your ID number",
                  },
                  {
                    step: 2,
                    title: "Complete Application",
                    desc: "Fill in all required personal and financial information",
                  },
                  {
                    step: 3,
                    title: "Upload Documents",
                    desc: "Submit all required supporting documents",
                  },
                  {
                    step: 4,
                    title: "Submit Application",
                    desc: "Review and submit your application before the deadline",
                  },
                  {
                    step: 5,
                    title: "Track Progress",
                    desc: "Monitor your application status on the portal",
                  },
                ].map((item) => (
                  <View key={item.step} style={styles.stepItem}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>{item.step}</Text>
                    </View>
                    <View style={styles.stepContent}>
                      <Text style={[styles.stepTitle, { color: colors.foreground }]}>
                        {item.title}
                      </Text>
                      <Text style={[styles.stepDesc, { color: colors.mutedForeground }]}>
                        {item.desc}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              <TouchableOpacity onPress={openNSFASPortal} style={styles.button}>
                <LinearGradient
                  colors={["#10b981", "#059669"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonGradient}
                >
                  <IconSymbol name="arrow.right.circle.fill" size={20} color="white" />
                  <Text style={styles.buttonText}>Apply on NSFAS Portal</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {/* Track Tab */}
          {activeTab === "track" && (
            <View>
              <View style={[styles.section, { backgroundColor: colors.card }]}>
                <View style={styles.sectionHeader}>
                  <IconSymbol name="chart.line.uptrend.xyaxis" size={24} color="#10b981" />
                  <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                    Application Status
                  </Text>
                </View>

                {APPLICATION_STATUS.map((item, index) => (
                  <View key={item.step} style={styles.statusItem}>
                    <View style={styles.statusLeft}>
                      <View
                        style={[
                          styles.statusIcon,
                          { backgroundColor: getStatusColor(item.status) + "20" },
                        ]}
                      >
                        <IconSymbol
                          name={getStatusIcon(item.status) as any}
                          size={20}
                          color={getStatusColor(item.status)}
                        />
                      </View>
                      {index < APPLICATION_STATUS.length - 1 && (
                        <View
                          style={[
                            styles.statusLine,
                            {
                              backgroundColor:
                                item.status === "completed"
                                  ? "#22c55e"
                                  : colors.border,
                            },
                          ]}
                        />
                      )}
                    </View>
                    <View style={styles.statusRight}>
                      <Text style={[styles.statusTitle, { color: colors.foreground }]}>
                        {item.title}
                      </Text>
                      <Text style={[styles.statusDate, { color: colors.mutedForeground }]}>
                        {item.date}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              <View style={[styles.infoBox, { backgroundColor: "#3b82f620" }]}>
                <IconSymbol name="info.circle.fill" size={20} color="#3b82f6" />
                <Text style={[styles.infoText, { color: "#3b82f6" }]}>
                  Your application is currently being assessed. You will be notified via SMS and
                  email once a decision has been made.
                </Text>
              </View>

              <TouchableOpacity onPress={openNSFASPortal} style={styles.button}>
                <LinearGradient
                  colors={["#10b981", "#059669"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonGradient}
                >
                  <IconSymbol name="arrow.clockwise.circle.fill" size={20} color="white" />
                  <Text style={styles.buttonText}>Refresh Status</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
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
    textAlign: "center",
  },
  tabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
    borderBottomWidth: 2,
  },
  tabActive: {},
  tabLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  content: {
    padding: 16,
  },
  section: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 12,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10b981",
    marginTop: 6,
  },
  listText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  dateItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  dateLabel: {
    fontSize: 15,
    fontWeight: "500",
  },
  dateValue: {
    fontSize: 15,
    fontWeight: "bold",
  },
  stepItem: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 20,
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#10b98120",
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumberText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#10b981",
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
  statusItem: {
    flexDirection: "row",
    marginBottom: 24,
  },
  statusLeft: {
    alignItems: "center",
    marginRight: 16,
  },
  statusIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  statusLine: {
    width: 2,
    flex: 1,
    marginTop: 8,
  },
  statusRight: {
    flex: 1,
    paddingTop: 8,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  statusDate: {
    fontSize: 14,
  },
  infoBox: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  button: {
    marginTop: 8,
    marginBottom: 32,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
