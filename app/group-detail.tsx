import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Alert, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface GroupMember {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
  user: {
    full_name: string;
    email: string;
    avatar_url?: string;
  };
}

export default function GroupDetailScreen() {
  const router = useRouter();
  const colors = useColors();
  const { groupId } = useLocalSearchParams();
  const [group, setGroup] = useState<any>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isMember, setIsMember] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUserId && groupId) {
      loadGroupDetails();
      loadGroupMembers();
    }
  }, [currentUserId, groupId]);

  const loadCurrentUser = async () => {
    const userId = await AsyncStorage.getItem('userId');
    setCurrentUserId(userId);
  };

  const loadGroupDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_groups')
        .select('*')
        .eq('id', groupId)
        .maybeSingle();

      if (error) throw error;
      setGroup(data);
    } catch (error) {
      console.error('Error loading group:', error);
    }
  };

  const loadGroupMembers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('chat_group_members')
        .select(`
          *,
          user:users(full_name, email, avatar_url)
        `)
        .eq('group_id', groupId)
        .order('joined_at', { ascending: false });

      if (error) throw error;

      setMembers(data || []);

      // Check if current user is member and/or admin
      const currentMember = data?.find((m) => m.user_id === currentUserId);
      setIsMember(!!currentMember);
      setIsAdmin(currentMember?.role === 'admin');
    } catch (error) {
      console.error('Error loading members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async () => {
    if (!currentUserId) return;

    try {
      const { error } = await supabase
        .from('chat_group_members')
        .insert({
          group_id: groupId,
          user_id: currentUserId,
          role: 'member',
        });

      if (error) throw error;

      Alert.alert('Success', 'You have joined the group!');
      loadGroupMembers();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleLeaveGroup = async () => {
    Alert.alert(
      'Leave Group',
      'Are you sure you want to leave this group?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('chat_group_members')
                .delete()
                .eq('group_id', groupId)
                .eq('user_id', currentUserId);

              if (error) throw error;

              Alert.alert('Success', 'You have left the group');
              router.back();
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    Alert.alert(
      'Remove Member',
      `Remove ${memberName} from the group?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('chat_group_members')
                .delete()
                .eq('id', memberId);

              if (error) throw error;

              Alert.alert('Success', 'Member removed');
              loadGroupMembers();
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  if (loading || !group) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted">Loading...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="px-4 py-3 border-b border-border flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-foreground">Group Details</Text>
          {isAdmin && (
            <TouchableOpacity onPress={() => setShowEditModal(true)}>
              <IconSymbol name="pencil" size={20} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Group Cover */}
        {group.cover_image && (
          <Image
            source={{ uri: group.cover_image }}
            className="w-full h-48"
            resizeMode="cover"
          />
        )}

        {/* Group Info */}
        <View className="p-4">
          <Text className="text-2xl font-bold text-foreground mb-2">{group.name}</Text>
          <View className="flex-row items-center gap-2 mb-4">
            <View className="flex-row items-center">
              <IconSymbol name="person.3.fill" size={16} color={colors.muted} />
              <Text className="text-sm text-muted ml-1">{members.length} members</Text>
            </View>
            {group.category && (
              <View className="px-2 py-1 rounded-full bg-surface">
                <Text className="text-xs font-medium text-foreground">{group.category}</Text>
              </View>
            )}
            {!group.is_public && (
              <View className="px-2 py-1 rounded-full bg-surface">
                <Text className="text-xs font-medium text-foreground">Private</Text>
              </View>
            )}
          </View>

          {group.description && (
            <View className="mb-4">
              <Text className="text-base text-foreground">{group.description}</Text>
            </View>
          )}

          {group.rules && (
            <View className="mb-4 p-3 rounded-lg bg-surface">
              <Text className="text-sm font-bold text-foreground mb-2">Group Rules</Text>
              <Text className="text-sm text-muted">{group.rules}</Text>
            </View>
          )}

          {/* Join/Leave Button */}
          {!isMember ? (
            <TouchableOpacity
              onPress={handleJoinGroup}
              className="py-3 rounded-lg items-center"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="text-white font-bold">Join Group</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleLeaveGroup}
              className="py-3 rounded-lg items-center border border-destructive"
            >
              <Text className="text-destructive font-bold">Leave Group</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Members List */}
        <View className="px-4 pb-4">
          <Text className="text-lg font-bold text-foreground mb-3">
            Members ({members.length})
          </Text>
          {members.map((member) => (
            <View
              key={member.id}
              className="flex-row items-center justify-between py-3 border-b border-border"
            >
              <View className="flex-row items-center flex-1">
                <View className="w-12 h-12 rounded-full overflow-hidden mr-3">
                  {member.user.avatar_url ? (
                    <Image
                      source={{ uri: member.user.avatar_url }}
                      className="w-full h-full"
                    />
                  ) : (
                    <View
                      className="w-full h-full items-center justify-center"
                      style={{ backgroundColor: colors.surface }}
                    >
                      <IconSymbol name="person.fill" size={24} color={colors.muted} />
                    </View>
                  )}
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-foreground">
                    {member.user.full_name}
                  </Text>
                  <Text className="text-sm text-muted">{member.user.email}</Text>
                </View>
              </View>

              <View className="flex-row items-center gap-2">
                {member.role === 'admin' && (
                  <View className="px-2 py-1 rounded-full bg-primary/20">
                    <Text className="text-xs font-bold" style={{ color: colors.primary }}>
                      Admin
                    </Text>
                  </View>
                )}
                {isAdmin && member.user_id !== currentUserId && member.role !== 'admin' && (
                  <TouchableOpacity
                    onPress={() => handleRemoveMember(member.id, member.user.full_name)}
                  >
                    <IconSymbol name="xmark.circle.fill" size={24} color={colors.destructive} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
