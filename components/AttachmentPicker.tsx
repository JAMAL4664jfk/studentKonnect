import React from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { IconSymbol } from './ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';

interface AttachmentOption {
  id: string;
  title: string;
  icon: string;
  color: string;
  onPress: () => void;
}

interface AttachmentPickerProps {
  visible: boolean;
  onClose: () => void;
  options: AttachmentOption[];
}

export function AttachmentPicker({ visible, onClose, options }: AttachmentPickerProps) {
  const colors = useColors();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        className="flex-1 justify-end" 
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity 
          activeOpacity={1}
          className="rounded-t-3xl p-6"
          style={{ backgroundColor: colors.background }}
        >
          {/* Header */}
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-bold text-foreground">Add Attachment</Text>
            <TouchableOpacity onPress={onClose}>
              <IconSymbol name="xmark.circle.fill" size={28} color={colors.muted} />
            </TouchableOpacity>
          </View>

          {/* Options Grid */}
          <View className="flex-row flex-wrap gap-4 pb-4">
            {options.map((option) => (
              <TouchableOpacity
                key={option.id}
                onPress={() => {
                  onClose();
                  option.onPress();
                }}
                className="items-center"
                style={{ width: '22%' }}
              >
                <View
                  className="w-16 h-16 rounded-2xl items-center justify-center mb-2"
                  style={{ backgroundColor: option.color + '20' }}
                >
                  <IconSymbol name={option.icon} size={32} color={option.color} />
                </View>
                <Text className="text-xs text-center text-foreground font-medium">
                  {option.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
