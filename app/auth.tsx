import { useState } from "react";
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
import { ImageBackground } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { supabase } from "@/lib/supabase";
import Toast from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type AuthMode = "login" | "institution-select" | "signup-method" | "full-signup" | "quick-signup";
type InstitutionType = "university" | "tvet_college" | "college" | "";
type SignupMethod = "full" | "quick" | null;

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

export default function AuthScreen() {
  const colors = useColors();
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [loading, setLoading] = useState(false);
  const [signupMethod, setSignupMethod] = useState<SignupMethod>(null);

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [studentNumber, setStudentNumber] = useState("");
  const [institutionType, setInstitutionType] = useState<InstitutionType>("");
  const [institutionName, setInstitutionName] = useState("");
  const [courseProgram, setCourseProgram] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState("");

  // Quick signup state
  const [quickLookupResults, setQuickLookupResults] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const availableInstitutions =
    institutionType === "university"
      ? universities
      : institutionType === "tvet_college"
      ? tvetColleges
      : colleges;

  const getInstitutionLabel = () => {
    if (institutionType === "university") return "University";
    if (institutionType === "tvet_college") return "TVET College";
    if (institutionType === "college") return "College";
    return "Institution";
  };

  const validateLoginForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Invalid email format";
    if (!password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSignupForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!fullName || fullName.length < 2) newErrors.fullName = "Full name must be at least 2 characters";
    if (!studentNumber || studentNumber.length < 5) newErrors.studentNumber = "Student number must be at least 5 characters";
    if (!institutionName) newErrors.institutionName = "Please select an institution";
    if (!courseProgram || courseProgram.length < 2) newErrors.courseProgram = "Course/Program must be at least 2 characters";
    if (!yearOfStudy) newErrors.yearOfStudy = "Please select year of study";
    if (!email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Invalid email format";
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 8) newErrors.password = "Password must be at least 8 characters";
    else if (!/(?=.*[0-9])(?=.*[!@#$%^&*])/.test(password))
      newErrors.password = "Password must contain at least 1 number and 1 special character";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateLoginForm()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      Toast.show({
        type: "success",
        text1: "Welcome Back!",
        text2: "You have successfully logged in",
      });

      router.replace("/(tabs)");
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2: error.message || "Invalid email or password",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!validateSignupForm()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            student_id: studentNumber,
            institution_type: institutionType,
            institution_name: institutionName,
            course_program: courseProgram,
            year_of_study: yearOfStudy,
            terms_accepted: true,
            terms_accepted_at: new Date().toISOString(),
          },
        },
      });

      if (error) throw error;

      Toast.show({
        type: "success",
        text1: "Account Created!",
        text2: "Welcome to Scholar Hub",
      });

      router.replace("/(tabs)");
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Sign Up Failed",
        text2: error.message || "Please check your details and try again",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLookup = async () => {
    if (!studentNumber || !institutionName) {
      Toast.show({
        type: "error",
        text1: "Missing Information",
        text2: "Please enter student number and select institution",
      });
      return;
    }

    setLoading(true);
    try {
      // Mock student lookup - in production, this would query a database
      const mockStudents = [
        {
          id: 1,
          name: "John Doe",
          studentNumber: studentNumber,
          institution: institutionName,
          course: "Computer Science",
          year: 3,
          email: `${studentNumber}@student.ac.za`,
        },
        {
          id: 2,
          name: "Jane Smith",
          studentNumber: studentNumber,
          institution: institutionName,
          course: "Business Administration",
          year: 2,
          email: `${studentNumber}@university.edu`,
        },
      ];

      setQuickLookupResults(mockStudents);

      if (mockStudents.length === 0) {
        Toast.show({
          type: "error",
          text1: "No Match Found",
          text2: "No student found with that number at the selected institution",
        });
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Lookup Failed",
        text2: error.message || "Failed to lookup student information",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSignup = async () => {
    if (!selectedStudent) return;

    setLoading(true);
    try {
      // Generate secure temporary password
      const tempPassword = crypto.randomUUID().slice(0, 16) + "Aa1!";

      const { data, error } = await supabase.auth.signUp({
        email: selectedStudent.email,
        password: tempPassword,
        options: {
          data: {
            full_name: selectedStudent.name,
            student_id: selectedStudent.studentNumber,
            institution_type: institutionType,
            institution_name: selectedStudent.institution,
            course_program: selectedStudent.course,
            year_of_study: selectedStudent.year.toString(),
            terms_accepted: true,
            terms_accepted_at: new Date().toISOString(),
          },
        },
      });

      if (error) throw error;

      Toast.show({
        type: "success",
        text1: "Account Created!",
        text2: "Welcome to Scholar Hub. Check your email to set a password.",
      });

      router.replace("/(tabs)");
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Sign Up Failed",
        text2: error.message || "Failed to create account",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderLoginScreen = () => (
    <View className="w-full max-w-md p-6 bg-card/95 rounded-2xl border-2 border-primary/20 backdrop-blur-xl">
      <View className="items-center mb-6">
        <View className="bg-primary p-4 rounded-xl mb-4">
          <Ionicons name="wallet" size={32} color="#fff" />
        </View>
        <Text className="text-3xl font-bold text-foreground mb-2">Welcome Back!</Text>
        <Text className="text-muted text-center">welcome back we missed you</Text>
      </View>

      <View className="space-y-4">
        <View>
          <Text className="text-sm text-foreground mb-2">Username</Text>
          <View className="flex-row items-center bg-surface border border-border rounded-lg px-4 py-3">
            <Ionicons name="person" size={20} color={colors.muted} />
            <TextInput
              placeholder="Username"
              placeholderTextColor={colors.muted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              className="flex-1 ml-3 text-foreground"
            />
          </View>
          {errors.email && <Text className="text-error text-xs mt-1">{errors.email}</Text>}
        </View>

        <View>
          <Text className="text-sm text-foreground mb-2">Password</Text>
          <View className="flex-row items-center bg-surface border border-border rounded-lg px-4 py-3">
            <Ionicons name="lock-closed" size={20} color={colors.muted} />
            <TextInput
              placeholder="••••••••"
              placeholderTextColor={colors.muted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              className="flex-1 ml-3 text-foreground"
            />
          </View>
          {errors.password && <Text className="text-error text-xs mt-1">{errors.password}</Text>}
        </View>

        <TouchableOpacity>
          <Text className="text-primary text-right text-sm">Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleLogin}
          disabled={loading}
          className="bg-gradient-to-r from-primary to-pink-500 rounded-full py-4 items-center mt-4"
          style={{
            backgroundColor: colors.primary,
          }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-semibold text-base">Sign In</Text>
          )}
        </TouchableOpacity>

        <View className="flex-row items-center justify-center mt-4">
          <Text className="text-muted">Don't have an account? </Text>
          <TouchableOpacity onPress={() => setMode("institution-select")}>
            <Text className="text-primary font-semibold">Sign up</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => router.push("/(tabs)")} className="mt-4">
          <Text className="text-muted text-center">Continue as Guest</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderInstitutionSelect = () => (
    <View className="w-full max-w-md p-6 bg-card/95 rounded-2xl border-2 border-primary/20 backdrop-blur-xl">
      <View className="items-center mb-6">
        <View className="bg-primary p-4 rounded-xl mb-4">
          <Ionicons name="school" size={32} color="#fff" />
        </View>
        <Text className="text-3xl font-bold text-foreground mb-2">Get Started</Text>
        <Text className="text-muted text-center">Select your institution type to continue</Text>
      </View>

      <View className="space-y-3">
        <TouchableOpacity
          onPress={() => {
            setInstitutionType("university");
            setMode("signup-method");
          }}
          className="bg-surface border-2 border-primary/30 rounded-xl p-6 items-center"
        >
          <Ionicons name="school" size={32} color={colors.primary} />
          <Text className="text-foreground font-bold text-lg mt-2">University</Text>
          <Text className="text-muted text-sm text-center mt-1">Traditional universities and institutions</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setInstitutionType("tvet_college");
            setMode("signup-method");
          }}
          className="bg-surface border-2 border-primary/30 rounded-xl p-6 items-center"
        >
          <MaterialCommunityIcons name="tools" size={32} color="#3b82f6" />
          <Text className="text-foreground font-bold text-lg mt-2">TVET College</Text>
          <Text className="text-muted text-sm text-center mt-1">Technical and vocational education</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setInstitutionType("college");
            setMode("signup-method");
          }}
          className="bg-surface border-2 border-primary/30 rounded-xl p-6 items-center"
        >
          <MaterialCommunityIcons name="office-building" size={32} color="#3b82f6" />
          <Text className="text-foreground font-bold text-lg mt-2">College</Text>
          <Text className="text-muted text-sm text-center mt-1">Private colleges and institutions</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setMode("login")} className="mt-4">
          <Text className="text-muted text-center">← Back to Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSignupMethodSelect = () => (
    <View className="w-full max-w-2xl p-6 bg-card/95 rounded-2xl border-2 border-primary/20 backdrop-blur-xl">
      <View className="items-center mb-6">
        <Text className="text-3xl font-bold text-foreground mb-2">{getInstitutionLabel()} Student</Text>
        <Text className="text-muted text-center">Choose how you'd like to create your account</Text>
      </View>

      <View className="flex-row gap-4">
        {/* Full Registration */}
        <TouchableOpacity
          onPress={() => {
            setSignupMethod("full");
            setMode("full-signup");
          }}
          className="flex-1 bg-surface border-2 border-primary/30 rounded-xl p-6"
        >
          <View className="items-center">
            <View className="bg-primary p-4 rounded-xl mb-4">
              <Ionicons name="person-add" size={28} color="#fff" />
            </View>
            <Text className="text-foreground font-bold text-lg mb-2">Full Registration</Text>
            <Text className="text-muted text-xs text-center mb-4">
              Fill in all your details manually to create a complete profile
            </Text>

            <View className="space-y-2 w-full">
              <View className="flex-row items-center gap-2">
                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                <Text className="text-muted text-xs flex-1">Complete control over your information</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                <Text className="text-muted text-xs flex-1">Choose your own email and password</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                <Text className="text-muted text-xs flex-1">Takes 2-3 minutes</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Quick Registration */}
        <TouchableOpacity
          onPress={() => {
            setSignupMethod("quick");
            setMode("quick-signup");
          }}
          className="flex-1 bg-surface border-2 border-primary/30 rounded-xl p-6"
        >
          <View className="items-center">
            <View className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-xl mb-4">
              <MaterialCommunityIcons name="school" size={28} color="#fff" />
            </View>
            <Text className="text-foreground font-bold text-lg mb-2">Quick Registration</Text>
            <Text className="text-muted text-xs text-center mb-4">
              Use your student number and institution to auto-fill your details
            </Text>

            <View className="space-y-2 w-full">
              <View className="flex-row items-center gap-2">
                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                <Text className="text-muted text-xs flex-1">Instant student verification</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                <Text className="text-muted text-xs flex-1">Pre-filled information from your institution</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                <Text className="text-muted text-xs flex-1">Takes less than 1 minute</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={() => {
          setInstitutionType("");
          setMode("institution-select");
        }}
        className="mt-6"
      >
        <Text className="text-muted text-center">← Change institution type</Text>
      </TouchableOpacity>
    </View>
  );

  const renderFullSignupForm = () => (
    <ScrollView className="w-full max-w-md">
      <View className="p-6 bg-card/95 rounded-2xl border-2 border-primary/20 backdrop-blur-xl">
        <View className="items-center mb-6">
          <View className="bg-primary p-4 rounded-xl mb-4">
            <Ionicons name="wallet" size={32} color="#fff" />
          </View>
          <Text className="text-3xl font-bold text-foreground mb-2">Full Registration</Text>
          <Text className="text-muted text-center">Create your account and start managing your finances</Text>
        </View>

        <View className="space-y-4">
          <View>
            <Text className="text-sm text-foreground mb-2">Full Name</Text>
            <TextInput
              placeholder="John Doe"
              placeholderTextColor={colors.muted}
              value={fullName}
              onChangeText={(text) => setFullName(text.replace(/[^a-zA-Z\s]/g, ""))}
              className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
            />
            {errors.fullName && <Text className="text-error text-xs mt-1">{errors.fullName}</Text>}
          </View>

          <View>
            <Text className="text-sm text-foreground mb-2">Student Number</Text>
            <TextInput
              placeholder="202412345"
              placeholderTextColor={colors.muted}
              value={studentNumber}
              onChangeText={(text) => setStudentNumber(text.replace(/[^0-9]/g, ""))}
              keyboardType="numeric"
              className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
            />
            {errors.studentNumber && <Text className="text-error text-xs mt-1">{errors.studentNumber}</Text>}
          </View>

          <View>
            <Text className="text-sm text-foreground mb-2">Select {getInstitutionLabel()}</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="border border-border rounded-lg bg-surface"
              style={{ maxHeight: 150 }}
            >
              <View className="p-2">
                {availableInstitutions.map((institution) => (
                  <TouchableOpacity
                    key={institution}
                    onPress={() => setInstitutionName(institution)}
                    className={`px-4 py-3 rounded-lg mb-2 ${
                      institutionName === institution ? "bg-primary" : "bg-surface"
                    }`}
                  >
                    <Text
                      className={`${institutionName === institution ? "text-white" : "text-foreground"}`}
                    >
                      {institution}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            {errors.institutionName && <Text className="text-error text-xs mt-1">{errors.institutionName}</Text>}
          </View>

          <View>
            <Text className="text-sm text-foreground mb-2">Course/Program</Text>
            <TextInput
              placeholder="Computer Science, Business Administration, etc."
              placeholderTextColor={colors.muted}
              value={courseProgram}
              onChangeText={(text) => setCourseProgram(text.replace(/[^a-zA-Z\s]/g, ""))}
              className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
            />
            {errors.courseProgram && <Text className="text-error text-xs mt-1">{errors.courseProgram}</Text>}
          </View>

          <View>
            <Text className="text-sm text-foreground mb-2">Year of Study</Text>
            <View className="flex-row gap-2">
              {["1", "2", "3", "4", "5", "6"].map((year) => (
                <TouchableOpacity
                  key={year}
                  onPress={() => setYearOfStudy(year)}
                  className={`flex-1 px-4 py-3 rounded-lg ${
                    yearOfStudy === year ? "bg-primary" : "bg-surface border border-border"
                  }`}
                >
                  <Text className={`text-center ${yearOfStudy === year ? "text-white" : "text-foreground"}`}>
                    {year}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.yearOfStudy && <Text className="text-error text-xs mt-1">{errors.yearOfStudy}</Text>}
          </View>

          <View>
            <Text className="text-sm text-foreground mb-2">Email</Text>
            <TextInput
              placeholder="student@university.edu"
              placeholderTextColor={colors.muted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
            />
            {errors.email && <Text className="text-error text-xs mt-1">{errors.email}</Text>}
          </View>

          <View>
            <Text className="text-sm text-foreground mb-2">Password</Text>
            <TextInput
              placeholder="••••••••"
              placeholderTextColor={colors.muted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
            />
            <Text className="text-muted text-xs mt-1">
              Must be at least 8 characters with 1 number and 1 special character
            </Text>
            {errors.password && <Text className="text-error text-xs mt-1">{errors.password}</Text>}
          </View>

          <View className="bg-surface/50 rounded-lg p-3 flex-row items-start gap-2">
            <Ionicons name="finger-print" size={20} color={colors.primary} />
            <View className="flex-1">
              <Text className="text-foreground font-medium text-sm">Biometric Security</Text>
              <Text className="text-muted text-xs">
                You'll be able to enable fingerprint/face recognition after signup
              </Text>
            </View>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
          </View>

          <TouchableOpacity
            onPress={handleSignup}
            disabled={loading}
            className="bg-primary rounded-full py-4 items-center mt-4"
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View className="flex-row items-center">
                <Ionicons name="person-add" size={16} color="#fff" />
                <Text className="text-white font-semibold text-base ml-2">Create Account</Text>
              </View>
            )}
          </TouchableOpacity>

          <View className="flex-row items-center justify-center mt-4">
            <Text className="text-muted">Already have an account? </Text>
            <TouchableOpacity
              onPress={() => {
                setMode("login");
                setSignupMethod(null);
              }}
            >
              <Text className="text-primary font-semibold">Sign in</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => {
              setMode("signup-method");
              setSignupMethod(null);
            }}
            className="mt-2"
          >
            <Text className="text-muted text-center">← Back to signup options</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const renderQuickSignupForm = () => {
    if (quickLookupResults.length === 0) {
      return (
        <View className="w-full max-w-md p-6 bg-card/95 rounded-2xl border-2 border-primary/20 backdrop-blur-xl">
          <View className="items-center mb-6">
            <View className="bg-primary p-4 rounded-xl mb-4">
              <Ionicons name="school" size={32} color="#fff" />
            </View>
            <Text className="text-3xl font-bold text-foreground mb-2">Quick Registration</Text>
            <Text className="text-muted text-center">Enter your student details to find your profile</Text>
          </View>

          <View className="space-y-4">
            <View>
              <Text className="text-sm text-foreground mb-2">Student Number</Text>
              <TextInput
                placeholder="202412345"
                placeholderTextColor={colors.muted}
                value={studentNumber}
                onChangeText={setStudentNumber}
                keyboardType="numeric"
                className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
              />
            </View>

            <View>
              <Text className="text-sm text-foreground mb-2">Select {getInstitutionLabel()}</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="border border-border rounded-lg bg-surface"
                style={{ maxHeight: 150 }}
              >
                <View className="p-2">
                  {availableInstitutions.map((institution) => (
                    <TouchableOpacity
                      key={institution}
                      onPress={() => setInstitutionName(institution)}
                      className={`px-4 py-3 rounded-lg mb-2 ${
                        institutionName === institution ? "bg-primary" : "bg-surface"
                      }`}
                    >
                      <Text
                        className={`${institutionName === institution ? "text-white" : "text-foreground"}`}
                      >
                        {institution}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <TouchableOpacity
              onPress={handleQuickLookup}
              disabled={loading || !institutionName}
              className="bg-primary rounded-full py-4 items-center mt-4"
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-semibold text-base">Find My Profile</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setMode("signup-method");
                setSignupMethod(null);
              }}
              className="mt-2"
            >
              <Text className="text-muted text-center">← Back to signup options</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    // Student selection view
    return (
      <View className="w-full max-w-md p-6 bg-card/95 rounded-2xl border-2 border-primary/20 backdrop-blur-xl">
        <View className="bg-success/10 border-2 border-success/30 rounded-lg p-4 mb-4">
          <Text className="text-success font-semibold mb-1">Students Found!</Text>
          <Text className="text-muted text-xs">Select your name below to continue</Text>
        </View>

        <View className="space-y-3 mb-4">
          {quickLookupResults.map((student) => (
            <TouchableOpacity
              key={student.id}
              onPress={() => setSelectedStudent(student)}
              className={`p-4 border-2 rounded-xl ${
                selectedStudent?.id === student.id
                  ? "border-primary bg-primary/5"
                  : "border-border bg-surface"
              }`}
            >
              <View className="flex-row items-center gap-3">
                <View
                  className={`p-2 rounded-lg ${
                    selectedStudent?.id === student.id ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <Ionicons
                    name="person"
                    size={20}
                    color={selectedStudent?.id === student.id ? "#fff" : colors.foreground}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-foreground font-bold">{student.name}</Text>
                  <Text className="text-muted text-xs">
                    {student.course} • Year {student.year}
                  </Text>
                  <Text className="text-muted text-xs">{student.email}</Text>
                </View>
                {selectedStudent?.id === student.id && (
                  <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          onPress={handleQuickSignup}
          disabled={!selectedStudent || loading}
          className="bg-primary rounded-full py-4 items-center"
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-semibold text-base">Create Account</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setQuickLookupResults([]);
            setSelectedStudent(null);
            setStudentNumber("");
            setInstitutionName("");
          }}
          className="mt-4"
        >
          <Text className="text-muted text-center">Try Different Details</Text>
        </TouchableOpacity>
      </View>
    );
  };

   return (
    <ImageBackground
      source={require("@/assets/images/hero-multiracial-students.jpg")}
      style={{ flex: 1 }}
      resizeMode="cover"
      blurRadius={3}
    >
      <LinearGradient
        colors={["rgba(0,0,0,0.6)", "rgba(0,0,0,0.8)"]}
        style={{ flex: 1 }}
      >
        <ScreenContainer edges={["top", "left", "right"]}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1"
          >
            <ScrollView
              contentContainerStyle={{
                flexGrow: 1,
                justifyContent: "center",
                alignItems: "center",
                padding: 16,
              }}
              showsVerticalScrollIndicator={false}
            >
              {mode === "login" && renderLoginScreen()}
              {mode === "institution-select" && renderInstitutionSelect()}
              {mode === "signup-method" && renderSignupMethodSelect()}
              {mode === "full-signup" && renderFullSignupForm()}
              {mode === "quick-signup" && renderQuickSignupForm()}
            </ScrollView>
          </KeyboardAvoidingView>
        </ScreenContainer>
      </LinearGradient>
    </ImageBackground>
  );
}
