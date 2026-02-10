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
  Modal,
  ImageBackground,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { supabase } from "@/lib/supabase";
import Toast from "react-native-toast-message";
import { SA_INSTITUTIONS, Institution, getInstitutionsByType } from "@/constants/sa-institutions-with-logos";

type AuthMode = "login" | "institution-select" | "signup-method" | "full-signup" | "quick-signup";
type InstitutionType = "university" | "tvet" | "staff" | "parent" | "";
type SignupMethod = "full" | "quick" | null;

export default function AuthScreen() {
  const colors = useColors();
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showInstitutionPicker, setShowInstitutionPicker] = useState(false);
  const [signupMethod, setSignupMethod] = useState<SignupMethod>(null);
  const [showPopiaConsent, setShowPopiaConsent] = useState(false);
  const [popiaAccepted, setPopiaAccepted] = useState<boolean | null>(null);

  // Form state
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [studentNumber, setStudentNumber] = useState("");
  const [institutionType, setInstitutionType] = useState<InstitutionType>("");
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
  const [courseProgram, setCourseProgram] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Quick signup state
  const [quickLookupResults, setQuickLookupResults] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const filteredInstitutions = SA_INSTITUTIONS.filter((inst) => {
    const matchesSearch = inst.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inst.shortName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = institutionType === "university" ? inst.type === "university" :
                       institutionType === "tvet" ? inst.type === "tvet" : true;
    return matchesSearch && matchesType;
  });

  const validateEmail = (email: string): boolean => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const validatePhoneNumber = (phone: string): boolean => {
    const cleaned = phone.replace(/\s/g, "");
    return /^0\d{9}$/.test(cleaned) || /^\d{9}$/.test(cleaned);
  };

  const validatePassword = (password: string): { valid: boolean; message?: string } => {
    if (password.length < 8) {
      return { valid: false, message: "Password must be at least 8 characters" };
    }
    if (!/(?=.*[0-9])/.test(password)) {
      return { valid: false, message: "Password must contain at least 1 number" };
    }
    if (!/(?=.*[!@#$%^&*(),.?\":{}|<>])/.test(password)) {
      return { valid: false, message: "Password must contain at least 1 special character" };
    }
    return { valid: true };
  };

  const validateLoginForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!email) newErrors.email = "Email is required";
    else if (!validateEmail(email)) newErrors.email = "Invalid email format";
    if (!password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSignupForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!fullName || fullName.trim().length < 2) {
      newErrors.fullName = "Full name must be at least 2 characters";
    }
    if (!email) newErrors.email = "Email is required";
    else if (!validateEmail(email)) newErrors.email = "Invalid email format";
    if (!phoneNumber) newErrors.phoneNumber = "Phone number is required";
    else if (!validatePhoneNumber(phoneNumber)) newErrors.phoneNumber = "Invalid phone number";
    if (!studentNumber || studentNumber.length < 5) {
      newErrors.studentNumber = "Student number must be at least 5 characters";
    }
    if (!selectedInstitution) newErrors.institution = "Please select an institution";
    if (!courseProgram || courseProgram.trim().length < 2) {
      newErrors.courseProgram = "Course/Program must be at least 2 characters";
    }
    if (!yearOfStudy) newErrors.yearOfStudy = "Please select year of study";
    
    const passwordValidation = validatePassword(password);
    if (!password) newErrors.password = "Password is required";
    else if (!passwordValidation.valid) newErrors.password = passwordValidation.message!;
    
    if (!confirmPassword) newErrors.confirmPassword = "Please confirm your password";
    else if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    
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

      router.replace("/(tabs)/services");
    } catch (error: any) {
      let errorMessage = error.message || "Invalid email or password";
      
      // Check if it's an email confirmation issue
      if (error.message?.includes("Email not confirmed") || error.message?.includes("confirm")) {
        errorMessage = "Please confirm your email address first";
      } else if (error.message?.includes("Invalid login credentials")) {
        errorMessage = "Invalid email or password. Please check and try again.";
      }
      
      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!validateSignupForm()) return;

    // Show POPIA consent popup first
    setShowPopiaConsent(true);
  };

  const proceedWithSignup = async () => {
    setLoading(true);
    try {
      const formattedPhone = phoneNumber.startsWith("0")
        ? `+27${phoneNumber.slice(1)}`
        : `+27${phoneNumber}`;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined,
          data: {
            full_name: fullName,
            phone_number: formattedPhone,
            student_id: studentNumber,
            institution_id: selectedInstitution!.id,
            institution_name: selectedInstitution!.name,
            institution_type: institutionType,
            course_program: courseProgram,
            year_of_study: yearOfStudy,
          },
        },
      });

      if (error) throw error;

      // Create profile in profiles table (fallback if trigger doesn't work)
      if (data.user) {
        const { error: profileError } = await supabase
          .from("profiles")
          .insert({
            id: data.user.id,
            full_name: fullName,
            email: email,
            phone_number: formattedPhone,
            institution_id: selectedInstitution!.id,
            institution_name: selectedInstitution!.name,
            course_program: courseProgram,
            year_of_study: yearOfStudy,
            popia_consent: popiaAccepted,
            popia_consent_date: new Date().toISOString(),
          });
        
        // Log error but don't fail signup
        if (profileError) {
          console.warn("Profile creation warning:", profileError.message);
        }
      }

      // Check if email confirmation is required
      if (data.user && !data.session) {
        Toast.show({
          type: "info",
          text1: "Account Created!",
          text2: "Please check your email to confirm your account",
        });
        setMode("login");
        return;
      }

      Toast.show({
        type: "success",
        text1: "Account Created!",
        text2: "Welcome to StudentKonnect",
      });

      router.replace("/(tabs)/services");
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
    if (!studentNumber || !selectedInstitution) {
      Toast.show({
        type: "error",
        text1: "Missing Information",
        text2: "Please enter student number and select institution",
      });
      return;
    }

    setLoading(true);
    try {
      // Mock lookup - in production, query actual database
      const mockStudents = [
        {
          id: 1,
          name: fullName || "John Doe",
          studentNumber: studentNumber,
          institution: selectedInstitution.name,
          course: "Computer Science",
          year: 3,
          email: `${studentNumber}@student.ac.za`,
        },
      ];

      setQuickLookupResults(mockStudents);
      if (mockStudents.length > 0) {
        setSelectedStudent(mockStudents[0]);
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

  const renderInstitutionPicker = () => (
    <Modal
      visible={showInstitutionPicker}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowInstitutionPicker(false)}
    >
      <View className="flex-1 bg-black/30">
        <TouchableOpacity
          className="flex-1"
          activeOpacity={1}
          onPress={() => setShowInstitutionPicker(false)}
        />
        <View className="bg-background/90 backdrop-blur-lg rounded-t-3xl" style={{ maxHeight: "80%" }}>
          <View className="p-6 border-b border-border">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-foreground">
                Select Institution
              </Text>
              <TouchableOpacity onPress={() => setShowInstitutionPicker(false)}>
                <IconSymbol name="xmark.circle.fill" size={28} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
            
            <View className="flex-row items-center bg-surface rounded-xl px-4 py-3">
              <IconSymbol name="magnifyingglass" size={20} color={colors.mutedForeground} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search institutions..."
                placeholderTextColor={colors.mutedForeground}
                className="flex-1 ml-2 text-foreground"
              />
            </View>
          </View>

          <ScrollView className="px-6">
            {filteredInstitutions.map((institution) => (
              <TouchableOpacity
                key={institution.id}
                onPress={() => {
                  setSelectedInstitution(institution);
                  setShowInstitutionPicker(false);
                  setSearchQuery("");
                }}
                className="flex-row items-center py-4 border-b border-border"
              >
                <View className="w-12 h-12 rounded-lg mr-3 bg-white items-center justify-center overflow-hidden">
                  <Image
                    source={{ uri: institution.logo }}
                    className="w-full h-full"
                    contentFit="contain"
                    transition={200}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-foreground">
                    {institution.name}
                  </Text>
                  <Text className="text-sm text-muted-foreground mt-1">
                    {institution.type === "university" ? "University" : "TVET College"}
                  </Text>
                </View>
                {selectedInstitution?.id === institution.id && (
                  <IconSymbol name="checkmark.circle.fill" size={24} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <ImageBackground
            source={require("@/assets/images/auth-background.jpg")}
            className="flex-1"
            resizeMode="cover"
          >
            <View className="flex-1 bg-black/40 px-6 pt-16 pb-8">
            {/* Logo */}
            <View className="items-center mb-8">
              <View className="w-32 h-32 rounded-full overflow-hidden mb-4" style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 }}>
                <Image
                  source={require("@/assets/images/student-konnect-logo.png")}
                  style={{ width: 128, height: 128 }}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                />
              </View>
              <View className="bg-white/20 backdrop-blur-md rounded-2xl px-6 py-4">
                <Text className="text-3xl font-bold text-white text-center">
                  StudentKonnect
                </Text>
                <Text className="text-white/90 text-center mt-2">
                  {mode === "login" ? "Welcome back!" :
                   mode === "institution-select" ? "Select your category" :
                   mode === "signup-method" ? "Choose registration method" :
                   "Create your account"}
                </Text>
              </View>
            </View>

            {/* Form Container */}
            <View className="bg-white/85 backdrop-blur-md rounded-3xl p-6 shadow-lg">
              {mode === "login" && (
                // LOGIN FORM
                <View className="gap-4">
                  <View>
                    <Text className="text-sm font-medium text-gray-700 mb-2">Email</Text>
                    <View className="flex-row items-center bg-white rounded-xl px-4 py-3 border border-gray-200">
                      <IconSymbol name="envelope.fill" size={20} color="#6b7280" />
                      <TextInput
                        value={email}
                        onChangeText={setEmail}
                        placeholder="your.email@example.com"
                        placeholderTextColor="#9ca3af"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        className="flex-1 ml-3 text-gray-900"
                      />
                    </View>
                    {errors.email && <Text className="text-red-500 text-xs mt-1">{errors.email}</Text>}
                  </View>

                  <View>
                    <Text className="text-sm font-medium text-gray-700 mb-2">Password</Text>
                    <View className="flex-row items-center bg-white rounded-xl px-4 py-3 border border-gray-200">
                      <IconSymbol name="lock.fill" size={20} color="#6b7280" />
                      <TextInput
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Enter your password"
                        placeholderTextColor="#9ca3af"
                        secureTextEntry={!showPassword}
                        className="flex-1 ml-3 text-gray-900"
                      />
                      <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <IconSymbol name={showPassword ? "eye.slash.fill" : "eye.fill"} size={20} color="#6b7280" />
                      </TouchableOpacity>
                    </View>
                    {errors.password && <Text className="text-red-500 text-xs mt-1">{errors.password}</Text>}
                  </View>

                  <TouchableOpacity
                    onPress={handleLogin}
                    disabled={loading}
                    className="bg-blue-600 rounded-xl py-4 items-center mt-4"
                  >
                    {loading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text className="text-white font-semibold text-base">Log In</Text>
                    )}
                  </TouchableOpacity>

                  <View className="flex-row items-center justify-center mt-4">
                    <Text className="text-gray-600">Don't have an account? </Text>
                    <TouchableOpacity onPress={() => setMode("institution-select")}>
                      <Text className="text-blue-600 font-semibold">Sign Up</Text>
                    </TouchableOpacity>
                  </View>

                  <View className="flex-row items-center my-4">
                    <View className="flex-1 h-px bg-gray-300" />
                    <Text className="mx-4 text-gray-500 text-sm">or</Text>
                    <View className="flex-1 h-px bg-gray-300" />
                  </View>

                  <TouchableOpacity
                    onPress={() => router.replace("/(tabs)/services")}
                    className="bg-gray-900 rounded-xl py-4 items-center"
                  >
                    <View className="flex-row items-center">
                      <IconSymbol name="person.fill" size={20} color="#ffffff" />
                      <Text className="text-white font-bold text-base ml-2">Continue as Guest</Text>
                    </View>
                  </TouchableOpacity>
                  <Text className="text-gray-600 text-xs text-center mt-2">Explore the app without creating an account</Text>
                </View>
              )}

              {mode === "institution-select" && (
                // INSTITUTION TYPE SELECTION
                <View className="gap-4">
                  <Text className="text-lg font-bold text-gray-900 text-center mb-2">
                    I am a...
                  </Text>

                  <TouchableOpacity
                    onPress={() => {
                      setInstitutionType("university");
                      setMode("signup-method");
                    }}
                    className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 items-center"
                  >
                    <IconSymbol name="building.2.fill" size={32} color="#2563eb" />
                    <Text className="text-blue-900 font-semibold text-base mt-2">University Student</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      setInstitutionType("tvet");
                      setMode("signup-method");
                    }}
                    className="bg-green-50 border-2 border-green-200 rounded-xl p-4 items-center"
                  >
                    <IconSymbol name="graduationcap.fill" size={32} color="#16a34a" />
                    <Text className="text-green-900 font-semibold text-base mt-2">TVET College Student</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      setInstitutionType("staff");
                      setMode("signup-method");
                    }}
                    className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4 items-center"
                  >
                    <IconSymbol name="person.badge.key.fill" size={32} color="#9333ea" />
                    <Text className="text-purple-900 font-semibold text-base mt-2">Staff Member</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      setInstitutionType("parent");
                      setMode("signup-method");
                    }}
                    className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4 items-center"
                  >
                    <IconSymbol name="person.2.fill" size={32} color="#ea580c" />
                    <Text className="text-orange-900 font-semibold text-base mt-2">Parent/Guardian</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setMode("login")}
                    className="mt-4"
                  >
                    <Text className="text-gray-600 text-center">
                      Already have an account? <Text className="text-blue-600 font-semibold">Log In</Text>
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {mode === "signup-method" && (
                // SIGNUP METHOD SELECTION
                <View className="gap-4">
                  <Text className="text-lg font-bold text-gray-900 text-center mb-2">
                    Choose Registration Method
                  </Text>

                  <TouchableOpacity
                    onPress={() => {
                      setSignupMethod("quick");
                      setMode("quick-signup");
                    }}
                    className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4"
                  >
                    <View className="flex-row items-center">
                      <IconSymbol name="bolt.fill" size={28} color="#2563eb" />
                      <View className="flex-1 ml-3">
                        <Text className="text-blue-900 font-semibold text-base">Quick Registration</Text>
                        <Text className="text-gray-600 text-sm mt-1">
                          Auto-fill with student number lookup
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      setSignupMethod("full");
                      setMode("full-signup");
                    }}
                    className="bg-green-50 border-2 border-green-200 rounded-xl p-4"
                  >
                    <View className="flex-row items-center">
                      <IconSymbol name="pencil.circle.fill" size={28} color="#16a34a" />
                      <View className="flex-1 ml-3">
                        <Text className="text-green-900 font-semibold text-base">Full Registration</Text>
                        <Text className="text-gray-600 text-sm mt-1">
                          Enter all details manually
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setMode("institution-select")}
                    className="mt-4"
                  >
                    <Text className="text-gray-600 text-center">
                      <Text className="text-blue-600 font-semibold">← Back</Text>
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {mode === "quick-signup" && (
                // QUICK SIGNUP
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View className="gap-4">
                    <Text className="text-lg font-bold text-gray-900 text-center mb-2">
                      Quick Registration
                    </Text>

                    <View>
                      <Text className="text-sm font-medium text-gray-700 mb-2">Student Number</Text>
                      <View className="flex-row items-center bg-white rounded-xl px-4 py-3 border border-gray-200">
                        <IconSymbol name="number" size={20} color="#6b7280" />
                        <TextInput
                          value={studentNumber}
                          onChangeText={setStudentNumber}
                          placeholder="202312345"
                          placeholderTextColor="#9ca3af"
                          className="flex-1 ml-3 text-gray-900"
                        />
                      </View>
                    </View>

                    <View>
                      <Text className="text-sm font-medium text-gray-700 mb-2">Institution</Text>
                      <TouchableOpacity
                        onPress={() => setShowInstitutionPicker(true)}
                        className="flex-row items-center bg-white rounded-xl px-4 py-3 border border-gray-200"
                      >
                        {selectedInstitution ? (
                          <>
                            <View className="w-8 h-8 rounded mr-3 bg-gray-100 items-center justify-center overflow-hidden">
                              <Image
                                source={{ uri: selectedInstitution.logo }}
                                className="w-full h-full"
                                contentFit="contain"
                                transition={200}
                              />
                            </View>
                            <Text className="flex-1 text-gray-900">{selectedInstitution.name}</Text>
                          </>
                        ) : (
                          <>
                            <IconSymbol name="building.2.fill" size={20} color="#6b7280" />
                            <Text className="flex-1 ml-3 text-gray-400">Select your institution</Text>
                          </>
                        )}
                        <IconSymbol name="chevron.down" size={20} color="#6b7280" />
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      onPress={handleQuickLookup}
                      disabled={loading}
                      className="bg-blue-600 rounded-xl py-4 items-center"
                    >
                      {loading ? (
                        <ActivityIndicator color="white" />
                      ) : (
                        <Text className="text-white font-semibold text-base">Lookup Student</Text>
                      )}
                    </TouchableOpacity>

                    {selectedStudent && (
                      <View className="bg-green-50 border border-green-200 rounded-xl p-4 mt-2">
                        <Text className="text-green-900 font-semibold mb-2">Student Found!</Text>
                        <Text className="text-gray-700">Name: {selectedStudent.name}</Text>
                        <Text className="text-gray-700">Course: {selectedStudent.course}</Text>
                        <Text className="text-gray-700">Year: {selectedStudent.year}</Text>
                        
                        <TouchableOpacity
                          onPress={handleSignup}
                          disabled={loading}
                          className="bg-green-600 rounded-xl py-3 items-center mt-4"
                        >
                          <Text className="text-white font-semibold">Confirm & Create Account</Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    <TouchableOpacity
                      onPress={() => setMode("signup-method")}
                      className="mt-4"
                    >
                      <Text className="text-gray-600 text-center">
                        <Text className="text-blue-600 font-semibold">← Back</Text>
                      </Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              )}

              {mode === "full-signup" && (
                // FULL SIGNUP FORM (scrollable)
                <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled={true} keyboardShouldPersistTaps="handled">
                  <View className="gap-4">
                    <Text className="text-lg font-bold text-gray-900 text-center mb-2">
                      Full Registration
                    </Text>

                    {/* All form fields here - keeping it concise */}
                    <View>
                      <Text className="text-sm font-medium text-gray-700 mb-2">Full Name</Text>
                      <View className="flex-row items-center bg-white rounded-xl px-4 py-3 border border-gray-200">
                        <IconSymbol name="person.fill" size={20} color="#6b7280" />
                        <TextInput
                          value={fullName}
                          onChangeText={setFullName}
                          placeholder="John Doe"
                          placeholderTextColor="#9ca3af"
                          className="flex-1 ml-3 text-gray-900"
                        />
                      </View>
                      {errors.fullName && <Text className="text-red-500 text-xs mt-1">{errors.fullName}</Text>}
                    </View>

                    <View>
                      <Text className="text-sm font-medium text-gray-700 mb-2">Email</Text>
                      <View className="flex-row items-center bg-white rounded-xl px-4 py-3 border border-gray-200">
                        <IconSymbol name="envelope.fill" size={20} color="#6b7280" />
                        <TextInput
                          value={email}
                          onChangeText={setEmail}
                          placeholder="your.email@example.com"
                          placeholderTextColor="#9ca3af"
                          keyboardType="email-address"
                          autoCapitalize="none"
                          className="flex-1 ml-3 text-gray-900"
                        />
                      </View>
                      {errors.email && <Text className="text-red-500 text-xs mt-1">{errors.email}</Text>}
                    </View>

                    <View>
                      <Text className="text-sm font-medium text-gray-700 mb-2">Phone Number</Text>
                      <View className="flex-row items-center bg-white rounded-xl px-4 py-3 border border-gray-200">
                        <IconSymbol name="phone.fill" size={20} color="#6b7280" />
                        <Text className="text-gray-900 font-medium ml-3 mr-2">+27</Text>
                        <TextInput
                          value={phoneNumber}
                          onChangeText={setPhoneNumber}
                          placeholder="812345678"
                          placeholderTextColor="#9ca3af"
                          keyboardType="phone-pad"
                          maxLength={10}
                          className="flex-1 text-gray-900"
                        />
                      </View>
                      {errors.phoneNumber && <Text className="text-red-500 text-xs mt-1">{errors.phoneNumber}</Text>}
                    </View>

                    <View>
                      <Text className="text-sm font-medium text-gray-700 mb-2">Student Number</Text>
                      <View className="flex-row items-center bg-white rounded-xl px-4 py-3 border border-gray-200">
                        <IconSymbol name="number" size={20} color="#6b7280" />
                        <TextInput
                          value={studentNumber}
                          onChangeText={setStudentNumber}
                          placeholder="202312345"
                          placeholderTextColor="#9ca3af"
                          className="flex-1 ml-3 text-gray-900"
                        />
                      </View>
                      {errors.studentNumber && <Text className="text-red-500 text-xs mt-1">{errors.studentNumber}</Text>}
                    </View>

                    <View>
                      <Text className="text-sm font-medium text-gray-700 mb-2">Institution</Text>
                      <TouchableOpacity
                        onPress={() => setShowInstitutionPicker(true)}
                        className="flex-row items-center bg-white rounded-xl px-4 py-3 border border-gray-200"
                      >
                        {selectedInstitution ? (
                          <>
                            <View className="w-8 h-8 rounded mr-3 bg-gray-100 items-center justify-center overflow-hidden">
                              <Image
                                source={{ uri: selectedInstitution.logo }}
                                className="w-full h-full"
                                contentFit="contain"
                                transition={200}
                              />
                            </View>
                            <Text className="flex-1 text-gray-900">{selectedInstitution.name}</Text>
                          </>
                        ) : (
                          <>
                            <IconSymbol name="building.2.fill" size={20} color="#6b7280" />
                            <Text className="flex-1 ml-3 text-gray-400">Select your institution</Text>
                          </>
                        )}
                        <IconSymbol name="chevron.down" size={20} color="#6b7280" />
                      </TouchableOpacity>
                      {errors.institution && <Text className="text-red-500 text-xs mt-1">{errors.institution}</Text>}
                    </View>

                    <View>
                      <Text className="text-sm font-medium text-gray-700 mb-2">Course/Program</Text>
                      <View className="flex-row items-center bg-white rounded-xl px-4 py-3 border border-gray-200">
                        <IconSymbol name="book.fill" size={20} color="#6b7280" />
                        <TextInput
                          value={courseProgram}
                          onChangeText={setCourseProgram}
                          placeholder="e.g., Computer Science"
                          placeholderTextColor="#9ca3af"
                          className="flex-1 ml-3 text-gray-900"
                        />
                      </View>
                      {errors.courseProgram && <Text className="text-red-500 text-xs mt-1">{errors.courseProgram}</Text>}
                    </View>

                    <View>
                      <Text className="text-sm font-medium text-gray-700 mb-2">Year of Study</Text>
                      <View className="flex-row gap-2">
                        {["1", "2", "3", "4+"].map((year) => (
                          <TouchableOpacity
                            key={year}
                            onPress={() => setYearOfStudy(year)}
                            className={`flex-1 py-3 rounded-xl border ${
                              yearOfStudy === year
                                ? "bg-blue-600 border-blue-600"
                                : "bg-white border-gray-200"
                            }`}
                          >
                            <Text
                              className={`text-center font-semibold ${
                                yearOfStudy === year ? "text-white" : "text-gray-900"
                              }`}
                            >
                              {year}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                      {errors.yearOfStudy && <Text className="text-red-500 text-xs mt-1">{errors.yearOfStudy}</Text>}
                    </View>

                    <View>
                      <Text className="text-sm font-medium text-gray-700 mb-2">Password</Text>
                      <View className="flex-row items-center bg-white rounded-xl px-4 py-3 border border-gray-200">
                        <IconSymbol name="lock.fill" size={20} color="#6b7280" />
                        <TextInput
                          value={password}
                          onChangeText={setPassword}
                          placeholder="Min 8 chars, 1 number, 1 special"
                          placeholderTextColor="#9ca3af"
                          secureTextEntry={!showPassword}
                          className="flex-1 ml-3 text-gray-900"
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                          <IconSymbol name={showPassword ? "eye.slash.fill" : "eye.fill"} size={20} color="#6b7280" />
                        </TouchableOpacity>
                      </View>
                      {errors.password && <Text className="text-red-500 text-xs mt-1">{errors.password}</Text>}
                    </View>

                    <View>
                      <Text className="text-sm font-medium text-gray-700 mb-2">Confirm Password</Text>
                      <View className="flex-row items-center bg-white rounded-xl px-4 py-3 border border-gray-200">
                        <IconSymbol name="lock.fill" size={20} color="#6b7280" />
                        <TextInput
                          value={confirmPassword}
                          onChangeText={setConfirmPassword}
                          placeholder="Re-enter your password"
                          placeholderTextColor="#9ca3af"
                          secureTextEntry={!showConfirmPassword}
                          className="flex-1 ml-3 text-gray-900"
                        />
                        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                          <IconSymbol name={showConfirmPassword ? "eye.slash.fill" : "eye.fill"} size={20} color="#6b7280" />
                        </TouchableOpacity>
                      </View>
                      {errors.confirmPassword && <Text className="text-red-500 text-xs mt-1">{errors.confirmPassword}</Text>}
                    </View>

                    <TouchableOpacity
                      onPress={handleSignup}
                      disabled={loading}
                      className="bg-blue-600 rounded-xl py-4 items-center mt-4"
                    >
                      {loading ? (
                        <ActivityIndicator color="white" />
                      ) : (
                        <Text className="text-white font-semibold text-base">Create Account</Text>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => setMode("signup-method")}
                      className="mt-4"
                    >
                      <Text className="text-gray-600 text-center">
                        <Text className="text-blue-600 font-semibold">← Back</Text>
                      </Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              )}
            </View>
            </View>
          </ImageBackground>
        </ScrollView>
      </KeyboardAvoidingView>

      {renderInstitutionPicker()}

      {/* POPIA Consent Modal */}
      <Modal
        visible={showPopiaConsent}
        animationType="slide"
        transparent
        onRequestClose={() => {}}
      >
        <View className="flex-1 justify-center items-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <View className="bg-white rounded-3xl p-6 mx-6 max-w-lg w-full">
            <View className="items-center mb-4">
              <View className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center mb-3">
                <IconSymbol name="shield.checkmark.fill" size={32} color={colors.primary} />
              </View>
              <Text className="text-2xl font-bold text-gray-900 text-center mb-2">
                Privacy & Data Protection
              </Text>
              <Text className="text-sm text-gray-500 text-center">
                POPIA Act Compliance
              </Text>
            </View>

            <ScrollView className="max-h-96 mb-6" showsVerticalScrollIndicator={true}>
              <View className="bg-gray-50 rounded-xl p-4 mb-4">
                <Text className="text-base text-gray-800 font-semibold mb-3">
                  Protection of Personal Information Act (POPIA)
                </Text>
                <Text className="text-sm text-gray-700 leading-6 mb-3">
                  By creating an account on StudentKonnect, you acknowledge and consent to the following:
                </Text>
                
                <View className="mb-3">
                  <Text className="text-sm font-semibold text-gray-800 mb-1">1. Information Collection</Text>
                  <Text className="text-sm text-gray-700 leading-5">
                    We collect and process your personal information including name, email, phone number, student ID, institution details, and profile information.
                  </Text>
                </View>

                <View className="mb-3">
                  <Text className="text-sm font-semibold text-gray-800 mb-1">2. Purpose of Processing</Text>
                  <Text className="text-sm text-gray-700 leading-5">
                    Your data is used to provide services, facilitate connections with other students, enable marketplace transactions, accommodation listings, and improve user experience.
                  </Text>
                </View>

                <View className="mb-3">
                  <Text className="text-sm font-semibold text-gray-800 mb-1">3. Data Security</Text>
                  <Text className="text-sm text-gray-700 leading-5">
                    We implement appropriate security measures to protect your personal information from unauthorized access, alteration, or disclosure.
                  </Text>
                </View>

                <View className="mb-3">
                  <Text className="text-sm font-semibold text-gray-800 mb-1">4. Your Rights</Text>
                  <Text className="text-sm text-gray-700 leading-5">
                    You have the right to access, correct, or delete your personal information at any time. You may also withdraw consent by deleting your account.
                  </Text>
                </View>

                <View className="mb-3">
                  <Text className="text-sm font-semibold text-gray-800 mb-1">5. Data Sharing</Text>
                  <Text className="text-sm text-gray-700 leading-5">
                    Your profile information may be visible to other verified students on the platform. We do not sell your data to third parties.
                  </Text>
                </View>

                <View>
                  <Text className="text-sm font-semibold text-gray-800 mb-1">6. Retention Period</Text>
                  <Text className="text-sm text-gray-700 leading-5">
                    Your data will be retained for as long as your account is active or as needed to provide services. You may request deletion at any time.
                  </Text>
                </View>
              </View>

              <Text className="text-xs text-gray-600 leading-5">
                By accepting, you confirm that you have read and understood this notice and consent to the processing of your personal information in accordance with POPIA and our Privacy Policy.
              </Text>
            </ScrollView>

            <View className="gap-3">
              <TouchableOpacity
                onPress={() => {
                  setPopiaAccepted(true);
                  setShowPopiaConsent(false);
                  proceedWithSignup();
                }}
                className="bg-primary py-4 rounded-2xl items-center"
              >
                <Text className="text-white font-bold text-base">
                  I Accept - Continue Sign Up
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setPopiaAccepted(false);
                  setShowPopiaConsent(false);
                  Toast.show({
                    type: "info",
                    text1: "Sign Up Cancelled",
                    text2: "You must accept the POPIA terms to create an account",
                  });
                }}
                className="bg-gray-200 py-4 rounded-2xl items-center"
              >
                <Text className="text-gray-700 font-semibold text-base">
                  I Decline - Cancel Sign Up
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
