import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Modal } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { supabase, safeGetUser } from "@/lib/supabase";
import Toast from "react-native-toast-message";

export default function DatingScreen() {
  const colors = useColors();
  const router = useRouter();
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const [ageVerified, setAgeVerified] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  useEffect(() => {
    checkUserProfile();
  }, []);

  const checkUserProfile = async () => {
    try {
      const { data: { user } } = await safeGetUser();
      if (user) {
        // Check if user has already verified age
        const { data: profile } = await supabase
          .from('profiles')
          .select('age_verified_for_dating')
          .eq('id', user.id)
          .maybeSingle();
        
        if (profile?.age_verified_for_dating) {
          setAgeVerified(true);
        }

        // Check dating profile
        const { data: datingProfile } = await supabase
          .from('dating_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        setUserProfile(datingProfile);
      }
    } catch (error) {
      console.error('Error checking profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartSwiping = () => {
    if (!ageVerified) {
      // Show age verification modal
      setShowAgeVerification(true);
      return;
    }

    if (userProfile) {
      // Navigate to swipe screen
      router.push('/dating-swipe' as any);
    } else {
      // Navigate to profile creation
      router.push('/dating-profile-setup' as any);
    }
  };

  const handleAgeVerification = async () => {
    if (!agreedToTerms) {
      Toast.show({
        type: 'error',
        text1: 'Confirmation Required',
        text2: 'Please confirm you are 18 years or older',
      });
      return;
    }

    try {
      const { data: { user } } = await safeGetUser();
      if (user) {
        // Store age verification in database
        const { error } = await supabase
          .from('profiles')
          .update({ age_verified_for_dating: true })
          .eq('id', user.id);

        if (error) throw error;

        setAgeVerified(true);
        setShowAgeVerification(false);
        
        Toast.show({
          type: 'success',
          text1: 'Verification Complete',
          text2: 'You can now access dating features',
        });

        // Proceed to next step
        if (userProfile) {
          router.push('/dating-swipe' as any);
        } else {
          router.push('/dating-profile-setup' as any);
        }
      }
    } catch (error) {
      console.error('Error verifying age:', error);
      Toast.show({
        type: 'error',
        text1: 'Verification Failed',
        text2: 'Please try again',
      });
    }
  };

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      <ScrollView className="flex-1 p-4">
        <View className="gap-6">
          <View className="flex-row items-center gap-4">
            <TouchableOpacity onPress={() => router.back()}>
              <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-foreground">Student Dating</Text>
              <Text className="text-sm text-muted">Connect with fellow students</Text>
            </View>
          </View>

          <View className="bg-primary rounded-2xl p-6" style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 }}>
            <IconSymbol name="heart.fill" size={48} color="white" />
            <Text className="text-white text-2xl font-bold mt-4 mb-2">Student Dating</Text>
            <Text className="text-white text-base opacity-90">Meet and connect with students at your campus</Text>
          </View>

          <TouchableOpacity 
            onPress={handleStartSwiping}
            className="bg-primary rounded-2xl p-4 items-center active:opacity-70 mb-6"
          >
            <Text className="text-white text-base font-semibold">
              {loading ? 'Loading...' : userProfile ? 'Start Swiping' : 'Create Profile'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Age Verification Modal */}
      <Modal
        visible={showAgeVerification}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAgeVerification(false)}
      >
        <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View className="bg-background mx-6 rounded-3xl p-6 w-11/12 max-w-md" style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 }}>
            {/* Header */}
            <View className="items-center mb-6">
              <View className="bg-primary/10 rounded-full p-4 mb-4">
                <IconSymbol name="exclamationmark.shield.fill" size={48} color={colors.primary} />
              </View>
              <Text className="text-2xl font-bold text-foreground text-center">Age Verification Required</Text>
              <Text className="text-sm text-muted text-center mt-2">
                You must be 18 years or older to use dating features
              </Text>
            </View>

            {/* Terms and Conditions */}
            <View className="bg-muted/20 rounded-2xl p-4 mb-6">
              <Text className="text-sm text-foreground mb-3">
                By accessing the dating features, you confirm that:
              </Text>
              <View className="gap-2">
                <View className="flex-row gap-2">
                  <Text className="text-foreground">•</Text>
                  <Text className="text-sm text-foreground flex-1">You are at least 18 years of age</Text>
                </View>
                <View className="flex-row gap-2">
                  <Text className="text-foreground">•</Text>
                  <Text className="text-sm text-foreground flex-1">You will not engage in any illegal activities</Text>
                </View>
                <View className="flex-row gap-2">
                  <Text className="text-foreground">•</Text>
                  <Text className="text-sm text-foreground flex-1">You will respect other users and follow community guidelines</Text>
                </View>
                <View className="flex-row gap-2">
                  <Text className="text-foreground">•</Text>
                  <Text className="text-sm text-foreground flex-1">You understand that false information may result in account suspension</Text>
                </View>
              </View>
            </View>

            {/* Checkbox */}
            <TouchableOpacity 
              onPress={() => setAgreedToTerms(!agreedToTerms)}
              className="flex-row items-center mb-6 p-3 rounded-xl active:opacity-70"
              style={{ backgroundColor: colors.muted + '20' }}
            >
              <View 
                className="w-6 h-6 rounded-md border-2 mr-3 items-center justify-center"
                style={{ 
                  borderColor: agreedToTerms ? colors.primary : colors.muted,
                  backgroundColor: agreedToTerms ? colors.primary : 'transparent'
                }}
              >
                {agreedToTerms && (
                  <IconSymbol name="checkmark" size={16} color="white" />
                )}
              </View>
              <Text className="text-sm text-foreground flex-1 font-medium">
                I confirm that I am 18 years of age or older
              </Text>
            </TouchableOpacity>

            {/* Buttons */}
            <View className="gap-3">
              <TouchableOpacity
                onPress={handleAgeVerification}
                className="rounded-xl p-4 items-center active:opacity-70"
                style={{ 
                  backgroundColor: agreedToTerms ? colors.primary : colors.muted,
                  opacity: agreedToTerms ? 1 : 0.5
                }}
              >
                <Text className="text-white text-base font-semibold">Continue</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setShowAgeVerification(false);
                  setAgreedToTerms(false);
                }}
                className="rounded-xl p-4 items-center active:opacity-70"
                style={{ backgroundColor: colors.muted + '30' }}
              >
                <Text className="text-foreground text-base font-semibold">Cancel</Text>
              </TouchableOpacity>
            </View>

            {/* Warning */}
            <View className="mt-4 p-3 bg-destructive/10 rounded-xl">
              <Text className="text-xs text-destructive text-center">
                ⚠️ Providing false information is a violation of our terms and may result in permanent account suspension
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
