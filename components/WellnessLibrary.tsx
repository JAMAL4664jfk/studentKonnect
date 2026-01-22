import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { supabase } from "@/lib/supabase";

interface Article {
  id: string;
  title: string;
  content: string;
  summary: string;
  category: string;
  image_url?: string;
  likes_count: number;
  views_count: number;
  created_at: string;
}

const categories = [
  { id: "mental-health", name: "Mental Health", icon: "brain" },
  { id: "nutrition", name: "Nutrition", icon: "heart.fill" },
  { id: "fitness", name: "Fitness", icon: "figure.walk" },
  { id: "sleep", name: "Sleep & Rest", icon: "moon.fill" },
  { id: "stress", name: "Stress Management", icon: "wind" },
  { id: "relationships", name: "Relationships", icon: "person.2.fill" },
];

export function WellnessLibrary({ onArticlePress }: { onArticlePress?: (article: Article) => void }) {
  const colors = useColors();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    loadArticles();
  }, [selectedCategory]);

  const loadArticles = async () => {
    try {
      let query = supabase
        .from("wellness_articles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (selectedCategory !== "all") {
        query = query.eq("category", selectedCategory);
      }

      const { data, error } = await query;

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error("Error loading articles:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredArticles = articles.filter((article) =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View className="flex-1">
      {/* Search */}
      <View className="px-4 py-3">
        <View
          className="flex-row items-center gap-3 bg-surface rounded-full px-4 py-3"
          style={{ borderWidth: 1, borderColor: colors.border }}
        >
          <IconSymbol name="magnifyingglass" size={20} color={colors.muted} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search articles..."
            placeholderTextColor={colors.muted}
            className="flex-1 text-foreground"
          />
        </View>
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-4 mb-4"
        contentContainerStyle={{ gap: 8 }}
      >
        <TouchableOpacity
          onPress={() => setSelectedCategory("all")}
          className={`px-4 py-2 rounded-full ${
            selectedCategory === "all" ? "bg-primary" : "bg-surface"
          }`}
        >
          <Text
            className={`font-semibold ${
              selectedCategory === "all" ? "text-white" : "text-foreground"
            }`}
          >
            All
          </Text>
        </TouchableOpacity>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            onPress={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-full ${
              selectedCategory === cat.id ? "bg-primary" : "bg-surface"
            }`}
          >
            <Text
              className={`font-semibold ${
                selectedCategory === cat.id ? "text-white" : "text-foreground"
              }`}
            >
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Articles */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
          {filteredArticles.length === 0 ? (
            <View className="items-center justify-center py-12">
              <IconSymbol name="book.fill" size={48} color={colors.muted} />
              <Text className="text-muted mt-4 text-center">
                No articles found
              </Text>
            </View>
          ) : (
            filteredArticles.map((article) => (
              <TouchableOpacity
                key={article.id}
                onPress={() => onArticlePress?.(article)}
                className="bg-surface rounded-2xl mb-4 overflow-hidden"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                {article.image_url && (
                  <Image
                    source={{ uri: article.image_url }}
                    style={{ width: "100%", height: 180 }}
                    contentFit="cover"
                  />
                )}
                <View className="p-4">
                  <Text className="text-lg font-bold text-foreground mb-2">
                    {article.title}
                  </Text>
                  <Text className="text-sm text-muted mb-3" numberOfLines={2}>
                    {article.summary}
                  </Text>
                  <View className="flex-row items-center gap-4">
                    <View className="flex-row items-center gap-1">
                      <IconSymbol name="heart.fill" size={16} color={colors.muted} />
                      <Text className="text-xs text-muted">{article.likes_count}</Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <IconSymbol name="eye.fill" size={16} color={colors.muted} />
                      <Text className="text-xs text-muted">{article.views_count}</Text>
                    </View>
                    <Text className="text-xs text-muted">
                      {new Date(article.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}
