import React, { useEffect, useState } from 'react';
import { View, Text, Modal, TouchableOpacity, Image, ScrollView, ActivityIndicator } from 'react-native';
import { IconSymbol } from './ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { supabase } from '@/lib/supabase';

interface UserProfileModalProps {
  visible: boolean;
  onClose: () => void;
  userId: string;
}

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  institution_name: string | null;
  course_program: string | null;
  year_of_study: string | null;
  phone_number: string | null;
}

export function UserProfileModal({ visible, onClose, userId }: UserProfileModalProps) {
  const colors = useColors();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible && userId) {
      loadProfile();
    }
  }, [visible, userId]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <View
          className="rounded-t-3xl p-6"
          style={{ backgroundColor: colors.background, maxHeight: '80%' }}
        >
          {/* Header */}
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-2xl font-bold text-foreground">Profile</Text>
            <TouchableOpacity onPress={onClose}>
              <IconSymbol name="xmark.circle.fill" size={28} color={colors.muted} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View className="py-20 items-center">
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : profile ? (
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Profile Picture */}
              <View className="items-center mb-6">
                <View className="w-32 h-32 rounded-full bg-muted/30 items-center justify-center overflow-hidden mb-4">
                  {profile.avatar_url ? (
                    <Image
                      source={{ uri: profile.avatar_url }}
                      className="w-full h-full"
                      style={{ resizeMode: 'cover' }}
                    />
                  ) : (
                    <Text className="text-foreground font-bold text-5xl">
                      {profile.full_name?.charAt(0).toUpperCase() || '?'}
                    </Text>
                  )}
                </View>
                <Text className="text-2xl font-bold text-foreground mb-1">
                  {profile.full_name}
                </Text>
                <Text className="text-base text-muted">{profile.email}</Text>
              </View>

              {/* Details */}
              <View className="gap-4">
                {profile.institution_name && (
                  <View className="flex-row items-center p-4 rounded-xl bg-surface">
                    <IconSymbol name="building.2" size={24} color={colors.primary} />
                    <View className="ml-3 flex-1">
                      <Text className="text-xs text-muted mb-1">Institution</Text>
                      <Text className="text-base text-foreground font-semibold">
                        {profile.institution_name}
                      </Text>
                    </View>
                  </View>
                )}

                {profile.course_program && (
                  <View className="flex-row items-center p-4 rounded-xl bg-surface">
                    <IconSymbol name="book" size={24} color={colors.primary} />
                    <View className="ml-3 flex-1">
                      <Text className="text-xs text-muted mb-1">Course</Text>
                      <Text className="text-base text-foreground font-semibold">
                        {profile.course_program}
                      </Text>
                    </View>
                  </View>
                )}

                {profile.year_of_study && (
                  <View className="flex-row items-center p-4 rounded-xl bg-surface">
                    <IconSymbol name="calendar" size={24} color={colors.primary} />
                    <View className="ml-3 flex-1">
                      <Text className="text-xs text-muted mb-1">Year of Study</Text>
                      <Text className="text-base text-foreground font-semibold">
                        {profile.year_of_study}
                      </Text>
                    </View>
                  </View>
                )}

                {profile.phone_number && (
                  <View className="flex-row items-center p-4 rounded-xl bg-surface">
                    <IconSymbol name="phone" size={24} color={colors.primary} />
                    <View className="ml-3 flex-1">
                      <Text className="text-xs text-muted mb-1">Phone</Text>
                      <Text className="text-base text-foreground font-semibold">
                        {profile.phone_number}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </ScrollView>
          ) : (
            <View className="py-20 items-center">
              <IconSymbol name="person.crop.circle.badge.exclamationmark" size={48} color={colors.muted} />
              <Text className="text-muted mt-4">Failed to load profile</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
