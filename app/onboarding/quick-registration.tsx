import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import Toast from "react-native-toast-message";
import { Picker } from "@react-native-picker/picker";

type InstitutionType = "university" | "tvet_college" | "college";

const universities = [
  "University of Cape Town",
  "University of the Witwatersrand",
  "Stellenbosch University",
  "University of Pretoria",
  "University of Johannesburg",
  "University of KwaZulu-Natal",
  "Rhodes University",
  "University of the Western Cape",
  "University of South Africa (UNISA)",
  "North-West University",
  "Nelson Mandela University",
  "University of the Free State",
  "Cape Peninsula University of Technology",
  "Durban University of Technology",
  "Tshwane University of Technology",
];

const tvetColleges = [
  "Boland College",
  "Buffalo City College",
  "Capricorn College",
  "Central Johannesburg College",
  "Coastal KZN College",
  "College of Cape Town",
  "Eastcape Midlands College",
  "Ekurhuleni East College",
  "Ekurhuleni West College",
  "Elangeni College",
  "False Bay College",
  "Goldfields College",
];

const colleges = [
  "Boston City Campus",
  "Damelin College",
  "Rosebank College",
  "Varsity College",
  "CTI Education Group",
  "Pearson Institute of Higher Education",
  "AFDA Film School",
  "AAA School of Advertising",
  "Vega School",
  "IMM Graduate School",
];

export default function QuickRegistrationScreen() {
  const colors = useColors();
  const router = useRouter();
  const params = useLocalSearchParams();
  const institutionType = params.institutionType as InstitutionType;

  const [studentNumber, setStudentNumber] = useState("");
  const [selectedInstitution, setSelectedInstitution] = useState("");
  const [loading, setLoading] = useState(false);

  const institutions =
    institutionType === "university"
      ? universities
      : institutionType === "tvet_college"
      ? tvetColleges
      : colleges;

  const getInstitutionLabel = () => {
    if (institutionType === "university") return "University";
    if (institutionType === "tvet_college") return "TVET College";
    return "College";
  };

  const handleFindProfile = async () => {
    if (!studentNumber || !selectedInstitution) {
      Toast.show({
        type: "error",
        text1: "Missing Information",
        text2: "Please enter student number and select institution",
      });
      return;
    }

    if (studentNumber.length < 5) {
      Toast.show({
        type: "error",
        text1: "Invalid Student Number",
        text2: "Student number must be at least 5 characters",
      });
      return;
    }

    setLoading(true);

    try {
      // Simulate API call to lookup student profile
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock profile found - in production, this would query a database
      const profileFound = Math.random() > 0.3; // 70% chance of finding profile

      if (profileFound) {
        Toast.show({
          type: "success",
          text1: "Profile Found!",
          text2: "Redirecting to complete registration...",
        });

        // Navigate to full registration with pre-filled data
        setTimeout(() => {
          router.push({
            pathname: "/onboarding/full-registration",
            params: {
              institutionType,
              studentNumber,
              institution: selectedInstitution,
              quickLookup: "true",
            },
          });
        }, 1000);
      } else {
        Toast.show({
          type: "info",
          text1: "Profile Not Found",
          text2: "No worries! You can still register manually.",
        });

        // Navigate to full registration
        setTimeout(() => {
          router.push({
            pathname: "/onboarding/full-registration",
            params: {
              institutionType,
              studentNumber,
              institution: selectedInstitution,
            },
          });
        }, 1000);
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Lookup Failed",
        text2: error.message || "Failed to lookup student profile",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#1e3a8a", "#3b82f6", "#60a5fa"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="flex-1"
    >
      <ScreenContainer>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            {/* Header */}
            <View className="items-center mt-8 mb-8">
              <View className="bg-white/20 p-4 rounded-2xl mb-4">
                <IconSymbol name="wallet" size={48} color="#fff" />
              </View>
              <Text className="text-3xl font-bold text-white mb-2">Quick Registration</Text>
              <Text className="text-base text-white/80 text-center px-6">
                Enter your student details to find your profile
              </Text>
            </View>

            {/* Form Card */}
            <View className="mx-4 bg-white/95 rounded-3xl p-6 mb-6"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 5,
              }}
            >
              {/* Student Number */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-foreground mb-2">
                  Student Number
                </Text>
                <View className="bg-surface border-2 border-border rounded-xl px-4 py-3 flex-row items-center">
                  <IconSymbol name="number" size={20} color={colors.muted} />
                  <TextInput
                    placeholder="202412345"
                    placeholderTextColor={colors.muted}
                    value={studentNumber}
                    onChangeText={setStudentNumber}
                    keyboardType="numeric"
                    className="flex-1 ml-3 text-base text-foreground"
                  />
                </View>
              </View>

              {/* Institution Selector */}
              <View className="mb-6">
                <Text className="text-sm font-semibold text-foreground mb-2">
                  Select {getInstitutionLabel()}
                </Text>
                <View className="bg-surface border-2 border-border rounded-xl overflow-hidden">
                  <Picker
                    selectedValue={selectedInstitution}
                    onValueChange={(value) => setSelectedInstitution(value)}
                    style={{
                      height: 50,
                      color: colors.foreground,
                    }}
                  >
                    <Picker.Item
                      label={`Choose your ${getInstitutionLabel().toLowerCase()}`}
                      value=""
                    />
                    {institutions.map((institution) => (
                      <Picker.Item
                        key={institution}
                        label={institution}
                        value={institution}
                      />
                    ))}
                  </Picker>
                </View>
              </View>

              {/* Find Profile Button */}
              <TouchableOpacity
                onPress={handleFindProfile}
                disabled={loading}
                className="bg-primary py-4 rounded-xl items-center active:opacity-80 mb-4"
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <View className="flex-row items-center gap-2">
                    <IconSymbol name="magnifyingglass" size={20} color="#fff" />
                    <Text className="text-white font-bold text-lg">Find My Profile</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Back Button */}
              <TouchableOpacity
                onPress={() => router.back()}
                className="bg-surface py-4 rounded-xl items-center active:opacity-80"
              >
                <Text className="text-foreground font-semibold text-base">Back to Options</Text>
              </TouchableOpacity>
            </View>

            {/* Alternative Option */}
            <View className="items-center px-6">
              <Text className="text-white/80 text-sm mb-3 text-center">
                Can't find your profile or prefer manual registration?
              </Text>
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/onboarding/full-registration",
                    params: {
                      institutionType,
                      studentNumber,
                      institution: selectedInstitution,
                    },
                  })
                }
                className="bg-white/20 px-6 py-3 rounded-xl"
              >
                <Text className="text-white font-semibold text-base">
                  Register Manually Instead
                </Text>
              </TouchableOpacity>
            </View>

            {/* Sign In Link */}
            <View className="items-center mt-8">
              <Text className="text-white/80 text-sm mb-2">Already have an account?</Text>
              <TouchableOpacity
                onPress={() => router.push("/auth")}
                className="bg-white/20 px-6 py-3 rounded-xl"
              >
                <Text className="text-white font-semibold text-base">Sign In</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ScreenContainer>
    </LinearGradient>
  );
}
