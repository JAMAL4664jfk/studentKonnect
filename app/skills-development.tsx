import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ImageBackground,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { LinearGradient } from "expo-linear-gradient";
import Toast from "react-native-toast-message";

interface Course {
  id: string;
  title: string;
  provider: string;
  category: string;
  level: string;
  duration: string;
  price: string;
  studentPrice: string;
  discount: string;
  rating: number;
  students: string;
  description: string;
}

const COURSES: Course[] = [
  {
    id: "1",
    title: "Full Stack Web Development",
    provider: "Coursera",
    category: "Technology",
    level: "Intermediate",
    duration: "12 weeks",
    price: "R1,200",
    studentPrice: "R600",
    discount: "50% OFF",
    rating: 4.8,
    students: "45,000",
    description: "Master modern web development with React, Node.js, and MongoDB",
  },
  {
    id: "2",
    title: "Data Science & Machine Learning",
    provider: "edX",
    category: "Technology",
    level: "Advanced",
    duration: "16 weeks",
    price: "R1,500",
    studentPrice: "R750",
    discount: "50% OFF",
    rating: 4.9,
    students: "67,000",
    description: "Learn Python, TensorFlow, and advanced ML algorithms",
  },
  {
    id: "3",
    title: "Digital Marketing Masterclass",
    provider: "Udemy",
    category: "Marketing",
    level: "Beginner",
    duration: "8 weeks",
    price: "R800",
    studentPrice: "R400",
    discount: "50% OFF",
    rating: 4.7,
    students: "32,000",
    description: "Complete guide to SEO, social media, and content marketing",
  },
  {
    id: "4",
    title: "Financial Modeling & Analysis",
    provider: "LinkedIn Learning",
    category: "Finance",
    level: "Intermediate",
    duration: "10 weeks",
    price: "R1,000",
    studentPrice: "R500",
    discount: "50% OFF",
    rating: 4.6,
    students: "28,000",
    description: "Excel-based financial modeling for business decisions",
  },
  {
    id: "5",
    title: "UX/UI Design Fundamentals",
    provider: "Coursera",
    category: "Design",
    level: "Beginner",
    duration: "6 weeks",
    price: "R900",
    studentPrice: "R450",
    discount: "50% OFF",
    rating: 4.8,
    students: "38,000",
    description: "Create user-centered designs with Figma and Adobe XD",
  },
  {
    id: "6",
    title: "Project Management Professional",
    provider: "edX",
    category: "Business",
    level: "Advanced",
    duration: "14 weeks",
    price: "R1,400",
    studentPrice: "R700",
    discount: "50% OFF",
    rating: 4.7,
    students: "41,000",
    description: "PMP certification prep with real-world case studies",
  },
];

export default function SkillsDevelopmentScreen() {
  const colors = useColors();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Technology", "Business", "Design", "Marketing", "Finance"];

  const filteredCourses = COURSES.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.provider.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleEnrollCourse = (course: Course) => {
    Toast.show({
      type: "success",
      text1: "Enrollment Started",
      text2: `You'll be redirected to ${course.provider} to complete enrollment`,
    });
  };

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-border">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity onPress={() => router.back()}>
              <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
            </TouchableOpacity>
            <View className="ml-4">
              <Text className="text-2xl font-bold text-foreground">Skills Development</Text>
              <Text className="text-sm text-muted">Premium courses at student prices</Text>
            </View>
          </View>
        </View>

        <ScrollView className="flex-1">
          {/* Hero Section */}
          <ImageBackground
            source={require("@/assets/images/learning-hero-bg.jpg")}
            className="overflow-hidden"
          >
            <LinearGradient
              colors={["rgba(0,0,0,0.7)", "rgba(0,0,0,0.5)"]}
              className="p-6"
            >
              <View className="py-6">
                <View
                  className="w-16 h-16 rounded-2xl items-center justify-center mb-4"
                  style={{ backgroundColor: colors.primary }}
                >
                  <IconSymbol name="graduationcap.fill" size={32} color="#fff" />
                </View>
                <Text className="text-3xl font-bold text-white mb-2">
                  Upskill with Premium Courses
                </Text>
                <Text className="text-lg text-white/90 mb-4">
                  Access courses from Coursera, edX, Udemy, and LinkedIn Learning at 50% student
                  discount
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  <View className="bg-white/20 px-3 py-1 rounded-full">
                    <Text className="text-white text-xs font-semibold">50% Student Discount</Text>
                  </View>
                  <View className="bg-white/20 px-3 py-1 rounded-full">
                    <Text className="text-white text-xs font-semibold">Certificates Included</Text>
                  </View>
                  <View className="bg-white/20 px-3 py-1 rounded-full">
                    <Text className="text-white text-xs font-semibold">Industry Experts</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </ImageBackground>

          {/* Search Bar */}
          <View className="p-4">
            <View className="bg-surface rounded-xl flex-row items-center px-4 py-3 border border-border">
              <IconSymbol name="magnifyingglass" size={20} color={colors.muted} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search courses..."
                placeholderTextColor={colors.muted}
                className="flex-1 ml-3 text-foreground"
              />
            </View>
          </View>

          {/* Category Filter */}
          <View className="px-4 pb-4">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2">
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-full border ${
                      selectedCategory === cat ? "border-primary" : "border-border"
                    }`}
                    style={{
                      backgroundColor:
                        selectedCategory === cat ? colors.primary + "20" : colors.surface,
                    }}
                  >
                    <Text
                      className="text-sm font-medium"
                      style={{
                        color: selectedCategory === cat ? colors.primary : colors.foreground,
                      }}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Courses List */}
          <View className="px-4 pb-4">
            <Text className="text-lg font-bold text-foreground mb-3">
              {filteredCourses.length} Courses Available
            </Text>
            <View className="gap-4">
              {filteredCourses.map((course) => (
                <View
                  key={course.id}
                  className="bg-surface rounded-2xl overflow-hidden border border-border"
                >
                  {/* Course Header */}
                  <View className="p-4">
                    <View className="flex-row items-start justify-between mb-3">
                      <View className="flex-1 mr-3">
                        <Text className="text-lg font-bold text-foreground mb-1">
                          {course.title}
                        </Text>
                        <Text className="text-sm text-muted">{course.provider}</Text>
                      </View>
                      <View
                        className="px-2 py-1 rounded-full"
                        style={{ backgroundColor: colors.primary + "20" }}
                      >
                        <Text className="text-xs font-bold" style={{ color: colors.primary }}>
                          {course.discount}
                        </Text>
                      </View>
                    </View>

                    <Text className="text-sm text-muted leading-relaxed mb-3">
                      {course.description}
                    </Text>

                    {/* Course Details */}
                    <View className="flex-row flex-wrap gap-2 mb-3">
                      <View className="flex-row items-center">
                        <IconSymbol name="star.fill" size={14} color="#FFA500" />
                        <Text className="text-xs text-muted ml-1">
                          {course.rating} ({course.students} students)
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <IconSymbol name="clock.fill" size={14} color={colors.muted} />
                        <Text className="text-xs text-muted ml-1">{course.duration}</Text>
                      </View>
                      <View className="flex-row items-center">
                        <IconSymbol name="chart.bar.fill" size={14} color={colors.muted} />
                        <Text className="text-xs text-muted ml-1">{course.level}</Text>
                      </View>
                    </View>

                    {/* Pricing */}
                    <View className="flex-row items-center justify-between">
                      <View>
                        <Text className="text-xs text-muted line-through">{course.price}</Text>
                        <Text className="text-xl font-bold" style={{ color: colors.primary }}>
                          {course.studentPrice}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleEnrollCourse(course)}
                        className="rounded-xl px-6 py-3 active:opacity-90"
                        style={{ backgroundColor: colors.primary }}
                      >
                        <Text className="text-white font-bold">Enroll Now</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Benefits Section */}
          <View className="p-4">
            <View className="bg-surface rounded-2xl p-6 border border-border">
              <Text className="text-xl font-bold text-foreground mb-4">Why Learn With Us?</Text>
              <View className="gap-3">
                {[
                  {
                    icon: "dollarsign.circle.fill",
                    title: "50% Student Discount",
                    desc: "Exclusive pricing for verified students",
                  },
                  {
                    icon: "checkmark.circle.fill",
                    title: "Industry Certificates",
                    desc: "Recognized certifications from top platforms",
                  },
                  {
                    icon: "person.fill",
                    title: "Expert Instructors",
                    desc: "Learn from industry professionals",
                  },
                  {
                    icon: "clock.fill",
                    title: "Flexible Learning",
                    desc: "Study at your own pace, anytime",
                  },
                ].map((benefit, index) => (
                  <View key={index} className="flex-row items-start">
                    <View
                      className="w-10 h-10 rounded-full items-center justify-center mr-3"
                      style={{ backgroundColor: colors.primary + "20" }}
                    >
                      <IconSymbol name={benefit.icon as any} size={20} color={colors.primary} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-bold text-foreground">{benefit.title}</Text>
                      <Text className="text-sm text-muted">{benefit.desc}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>

        <Toast />
      </View>
    </ScreenContainer>
  );
}
