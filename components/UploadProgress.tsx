import React from 'react';
import { View, Text, Modal, ActivityIndicator } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';

interface UploadProgressProps {
  visible: boolean;
  progress: number; // 0-100
  fileName?: string;
  uploadType?: 'image' | 'video' | 'audio' | 'file';
}

export function UploadProgress({ 
  visible, 
  progress, 
  fileName = 'File',
  uploadType = 'file'
}: UploadProgressProps) {
  const colors = useColors();

  const getIcon = () => {
    switch (uploadType) {
      case 'image':
        return 'photo.fill';
      case 'video':
        return 'video.fill';
      case 'audio':
        return 'music.note';
      default:
        return 'doc.fill';
    }
  };

  const getTypeLabel = () => {
    switch (uploadType) {
      case 'image':
        return 'Image';
      case 'video':
        return 'Video';
      case 'audio':
        return 'Audio';
      default:
        return 'File';
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View className="flex-1 bg-black/50 items-center justify-center p-6">
        <View className="bg-background rounded-3xl p-6 w-full max-w-sm">
          {/* Icon */}
          <View className="items-center mb-4">
            <View 
              className="w-16 h-16 rounded-full items-center justify-center mb-3"
              style={{ backgroundColor: colors.primary + '20' }}
            >
              <IconSymbol name={getIcon()} size={32} color={colors.primary} />
            </View>
            <Text className="text-lg font-bold text-foreground mb-1">
              Uploading {getTypeLabel()}
            </Text>
            <Text className="text-sm text-muted text-center" numberOfLines={1}>
              {fileName}
            </Text>
          </View>

          {/* Progress Bar */}
          <View className="mb-4">
            <View className="h-2 bg-muted rounded-full overflow-hidden">
              <View 
                className="h-full rounded-full"
                style={{ 
                  width: `${progress}%`,
                  backgroundColor: colors.primary
                }}
              />
            </View>
            <View className="flex-row justify-between mt-2">
              <Text className="text-xs text-muted">
                {Math.round(progress)}%
              </Text>
              <Text className="text-xs text-muted">
                {progress < 100 ? 'Uploading...' : 'Complete!'}
              </Text>
            </View>
          </View>

          {/* Loading indicator for processing */}
          {progress >= 100 && (
            <View className="flex-row items-center justify-center gap-2 py-2">
              <ActivityIndicator size="small" color={colors.primary} />
              <Text className="text-sm text-muted">
                Processing...
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
