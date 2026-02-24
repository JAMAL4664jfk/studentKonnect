import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  TextInput,
  Modal,
  Pressable,
  ImageBackground,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useChat } from "@/contexts/ChatContext";
import { useInstitution } from "@/contexts/InstitutionContext";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { supabase, safeGetUser } from "@/lib/supabase";
import Toast from "react-native-toast-message";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GroupDetailModal } from "@/components/GroupDetailModal";
import { UserProfileModal } from "@/components/UserProfileModal";

interface Conversation {
  id: string;
  participant1_id: string;
  participant2_id: string;
  last_message: string | null;
  last_message_at: string | null;
  other_user_id: string;
  other_user_name: string;
  other_user_photo: string | null;
  unread_count: number;
}

interface Group {
  id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  created_by: string;
  is_public: boolean;
  member_count: number;
  is_member: boolean;
  is_admin: boolean;
  last_message: string | null;
  last_message_at: string | null;
}

interface CallLog {
  id: string;
  caller_id: string;
  receiver_id: string;
  call_type: "voice" | "video";
  call_status: "missed" | "answered" | "declined" | "cancelled";
  duration: number;
  started_at: string;
  caller_name: string;
  caller_photo: string | null;
  receiver_name: string;
  receiver_photo: string | null;
}

interface Status {
  id: string;
  user_id: string;
  content: string;
  media_url: string | null;
  media_type: string | null;
  created_at: string;
  expires_at: string;
  views_count: number;
  user_name: string;
  user_photo: string | null;
}

type User = {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  course_program: string | null;
};

type TabType = "chats" | "groups" | "calls" | "status" | "discover";

// Safety function to ensure we always render strings, never objects
const safeString = (value: any): string => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    // Extract name from object if it exists
    return value.name || value.shortName || value.displayName || '';
  }
  return String(value);
};

export default function ChatScreen() {
  const router = useRouter();
  const colors = useColors();
  const { userInstitution } = useInstitution();
  const { conversations, setConversations, loadConversations } = useChat();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("chats");
  const [showTabDropdown, setShowTabDropdown] = useState(false);

  // Format last message for display
  const formatLastMessage = (message: string | null): string => {
    if (!message) return "No messages yet";
    
    if (message.startsWith('[Image]')) {
      return "📷 Photo";
    }
    if (message.startsWith('[Video]')) {
      return "🎥 Video";
    }
    if (message.startsWith('[File:')) {
      const match = message.match(/\[File: (.+?)\]/);
      if (match) {
        const fileName = match[1];
        const extension = fileName.split('.').pop()?.toUpperCase();
        return `📄 ${fileName}`;
      }
      return "📄 File";
    }
    return message;
  };
  
  // Groups state
  const [groups, setGroups] = useState<Group[]>([]);
  const [publicGroups, setPublicGroups] = useState<Group[]>([]);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [isPublicGroup, setIsPublicGroup] = useState(false);
  
  // Calls state
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [callFilter, setCallFilter] = useState<"all" | "missed" | "incoming" | "outgoing">("all");
  
  // Status state
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [myStatuses, setMyStatuses] = useState<Status[]>([]);
  const [showAddStatus, setShowAddStatus] = useState(false);
  const [newStatusContent, setNewStatusContent] = useState("");
  const [statusMediaUri, setStatusMediaUri] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<Status | null>(null);
  const [showStatusViewer, setShowStatusViewer] = useState(false);
  const [statusViewerIndex, setStatusViewerIndex] = useState(0);
  
  // Discover state
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [connections, setConnections] = useState<Set<string>>(new Set());
  const [pendingRequests, setPendingRequests] = useState<Set<string>>(new Set());
  
  // Search state for each tab
  const [chatSearch, setChatSearch] = useState("");
  const [groupSearch, setGroupSearch] = useState("");
  const [callSearch, setCallSearch] = useState("");
  
  // Group detail modal state
  const [showGroupDetail, setShowGroupDetail] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  
  // Profile modal state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await safeGetUser();
      if (user) {
        setCurrentUserId(user.id);
        loadConversations(user.id);
        loadGroups(user.id);
        loadCallLogs(user.id);
        loadStatuses(user.id);
        loadAllUsers(user.id);
        loadConnections(user.id);
      }
    };

    getCurrentUser();
  }, []);

  // Real-time subscriptions
  useEffect(() => {
    if (!currentUserId) return;

    const groupsChannel = supabase
      .channel("groups_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_groups" }, () => {
        loadGroups(currentUserId);
      })
      .subscribe();

    const callsChannel = supabase
      .channel("calls_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "call_logs" }, () => {
        loadCallLogs(currentUserId);
      })
      .subscribe();

    const statusesChannel = supabase
      .channel("statuses_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "user_statuses" }, () => {
        loadStatuses(currentUserId);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(groupsChannel);
      supabase.removeChannel(callsChannel);
      supabase.removeChannel(statusesChannel);
    };
  }, [currentUserId]);

  const loadGroups = async (userId: string) => {
    try {
      // Load my groups
      const { data: memberData } = await supabase
        .from("group_members")
        .select("group_id, role")
        .eq("user_id", userId);

      if (memberData && memberData.length > 0) {
        const groupIds = memberData.map((m) => m.group_id);
        const { data: groupsData } = await supabase
          .from("chat_groups")
          .select("*")
          .in("id", groupIds)
          .order("updated_at", { ascending: false });

        if (groupsData) {
          const groupsWithInfo = await Promise.all(
            groupsData.map(async (group) => {
              const { count } = await supabase
                .from("group_members")
                .select("*", { count: "exact", head: true })
                .eq("group_id", group.id);

              const memberInfo = memberData.find((m) => m.group_id === group.id);

              return {
                ...group,
                member_count: count || 0,
                is_member: true,
                is_admin: memberInfo?.role === "admin",
                last_message: null,
                last_message_at: null,
              };
            })
          );
          setGroups(groupsWithInfo);
        }
      }

      // Load public groups
      const { data: publicGroupsData } = await supabase
        .from("chat_groups")
        .select("*")
        .eq("is_public", true)
        .order("updated_at", { ascending: false })
        .limit(20);

      if (publicGroupsData) {
        const publicGroupsWithInfo = await Promise.all(
          publicGroupsData.map(async (group) => {
            const { count } = await supabase
              .from("group_members")
              .select("*", { count: "exact", head: true })
              .eq("group_id", group.id);

            const { data: memberCheck } = await supabase
              .from("group_members")
              .select("role")
              .eq("group_id", group.id)
              .eq("user_id", userId)
              .maybeSingle();

            return {
              ...group,
              member_count: count || 0,
              is_member: !!memberCheck,
              is_admin: memberCheck?.role === "admin",
              last_message: null,
              last_message_at: null,
            };
          })
        );
        setPublicGroups(publicGroupsWithInfo);
      }
    } catch (error) {
      console.error("Error loading groups:", error);
    }
  };

  const loadCallLogs = async (userId: string) => {
    try {
      const { data: callsData } = await supabase
        .from("call_logs")
        .select("*")
        .or(`caller_id.eq.${userId},receiver_id.eq.${userId}`)
        .order("started_at", { ascending: false })
        .limit(50);

      if (callsData) {
        const userIds = [
          ...new Set(callsData.flatMap((call) => [call.caller_id, call.receiver_id])),
        ];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .in("id", userIds);

        const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

        const logsWithNames = callsData.map((call) => ({
          ...call,
          caller_name: profileMap.get(call.caller_id)?.full_name || "Unknown",
          caller_photo: profileMap.get(call.caller_id)?.avatar_url || null,
          receiver_name: profileMap.get(call.receiver_id)?.full_name || "Unknown",
          receiver_photo: profileMap.get(call.receiver_id)?.avatar_url || null,
        }));

        setCallLogs(logsWithNames);
      }
    } catch (error) {
      console.error("Error loading call logs:", error);
    }
  };

  const loadStatuses = async (userId: string) => {
    try {
      // Load connections first
      const { data: connectionsData } = await supabase
        .from("connections")
        .select("user1_id, user2_id")
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

      const connectedIds = new Set<string>();
      connectionsData?.forEach((conn) => {
        const otherId = conn.user1_id === userId ? conn.user2_id : conn.user1_id;
        connectedIds.add(otherId);
      });
      connectedIds.add(userId); // Include own statuses

      // Load statuses from connections
      const { data: statusData } = await supabase
        .from("user_statuses")
        .select("*")
        .in("user_id", Array.from(connectedIds))
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });

      if (statusData) {
        const userIds = [...new Set(statusData.map((s) => s.user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .in("id", userIds);

        const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

        const formattedStatuses = statusData.map((status) => ({
          ...status,
          user_name: profileMap.get(status.user_id)?.full_name || "Unknown User",
          user_photo: profileMap.get(status.user_id)?.avatar_url || null,
        }));

        setMyStatuses(formattedStatuses.filter((s) => s.user_id === userId));
        setStatuses(formattedStatuses.filter((s) => s.user_id !== userId));
      }
    } catch (error) {
      console.error("Error loading statuses:", error);
    }
  };

  const loadAllUsers = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, avatar_url, course_program")
        .neq("id", userId)
        .order("full_name");

      // If Supabase query succeeds and has data, use it
      if (!error && data && data.length > 0) {
        setAllUsers(data);
        return;
      }

      // Otherwise, use sample data for testing
      console.log("Using sample data - run supabase-setup.sql to use real users");
      const sampleUsers = [
        {
          id: "sample-1",
          full_name: "Thabo Mokoena",
          email: "thabo.m@student.ac.za",
          avatar_url: "https://i.pravatar.cc/150?img=12",
          course_program: "BSc Computer Science",
        },
        {
          id: "sample-2",
          full_name: "Nomsa Dlamini",
          email: "nomsa.d@student.ac.za",
          avatar_url: "https://i.pravatar.cc/150?img=45",
          course_program: "BCom Accounting",
        },
        {
          id: "sample-3",
          full_name: "Sipho Ndlovu",
          email: "sipho.n@student.ac.za",
          avatar_url: "https://i.pravatar.cc/150?img=33",
          course_program: "LLB Law",
        },
        {
          id: "sample-4",
          full_name: "Lerato Khumalo",
          email: "lerato.k@student.ac.za",
          avatar_url: "https://i.pravatar.cc/150?img=27",
          course_program: "BEng Mechanical Engineering",
        },
        {
          id: "sample-5",
          full_name: "Bongani Zulu",
          email: "bongani.z@student.ac.za",
          avatar_url: "https://i.pravatar.cc/150?img=51",
          course_program: "BA Psychology",
        },
        {
          id: "sample-6",
          full_name: "Zanele Mthembu",
          email: "zanele.m@student.ac.za",
          avatar_url: "https://i.pravatar.cc/150?img=38",
          course_program: "MBChB Medicine",
        },
        {
          id: "sample-7",
          full_name: "Mandla Sithole",
          email: "mandla.s@student.ac.za",
          avatar_url: "https://i.pravatar.cc/150?img=15",
          course_program: "BSc Information Systems",
        },
        {
          id: "sample-8",
          full_name: "Precious Mahlangu",
          email: "precious.m@student.ac.za",
          avatar_url: "https://i.pravatar.cc/150?img=42",
          course_program: "BCom Marketing",
        },
      ];
      setAllUsers(sampleUsers);
    } catch (error) {
      console.error("Error loading users:", error);
      // Fallback to sample data on any error
      const sampleUsers = [
        {
          id: "sample-1",
          full_name: "Thabo Mokoena",
          email: "thabo.m@student.ac.za",
          avatar_url: "https://i.pravatar.cc/150?img=12",
          course_program: "BSc Computer Science",
        },
        {
          id: "sample-2",
          full_name: "Nomsa Dlamini",
          email: "nomsa.d@student.ac.za",
          avatar_url: "https://i.pravatar.cc/150?img=45",
          course_program: "BCom Accounting",
        },
        {
          id: "sample-3",
          full_name: "Sipho Ndlovu",
          email: "sipho.n@student.ac.za",
          avatar_url: "https://i.pravatar.cc/150?img=33",
          course_program: "LLB Law",
        },
        {
          id: "sample-4",
          full_name: "Lerato Khumalo",
          email: "lerato.k@student.ac.za",
          avatar_url: "https://i.pravatar.cc/150?img=27",
          course_program: "BEng Mechanical Engineering",
        },
        {
          id: "sample-5",
          full_name: "Bongani Zulu",
          email: "bongani.z@student.ac.za",
          avatar_url: "https://i.pravatar.cc/150?img=51",
          course_program: "BA Psychology",
        },
        {
          id: "sample-6",
          full_name: "Zanele Mthembu",
          email: "zanele.m@student.ac.za",
          avatar_url: "https://i.pravatar.cc/150?img=38",
          course_program: "MBChB Medicine",
        },
        {
          id: "sample-7",
          full_name: "Mandla Sithole",
          email: "mandla.s@student.ac.za",
          avatar_url: "https://i.pravatar.cc/150?img=15",
          course_program: "BSc Information Systems",
        },
        {
          id: "sample-8",
          full_name: "Precious Mahlangu",
          email: "precious.m@student.ac.za",
          avatar_url: "https://i.pravatar.cc/150?img=42",
          course_program: "BCom Marketing",
        },
      ];
      setAllUsers(sampleUsers);
    }
  };

  const loadConnections = async (userId: string) => {
    try {
      const { data: connectionsData } = await supabase
        .from("connections")
        .select("user1_id, user2_id")
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

      const connectedIds = new Set<string>();
      connectionsData?.forEach((conn) => {
        const otherId = conn.user1_id === userId ? conn.user2_id : conn.user1_id;
        connectedIds.add(otherId);
      });
      setConnections(connectedIds);

      const { data: requestsData } = await supabase
        .from("connection_requests")
        .select("receiver_id")
        .eq("sender_id", userId)
        .eq("status", "pending");

      const pendingIds = new Set<string>();
      requestsData?.forEach((req) => {
        pendingIds.add(req.receiver_id);
      });
      setPendingRequests(pendingIds);
    } catch (error) {
      console.error("Error loading connections:", error);
    }
  };



  const handleRefresh = async () => {
    if (!currentUserId) return;
    setRefreshing(true);
    await loadConversations(currentUserId);
    if (activeTab === "groups") await loadGroups(currentUserId);
    if (activeTab === "calls") await loadCallLogs(currentUserId);
    if (activeTab === "status") await loadStatuses(currentUserId);
    if (activeTab === "discover") await loadAllUsers(currentUserId);
    setRefreshing(false);
  };

  const handleConversationPress = (conversation: Conversation) => {
    router.push({
      pathname: "/chat-detail",
      params: {
        conversationId: conversation.id,
        otherUserName: conversation.other_user_name,
        otherUserPhoto: conversation.other_user_photo || "",
        otherUserId: conversation.other_user_id,
      },
    });
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim() || !currentUserId) {
      Toast.show({ type: "error", text1: "Please enter a group name" });
      return;
    }

    try {
      const { data: group, error } = await supabase
        .from("chat_groups")
        .insert({
          name: newGroupName,
          description: newGroupDescription,
          created_by: currentUserId,
          is_public: isPublicGroup,
        })
        .select()
        .maybeSingle();

      if (error) throw error;

      // Add creator as admin
      await supabase.from("group_members").insert({
        group_id: group.id,
        user_id: currentUserId,
        role: "admin",
      });

      Toast.show({ type: "success", text1: "Group created successfully!" });
      setShowCreateGroup(false);
      setNewGroupName("");
      setNewGroupDescription("");
      setIsPublicGroup(false);
      loadGroups(currentUserId);
    } catch (error) {
      console.error("Error creating group:", error);
      Toast.show({ type: "error", text1: "Failed to create group" });
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    if (!currentUserId) return;

    try {
      await supabase.from("group_members").insert({
        group_id: groupId,
        user_id: currentUserId,
        role: "member",
      });

      Toast.show({ type: "success", text1: "Joined group successfully!" });
      loadGroups(currentUserId);
    } catch (error) {
      console.error("Error joining group:", error);
      Toast.show({ type: "error", text1: "Failed to join group" });
    }
  };

  const handleAddStatus = async () => {
    if (!newStatusContent.trim() && !statusMediaUri) {
      Toast.show({ type: "error", text1: "Please add text or media" });
      return;
    }

    if (!currentUserId) return;

    try {
      let mediaUrl = null;
      let mediaType = null;

      if (statusMediaUri) {
        // In a real app, upload to storage here
        mediaUrl = statusMediaUri;
        mediaType = statusMediaUri.includes("video") ? "video" : "image";
      }

      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      await supabase.from("user_statuses").insert({
        user_id: currentUserId,
        content: newStatusContent,
        media_url: mediaUrl,
        media_type: mediaType,
        expires_at: expiresAt.toISOString(),
      });

      Toast.show({ type: "success", text1: "Status posted!" });
      setShowAddStatus(false);
      setNewStatusContent("");
      setStatusMediaUri(null);
      loadStatuses(currentUserId);
    } catch (error) {
      console.error("Error adding status:", error);
      Toast.show({ type: "error", text1: "Failed to post status" });
    }
  };

  const handlePickStatusMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setStatusMediaUri(result.assets[0].uri);
    }
  };

  const handleViewStatus = (status: Status, index: number) => {
    setSelectedStatus(status);
    setStatusViewerIndex(index);
    setShowStatusViewer(true);

    // Mark as viewed
    if (currentUserId && status.user_id !== currentUserId) {
      supabase
        .from("user_statuses")
        .update({ views_count: status.views_count + 1 })
        .eq("id", status.id)
        .then();
    }
  };

  const handleSendConnectionRequest = async (receiverId: string) => {
    if (!currentUserId) return;

    try {
      await supabase.from("connection_requests").insert({
        sender_id: currentUserId,
        receiver_id: receiverId,
        status: "pending",
      });

      Toast.show({ type: "success", text1: "Connection request sent!" });
      loadConnections(currentUserId);
    } catch (error) {
      console.error("Error sending connection request:", error);
      Toast.show({ type: "error", text1: "Failed to send request" });
    }
  };

  const handleStartChat = async (userId: string) => {
    if (!currentUserId) return;

    try {
      // Check if conversation exists
      const { data: existing } = await supabase
        .from("conversations")
        .select("*")
        .or(
          `and(participant1_id.eq.${currentUserId},participant2_id.eq.${userId}),and(participant1_id.eq.${userId},participant2_id.eq.${currentUserId})`
        )
        .maybeSingle();

      let conversationId = existing?.id;

      if (!conversationId) {
        const { data: newConv } = await supabase
          .from("conversations")
          .insert({
            participant1_id: currentUserId,
            participant2_id: userId,
          })
          .select()
          .maybeSingle();

        conversationId = newConv?.id;
      }

      if (conversationId) {
        const user = allUsers.find((u) => u.id === userId);
        router.push({
          pathname: "/chat-detail",
          params: {
            conversationId,
            otherUserName: user?.full_name || "User",
            otherUserPhoto: user?.avatar_url || "",
            otherUserId: userId,
          },
        });
      }
    } catch (error) {
      console.error("Error starting chat:", error);
      Toast.show({ type: "error", text1: "Failed to start chat" });
    }
  };

  const formatTime = (timestamp: string | null) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  const formatCallDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getCallIcon = (log: CallLog) => {
    const isIncoming = log.receiver_id === currentUserId;
    const isMissed = log.call_status === "missed";

    if (isMissed) return "phone.down.fill";
    if (isIncoming) return "phone.arrow.down.left";
    return "phone.arrow.up.right";
  };

  const getCallColor = (log: CallLog) => {
    if (log.call_status === "missed") return colors.error;
    if (log.receiver_id === currentUserId) return colors.success;
    return colors.primary;
  };

  const filteredCallLogs = callLogs.filter((log) => {
    if (callFilter === "all") return true;
    if (callFilter === "missed") return log.call_status === "missed";
    if (callFilter === "incoming") return log.receiver_id === currentUserId;
    if (callFilter === "outgoing") return log.caller_id === currentUserId;
    return true;
  });

  const filteredUsers = allUsers.filter(
    (user) =>
      user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.course_program?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
  );

  const tabs: { key: TabType; label: string; icon: string }[] = [
    { key: "chats", label: "Chats", icon: "message.fill" },
    { key: "groups", label: "Groups", icon: "person.3.fill" },
    { key: "calls", label: "Calls", icon: "phone.fill" },
    { key: "status", label: "Status", icon: "circle.fill" },
    { key: "discover", label: "Discover", icon: "magnifyingglass" },
  ];

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      <View className="flex-1">
        {/* Header */}
        <View className="px-4 py-3 border-b border-border">
          <View className="flex-row items-center justify-between">
            <Text className="text-2xl font-bold text-foreground">
              {userInstitution ? `${userInstitution.shortName} Konnect` : "Student Konnect"}
            </Text>
            <View className="flex-row gap-3">
              <TouchableOpacity onPress={() => router.push("/connection-requests" as any)}>
                <IconSymbol name="person.badge.plus" size={24} color={colors.foreground} />
              </TouchableOpacity>
              <TouchableOpacity>
                <IconSymbol name="camera.fill" size={24} color={colors.foreground} />
              </TouchableOpacity>
              <TouchableOpacity>
                <IconSymbol name="ellipsis.circle" size={24} color={colors.foreground} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Dropdown Menu */}
        <View className="px-4 py-3 border-b border-border">
          <TouchableOpacity
            onPress={() => setShowTabDropdown(!showTabDropdown)}
            className="flex-row items-center justify-between p-3 rounded-xl"
            style={{ backgroundColor: colors.surface }}
          >
            <View className="flex-row items-center gap-3">
              <IconSymbol
                name={tabs.find(t => t.key === activeTab)?.icon as any}
                size={20}
                color={colors.primary}
              />
              <Text className="text-base font-semibold" style={{ color: colors.foreground }}>
                {tabs.find(t => t.key === activeTab)?.label}
              </Text>
            </View>
            <IconSymbol
              name={showTabDropdown ? "chevron.up" : "chevron.down"}
              size={20}
              color={colors.muted}
            />
          </TouchableOpacity>
          
          {showTabDropdown && (
            <View className="mt-2 rounded-xl overflow-hidden" style={{ backgroundColor: colors.surface }}>
              {tabs.map((tab) => (
                <TouchableOpacity
                  key={tab.key}
                  onPress={() => {
                    setActiveTab(tab.key);
                    setShowTabDropdown(false);
                  }}
                  className="flex-row items-center gap-3 p-3 border-b border-border"
                  style={{
                    backgroundColor: activeTab === tab.key ? colors.primary + '15' : 'transparent',
                  }}
                >
                  <IconSymbol
                    name={tab.icon as any}
                    size={20}
                    color={activeTab === tab.key ? colors.primary : colors.muted}
                  />
                  <Text
                    className="text-base font-medium flex-1"
                    style={{
                      color: activeTab === tab.key ? colors.primary : colors.foreground,
                    }}
                  >
                    {tab.label}
                  </Text>
                  {activeTab === tab.key && (
                    <IconSymbol name="checkmark" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Content */}
        <View className="flex-1">
          {activeTab === "chats" && (
            <ImageBackground
              source={require("@/assets/images/chat-bg.jpg")}
              style={{ flex: 1 }}
              imageStyle={{ opacity: 0.05 }}
            >
            <FlatList
              data={conversations}
              keyExtractor={(item) => item.id}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleConversationPress(item)}
                  delayLongPress={500}
                  onLongPress={() => {
                    Alert.alert(
                      item.other_user_name,
                      'Choose an action',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Delete Chat',
                          style: 'destructive',
                          onPress: async () => {
                            try {
                              // Immediately remove from UI
                              setConversations(prev => prev.filter(c => c.id !== item.id));
                              
                              // Delete from database
                              await supabase
                                .from('conversations')
                                .delete()
                                .eq('id', item.id);
                              
                              Toast.show({
                                type: 'success',
                                text1: 'Chat deleted',
                              });
                            } catch (error) {
                              // Reload on error
                              if (currentUserId) loadConversations(currentUserId);
                              Toast.show({
                                type: 'error',
                                text1: 'Failed to delete chat',
                              });
                            }
                          },
                        },
                        {
                          text: 'Block User',
                          style: 'destructive',
                          onPress: async () => {
                            try {
                              // Immediately remove from UI
                              setConversations(prev => prev.filter(c => c.id !== item.id));
                              
                              // Block user in database
                              await supabase.from('blocked_users').insert({
                                blocker_id: currentUserId,
                                blocked_id: item.other_user_id,
                              });
                              
                              // Also delete the conversation
                              await supabase
                                .from('conversations')
                                .delete()
                                .eq('id', item.id);
                              
                              Toast.show({
                                type: 'success',
                                text1: 'User blocked',
                              });
                            } catch (error) {
                              // Reload on error
                              if (currentUserId) loadConversations(currentUserId);
                              Toast.show({
                                type: 'error',
                                text1: 'Failed to block user',
                              });
                            }
                          },
                        },
                      ],
                      { cancelable: true }
                    );
                  }}
                  className="flex-row items-center px-4 py-3 border-b border-border active:bg-surface"
                  style={{
                    backgroundColor: item.unread_count > 0 ? colors.primary + '08' : 'transparent'
                  }}
                >
                  <TouchableOpacity 
                    className="relative"
                    onPress={() => {
                      setSelectedUserId(item.other_user_id);
                      setShowProfileModal(true);
                    }}
                  >
                    <Image
                      source={{
                        uri: item.other_user_photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.other_user_name)}&background=random&size=128`,
                      }}
                      className="w-12 h-12 rounded-full mr-3"
                    />
                    <View className="absolute bottom-0 right-3 w-3 h-3 rounded-full border-2 border-background" style={{ backgroundColor: '#10b981' }} />
                  </TouchableOpacity>
                  <View className="flex-1">
                    <View className="flex-row items-center justify-between mb-1">
                      <Text className="text-base text-foreground" style={{ fontWeight: item.unread_count > 0 ? '700' : '600' }}>
                        {item.other_user_name}
                      </Text>
                      <Text className="text-xs text-muted">
                        {formatTime(item.last_message_at)}
                      </Text>
                    </View>
                    <View className="flex-row items-center justify-between">
                      <Text className="text-sm flex-1" numberOfLines={1} style={{ 
                        color: item.unread_count > 0 ? colors.foreground : colors.muted,
                        fontWeight: item.unread_count > 0 ? '600' : '400'
                      }}>
                        {formatLastMessage(item.last_message)}
                      </Text>
                      {item.unread_count > 0 && (
                        <View
                          className="w-5 h-5 rounded-full items-center justify-center ml-2"
                          style={{ backgroundColor: colors.primary }}
                        >
                          <Text className="text-white text-xs font-bold">
                            {item.unread_count}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
                  {/* Welcome Message */}
                  <View className="bg-primary/10 rounded-2xl p-6 mb-6 mt-4">
                    <View className="flex-row items-center mb-3">
                      <IconSymbol name="message.fill" size={32} color={colors.primary} />
                      <Text className="text-xl font-bold text-foreground ml-3">Welcome to Chat! 👋</Text>
                    </View>
                    <Text className="text-muted-foreground text-base leading-6">
                      Connect with students from {userInstitution?.name || "your institution"}. Start conversations, share ideas, and build your network!
                    </Text>
                  </View>


                  {/* People to Connect With */}
                  {allUsers.length > 0 && (
                  <View className="mb-6">
                    <Text className="text-lg font-bold text-foreground mb-4">People to Connect With</Text>
                    {allUsers.slice(0, 5).map((user) => (
                      <View
                        key={user.id}
                        className="bg-white rounded-xl p-4 mb-3 flex-row items-center"
                        style={{
                          shadowColor: "#000",
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.1,
                          shadowRadius: 4,
                          elevation: 2,
                        }}
                      >
                        <View className="w-12 h-12 rounded-full bg-muted items-center justify-center mr-3 overflow-hidden">
                          {user.avatar_url ? (
                            <Image
                              source={{ uri: user.avatar_url }}
                              className="w-full h-full"
                              style={{ resizeMode: 'cover' }}
                            />
                          ) : (
                            <Text className="text-foreground font-bold text-lg">
                              {user.full_name?.charAt(0).toUpperCase() || '?'}
                            </Text>
                          )}
                        </View>
                        <View className="flex-1">
                          <Text className="text-base font-semibold text-foreground">
                            {user.full_name}
                          </Text>
                          <Text className="text-sm text-muted" numberOfLines={1}>
                            {user.course_program || 'Student'}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => handleStartChat(user.id)}
                          className="px-4 py-2 rounded-xl"
                          style={{ backgroundColor: colors.primary }}
                        >
                          <Text className="text-white font-semibold">Chat</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                    
                    <TouchableOpacity
                      onPress={() => setActiveTab("discover")}
                      className="bg-primary/10 rounded-xl p-3 flex-row items-center justify-center mt-2"
                    >
                      <Text className="text-primary font-semibold mr-2">See All People</Text>
                      <IconSymbol name="chevron.right" size={16} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                  )}

                  {/* Quick Actions */}
                  <View className="mb-6">
                    <Text className="text-lg font-bold text-foreground mb-4">Quick Actions</Text>
                    <TouchableOpacity
                      onPress={() => setActiveTab("groups")}
                      className="bg-white rounded-xl p-4 flex-row items-center"
                      style={{
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 2,
                      }}
                    >
                      <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center mr-4">
                        <IconSymbol name="person.3.fill" size={24} color={colors.primary} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-foreground">Join Groups</Text>
                        <Text className="text-sm text-muted-foreground">Connect with communities</Text>
                      </View>
                      <IconSymbol name="chevron.right" size={20} color={colors.mutedForeground} />
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              }
            />
            </ImageBackground>
          )}

          {activeTab === "groups" && (
            <ImageBackground
              source={require("@/assets/images/groups-bg.jpg")}
              style={{ flex: 1 }}
              imageStyle={{ opacity: 0.05 }}
            >
            <ScrollView
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
              }
            >
              {/* Create Group Button */}
              <TouchableOpacity
                onPress={() => setShowCreateGroup(true)}
                className="mx-4 mt-2 mb-3 rounded-2xl p-4 flex-row items-center justify-center"
                style={{ backgroundColor: colors.primary }}
              >
                <IconSymbol name="plus.circle.fill" size={20} color="#fff" />
                <Text className="text-white font-semibold ml-2">Create New Group</Text>
              </TouchableOpacity>

              {/* My Groups */}
              <View className="px-4 mb-4">
                <Text className="text-lg font-bold text-foreground mb-3">My Groups</Text>
                {groups.length === 0 ? (
                  <View className="bg-surface rounded-xl p-6 items-center">
                    <IconSymbol name="person.3" size={40} color={colors.muted} />
                    <Text className="text-muted text-center mt-2">
                      You haven't joined any groups yet
                    </Text>
                  </View>
                ) : (
                  groups.map((group) => (
                    <TouchableOpacity
                      key={group.id}
                      onPress={() => {
                        router.push({
                          pathname: "/group-chat",
                          params: {
                            groupId: group.id,
                            groupName: group.name,
                            memberCount: group.member_count.toString(),
                          },
                        });
                      }}
                      className="bg-surface rounded-xl p-4 mb-3 flex-row items-center"
                    >
                      {group.avatar_url ? (
                        <Image
                          source={{ uri: group.avatar_url }}
                          className="w-12 h-12 rounded-full mr-3"
                        />
                      ) : (
                        <View
                          className="w-12 h-12 rounded-full items-center justify-center mr-3"
                          style={{ backgroundColor: colors.primary + "20" }}
                        >
                          <IconSymbol name="person.3.fill" size={24} color={colors.primary} />
                        </View>
                      )}
                      <View className="flex-1">
                        <View className="flex-row items-center justify-between mb-1">
                          <Text className="text-base font-semibold text-foreground">
                            {group.name}
                          </Text>
                          {group.is_admin && (
                            <View
                              className="px-2 py-1 rounded-md"
                              style={{ backgroundColor: colors.primary + "20" }}
                            >
                              <Text className="text-xs font-bold" style={{ color: colors.primary }}>
                                Admin
                              </Text>
                            </View>
                          )}
                        </View>
                        <Text className="text-sm text-muted" numberOfLines={1}>
                          {group.member_count} members
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation();
                          setSelectedGroupId(group.id);
                          setShowGroupDetail(true);
                        }}
                        className="ml-2"
                      >
                        <IconSymbol name="info.circle" size={24} color={colors.primary} />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))
                )}
              </View>

              {/* Discover Groups */}
              <View className="px-4 mb-4">
                <Text className="text-lg font-bold text-foreground mb-3">Discover Groups</Text>
                {publicGroups.length === 0 ? (
                  <View className="bg-surface rounded-xl p-6 items-center">
                    <IconSymbol name="magnifyingglass" size={40} color={colors.muted} />
                    <Text className="text-muted text-center mt-2">No public groups available</Text>
                  </View>
                ) : (
                  publicGroups.map((group) => (
                    <View key={group.id} className="bg-surface rounded-xl p-4 mb-3">
                      <View className="flex-row items-center mb-3">
                        {group.avatar_url ? (
                          <Image
                            source={{ uri: group.avatar_url }}
                            className="w-12 h-12 rounded-full mr-3"
                          />
                        ) : (
                          <View
                            className="w-12 h-12 rounded-full items-center justify-center mr-3"
                            style={{ backgroundColor: colors.primary + "20" }}
                          >
                            <IconSymbol name="globe" size={24} color={colors.primary} />
                          </View>
                        )}
                        <View className="flex-1">
                          <Text className="text-base font-semibold text-foreground">
                            {group.name}
                          </Text>
                          <Text className="text-sm text-muted">{group.member_count} members</Text>
                        </View>
                      </View>
                      {group.description && (
                        <Text className="text-sm text-muted mb-3" numberOfLines={2}>
                          {group.description}
                        </Text>
                      )}
                      {!group.is_member && (
                        <TouchableOpacity
                          onPress={() => handleJoinGroup(group.id)}
                          className="rounded-xl py-2 items-center"
                          style={{ backgroundColor: colors.primary }}
                        >
                          <Text className="text-white font-semibold">Join Group</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  ))
                )}
              </View>
            </ScrollView>
            </ImageBackground>
          )}

          {activeTab === "calls" && (
            <ImageBackground
              source={require("@/assets/images/calls-bg.jpg")}
              style={{ flex: 1 }}
              imageStyle={{ opacity: 0.05 }}
            >
            <View className="flex-1">
              {/* Call Filter */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="flex-row px-4 py-2 border-b border-border"
                style={{ flexGrow: 0 }}
              >
                {(["all", "missed", "incoming", "outgoing"] as const).map((filter) => (
                  <TouchableOpacity
                    key={filter}
                    onPress={() => setCallFilter(filter)}
                    className="px-3 py-1.5 rounded-full mr-2"
                    style={{
                      backgroundColor:
                        callFilter === filter ? colors.primary : colors.surface,
                    }}
                  >
                    <Text
                      className="text-sm font-medium capitalize"
                      style={{
                        color: callFilter === filter ? "#fff" : colors.foreground,
                      }}
                    >
                      {filter}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <FlatList
                data={filteredCallLogs}
                keyExtractor={(item) => item.id}
                refreshControl={
                  <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
                renderItem={({ item }) => {
                  const isIncoming = item.receiver_id === currentUserId;
                  const otherUser = isIncoming
                    ? { name: item.caller_name, photo: item.caller_photo }
                    : { name: item.receiver_name, photo: item.receiver_photo };

                  return (
                    <View className="flex-row items-center px-4 py-3 border-b border-border">
                      <Image
                        source={{
                          uri: otherUser.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser.name)}&background=random&size=128`,
                        }}
                        className="w-12 h-12 rounded-full mr-3"
                      />
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-foreground mb-1">
                          {otherUser.name}
                        </Text>
                        <View className="flex-row items-center">
                          <IconSymbol
                            name={getCallIcon(item) as any}
                            size={14}
                            color={getCallColor(item)}
                          />
                          <Text className="text-sm text-muted ml-1">
                            {item.call_type === "video" ? "Video" : "Voice"} •{" "}
                            {item.call_status === "answered"
                              ? formatCallDuration(item.duration)
                              : item.call_status}
                          </Text>
                        </View>
                      </View>
                      <Text className="text-xs text-muted">
                        {formatTime(item.started_at)}
                      </Text>
                    </View>
                  );
                }}
                ListEmptyComponent={
                  <View className="items-center justify-center py-12">
                    <IconSymbol name="phone" size={48} color={colors.muted} />
                    <Text className="text-muted text-center mt-4">No call logs</Text>
                  </View>
                }
              />
            </View>
            </ImageBackground>
          )}

          {activeTab === "status" && (
            <ImageBackground
              source={require("@/assets/images/status-bg.jpg")}
              style={{ flex: 1 }}
              imageStyle={{ opacity: 0.05 }}
            >
            <ScrollView
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
              }
            >
              {/* Add Status Button */}
              <TouchableOpacity
                onPress={() => setShowAddStatus(true)}
                className="mx-4 mt-4 mb-3 rounded-2xl p-4 flex-row items-center justify-center"
                style={{ backgroundColor: colors.primary }}
              >
                <IconSymbol name="plus.circle.fill" size={20} color="#fff" />
                <Text className="text-white font-semibold ml-2">Add Status</Text>
              </TouchableOpacity>

              {/* My Status */}
              {myStatuses.length > 0 && (
                <View className="px-4 mb-4">
                  <Text className="text-lg font-bold text-foreground mb-3">My Status</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {myStatuses.map((status, index) => (
                      <TouchableOpacity
                        key={status.id}
                        onPress={() => handleViewStatus(status, index)}
                        className="mr-3"
                      >
                        <View
                          className="w-20 h-20 rounded-full items-center justify-center"
                          style={{
                            borderWidth: 3,
                            borderColor: colors.primary,
                          }}
                        >
                          {status.media_url ? (
                            <Image
                              source={{ uri: status.media_url }}
                              className="w-full h-full rounded-full"
                            />
                          ) : (
                            <View
                              className="w-full h-full rounded-full items-center justify-center"
                              style={{ backgroundColor: colors.primary + "20" }}
                            >
                              <Text className="text-2xl">📝</Text>
                            </View>
                          )}
                        </View>
                        <Text className="text-xs text-center text-muted mt-1">
                          {formatTime(status.created_at)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Recent Updates */}
              <View className="px-4 mb-4">
                <Text className="text-lg font-bold text-foreground mb-3">Recent Updates</Text>
                {statuses.length === 0 ? (
                  <View className="bg-surface rounded-xl p-6 items-center">
                    <IconSymbol name="circle" size={40} color={colors.muted} />
                    <Text className="text-muted text-center mt-2">No status updates</Text>
                  </View>
                ) : (
                  // Group statuses by user_id
                  Object.entries(
                    statuses.reduce((acc, status) => {
                      if (!acc[status.user_id]) {
                        acc[status.user_id] = [];
                      }
                      acc[status.user_id].push(status);
                      return acc;
                    }, {} as Record<string, Status[]>)
                  ).map(([userId, userStatuses]) => {
                    const firstStatus = userStatuses[0];
                    return (
                      <TouchableOpacity
                        key={userId}
                        onPress={() => handleViewStatus(firstStatus, 0)}
                        className="flex-row items-center mb-4"
                      >
                        <View
                          className="w-14 h-14 rounded-full items-center justify-center mr-3"
                          style={{
                            borderWidth: 3,
                            borderColor: colors.primary,
                          }}
                        >
                          {firstStatus.user_photo ? (
                            <Image
                              source={{ uri: firstStatus.user_photo }}
                              className="w-full h-full rounded-full"
                            />
                          ) : (
                            <Image
                              source={{ uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(firstStatus.user_name)}&background=random&size=128` }}
                              className="w-full h-full rounded-full"
                            />
                          )}
                        </View>
                        <View className="flex-1">
                          <Text className="text-base font-semibold text-foreground">
                            {firstStatus.user_name}
                          </Text>
                          <Text className="text-sm text-muted">
                            {userStatuses.length} {userStatuses.length === 1 ? 'status' : 'statuses'} • {formatTime(userStatuses[0].created_at)}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })
                )}
              </View>
            </ScrollView>
            </ImageBackground>
          )}

          {activeTab === "discover" && (
            <ImageBackground
              source={require("@/assets/images/discover-bg.jpg")}
              style={{ flex: 1 }}
              imageStyle={{ opacity: 0.05 }}
            >
            <View className="flex-1">
              {/* Search */}
              <View className="px-4 py-3 border-b border-border">
                <View className="flex-row items-center gap-3 rounded-2xl px-4 py-3 bg-surface border border-border">
                  <IconSymbol name="magnifyingglass" size={20} color={colors.muted} />
                  <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search students..."
                    placeholderTextColor={colors.muted}
                    className="flex-1 text-foreground text-base"
                  />
                </View>
              </View>

              <FlatList
                data={filteredUsers}
                keyExtractor={(item) => item.id}
                refreshControl={
                  <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
                renderItem={({ item }) => {
                  const isConnected = connections.has(item.id);
                  const isPending = pendingRequests.has(item.id);

                  return (
                    <View className="px-4 py-3 border-b border-border">
                      <View className="flex-row items-center mb-3">
                        <View className="w-14 h-14 rounded-full mr-3 bg-muted/30 items-center justify-center overflow-hidden">
                          {item.avatar_url ? (
                            <Image
                              source={{ uri: item.avatar_url }}
                              className="w-full h-full"
                              style={{ resizeMode: 'cover' }}
                            />
                          ) : (
                            <Text className="text-foreground font-bold text-lg">
                              {item.full_name?.charAt(0).toUpperCase() || '?'}
                            </Text>
                          )}
                        </View>
                        <View className="flex-1">
                          <Text className="text-base font-semibold text-foreground">
                            {item.full_name}
                          </Text>
                          {item.course_program && (
                            <Text className="text-sm text-muted" numberOfLines={1}>
                              {item.course_program}
                            </Text>
                          )}
                          {item.email && (
                            <Text className="text-xs text-muted" numberOfLines={1}>
                              {item.email}
                            </Text>
                          )}
                        </View>
                      </View>
                      <View className="flex-row gap-2">
                        <TouchableOpacity
                          onPress={() => handleStartChat(item.id)}
                          className="flex-1 rounded-xl py-2 items-center"
                          style={{ backgroundColor: colors.primary }}
                        >
                          <Text className="text-white font-semibold">Message</Text>
                        </TouchableOpacity>
                        {!isConnected && !isPending && (
                          <TouchableOpacity
                            onPress={() => handleSendConnectionRequest(item.id)}
                            className="px-4 rounded-xl py-2 items-center border border-primary"
                          >
                            <IconSymbol name="person.badge.plus" size={20} color={colors.primary} />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  );
                }}
                ListEmptyComponent={
                  <View className="items-center justify-center py-12">
                    <IconSymbol name="person.2" size={48} color={colors.muted} />
                    <Text className="text-muted text-center mt-4">No users found</Text>
                  </View>
                }
              />
            </View>
            </ImageBackground>
          )}
        </View>
      </View>

      {/* Create Group Modal */}
      <Modal visible={showCreateGroup} animationType="slide" transparent>
        <View className="flex-1 justify-end" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <View
            className="rounded-t-3xl p-6"
            style={{ backgroundColor: colors.background, maxHeight: "80%" }}
          >
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
                Create Group
              </Text>
              <TouchableOpacity onPress={() => setShowCreateGroup(false)}>
                <IconSymbol name="xmark" size={24} color={colors.foreground} />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <View className="gap-4">
                <View>
                  <Text className="text-sm font-semibold text-foreground mb-2">
                    Group Name *
                  </Text>
                  <TextInput
                    value={newGroupName}
                    onChangeText={setNewGroupName}
                    placeholder="Enter group name"
                    placeholderTextColor={colors.muted}
                    className="bg-surface rounded-xl px-4 py-3 text-foreground border border-border"
                  />
                </View>

                <View>
                  <Text className="text-sm font-semibold text-foreground mb-2">
                    Description (Optional)
                  </Text>
                  <TextInput
                    value={newGroupDescription}
                    onChangeText={setNewGroupDescription}
                    placeholder="What's this group about?"
                    placeholderTextColor={colors.muted}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                    className="bg-surface rounded-xl px-4 py-3 text-foreground border border-border"
                  />
                </View>

                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-sm font-semibold text-foreground mb-1">
                      Public Group
                    </Text>
                    <Text className="text-xs text-muted">
                      Anyone can discover and join
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setIsPublicGroup(!isPublicGroup)}
                    className="w-12 h-7 rounded-full justify-center"
                    style={{
                      backgroundColor: isPublicGroup ? colors.primary : colors.muted + "40",
                    }}
                  >
                    <View
                      className="w-5 h-5 rounded-full bg-white"
                      style={{
                        marginLeft: isPublicGroup ? 24 : 4,
                      }}
                    />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  onPress={handleCreateGroup}
                  className="py-4 rounded-xl items-center mt-2"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Text className="text-white font-semibold text-base">Create Group</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Add Status Modal */}
      <Modal visible={showAddStatus} animationType="slide" transparent>
        <View className="flex-1 justify-end" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <View
            className="rounded-t-3xl p-6"
            style={{ backgroundColor: colors.background, maxHeight: "80%" }}
          >
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
                Add Status
              </Text>
              <TouchableOpacity onPress={() => {
                setShowAddStatus(false);
                setNewStatusContent("");
                setStatusMediaUri(null);
              }}>
                <IconSymbol name="xmark" size={24} color={colors.foreground} />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <View className="gap-4">
                {statusMediaUri && (
                  <View className="relative">
                    <Image
                      source={{ uri: statusMediaUri }}
                      className="w-full h-48 rounded-xl"
                      resizeMode="cover"
                    />
                    <TouchableOpacity
                      onPress={() => setStatusMediaUri(null)}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full items-center justify-center"
                      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
                    >
                      <IconSymbol name="xmark" size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                )}

                <View>
                  <TextInput
                    value={newStatusContent}
                    onChangeText={setNewStatusContent}
                    placeholder="What's on your mind?"
                    placeholderTextColor={colors.muted}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    className="bg-surface rounded-xl px-4 py-3 text-foreground border border-border"
                  />
                </View>

                <View className="flex-row gap-3">
                  <TouchableOpacity
                    onPress={handlePickStatusMedia}
                    className="flex-1 rounded-xl py-3 items-center border border-primary"
                  >
                    <View className="flex-row items-center gap-2">
                      <IconSymbol name="photo" size={20} color={colors.primary} />
                      <Text className="text-primary font-semibold">Add Media</Text>
                    </View>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  onPress={handleAddStatus}
                  className="py-4 rounded-xl items-center"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Text className="text-white font-semibold text-base">Post Status</Text>
                </TouchableOpacity>

                <Text className="text-xs text-muted text-center">
                  Status will be visible for 24 hours
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Status Viewer Modal */}
      <Modal visible={showStatusViewer} animationType="fade" transparent>
        <View className="flex-1" style={{ backgroundColor: "rgba(0,0,0,0.95)" }}>
          {selectedStatus && (
            <>
              {/* Header */}
              <View className="flex-row items-center justify-between px-4 py-3 mt-12">
                <View className="flex-row items-center flex-1">
                  <Image
                    source={{
                      uri: selectedStatus.user_photo || "https://via.placeholder.com/40",
                    }}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <View className="flex-1">
                    <Text className="text-white font-semibold">
                      {selectedStatus.user_name}
                    </Text>
                    <Text className="text-white/70 text-xs">
                      {formatTime(selectedStatus.created_at)}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => setShowStatusViewer(false)}
                  className="w-8 h-8 rounded-full items-center justify-center"
                  style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
                >
                  <IconSymbol name="xmark" size={20} color="#fff" />
                </TouchableOpacity>
              </View>

              {/* Content */}
              <View className="flex-1 items-center justify-center px-4">
                {selectedStatus.media_url ? (
                  <Image
                    source={{ uri: selectedStatus.media_url }}
                    className="w-full h-96 rounded-xl"
                    resizeMode="contain"
                  />
                ) : (
                  <View className="w-full bg-white/10 rounded-xl p-8">
                    <Text className="text-white text-xl text-center">
                      {selectedStatus.content}
                    </Text>
                  </View>
                )}
                {selectedStatus.content && selectedStatus.media_url && (
                  <Text className="text-white text-center mt-4 px-4">
                    {selectedStatus.content}
                  </Text>
                )}
              </View>

              {/* Footer */}
              <View className="px-4 py-4 mb-8">
                <Text className="text-white/70 text-center text-sm">
                  👁️ {selectedStatus.views_count} views
                </Text>
              </View>
            </>
          )}
        </View>
       </Modal>

      {/* Group Detail Modal */}      <GroupDetailModal
        visible={showGroupDetail}
        groupId={selectedGroupId}
        currentUserId={currentUserId || ""}
        onClose={() => {
          setShowGroupDetail(false);
          setSelectedGroupId(null);
        }}
        onLeave={() => {
          if (currentUserId) loadGroups(currentUserId);
        }}
      />

      {/* User Profile Modal */}
      <UserProfileModal
        visible={showProfileModal}
        onClose={() => {
          setShowProfileModal(false);
          setSelectedUserId(null);
        }}
        userId={selectedUserId || ""}
      />

      <Toast />
    </ScreenContainer>
  );
}
