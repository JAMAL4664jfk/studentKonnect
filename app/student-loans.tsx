import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

export default function StudentLoansScreen() {
  const colors = useColors();
  const router = useRouter();

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      <ScrollView className="flex-1 p-4">
        <View className="gap-6">
          {/* Header */}
          <View className="flex-row items-center gap-4">
            <TouchableOpacity onPress={() => router.back()}>
              <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-foreground">Student Loans</Text>
              <Text className="text-sm text-muted">Apply for student financing</Text>
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
            <IconSymbol name="creditcard.fill" size={48} color="white" />
            <Text className="text-white text-2xl font-bold mt-4 mb-2">
              Student Loans
            </Text>
            <Text className="text-white text-base opacity-90">
              Get the financial support you need for your education
            </Text>
          </View>

          {/* Loan Options */}
          <View className="gap-4">
            <Text className="text-xl font-bold text-foreground">Loan Options</Text>
            
            {[
              { title: "NSFAS Loan", rate: "0% Interest", amount: "Up to R100,000" },
              { title: "Private Student Loan", rate: "From 8.5%", amount: "Up to R500,000" },
              { title: "Bursary Advance", rate: "Interest-free", amount: "Up to R50,000" },
            ].map((loan, index) => (
              <TouchableOpacity
                key={index}
                className="bg-surface rounded-2xl p-4 border border-border active:opacity-70"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                <Text className="text-lg font-semibold text-foreground mb-2">
                  {loan.title}
                </Text>
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-sm text-muted">Interest Rate</Text>
                    <Text className="text-base font-medium text-foreground">
                      {loan.rate}
                    </Text>
                  </View>
                  <View>
                    <Text className="text-sm text-muted">Max Amount</Text>
                    <Text className="text-base font-medium text-primary">
                      {loan.amount}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Apply Button */}
          <TouchableOpacity
            className="bg-primary rounded-2xl p-4 items-center active:opacity-70 mb-6"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <Text className="text-white text-base font-semibold">
              Apply for Student Loan
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
