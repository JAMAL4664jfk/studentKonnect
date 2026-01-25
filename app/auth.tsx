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
// LinearGradient removed - using ImageBackground instead
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { supabase } from "@/lib/supabase";
import Toast from "react-native-toast-message";
import { SA_INSTITUTIONS, Institution } from "@/constants/sa-institutions-with-logos";

type AuthMode = "login" | "signup";

export default function AuthScreen() {
  const colors = useColors();
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showInstitutionPicker, setShowInstitutionPicker] = useState(false);

  // Form state
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [studentNumber, setStudentNumber] = useState("");
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
  const [courseProgram, setCourseProgram] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});

  const filteredInstitutions = SA_INSTITUTIONS.filter((inst) =>
    inst.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inst.shortName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const validateEmail = (email: string): boolean => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const validatePhoneNumber = (phone: string): boolean => {
    // SA phone numbers: 10 digits starting with 0, or 9 digits without 0
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
    if (!/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(password)) {
      return { valid: false, message: "Password must contain at least 1 special character" };
    }
    return { valid: true };
  };

  const validateLoginForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(email)) {
      newErrors.email = "Invalid email format";
    }
    
    if (!password) {
      newErrors.password = "Password is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSignupForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!fullName || fullName.trim().length < 2) {
      newErrors.fullName = "Full name must be at least 2 characters";
    }
    
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(email)) {
      newErrors.email = "Invalid email format";
    }
    
    if (!phoneNumber) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!validatePhoneNumber(phoneNumber)) {
      newErrors.phoneNumber = "Invalid phone number (10 digits starting with 0)";
    }
    
    if (!studentNumber || studentNumber.length < 5) {
      newErrors.studentNumber = "Student number must be at least 5 characters";
    }
    
    if (!selectedInstitution) {
      newErrors.institution = "Please select an institution";
    }
    
    if (!courseProgram || courseProgram.trim().length < 2) {
      newErrors.courseProgram = "Course/Program must be at least 2 characters";
    }
    
    if (!yearOfStudy) {
      newErrors.yearOfStudy = "Please select year of study";
    }
    
    const passwordValidation = validatePassword(password);
    if (!password) {
      newErrors.password = "Password is required";
    } else if (!passwordValidation.valid) {
      newErrors.password = passwordValidation.message!;
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
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
      // Format phone number to E.164 format (+27...)
      const formattedPhone = phoneNumber.startsWith("0")
        ? `+27${phoneNumber.slice(1)}`
        : `+27${phoneNumber}`;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone_number: formattedPhone,
            student_id: studentNumber,
            institution_id: selectedInstitution!.id,
            institution_name: selectedInstitution!.name,
            course_program: courseProgram,
            year_of_study: yearOfStudy,
          },
        },
      });

      if (error) throw error;

      Toast.show({
        type: "success",
        text1: "Account Created!",
        text2: "Welcome to StudentKonnect",
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

  const renderInstitutionPicker = () => (
    <Modal
      visible={showInstitutionPicker}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowInstitutionPicker(false)}
    >
      <View className="flex-1 bg-black/50">
        <TouchableOpacity
          className="flex-1"
          activeOpacity={1}
          onPress={() => setShowInstitutionPicker(false)}
        />
        <View className="bg-background rounded-t-3xl" style={{ maxHeight: "80%" }}>
          <View className="p-6 border-b border-border">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-foreground">
                Select Institution
              </Text>
              <TouchableOpacity onPress={() => setShowInstitutionPicker(false)}>
                <IconSymbol name="xmark.circle.fill" size={28} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
            
            {/* Search */}
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
                <Image
                  source={{ uri: institution.logo }}
                  className="w-12 h-12 rounded-lg mr-3"
                  contentFit="contain"
                />
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
        >
          <ImageBackground
            source={require("@/assets/images/auth-background.jpg")}
            className="flex-1"
            imageStyle={{ opacity: 0.15 }}
            style={{ backgroundColor: colors.background }}
            resizeMode="cover"
          >
            <View className="flex-1 px-6 pt-16 pb-8">
            {/* Logo */}
            <View className="items-center mb-8">
              <Image
                source={require("@/assets/images/student-konnect-logo.png")}
                className="w-32 h-32 mb-4"
                contentFit="contain"
              />
              <Text className="text-3xl font-bold text-white text-center">
                StudentKonnect
              </Text>
              <Text className="text-white/80 text-center mt-2">
                {mode === "login" ? "Welcome back!" : "Create your account"}
              </Text>
            </View>

            {/* Form Container */}
            <View className="bg-background rounded-3xl p-6 shadow-lg">
              {mode === "login" ? (
                // LOGIN FORM
                <View className="gap-4">
                  {/* Email */}
                  <View>
                    <Text className="text-sm font-medium text-foreground mb-2">
                      Email
                    </Text>
                    <View className="flex-row items-center bg-surface rounded-xl px-4 py-3 border border-border">
                      <IconSymbol name="envelope.fill" size={20} color={colors.mutedForeground} />
                      <TextInput
                        value={email}
                        onChangeText={setEmail}
                        placeholder="your.email@example.com"
                        placeholderTextColor={colors.mutedForeground}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        className="flex-1 ml-3 text-foreground"
                      />
                    </View>
                    {errors.email && (
                      <Text className="text-destructive text-xs mt-1">{errors.email}</Text>
                    )}
                  </View>

                  {/* Password */}
                  <View>
                    <Text className="text-sm font-medium text-foreground mb-2">
                      Password
                    </Text>
                    <View className="flex-row items-center bg-surface rounded-xl px-4 py-3 border border-border">
                      <IconSymbol name="lock.fill" size={20} color={colors.mutedForeground} />
                      <TextInput
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Enter your password"
                        placeholderTextColor={colors.mutedForeground}
                        secureTextEntry={!showPassword}
                        className="flex-1 ml-3 text-foreground"
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
                      <Text className="text-destructive text-xs mt-1">{errors.password}</Text>
                    )}
                  </View>

                  {/* Login Button */}
                  <TouchableOpacity
                    onPress={handleLogin}
                    disabled={loading}
                    className="bg-primary rounded-xl py-4 items-center mt-4"
                  >
                    {loading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text className="text-primary-foreground font-semibold text-base">
                        Log In
                      </Text>
                    )}
                  </TouchableOpacity>

                  {/* Switch to Signup */}
                  <View className="flex-row items-center justify-center mt-4">
                    <Text className="text-muted-foreground">Don't have an account? </Text>
                    <TouchableOpacity onPress={() => setMode("signup")}>
                      <Text className="text-primary font-semibold">Sign Up</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                // SIGNUP FORM
                <View className="gap-4">
                  {/* Full Name */}
                  <View>
                    <Text className="text-sm font-medium text-foreground mb-2">
                      Full Name
                    </Text>
                    <View className="flex-row items-center bg-surface rounded-xl px-4 py-3 border border-border">
                      <IconSymbol name="person.fill" size={20} color={colors.mutedForeground} />
                      <TextInput
                        value={fullName}
                        onChangeText={setFullName}
                        placeholder="John Doe"
                        placeholderTextColor={colors.mutedForeground}
                        className="flex-1 ml-3 text-foreground"
                      />
                    </View>
                    {errors.fullName && (
                      <Text className="text-destructive text-xs mt-1">{errors.fullName}</Text>
                    )}
                  </View>

                  {/* Email */}
                  <View>
                    <Text className="text-sm font-medium text-foreground mb-2">
                      Email
                    </Text>
                    <View className="flex-row items-center bg-surface rounded-xl px-4 py-3 border border-border">
                      <IconSymbol name="envelope.fill" size={20} color={colors.mutedForeground} />
                      <TextInput
                        value={email}
                        onChangeText={setEmail}
                        placeholder="your.email@example.com"
                        placeholderTextColor={colors.mutedForeground}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        className="flex-1 ml-3 text-foreground"
                      />
                    </View>
                    {errors.email && (
                      <Text className="text-destructive text-xs mt-1">{errors.email}</Text>
                    )}
                  </View>

                  {/* Phone Number */}
                  <View>
                    <Text className="text-sm font-medium text-foreground mb-2">
                      Phone Number
                    </Text>
                    <View className="flex-row items-center bg-surface rounded-xl px-4 py-3 border border-border">
                      <IconSymbol name="phone.fill" size={20} color={colors.mutedForeground} />
                      <Text className="text-foreground font-medium ml-3 mr-2">+27</Text>
                      <TextInput
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                        placeholder="812345678"
                        placeholderTextColor={colors.mutedForeground}
                        keyboardType="phone-pad"
                        maxLength={10}
                        className="flex-1 text-foreground"
                      />
                    </View>
                    {errors.phoneNumber && (
                      <Text className="text-destructive text-xs mt-1">{errors.phoneNumber}</Text>
                    )}
                  </View>

                  {/* Student Number */}
                  <View>
                    <Text className="text-sm font-medium text-foreground mb-2">
                      Student Number
                    </Text>
                    <View className="flex-row items-center bg-surface rounded-xl px-4 py-3 border border-border">
                      <IconSymbol name="number" size={20} color={colors.mutedForeground} />
                      <TextInput
                        value={studentNumber}
                        onChangeText={setStudentNumber}
                        placeholder="202312345"
                        placeholderTextColor={colors.mutedForeground}
                        className="flex-1 ml-3 text-foreground"
                      />
                    </View>
                    {errors.studentNumber && (
                      <Text className="text-destructive text-xs mt-1">{errors.studentNumber}</Text>
                    )}
                  </View>

                  {/* Institution */}
                  <View>
                    <Text className="text-sm font-medium text-foreground mb-2">
                      Institution
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowInstitutionPicker(true)}
                      className="flex-row items-center bg-surface rounded-xl px-4 py-3 border border-border"
                    >
                      {selectedInstitution ? (
                        <>
                          <Image
                            source={{ uri: selectedInstitution.logo }}
                            className="w-8 h-8 rounded mr-3"
                            contentFit="contain"
                          />
                          <Text className="flex-1 text-foreground">
                            {selectedInstitution.name}
                          </Text>
                        </>
                      ) : (
                        <>
                          <IconSymbol name="building.2.fill" size={20} color={colors.mutedForeground} />
                          <Text className="flex-1 ml-3 text-muted-foreground">
                            Select your institution
                          </Text>
                        </>
                      )}
                      <IconSymbol name="chevron.down" size={20} color={colors.mutedForeground} />
                    </TouchableOpacity>
                    {errors.institution && (
                      <Text className="text-destructive text-xs mt-1">{errors.institution}</Text>
                    )}
                  </View>

                  {/* Course/Program */}
                  <View>
                    <Text className="text-sm font-medium text-foreground mb-2">
                      Course/Program
                    </Text>
                    <View className="flex-row items-center bg-surface rounded-xl px-4 py-3 border border-border">
                      <IconSymbol name="book.fill" size={20} color={colors.mutedForeground} />
                      <TextInput
                        value={courseProgram}
                        onChangeText={setCourseProgram}
                        placeholder="e.g., Computer Science"
                        placeholderTextColor={colors.mutedForeground}
                        className="flex-1 ml-3 text-foreground"
                      />
                    </View>
                    {errors.courseProgram && (
                      <Text className="text-destructive text-xs mt-1">{errors.courseProgram}</Text>
                    )}
                  </View>

                  {/* Year of Study */}
                  <View>
                    <Text className="text-sm font-medium text-foreground mb-2">
                      Year of Study
                    </Text>
                    <View className="flex-row gap-2">
                      {["1", "2", "3", "4+"].map((year) => (
                        <TouchableOpacity
                          key={year}
                          onPress={() => setYearOfStudy(year)}
                          className={`flex-1 py-3 rounded-xl border ${
                            yearOfStudy === year
                              ? "bg-primary border-primary"
                              : "bg-surface border-border"
                          }`}
                        >
                          <Text
                            className={`text-center font-semibold ${
                              yearOfStudy === year ? "text-primary-foreground" : "text-foreground"
                            }`}
                          >
                            {year}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    {errors.yearOfStudy && (
                      <Text className="text-destructive text-xs mt-1">{errors.yearOfStudy}</Text>
                    )}
                  </View>

                  {/* Password */}
                  <View>
                    <Text className="text-sm font-medium text-foreground mb-2">
                      Password
                    </Text>
                    <View className="flex-row items-center bg-surface rounded-xl px-4 py-3 border border-border">
                      <IconSymbol name="lock.fill" size={20} color={colors.mutedForeground} />
                      <TextInput
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Min 8 chars, 1 number, 1 special"
                        placeholderTextColor={colors.mutedForeground}
                        secureTextEntry={!showPassword}
                        className="flex-1 ml-3 text-foreground"
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
                      <Text className="text-destructive text-xs mt-1">{errors.password}</Text>
                    )}
                  </View>

                  {/* Confirm Password */}
                  <View>
                    <Text className="text-sm font-medium text-foreground mb-2">
                      Confirm Password
                    </Text>
                    <View className="flex-row items-center bg-surface rounded-xl px-4 py-3 border border-border">
                      <IconSymbol name="lock.fill" size={20} color={colors.mutedForeground} />
                      <TextInput
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        placeholder="Re-enter your password"
                        placeholderTextColor={colors.mutedForeground}
                        secureTextEntry={!showConfirmPassword}
                        className="flex-1 ml-3 text-foreground"
                      />
                      <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                        <IconSymbol
                          name={showConfirmPassword ? "eye.slash.fill" : "eye.fill"}
                          size={20}
                          color={colors.mutedForeground}
                        />
                      </TouchableOpacity>
                    </View>
                    {errors.confirmPassword && (
                      <Text className="text-destructive text-xs mt-1">{errors.confirmPassword}</Text>
                    )}
                  </View>

                  {/* Sign Up Button */}
                  <TouchableOpacity
                    onPress={handleSignup}
                    disabled={loading}
                    className="bg-primary rounded-xl py-4 items-center mt-4"
                  >
                    {loading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text className="text-primary-foreground font-semibold text-base">
                        Create Account
                      </Text>
                    )}
                  </TouchableOpacity>

                  {/* Switch to Login */}
                  <View className="flex-row items-center justify-center mt-4">
                    <Text className="text-muted-foreground">Already have an account? </Text>
                    <TouchableOpacity onPress={() => setMode("login")}>
                      <Text className="text-primary font-semibold">Log In</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
            </View>
          </ImageBackground>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Institution Picker Modal */}
      {renderInstitutionPicker()}
    </ScreenContainer>
  );
}
