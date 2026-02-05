import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import Toast from "react-native-toast-message";
import * as DocumentPicker from "expo-document-picker";

type JobType = "all" | "internships" | "jobs" | "learnerships" | "bursaries";

interface Bursary {
  id: string;
  title: string;
  provider: string;
  provider_logo: string;
  amount: string;
  field_of_study: string;
  requirements: string[];
  benefits: string[];
  deadline: string;
  description: string;
}

interface JobProfile {
  full_name: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  skills: string[];
  cv_url?: string;
  available_for_work: boolean;
}

interface Job {
  id: string;
  type: string;
  title: string;
  company: string;
  companyLogo?: string;
  postedBy: string;
  postedByType: "company" | "person";
  match: string;
  matchScore: number;
  location: string;
  salary: string;
  duration: string;
  applicants: string;
  description: string;
  requirements: string[];
  benefits: string[];
  postedDate: string;
}

const JOBS: Job[] = [
  {
    id: "1",
    type: "Internship",
    title: "Software Engineering Intern",
    company: "TechCorp Solutions",
    companyLogo: "https://ui-avatars.com/api/?name=TechCorp+Solutions&background=3b82f6&color=fff&size=128",
    postedBy: "TechCorp Solutions HR",
    postedByType: "company",
    match: "95%",
    matchScore: 95,
    location: "Remote",
    salary: "R8,000/mo",
    duration: "3 months",
    applicants: "12",
    postedDate: "2 days ago",
    description:
      "Join our dynamic team as a Software Engineering Intern. Work on real-world projects using React, Node.js, and cloud technologies. Perfect opportunity for students looking to gain hands-on experience in a fast-paced startup environment.",
    requirements: [
      "Currently pursuing Computer Science degree",
      "Knowledge of JavaScript/TypeScript",
      "Familiarity with React or similar frameworks",
      "Strong problem-solving skills",
    ],
    benefits: [
      "Flexible remote work",
      "Mentorship from senior engineers",
      "Potential for full-time conversion",
      "Access to premium learning resources",
    ],
  },
  {
    id: "2",
    type: "Internship",
    title: "Marketing Assistant",
    company: "Brand Innovate",
    companyLogo: "https://ui-avatars.com/api/?name=Brand+Innovate&background=10b981&color=fff&size=128",
    postedBy: "Sarah Johnson",
    postedByType: "person",
    match: "88%",
    matchScore: 88,
    location: "Johannesburg",
    salary: "R6,500/mo",
    duration: "6 months",
    applicants: "8",
    postedDate: "1 week ago",
    description:
      "Exciting opportunity to work with a creative marketing agency. Assist with campaign development, social media management, and content creation. Great for students passionate about branding and digital marketing.",
    requirements: [
      "Marketing or Business degree",
      "Social media savvy",
      "Creative thinking",
      "Good communication skills",
    ],
    benefits: [
      "Office-based with hybrid options",
      "Creative work environment",
      "Portfolio building opportunities",
      "Industry networking",
    ],
  },
  {
    id: "3",
    type: "Learnership",
    title: "Data Analytics Learnership",
    company: "InsightsCo",
    companyLogo: "https://ui-avatars.com/api/?name=InsightsCo&background=8b5cf6&color=fff&size=128",
    postedBy: "InsightsCo Talent Team",
    postedByType: "company",
    match: "82%",
    matchScore: 82,
    location: "Cape Town",
    salary: "R5,000/mo",
    duration: "12 months",
    applicants: "20",
    postedDate: "3 days ago",
    description:
      "12-month comprehensive learnership program combining theoretical knowledge with practical data analytics skills. Work with real datasets, learn industry-standard tools, and earn while you learn.",
    requirements: [
      "Currently studying or completed relevant degree",
      "Basic understanding of statistics",
      "Proficiency in Excel",
      "Eager to learn Python/R",
    ],
    benefits: [
      "Full-time learnership with stipend",
      "Official SETA-accredited qualification",
      "Mentorship and training",
      "Potential permanent position",
    ],
  },
  {
    id: "4",
    type: "Full-time Job",
    title: "Junior Graphic Designer",
    company: "Creative Studio ZA",
    match: "75%",
    matchScore: 75,
    location: "Durban",
    salary: "R12,000/mo",
    duration: "Permanent",
    applicants: "15",
    postedDate: "5 days ago",
    description:
      "Join our creative team as a Junior Graphic Designer. Work on diverse projects including branding, digital design, and print media. Perfect for recent graduates looking to build their portfolio in a supportive creative environment.",
    requirements: [
      "Degree in Graphic Design or related field",
      "Proficiency in Adobe Creative Suite",
      "Strong portfolio",
      "Attention to detail",
    ],
    benefits: [
      "Competitive salary",
      "Creative freedom",
      "Professional development",
      "Modern office space",
    ],
  },
  {
    id: "5",
    type: "Internship",
    title: "Finance Analyst Intern",
    company: "FinanceHub",
    match: "90%",
    matchScore: 90,
    location: "Pretoria",
    salary: "R7,000/mo",
    duration: "6 months",
    applicants: "10",
    postedDate: "1 day ago",
    description:
      "Work alongside experienced financial analysts in a leading financial services firm. Gain exposure to financial modeling, market analysis, and investment strategies.",
    requirements: [
      "BCom Finance or Accounting student",
      "Strong analytical skills",
      "Excel proficiency",
      "Interest in financial markets",
    ],
    benefits: [
      "Professional work environment",
      "Industry certifications support",
      "Networking opportunities",
      "Potential full-time offer",
    ],
  },
  {
    id: "6",
    type: "Full-time Job",
    title: "Retail Manager Trainee",
    company: "RetailCo",
    match: "70%",
    matchScore: 70,
    location: "Johannesburg",
    salary: "R15,000/mo",
    duration: "Permanent",
    applicants: "25",
    postedDate: "1 week ago",
    description:
      "Fast-track management program in one of South Africa's leading retail chains. Learn all aspects of retail operations, team management, and customer service excellence.",
    requirements: [
      "Degree in Business Management",
      "Leadership potential",
      "Customer service orientation",
      "Willingness to work retail hours",
    ],
    benefits: [
      "Structured training program",
      "Career progression",
      "Staff discounts",
      "Performance bonuses",
    ],
  },
  {
    id: "7",
    type: "Internship",
    title: "Cloud Infrastructure Intern",
    company: "CloudTech SA",
    match: "85%",
    matchScore: 85,
    location: "Remote",
    salary: "R9,000/mo",
    duration: "4 months",
    applicants: "18",
    postedDate: "4 days ago",
    description:
      "Learn cloud computing fundamentals while working with AWS, Azure, and Google Cloud. Assist with infrastructure setup, monitoring, and optimization for enterprise clients.",
    requirements: [
      "IT or Computer Science student",
      "Basic networking knowledge",
      "Interest in cloud technologies",
      "Problem-solving mindset",
    ],
    benefits: [
      "Remote work flexibility",
      "Cloud certifications sponsored",
      "Mentorship program",
      "Real-world project experience",
    ],
  },
  {
    id: "8",
    type: "Learnership",
    title: "Healthcare Administration Learnership",
    company: "HealthPlus",
    match: "78%",
    matchScore: 78,
    location: "Cape Town",
    salary: "R4,500/mo",
    duration: "12 months",
    applicants: "14",
    postedDate: "6 days ago",
    description:
      "Comprehensive learnership in healthcare administration covering medical billing, patient records management, and healthcare compliance. SETA-accredited program.",
    requirements: [
      "Matric certificate",
      "Interest in healthcare sector",
      "Good communication skills",
      "Computer literacy",
    ],
    benefits: [
      "SETA qualification",
      "Healthcare industry exposure",
      "Structured learning path",
      "Employment opportunities post-completion",
    ],
  },
  {
    id: "9",
    type: "Internship",
    title: "Retail Management Intern",
    company: "RetailCo",
    match: "90%",
    matchScore: 90,
    location: "Pretoria",
    salary: "R7,000/mo",
    duration: "6 months",
    applicants: "18",
    postedDate: "3 days ago",
    description:
      "Join South Africa's leading retail chain as a Retail Management Intern. Learn about store operations, inventory management, customer service, and team leadership. Hands-on experience in a fast-paced retail environment.",
    requirements: [
      "Business Management or Retail degree",
      "Customer service orientation",
      "Strong communication skills",
      "Willingness to work retail hours",
    ],
    benefits: [
      "Employee discount",
      "Management training program",
      "Diverse work experience",
      "Career advancement opportunities",
    ],
  },
  {
    id: "10",
    type: "Learnership",
    title: "Cloud Computing Learnership",
    company: "CloudTech Solutions",
    match: "85%",
    matchScore: 85,
    location: "Remote",
    salary: "R6,000/mo",
    duration: "12 months",
    applicants: "25",
    postedDate: "2 days ago",
    description:
      "Comprehensive 12-month learnership focused on cloud technologies, DevOps, and modern infrastructure. Learn AWS, Azure, Docker, Kubernetes while working on real cloud projects.",
    requirements: [
      "IT or Computer Science background",
      "Basic Linux knowledge",
      "Passion for cloud technologies",
      "Self-motivated learner",
    ],
    benefits: [
      "Remote work flexibility",
      "AWS/Azure certifications",
      "Industry mentorship",
      "Potential permanent role",
    ],
  },
  {
    id: "11",
    type: "Full-time Job",
    title: "Healthcare Administrator",
    company: "HealthPlus Medical",
    match: "78%",
    matchScore: 78,
    location: "Johannesburg",
    salary: "R15,000/mo",
    duration: "Permanent",
    applicants: "22",
    postedDate: "1 week ago",
    description:
      "Seeking a Healthcare Administrator to support our medical practice operations. Handle patient records, scheduling, billing, and assist with administrative tasks. Perfect for graduates with healthcare administration background.",
    requirements: [
      "Healthcare Administration diploma/degree",
      "Medical terminology knowledge",
      "Excellent organizational skills",
      "Computer literacy",
    ],
    benefits: [
      "Medical aid coverage",
      "Stable employment",
      "Professional development",
      "Work-life balance",
    ],
  },
];

const BURSARIES: Bursary[] = [
  {
    id: "1",
    title: "Engineering Excellence Bursary",
    provider: "TechCorp Foundation",
    provider_logo: "https://ui-avatars.com/api/?name=TechCorp&background=3b82f6&color=fff&size=128",
    amount: "R80,000/year",
    field_of_study: "Engineering",
    requirements: [
      "Currently enrolled in Engineering degree",
      "Minimum 65% average",
      "South African citizen",
      "Financial need",
    ],
    benefits: [
      "Full tuition coverage",
      "Monthly stipend R3,000",
      "Vacation work opportunities",
      "Mentorship program",
    ],
    deadline: "2024-12-31",
    description: "Comprehensive bursary for engineering students covering tuition, books, and living expenses.",
  },
  {
    id: "2",
    title: "Business Leadership Bursary",
    provider: "Future Leaders SA",
    provider_logo: "https://ui-avatars.com/api/?name=Future+Leaders&background=10b981&color=fff&size=128",
    amount: "R60,000/year",
    field_of_study: "Business & Commerce",
    requirements: [
      "BCom or related degree",
      "Leadership experience",
      "Minimum 60% average",
      "Community involvement",
    ],
    benefits: [
      "Tuition coverage",
      "Leadership development program",
      "Networking events",
      "Internship placement",
    ],
    deadline: "2024-11-30",
    description: "Develop your business acumen with our comprehensive bursary program.",
  },
  {
    id: "3",
    title: "Science Innovation Bursary",
    provider: "Research Institute ZA",
    provider_logo: "https://ui-avatars.com/api/?name=Research+Institute&background=8b5cf6&color=fff&size=128",
    amount: "R70,000/year",
    field_of_study: "Science & Technology",
    requirements: [
      "BSc in Science or Technology",
      "Research interest",
      "Minimum 70% average",
      "South African resident",
    ],
    benefits: [
      "Full tuition and accommodation",
      "Research opportunities",
      "Conference attendance",
      "Postgraduate support",
    ],
    deadline: "2025-01-15",
    description: "Join cutting-edge research projects while completing your degree.",
  },
];

export default function CareerScreen() {
  const colors = useColors();
  const router = useRouter();
  const [showOpportunities, setShowOpportunities] = useState(false);
  const [jobFilter, setJobFilter] = useState<JobType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showJobDetail, setShowJobDetail] = useState(false);
  const [showPostJob, setShowPostJob] = useState(false);
  const [cvFileName, setCvFileName] = useState<string | null>(null);
  const [showJobProfile, setShowJobProfile] = useState(false);
  const [showAutoApply, setShowAutoApply] = useState(false);
  const [showBursaryDetail, setShowBursaryDetail] = useState(false);
  const [selectedBursary, setSelectedBursary] = useState<Bursary | null>(null);

  const filteredJobs = JOBS.filter((job) => {
    const matchesFilter =
      jobFilter === "all" ||
      (jobFilter === "internships" && job.type === "Internship") ||
      (jobFilter === "jobs" && job.type === "Full-time Job") ||
      (jobFilter === "learnerships" && job.type === "Learnership");

    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  }).sort((a, b) => b.matchScore - a.matchScore);

  const handleJobClick = (job: Job) => {
    setSelectedJob(job);
    setShowJobDetail(true);
  };

  const handleApply = () => {
    if (!cvFileName) {
      Toast.show({
        type: "error",
        text1: "CV Required",
        text2: "Please upload your CV before applying.",
      });
      return;
    }

    Toast.show({
      type: "success",
      text1: "Application Submitted",
      text2: `Your application for ${selectedJob?.title} has been submitted successfully!`,
    });
    setShowJobDetail(false);
    setCvFileName(null);
  };

  const handleCvUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        const fileSizeMB = file.size ? file.size / (1024 * 1024) : 0;
        const MAX_FILE_SIZE_MB = 5;

        if (fileSizeMB > MAX_FILE_SIZE_MB) {
          Toast.show({
            type: "error",
            text1: "File Too Large",
            text2: `File size must be under ${MAX_FILE_SIZE_MB}MB. Your file is ${fileSizeMB.toFixed(2)}MB.`,
          });
          return;
        }

        setCvFileName(file.name);
        Toast.show({
          type: "success",
          text1: "CV Uploaded",
          text2: `${file.name} (${fileSizeMB.toFixed(2)}MB) uploaded successfully.`,
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Upload Failed",
        text2: "Failed to upload CV. Please try again.",
      });
    }
  };

  const getMatchColor = (matchScore: number) => {
    if (matchScore >= 90) return colors.success;
    if (matchScore >= 80) return colors.primary;
    if (matchScore >= 70) return colors.warning;
    return colors.muted;
  };

  const getMatchBgColor = (matchScore: number) => {
    if (matchScore >= 90) return colors.success + "20";
    if (matchScore >= 80) return colors.primary + "20";
    if (matchScore >= 70) return colors.warning + "20";
    return colors.muted + "20";
  };

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      <View className="flex-1">
        {/* Header with Background */}
        <View className="overflow-hidden">
          <Image
            source={{ uri: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=300&fit=crop" }}
            className="absolute w-full h-full opacity-20"
            contentFit="cover"
          />
          <View className="flex-row items-center justify-between p-4 border-b border-border" style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}>
          <View className="flex-row items-center flex-1">
            <TouchableOpacity onPress={() => router.back()}>
              <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
            </TouchableOpacity>
            <View className="ml-4">
              <Text className="text-2xl font-bold text-foreground">Career</Text>
              <Text className="text-sm text-muted">Career development tools</Text>
            </View>
          </View>
          </View>
        </View>

        <ScrollView className="flex-1">
          {!showOpportunities ? (
            <>
              {/* Career Innovation Card */}
              <View className="p-4">
                <TouchableOpacity
                  onPress={() => {
                    Toast.show({
                      type: "info",
                      text1: "Career Innovation",
                      text2: "Access expert career guidance, CV builder, and interview prep tools.",
                    });
                  }}
                  className="rounded-2xl p-6 overflow-hidden active:opacity-90"
                  style={{
                    backgroundColor: colors.primary,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 8,
                    elevation: 4,
                  }}
                >
                  <View className="flex-row items-center mb-3">
                    <View
                      className="w-12 h-12 rounded-xl items-center justify-center mr-3"
                      style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
                    >
                      <IconSymbol name="briefcase.fill" size={24} color="#fff" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-xl font-bold text-white">Career Innovation</Text>
                      <Text className="text-sm text-white/90">
                        Build your career with expert guidance
                      </Text>
                    </View>
                  </View>
                  <View className="bg-white/10 rounded-xl p-4 mb-3">
                    <Text className="text-white/90 text-sm leading-relaxed">
                      Access comprehensive career development tools including CV builder, interview
                      preparation, skills assessment, and personalized career path recommendations.
                    </Text>
                  </View>
                  <View className="flex-row flex-wrap gap-2">
                    <View className="bg-white/20 px-3 py-1 rounded-full">
                      <Text className="text-white text-xs font-semibold">CV Builder</Text>
                    </View>
                    <View className="bg-white/20 px-3 py-1 rounded-full">
                      <Text className="text-white text-xs font-semibold">Interview Prep</Text>
                    </View>
                    <View className="bg-white/20 px-3 py-1 rounded-full">
                      <Text className="text-white text-xs font-semibold">Skills Assessment</Text>
                    </View>
                    <View className="bg-white/20 px-3 py-1 rounded-full">
                      <Text className="text-white text-xs font-semibold">Career Guidance</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Explore Opportunities Button */}
              <View className="px-4 pb-4">
                <TouchableOpacity
                  onPress={() => setShowOpportunities(true)}
                  className="rounded-2xl p-6 items-center active:opacity-90"
                  style={{
                    backgroundColor: colors.primary,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 8,
                    elevation: 4,
                  }}
                >
                  <Text className="text-white text-lg font-bold">Explore Opportunities</Text>
                </TouchableOpacity>
              </View>

              {/* Quick Access Cards */}
              <View className="px-4 pb-4">
                <Text className="text-lg font-semibold text-foreground mb-3">
                  Quick Access
                </Text>
                <View className="gap-3 mb-4">
                  <TouchableOpacity
                    onPress={() => router.push("/innovation-fund")}
                    className="bg-surface rounded-2xl p-4 border border-border active:opacity-90"
                  >
                    <View className="flex-row items-center mb-2">
                      <View
                        className="w-12 h-12 rounded-xl items-center justify-center mr-3"
                        style={{ backgroundColor: colors.primary + "20" }}
                      >
                        <IconSymbol name="lightbulb.fill" size={24} color={colors.primary} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-base font-bold text-foreground">Innovation Fund</Text>
                        <Text className="text-sm text-muted">Grants up to R50,000 for startup ideas</Text>
                      </View>
                      <IconSymbol name="chevron.right" size={20} color={colors.muted} />
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => router.push("/skills-development")}
                    className="bg-surface rounded-2xl p-4 border border-border active:opacity-90"
                  >
                    <View className="flex-row items-center mb-2">
                      <View
                        className="w-12 h-12 rounded-xl items-center justify-center mr-3"
                        style={{ backgroundColor: colors.primary + "20" }}
                      >
                        <IconSymbol name="graduationcap.fill" size={24} color={colors.primary} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-base font-bold text-foreground">Skills Development</Text>
                        <Text className="text-sm text-muted">Premium courses at student prices</Text>
                      </View>
                      <IconSymbol name="chevron.right" size={20} color={colors.muted} />
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setShowJobProfile(true)}
                    className="bg-surface rounded-2xl p-4 border border-border active:opacity-90"
                  >
                    <View className="flex-row items-center mb-2">
                      <View
                        className="w-12 h-12 rounded-xl items-center justify-center mr-3"
                        style={{ backgroundColor: colors.primary + "20" }}
                      >
                        <IconSymbol name="person.text.rectangle" size={24} color={colors.primary} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-base font-bold text-foreground">My Job Profile</Text>
                        <Text className="text-sm text-muted">Let recruiters find you</Text>
                      </View>
                      <IconSymbol name="chevron.right" size={20} color={colors.muted} />
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setShowAutoApply(true)}
                    className="bg-surface rounded-2xl p-4 border border-border active:opacity-90"
                  >
                    <View className="flex-row items-center mb-2">
                      <View
                        className="w-12 h-12 rounded-xl items-center justify-center mr-3"
                        style={{ backgroundColor: colors.primary + "20" }}
                      >
                        <IconSymbol name="bolt.fill" size={24} color={colors.primary} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-base font-bold text-foreground">Auto-Apply</Text>
                        <Text className="text-sm text-muted">Automatically apply to matching jobs</Text>
                      </View>
                      <IconSymbol name="chevron.right" size={20} color={colors.muted} />
                    </View>
                  </TouchableOpacity>
                </View>
              </View>


            </>
          ) : (
            <>
              {/* Back Button */}
              <View className="p-4">
                <TouchableOpacity
                  onPress={() => setShowOpportunities(false)}
                  className="flex-row items-center"
                >
                  <IconSymbol name="chevron.left" size={20} color={colors.primary} />
                  <Text className="text-primary font-semibold ml-1">Back to Career</Text>
                </TouchableOpacity>
              </View>

              {/* Opportunities Header */}
              <View className="px-4 pb-4">
                <View className="items-center mb-4">
                  <View
                    className="px-3 py-1 rounded-full mb-2"
                    style={{ backgroundColor: colors.primary + "20" }}
                  >
                    <Text className="text-primary text-xs font-semibold">
                      Smart Job Matching
                    </Text>
                  </View>
                  <Text className="text-2xl font-bold text-foreground text-center mb-2">
                    Internships & Job Board
                  </Text>
                  <Text className="text-sm text-muted text-center">
                    AI-powered matching connects you with verified employers
                  </Text>
                </View>

                {/* Search and Post Button */}
                <View className="flex-row gap-3 mb-3">
                  <View className="flex-1 flex-row items-center gap-3 rounded-2xl px-4 py-3 bg-surface border border-border">
                    <IconSymbol name="magnifyingglass" size={20} color={colors.muted} />
                    <TextInput
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      placeholder="Search jobs, internships..."
                      placeholderTextColor={colors.muted}
                      className="flex-1 text-foreground text-base"
                    />
                  </View>
                  <TouchableOpacity
                    onPress={() => setShowPostJob(true)}
                    className="rounded-2xl px-4 py-3 items-center justify-center"
                    style={{ backgroundColor: colors.primary }}
                  >
                    <IconSymbol name="plus" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>

                {/* Filter Tabs */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="flex-row gap-2"
                >
                  {(["all", "internships", "jobs", "learnerships", "bursaries"] as JobType[]).map((filter) => (
                    <TouchableOpacity
                      key={filter}
                      onPress={() => setJobFilter(filter)}
                      className="px-4 py-2 rounded-full"
                      style={{
                        backgroundColor:
                          jobFilter === filter ? colors.primary : colors.surface,
                        borderWidth: 1,
                        borderColor: jobFilter === filter ? colors.primary : colors.border,
                      }}
                    >
                      <Text
                        className="text-sm font-semibold capitalize"
                        style={{
                          color: jobFilter === filter ? "#fff" : colors.foreground,
                        }}
                      >
                        {filter}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Feature Cards */}
              <View className="px-4 pb-4">
                <View className="flex-row gap-3 mb-4">
                  <View className="flex-1 bg-surface rounded-xl p-3 border border-border">
                    <View
                      className="w-8 h-8 rounded-lg items-center justify-center mb-2"
                      style={{ backgroundColor: colors.primary + "20" }}
                    >
                      <IconSymbol name="target" size={16} color={colors.primary} />
                    </View>
                    <Text className="text-xs font-bold text-foreground mb-1">
                      Skills Matching
                    </Text>
                    <Text className="text-xs text-muted">Perfect opportunities for you</Text>
                  </View>

                  <View className="flex-1 bg-surface rounded-xl p-3 border border-border">
                    <View
                      className="w-8 h-8 rounded-lg items-center justify-center mb-2"
                      style={{ backgroundColor: colors.primary + "20" }}
                    >
                      <IconSymbol name="building.2.fill" size={16} color={colors.primary} />
                    </View>
                    <Text className="text-xs font-bold text-foreground mb-1">
                      Verified Employers
                    </Text>
                    <Text className="text-xs text-muted">Trusted companies only</Text>
                  </View>

                  <View className="flex-1 bg-surface rounded-xl p-3 border border-border">
                    <View
                      className="w-8 h-8 rounded-lg items-center justify-center mb-2"
                      style={{ backgroundColor: colors.primary + "20" }}
                    >
                      <IconSymbol name="dollarsign.circle" size={16} color={colors.primary} />
                    </View>
                    <Text className="text-xs font-bold text-foreground mb-1">
                      Referral Bonuses
                    </Text>
                    <Text className="text-xs text-muted">Earn up to R500</Text>
                  </View>
                </View>
              </View>

              {/* Job Listings */}
              <View className="px-4 pb-4">
                {filteredJobs.map((job) => (
                  <TouchableOpacity
                    key={job.id}
                    onPress={() => handleJobClick(job)}
                    className="bg-surface rounded-2xl p-4 mb-3 border border-border active:opacity-70"
                    style={{
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 2,
                    }}
                  >
                    <View className="flex-row items-start justify-between mb-3">
                      <View className="flex-row flex-1">
                        {/* Company Logo */}
                        {job.companyLogo && (
                          <Image
                            source={{ uri: job.companyLogo }}
                            className="w-12 h-12 rounded-xl mr-3"
                            contentFit="cover"
                          />
                        )}
                        <View className="flex-1">
                          <View className="flex-row items-center mb-2">
                            <View
                              className="px-2 py-1 rounded-md mr-2"
                              style={{
                                backgroundColor:
                                  job.type === "Internship"
                                    ? colors.primary + "20"
                                    : job.type === "Learnership"
                                    ? colors.warning + "20"
                                    : colors.success + "20",
                              }}
                            >
                              <Text
                                className="text-xs font-bold"
                                style={{
                                  color:
                                    job.type === "Internship"
                                      ? colors.primary
                                      : job.type === "Learnership"
                                      ? colors.warning
                                      : colors.success,
                                }}
                              >
                                {job.type}
                              </Text>
                            </View>
                            <Text className="text-xs text-muted">{job.postedDate}</Text>
                          </View>
                          <Text className="text-base font-bold text-foreground mb-1">
                            {job.title}
                          </Text>
                          <Text className="text-sm text-muted mb-1">{job.company}</Text>
                          {/* Posted By */}
                          <View className="flex-row items-center">
                            <IconSymbol 
                              name={job.postedByType === "company" ? "building.2" : "person.circle"} 
                              size={12} 
                              color={colors.muted} 
                            />
                            <Text className="text-xs text-muted ml-1">Posted by {job.postedBy}</Text>
                          </View>
                        </View>
                      </View>
                      <View
                        className="px-2 py-1 rounded-md"
                        style={{ backgroundColor: getMatchBgColor(job.matchScore) }}
                      >
                        <Text className="text-xs font-bold" style={{ color: getMatchColor(job.matchScore) }}>
                          {job.match}
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row flex-wrap gap-3 mb-3">
                      <View className="flex-row items-center">
                        <IconSymbol name="mappin" size={14} color={colors.muted} />
                        <Text className="text-xs text-muted ml-1">{job.location}</Text>
                      </View>
                      <View className="flex-row items-center">
                        <IconSymbol name="dollarsign.circle" size={14} color={colors.muted} />
                        <Text className="text-xs text-muted ml-1">{job.salary}</Text>
                      </View>
                      <View className="flex-row items-center">
                        <IconSymbol name="clock" size={14} color={colors.muted} />
                        <Text className="text-xs text-muted ml-1">{job.duration}</Text>
                      </View>
                      <View className="flex-row items-center">
                        <IconSymbol name="person.2" size={14} color={colors.muted} />
                        <Text className="text-xs text-muted ml-1">{job.applicants} applicants</Text>
                      </View>
                    </View>

                    <View className="bg-muted/10 rounded-lg p-3 mb-3">
                      <Text className="text-xs text-muted leading-relaxed" numberOfLines={2}>
                        {job.description}
                      </Text>
                    </View>

                    <TouchableOpacity
                      className="bg-primary rounded-xl py-2 items-center"
                      onPress={() => handleJobClick(job)}
                    >
                      <Text className="text-white text-sm font-semibold">
                        View Details & Apply
                      </Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}

                {filteredJobs.length === 0 && (
                  <View className="items-center justify-center py-12">
                    <IconSymbol name="exclamationmark.triangle" size={48} color={colors.muted} />
                    <Text className="text-muted text-center mt-4">
                      No opportunities found matching your criteria
                    </Text>
                  </View>
                )}
              </View>
            </>
          )}
        </ScrollView>
      </View>

      {/* Job Detail Modal */}
      <Modal visible={showJobDetail} animationType="slide" transparent>
        <View
          className="flex-1 justify-end"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <View
            className="rounded-t-3xl p-6"
            style={{ backgroundColor: colors.background, maxHeight: "90%" }}
          >
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
                Job Details
              </Text>
              <TouchableOpacity onPress={() => {
                setShowJobDetail(false);
                setCvFileName(null);
              }}>
                <IconSymbol name="xmark" size={24} color={colors.foreground} />
              </TouchableOpacity>
            </View>

            {selectedJob && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Job Header */}
                <View className="mb-4">
                  {/* Company Logo and Type/Match */}
                  <View className="flex-row items-start justify-between mb-4">
                    {selectedJob.companyLogo && (
                      <Image
                        source={{ uri: selectedJob.companyLogo }}
                        className="w-16 h-16 rounded-xl"
                        contentFit="cover"
                      />
                    )}
                    <View className="flex-row gap-2">
                      <View
                        className="px-3 py-1 rounded-md"
                        style={{
                          backgroundColor:
                            selectedJob.type === "Internship"
                              ? colors.primary + "20"
                              : selectedJob.type === "Learnership"
                              ? colors.warning + "20"
                              : colors.success + "20",
                        }}
                      >
                        <Text
                          className="text-xs font-bold"
                          style={{
                            color:
                              selectedJob.type === "Internship"
                                ? colors.primary
                                : selectedJob.type === "Learnership"
                                ? colors.warning
                                : colors.success,
                          }}
                        >
                          {selectedJob.type}
                        </Text>
                      </View>
                      <View
                        className="px-3 py-1 rounded-md"
                        style={{ backgroundColor: getMatchBgColor(selectedJob.matchScore) }}
                      >
                        <Text className="text-xs font-bold" style={{ color: getMatchColor(selectedJob.matchScore) }}>
                          {selectedJob.match} Match
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Text className="text-2xl font-bold text-foreground mb-1">
                    {selectedJob.title}
                  </Text>
                  <Text className="text-base text-muted mb-2">{selectedJob.company}</Text>
                  {/* Posted By */}
                  <View className="flex-row items-center mb-3">
                    <IconSymbol 
                      name={selectedJob.postedByType === "company" ? "building.2.fill" : "person.circle.fill"} 
                      size={14} 
                      color={colors.muted} 
                    />
                    <Text className="text-sm text-muted ml-1">Posted by {selectedJob.postedBy}</Text>
                  </View>

                  {/* Quick Info Grid */}
                  <View className="bg-surface rounded-xl p-4 mb-4">
                    <View className="flex-row flex-wrap gap-4">
                      <View className="flex-1 min-w-[45%]">
                        <Text className="text-xs text-muted mb-1">Location</Text>
                        <View className="flex-row items-center">
                          <IconSymbol name="mappin" size={14} color={colors.foreground} />
                          <Text className="text-sm font-semibold text-foreground ml-1">
                            {selectedJob.location}
                          </Text>
                        </View>
                      </View>
                      <View className="flex-1 min-w-[45%]">
                        <Text className="text-xs text-muted mb-1">Salary</Text>
                        <View className="flex-row items-center">
                          <IconSymbol name="dollarsign.circle" size={14} color={colors.foreground} />
                          <Text className="text-sm font-semibold text-foreground ml-1">
                            {selectedJob.salary}
                          </Text>
                        </View>
                      </View>
                      <View className="flex-1 min-w-[45%]">
                        <Text className="text-xs text-muted mb-1">Duration</Text>
                        <View className="flex-row items-center">
                          <IconSymbol name="clock" size={14} color={colors.foreground} />
                          <Text className="text-sm font-semibold text-foreground ml-1">
                            {selectedJob.duration}
                          </Text>
                        </View>
                      </View>
                      <View className="flex-1 min-w-[45%]">
                        <Text className="text-xs text-muted mb-1">Applicants</Text>
                        <View className="flex-row items-center">
                          <IconSymbol name="person.2" size={14} color={colors.foreground} />
                          <Text className="text-sm font-semibold text-foreground ml-1">
                            {selectedJob.applicants}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Description */}
                <View className="mb-4">
                  <Text className="text-lg font-semibold text-foreground mb-2">About the Role</Text>
                  <Text className="text-sm text-muted leading-relaxed">
                    {selectedJob.description}
                  </Text>
                </View>

                {/* Requirements */}
                <View className="mb-4">
                  <Text className="text-lg font-semibold text-foreground mb-2">Requirements</Text>
                  {selectedJob.requirements.map((req, index) => (
                    <View key={index} className="flex-row items-start mb-2">
                      <View
                        className="w-5 h-5 rounded-full items-center justify-center mr-2 mt-0.5"
                        style={{ backgroundColor: colors.success + "20" }}
                      >
                        <IconSymbol name="checkmark" size={12} color={colors.success} />
                      </View>
                      <Text className="text-sm text-muted flex-1">{req}</Text>
                    </View>
                  ))}
                </View>

                {/* Benefits */}
                <View className="mb-4">
                  <Text className="text-lg font-semibold text-foreground mb-2">What You'll Get</Text>
                  {selectedJob.benefits.map((benefit, index) => (
                    <View key={index} className="flex-row items-start mb-2">
                      <View
                        className="w-5 h-5 rounded-full items-center justify-center mr-2 mt-0.5"
                        style={{ backgroundColor: colors.primary + "20" }}
                      >
                        <IconSymbol name="star.fill" size={12} color={colors.primary} />
                      </View>
                      <Text className="text-sm text-muted flex-1">{benefit}</Text>
                    </View>
                  ))}
                </View>

                {/* CV Upload */}
                <View className="mb-4 border-t border-border pt-4">
                  <Text className="text-lg font-semibold text-foreground mb-3">Upload Your CV</Text>
                  <TouchableOpacity
                    onPress={handleCvUpload}
                    className="border-2 border-dashed rounded-xl p-6 items-center"
                    style={{
                      borderColor: cvFileName ? colors.success : colors.border,
                      backgroundColor: cvFileName
                        ? colors.success + "10"
                        : colors.surface,
                    }}
                  >
                    <IconSymbol
                      name={cvFileName ? "checkmark.circle.fill" : "doc.badge.plus"}
                      size={32}
                      color={cvFileName ? colors.success : colors.muted}
                    />
                    <Text
                      className="text-sm font-semibold mt-2"
                      style={{
                        color: cvFileName ? colors.success : colors.muted,
                      }}
                    >
                      {cvFileName || "Tap to upload your CV"}
                    </Text>
                    {!cvFileName && (
                      <Text className="text-xs text-muted mt-1">
                        Accepted: PDF, DOC, DOCX (Max 5MB)
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Action Buttons */}
                <View className="flex-row gap-3">
                  <TouchableOpacity
                    onPress={handleApply}
                    className="flex-1 py-4 rounded-xl items-center"
                    style={{ backgroundColor: colors.primary }}
                  >
                    <Text className="text-white font-semibold text-base">Submit Application</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setShowJobDetail(false);
                      setCvFileName(null);
                    }}
                    className="px-6 py-4 rounded-xl items-center border border-border"
                    style={{ backgroundColor: colors.surface }}
                  >
                    <Text className="text-foreground font-semibold text-base">Cancel</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Post Job Modal */}
      <Modal visible={showPostJob} animationType="slide" transparent>
        <View
          className="flex-1 justify-end"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <View
            className="rounded-t-3xl p-6"
            style={{ backgroundColor: colors.background, maxHeight: "90%" }}
          >
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
                Post Job Opportunity
              </Text>
              <TouchableOpacity onPress={() => setShowPostJob(false)}>
                <IconSymbol name="xmark" size={24} color={colors.foreground} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text className="text-sm text-muted mb-4">
                Share a job vacancy, internship, or learnership opportunity
              </Text>

              <View className="gap-4">
                <View>
                  <Text className="text-sm font-semibold text-foreground mb-2">Job Title *</Text>
                  <TextInput
                    placeholder="e.g., Software Engineering Intern"
                    placeholderTextColor={colors.muted}
                    className="bg-surface rounded-xl px-4 py-3 text-foreground border border-border"
                  />
                </View>

                <View>
                  <Text className="text-sm font-semibold text-foreground mb-2">Company Name *</Text>
                  <TextInput
                    placeholder="Your company name"
                    placeholderTextColor={colors.muted}
                    className="bg-surface rounded-xl px-4 py-3 text-foreground border border-border"
                  />
                </View>

                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-foreground mb-2">Location *</Text>
                    <TextInput
                      placeholder="e.g., Johannesburg"
                      placeholderTextColor={colors.muted}
                      className="bg-surface rounded-xl px-4 py-3 text-foreground border border-border"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-foreground mb-2">Salary *</Text>
                    <TextInput
                      placeholder="Amount in ZAR"
                      placeholderTextColor={colors.muted}
                      keyboardType="numeric"
                      className="bg-surface rounded-xl px-4 py-3 text-foreground border border-border"
                    />
                  </View>
                </View>

                <View>
                  <Text className="text-sm font-semibold text-foreground mb-2">Description *</Text>
                  <TextInput
                    placeholder="Describe the role, responsibilities, and requirements"
                    placeholderTextColor={colors.muted}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    className="bg-surface rounded-xl px-4 py-3 text-foreground border border-border"
                  />
                </View>

                <TouchableOpacity
                  onPress={() => {
                    setShowPostJob(false);
                    Toast.show({
                      type: "success",
                      text1: "Opportunity Posted!",
                      text2: "Your job posting is now live on the board.",
                    });
                  }}
                  className="py-4 rounded-xl items-center mt-2"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Text className="text-white font-semibold text-base">Publish Opportunity</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Toast />
    </ScreenContainer>
  );
}
