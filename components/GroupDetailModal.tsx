import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { supabase } from "@/lib/supabase";
import Toast from "react-native-toast-message";

interface GroupMember {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
  full_name: string;
  avatar_url: string | null;
  email: string;
}

interface GroupDetail {
  id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  created_by: string;
  is_public: boolean;
  category: string | null;
  rules: string | null;
  member_count: number;
  is_member: boolean;
  is_admin: boolean;
}

interface GroupDetailModalProps {
  visible: boolean;
  groupId: string | null;
  onClose: () => void;
  onLeave?: () => void;
  onJoin?: () => void;
  currentUserId: string;
}

export function GroupDetailModal({
  visible,
  groupId,
  onClose,
  onLeave,
  onJoin,
  currentUserId,
}: GroupDetailModalProps) {
  const colors = useColors();
  const [loading, setLoading] = useState(false);
  const [groupDetail, setGroupDetail] = useState<GroupDetail | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [activeTab, setActiveTab] = useState<"about" | "members">("about");

  useEffect(() => {
    if (visible && groupId) {
      loadGroupDetail();
    }
  }, [visible, groupId]);

  const loadGroupDetail = async () => {
    if (!groupId) return;

    try {
      setLoading(true);

      // Load group info
      const { data: groupData, error: groupError } = await supabase
        .from("chat_groups")
        .select("*")
        .eq("id", groupId)
        .single();

      if (groupError) throw groupError;

      // Check if user is member
      const { data: memberCheck } = await supabase
        .from("group_members")
        .select("role")
        .eq("group_id", groupId)
        .eq("user_id", currentUserId)
        .single();

      // Get member count
      const { count } = await supabase
        .from("group_members")
        .select("*", { count: "exact", head: true })
        .eq("group_id", groupId);

      setGroupDetail({
        ...groupData,
        member_count: count || 0,
        is_member: !!memberCheck,
        is_admin: memberCheck?.role === "admin",
      });

      // Load members
      const { data: membersData, error: membersError } = await supabase
        .from("group_members")
        .select(`
          id,
          user_id,
          role,
          joined_at,
          profiles:user_id (
            full_name,
            avatar_url,
            email
          )
        `)
        .eq("group_id", groupId)
        .order("joined_at", { ascending: true });

      if (membersError) throw membersError;

      const formattedMembers = membersData.map((member: any) => ({
        id: member.id,
        user_id: member.user_id,
        role: member.role,
        joined_at: member.joined_at,
        full_name: member.profiles?.full_name || "Unknown",
        avatar_url: member.profiles?.avatar_url || null,
        email: member.profiles?.email || "",
      }));

      setMembers(formattedMembers);
    } catch (error) {
      console.error("Error loading group detail:", error);
      Toast.show({
        type: "error",
        text1: "Failed to load group details",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveGroup = async () => {
    if (!groupId || !groupDetail) return;

    try {
      const { error } = await supabase
        .from("group_members")
        .delete()
        .eq("group_id", groupId)
        .eq("user_id", currentUserId);

      if (error) throw error;

      Toast.show({
        type: "success",
        text1: "Left group successfully",
      });

      onLeave?.();
      onClose();
    } catch (error) {
      console.error("Error leaving group:", error);
      Toast.show({
        type: "error",
        text1: "Failed to leave group",
      });
    }
  };

  const handleJoinGroup = async () => {
    if (!groupId) return;

    try {
      const { error } = await supabase.from("group_members").insert({
        group_id: groupId,
        user_id: currentUserId,
        role: "member",
      });

      if (error) throw error;

      Toast.show({
        type: "success",
        text1: "Joined group successfully!",
      });

      onJoin?.();
      loadGroupDetail(); // Reload to update member status
    } catch (error) {
      console.error("Error joining group:", error);
      Toast.show({
        type: "error",
        text1: "Failed to join group",
      });
    }
  };

  if (!groupDetail) {
    return null;
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-end" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
        <View
          className="rounded-t-3xl"
          style={{ backgroundColor: colors.background, maxHeight: "90%" }}
        >
          {/* Header */}
          <View className="p-6 border-b border-border">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-2xl font-bold text-foreground">Group Details</Text>
              <TouchableOpacity onPress={onClose}>
                <IconSymbol name="xmark.circle.fill" size={28} color={colors.muted} />
              </TouchableOpacity>
            </View>

            {/* Group Info */}
            <View className="flex-row items-center mb-4">
              {groupDetail.avatar_url ? (
                <Image
                  source={{ uri: groupDetail.avatar_url }}
                  style={{ width: 64, height: 64, borderRadius: 32, marginRight: 16 }}
                />
              ) : (
                <View
                  className="w-16 h-16 rounded-full items-center justify-center mr-4"
                  style={{ backgroundColor: colors.primary + "20" }}
                >
                  <IconSymbol name="person.3.fill" size={32} color={colors.primary} />
                </View>
              )}
              <View className="flex-1">
                <Text className="text-xl font-bold text-foreground">{groupDetail.name}</Text>
                <Text className="text-sm text-muted mt-1">
                  {groupDetail.member_count} members • {groupDetail.is_public ? "Public" : "Private"}
                </Text>
                {groupDetail.category && (
                  <View
                    className="px-2 py-1 rounded-md mt-2 self-start"
                    style={{ backgroundColor: colors.primary + "20" }}
                  >
                    <Text className="text-xs font-semibold" style={{ color: colors.primary }}>
                      {groupDetail.category}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Action Buttons */}
            {groupDetail.is_member ? (
              <View className="flex-row gap-2">
                {!groupDetail.is_admin && (
                  <TouchableOpacity
                    onPress={handleLeaveGroup}
                    className="flex-1 rounded-xl py-3 items-center border-2"
                    style={{ borderColor: colors.destructive }}
                  >
                    <Text className="font-semibold" style={{ color: colors.destructive }}>
                      Leave Group
                    </Text>
                  </TouchableOpacity>
                )}
                {groupDetail.is_admin && (
                  <View
                    className="flex-1 rounded-xl py-3 items-center"
                    style={{ backgroundColor: colors.primary + "20" }}
                  >
                    <Text className="font-semibold" style={{ color: colors.primary }}>
                      You're an Admin
                    </Text>
                  </View>
                )}
              </View>
            ) : (
              <TouchableOpacity
                onPress={handleJoinGroup}
                className="rounded-xl py-3 items-center"
                style={{ backgroundColor: colors.primary }}
              >
                <Text className="text-white font-semibold">Join Group</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Tabs */}
          <View className="flex-row border-b border-border">
            <TouchableOpacity
              onPress={() => setActiveTab("about")}
              className="flex-1 py-3 items-center"
              style={{
                borderBottomWidth: activeTab === "about" ? 2 : 0,
                borderBottomColor: colors.primary,
              }}
            >
              <Text
                className="font-semibold"
                style={{ color: activeTab === "about" ? colors.primary : colors.muted }}
              >
                About
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab("members")}
              className="flex-1 py-3 items-center"
              style={{
                borderBottomWidth: activeTab === "members" ? 2 : 0,
                borderBottomColor: colors.primary,
              }}
            >
              <Text
                className="font-semibold"
                style={{ color: activeTab === "members" ? colors.primary : colors.muted }}
              >
                Members ({groupDetail.member_count})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView className="flex-1">
            {loading ? (
              <View className="p-6 items-center">
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : activeTab === "about" ? (
              <View className="p-6">
                {groupDetail.description && (
                  <View className="mb-4">
                    <Text className="text-base font-semibold text-foreground mb-2">
                      Description
                    </Text>
                    <Text className="text-sm text-muted">{groupDetail.description}</Text>
                  </View>
                )}
                {groupDetail.rules && (
                  <View className="mb-4">
                    <Text className="text-base font-semibold text-foreground mb-2">Rules</Text>
                    <Text className="text-sm text-muted">{groupDetail.rules}</Text>
                  </View>
                )}
                {!groupDetail.description && !groupDetail.rules && (
                  <Text className="text-sm text-muted text-center">
                    No description or rules available
                  </Text>
                )}
              </View>
            ) : (
              <View className="p-4">
                {members.map((member) => (
                  <View
                    key={member.id}
                    className="flex-row items-center p-3 mb-2 rounded-xl"
                    style={{ backgroundColor: colors.surface }}
                  >
                    {member.avatar_url ? (
                      <Image
                        source={{ uri: member.avatar_url }}
                        style={{ width: 48, height: 48, borderRadius: 24, marginRight: 12 }}
                      />
                    ) : (
                      <View
                        className="w-12 h-12 rounded-full items-center justify-center mr-3"
                        style={{ backgroundColor: colors.primary + "20" }}
                      >
                        <Text className="text-lg font-bold" style={{ color: colors.primary }}>
                          {member.full_name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-foreground">
                        {member.full_name}
                      </Text>
                      <Text className="text-xs text-muted">{member.email}</Text>
                    </View>
                    {member.role === "admin" && (
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
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
