import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useColors } from "@/hooks/use-colors";

type EmojiPickerProps = {
  onEmojiSelect: (emoji: string) => void;
};

const EMOJI_CATEGORIES = {
  "Smileys": ["😀", "😃", "😄", "😁", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🥸", "🤩", "🥳"],
  "Gestures": ["👋", "🤚", "🖐", "✋", "🖖", "👌", "🤌", "🤏", "✌", "🤞", "🤟", "🤘", "🤙", "👈", "👉", "👆", "🖕", "👇", "☝", "👍", "👎", "✊", "👊", "🤛", "🤜", "👏", "🙌", "👐", "🤲", "🤝"],
  "Hearts": ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟"],
  "Objects": ["📱", "💻", "⌨️", "🖥", "🖨", "🖱", "🖲", "🕹", "🗜", "💾", "💿", "📀", "📼", "📷", "📸", "📹", "🎥", "📽", "🎞", "📞", "☎️", "📟", "📠", "📺", "📻", "🎙", "🎚", "🎛", "🧭", "⏱"],
};

export function EmojiPicker({ onEmojiSelect }: EmojiPickerProps) {
  const colors = useColors();

  return (
    <View className="bg-surface border-t border-border" style={{ height: 250 }}>
      <ScrollView className="p-4">
        {Object.entries(EMOJI_CATEGORIES).map(([category, emojis]) => (
          <View key={category} className="mb-4">
            <Text className="text-xs font-semibold text-muted mb-2">
              {category}
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {emojis.map((emoji, index) => (
                <TouchableOpacity
                  key={`${emoji}-${index}`}
                  onPress={() => onEmojiSelect(emoji)}
                  className="w-10 h-10 items-center justify-center rounded-lg bg-background active:bg-primary/10"
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <Text className="text-2xl">{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
