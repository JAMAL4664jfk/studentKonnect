import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import Toast from "react-native-toast-message";
import { Picker } from "@react-native-picker/picker";
import * as LocalAuthentication from "expo-local-authentication";
import { supabase } from "@/lib/supabase";

type InstitutionType = "university" | "tvet_college" | "college" | "staff" | "parent";

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

const yearOptions = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year", "Postgraduate"];

export default function FullRegistrationScreen() {
  const colors = useColors();
  const router = useRouter();
  const params = useLocalSearchParams();

  const institutionType = (params.institutionType as InstitutionType) || "university";
  const quickLookup = params.quickLookup === "true";

  const [fullName, setFullName] = useState("");
  const [studentNumber, setStudentNumber] = useState(params.studentNumber as string || "");
  const [selectedInstitution, setSelectedInstitution] = useState(params.institution as string || "");
  const [courseProgram, setCourseProgram] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const institutions =
    institutionType === "university"
      ? universities
      : institutionType === "tvet_college"
      ? tvetColleges
      : institutionType === "college"
      ? colleges
      : [];

  useEffect(() => {
    checkBiometricAvailability();
    
    // If quick lookup, pre-fill some data
    if (quickLookup) {
      setFullName("John Doe"); // Mock data
      setCourseProgram("Computer Science");
      setYearOfStudy("3rd Year");
      setEmail(`${studentNumber}@student.ac.za`);
    }
  }, []);

  const checkBiometricAvailability = async () => {
    // Biometric auth not available on web
    if (Platform.OS === 'web') {
      setBiometricAvailable(false);
      return;
    }
    
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();

      if (compatible && enrolled) {
        setBiometricAvailable(true);
        if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometricType("Face Recognition");
        } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          setBiometricType("Fingerprint");
        } else {
          setBiometricType("Biometric");
        }
      }
    } catch (error) {
      console.error("Biometric check error:", error);
      setBiometricAvailable(false);
    }
  };

  const getInstitutionLabel = () => {
    if (institutionType === "university") return "University";
    if (institutionType === "tvet_college") return "TVET College";
    if (institutionType === "college") return "College";
    if (institutionType === "staff") return "Institution";
    return "Institution";
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!fullName || fullName.length < 2) {
      newErrors.fullName = "Full name must be at least 2 characters";
    }

    if (institutionType !== "parent" && institutionType !== "staff") {
      if (!studentNumber || studentNumber.length < 5) {
        newErrors.studentNumber = "Student number must be at least 5 characters";
      }
    }

    if (!selectedInstitution) {
      newErrors.institution = "Please select an institution";
    }

    if (institutionType !== "parent" && institutionType !== "staff") {
      if (!courseProgram || courseProgram.length < 2) {
        newErrors.courseProgram = "Course/Program must be at least 2 characters";
      }

      if (!yearOfStudy) {
        newErrors.yearOfStudy = "Please select year of study";
      }
    }

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Invalid email format";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[0-9])(?=.*[!@#$%^&*])/.test(password)) {
      newErrors.password = "Password must contain at least 1 number and 1 special character";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateAccount = async () => {
    if (!validateForm()) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please fix the errors and try again",
      });
      return;
    }

    setLoading(true);

    try {
      // Create Supabase auth account
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            student_number: studentNumber,
            institution_type: institutionType,
            institution_name: selectedInstitution,
            course_program: courseProgram,
            year_of_study: yearOfStudy,
            biometric_enabled: biometricEnabled,
            terms_accepted: true,
            terms_accepted_at: new Date().toISOString(),
          },
        },
      });

      if (error) throw error;

      // If biometric is enabled, set up biometric authentication (not on web)
      if (biometricEnabled && biometricAvailable && Platform.OS !== 'web') {
        try {
          const result = await LocalAuthentication.authenticateAsync({
            promptMessage: "Verify your identity",
            fallbackLabel: "Use password instead",
          });

          if (result.success) {
            Toast.show({
              type: "success",
              text1: "Biometric Setup Complete!",
              text2: "You can now use biometric authentication",
            });
          }
        } catch (error) {
          console.log('Biometric auth failed:', error);
        }
      }

      Toast.show({
        type: "success",
        text1: "Account Created!",
        text2: "Welcome to StudentKonnect",
      });

      // Navigate to main app
      setTimeout(() => {
        router.replace("/(tabs)");
      }, 1000);
    } catch (error: any) {
      console.error("Registration error:", error);
      Toast.show({
        type: "error",
        text1: "Registration Failed",
        text2: error.message || "Please check your details and try again",
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
            <View className="items-center mt-8 mb-6">
              <View className="bg-white/20 p-4 rounded-2xl mb-4">
                <IconSymbol name="wallet" size={48} color="#fff" />
              </View>
              <Text className="text-3xl font-bold text-white mb-2">Full Registration</Text>
              <Text className="text-base text-white/80 text-center px-6">
                Create your account and start managing your finances
              </Text>
            </View>

            {/* Form Card */}
            <View
              className="mx-4 bg-white/95 rounded-3xl p-6 mb-6"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 5,
              }}
            >
              {/* Full Name */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-foreground mb-2">Full Name</Text>
                <View
                  className={`bg-surface border-2 rounded-xl px-4 py-3 flex-row items-center ${
                    errors.fullName ? "border-red-500" : "border-border"
                  }`}
                >
                  <IconSymbol name="person.fill" size={20} color={colors.mutedForeground} />
                  <TextInput
                    placeholder="John Doe"
                    placeholderTextColor={colors.mutedForeground}
                    value={fullName}
                    onChangeText={(text) => {
                      setFullName(text);
                      if (errors.fullName) setErrors({ ...errors, fullName: "" });
                    }}
                    className="flex-1 ml-3 text-base text-foreground"
                  />
                </View>
                {errors.fullName && (
                  <Text className="text-xs text-red-500 mt-1">{errors.fullName}</Text>
                )}
              </View>

              {/* Student Number (not for parent/staff) */}
              {institutionType !== "parent" && institutionType !== "staff" && (
                <View className="mb-4">
                  <Text className="text-sm font-semibold text-foreground mb-2">
                    Student Number
                  </Text>
                  <View
                    className={`bg-surface border-2 rounded-xl px-4 py-3 flex-row items-center ${
                      errors.studentNumber ? "border-red-500" : "border-border"
                    }`}
                  >
                    <IconSymbol name="number" size={20} color={colors.mutedForeground} />
                    <TextInput
                      placeholder="202412345"
                      placeholderTextColor={colors.mutedForeground}
                      value={studentNumber}
                      onChangeText={(text) => {
                        setStudentNumber(text);
                        if (errors.studentNumber) setErrors({ ...errors, studentNumber: "" });
                      }}
                      keyboardType="numeric"
                      className="flex-1 ml-3 text-base text-foreground"
                    />
                  </View>
                  {errors.studentNumber && (
                    <Text className="text-xs text-red-500 mt-1">{errors.studentNumber}</Text>
                  )}
                </View>
              )}

              {/* Institution Selector */}
              {institutions.length > 0 && (
                <View className="mb-4">
                  <Text className="text-sm font-semibold text-foreground mb-2">
                    Select {getInstitutionLabel()}
                  </Text>
                  <View
                    className={`bg-surface border-2 rounded-xl overflow-hidden ${
                      errors.institution ? "border-red-500" : "border-border"
                    }`}
                  >
                    <Picker
                      selectedValue={selectedInstitution}
                      onValueChange={(value) => {
                        setSelectedInstitution(value);
                        if (errors.institution) setErrors({ ...errors, institution: "" });
                      }}
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
                  {errors.institution && (
                    <Text className="text-xs text-red-500 mt-1">{errors.institution}</Text>
                  )}
                </View>
              )}

              {/* Course/Program (not for parent/staff) */}
              {institutionType !== "parent" && institutionType !== "staff" && (
                <View className="mb-4">
                  <Text className="text-sm font-semibold text-foreground mb-2">
                    Course / Program
                  </Text>
                  <View
                    className={`bg-surface border-2 rounded-xl px-4 py-3 flex-row items-center ${
                      errors.courseProgram ? "border-red-500" : "border-border"
                    }`}
                  >
                    <IconSymbol name="book.fill" size={20} color={colors.mutedForeground} />
                    <TextInput
                      placeholder="Computer Science, Business Administration, etc."
                      placeholderTextColor={colors.mutedForeground}
                      value={courseProgram}
                      onChangeText={(text) => {
                        setCourseProgram(text);
                        if (errors.courseProgram) setErrors({ ...errors, courseProgram: "" });
                      }}
                      className="flex-1 ml-3 text-base text-foreground"
                    />
                  </View>
                  {errors.courseProgram && (
                    <Text className="text-xs text-red-500 mt-1">{errors.courseProgram}</Text>
                  )}
                </View>
              )}

              {/* Year of Study (not for parent/staff) */}
              {institutionType !== "parent" && institutionType !== "staff" && (
                <View className="mb-4">
                  <Text className="text-sm font-semibold text-foreground mb-2">
                    Year of Study
                  </Text>
                  <View
                    className={`bg-surface border-2 rounded-xl overflow-hidden ${
                      errors.yearOfStudy ? "border-red-500" : "border-border"
                    }`}
                  >
                    <Picker
                      selectedValue={yearOfStudy}
                      onValueChange={(value) => {
                        setYearOfStudy(value);
                        if (errors.yearOfStudy) setErrors({ ...errors, yearOfStudy: "" });
                      }}
                      style={{
                        height: 50,
                        color: colors.foreground,
                      }}
                    >
                      <Picker.Item label="Select your year" value="" />
                      {yearOptions.map((year) => (
                        <Picker.Item key={year} label={year} value={year} />
                      ))}
                    </Picker>
                  </View>
                  {errors.yearOfStudy && (
                    <Text className="text-xs text-red-500 mt-1">{errors.yearOfStudy}</Text>
                  )}
                </View>
              )}

              {/* Email */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-foreground mb-2">Email</Text>
                <View
                  className={`bg-surface border-2 rounded-xl px-4 py-3 flex-row items-center ${
                    errors.email ? "border-red-500" : "border-border"
                  }`}
                >
                  <IconSymbol name="envelope.fill" size={20} color={colors.mutedForeground} />
                  <TextInput
                    placeholder="morakef.mathibe@gmail.com"
                    placeholderTextColor={colors.mutedForeground}
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (errors.email) setErrors({ ...errors, email: "" });
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    className="flex-1 ml-3 text-base text-foreground"
                  />
                </View>
                {errors.email && (
                  <Text className="text-xs text-red-500 mt-1">{errors.email}</Text>
                )}
              </View>

              {/* Password */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-foreground mb-2">Password</Text>
                <View
                  className={`bg-surface border-2 rounded-xl px-4 py-3 flex-row items-center ${
                    errors.password ? "border-red-500" : "border-border"
                  }`}
                >
                  <IconSymbol name="lock.fill" size={20} color={colors.mutedForeground} />
                  <TextInput
                    placeholder="••••••••"
                    placeholderTextColor={colors.mutedForeground}
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (errors.password) setErrors({ ...errors, password: "" });
                    }}
                    secureTextEntry={!showPassword}
                    className="flex-1 ml-3 text-base text-foreground"
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <IconSymbol
                      name={showPassword ? "eye.slash.fill" : "eye.fill"}
                      size={20}
                      color={colors.mutedForeground}
                    />
                  </TouchableOpacity>
                </View>
                {errors.password && (
                  <Text className="text-xs text-red-500 mt-1">{errors.password}</Text>
                )}
                <Text className="text-xs text-muted-foreground mt-1">
                  Must be 8+ characters with 1 number and 1 special character
                </Text>
              </View>

              {/* Biometric Security */}
              {biometricAvailable && (
                <View className="mb-6">
                  <View
                    className="bg-primary/10 border-2 border-primary/30 rounded-xl p-4 flex-row items-center justify-between"
                  >
                    <View className="flex-row items-center gap-3 flex-1">
                      <View className="bg-primary/20 p-2 rounded-lg">
                        <IconSymbol name="faceid" size={24} color={colors.primary} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-sm font-bold text-foreground mb-1">
                          Biometric Security
                        </Text>
                        <Text className="text-xs text-muted-foreground">
                          Enable {biometricType.toLowerCase()} after signup
                        </Text>
                      </View>
                    </View>
                    <Switch
                      value={biometricEnabled}
                      onValueChange={setBiometricEnabled}
                      trackColor={{ false: colors.muted, true: colors.primary }}
                      thumbColor={biometricEnabled ? "#fff" : "#f4f3f4"}
                    />
                  </View>
                </View>
              )}

              {/* Create Account Button */}
              <TouchableOpacity
                onPress={handleCreateAccount}
                disabled={loading}
                className="bg-primary py-4 rounded-xl items-center active:opacity-80 mb-4"
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <View className="flex-row items-center gap-2">
                    <IconSymbol name="person.badge.plus" size={20} color="#fff" />
                    <Text className="text-white font-bold text-lg">Create Account</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Back Button */}
              <TouchableOpacity
                onPress={() => router.back()}
                className="bg-surface py-4 rounded-xl items-center active:opacity-80"
              >
                <Text className="text-foreground font-semibold text-base">Back</Text>
              </TouchableOpacity>
            </View>

            {/* Sign In Link */}
            <View className="items-center">
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
