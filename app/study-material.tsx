import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import Toast from "react-native-toast-message";

type Category = "all" | "textbooks" | "stationery" | "tech";
type Faculty = "all" | "engineering" | "business" | "science" | "arts" | "health" | "law";

type Product = {
  id: string;
  name: string;
  category: "textbooks" | "stationery" | "tech";
  faculty?: Faculty;
  price: number;
  image: string;
  description: string;
  inStock: boolean;
};

type CartItem = Product & { quantity: number };

const PRODUCTS: Product[] = [
  // Engineering Textbooks
  {
    id: "1",
    name: "Engineering Mathematics",
    category: "textbooks",
    faculty: "engineering",
    price: 650,
    image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&h=500&fit=crop",
    description: "Advanced mathematics for engineering students",
    inStock: true,
  },
  {
    id: "2",
    name: "Thermodynamics Fundamentals",
    category: "textbooks",
    faculty: "engineering",
    price: 720,
    image: "https://images.unsplash.com/photo-1532619187608-e5375cab36aa?w=400&h=500&fit=crop",
    description: "Complete guide to thermodynamics principles",
    inStock: true,
  },
  {
    id: "3",
    name: "Circuit Analysis",
    category: "textbooks",
    faculty: "engineering",
    price: 580,
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=500&fit=crop",
    description: "Electrical circuit theory and applications",
    inStock: true,
  },
  // Business Textbooks
  {
    id: "4",
    name: "Principles of Economics",
    category: "textbooks",
    faculty: "business",
    price: 480,
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&h=500&fit=crop",
    description: "Microeconomics and macroeconomics fundamentals",
    inStock: true,
  },
  {
    id: "5",
    name: "Financial Accounting",
    category: "textbooks",
    faculty: "business",
    price: 520,
    image: "https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=400&h=500&fit=crop",
    description: "South African accounting standards and practices",
    inStock: true,
  },
  {
    id: "6",
    name: "Marketing Management",
    category: "textbooks",
    faculty: "business",
    price: 450,
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=500&fit=crop",
    description: "Modern marketing strategies and consumer behavior",
    inStock: true,
  },
  // Science Textbooks
  {
    id: "7",
    name: "Organic Chemistry",
    category: "textbooks",
    faculty: "science",
    price: 590,
    image: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400&h=500&fit=crop",
    description: "Complete guide to organic chemistry with lab manual",
    inStock: true,
  },
  {
    id: "8",
    name: "General Biology",
    category: "textbooks",
    faculty: "science",
    price: 510,
    image: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=400&h=500&fit=crop",
    description: "Comprehensive biology textbook with illustrations",
    inStock: true,
  },
  {
    id: "9",
    name: "Physics for Scientists",
    category: "textbooks",
    faculty: "science",
    price: 680,
    image: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=400&h=500&fit=crop",
    description: "Classical and modern physics concepts",
    inStock: true,
  },
  // Arts & Humanities Textbooks
  {
    id: "10",
    name: "Introduction to Psychology",
    category: "textbooks",
    faculty: "arts",
    price: 450,
    image: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&h=500&fit=crop",
    description: "Comprehensive psychology textbook for first-year students",
    inStock: true,
  },
  {
    id: "11",
    name: "Sociology: A Global Perspective",
    category: "textbooks",
    faculty: "arts",
    price: 420,
    image: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=400&h=500&fit=crop",
    description: "Understanding society and social structures",
    inStock: true,
  },
  {
    id: "12",
    name: "World History",
    category: "textbooks",
    faculty: "arts",
    price: 390,
    image: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=400&h=500&fit=crop",
    description: "Comprehensive world history from ancient to modern times",
    inStock: true,
  },
  // Health Sciences Textbooks
  {
    id: "13",
    name: "Human Anatomy & Physiology",
    category: "textbooks",
    faculty: "health",
    price: 750,
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=500&fit=crop",
    description: "Detailed anatomy and physiology with full-color illustrations",
    inStock: true,
  },
  {
    id: "14",
    name: "Medical Microbiology",
    category: "textbooks",
    faculty: "health",
    price: 680,
    image: "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=400&h=500&fit=crop",
    description: "Microbiology for health science students",
    inStock: true,
  },
  // Law Textbooks
  {
    id: "15",
    name: "Business Law Essentials",
    category: "textbooks",
    faculty: "law",
    price: 420,
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=500&fit=crop",
    description: "South African business law textbook",
    inStock: true,
  },
  {
    id: "16",
    name: "Constitutional Law",
    category: "textbooks",
    faculty: "law",
    price: 550,
    image: "https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=400&h=500&fit=crop",
    description: "South African constitutional law and human rights",
    inStock: true,
  },
  // Stationery
  {
    id: "17",
    name: "A4 Notebook Pack (5)",
    category: "stationery",
    price: 85,
    image: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400&h=500&fit=crop",
    description: "5 ruled A4 notebooks, 200 pages each",
    inStock: true,
  },
  {
    id: "18",
    name: "Pen Set (12 Pack)",
    category: "stationery",
    price: 45,
    image: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&h=500&fit=crop",
    description: "Blue and black ballpoint pens",
    inStock: true,
  },
  {
    id: "19",
    name: "Scientific Calculator",
    category: "stationery",
    price: 250,
    image: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=500&fit=crop",
    description: "Casio FX-82ZA PLUS II scientific calculator",
    inStock: true,
  },
  {
    id: "20",
    name: "Highlighter Set (6)",
    category: "stationery",
    price: 55,
    image: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=400&h=500&fit=crop",
    description: "Assorted color highlighters",
    inStock: true,
  },
  {
    id: "21",
    name: "A4 Paper Ream",
    category: "stationery",
    price: 120,
    image: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400&h=500&fit=crop",
    description: "500 sheets of premium A4 paper",
    inStock: true,
  },
  {
    id: "22",
    name: "Geometry Set",
    category: "stationery",
    price: 75,
    image: "https://images.unsplash.com/photo-1596496181848-3091d4878b24?w=400&h=500&fit=crop",
    description: "Complete geometry set with compass and protractor",
    inStock: true,
  },
  {
    id: "23",
    name: "Sticky Notes Pack",
    category: "stationery",
    price: 35,
    image: "https://images.unsplash.com/photo-1599492906227-c4c5e5a4b7c8?w=400&h=500&fit=crop",
    description: "Assorted color sticky notes, 6 pads",
    inStock: true,
  },
  // Tech Items
  {
    id: "24",
    name: "USB Flash Drive 32GB",
    category: "tech",
    price: 150,
    image: "https://images.unsplash.com/photo-1624823183493-ed5832f48f18?w=400&h=500&fit=crop",
    description: "High-speed USB 3.0 flash drive",
    inStock: true,
  },
  {
    id: "25",
    name: "Wireless Mouse",
    category: "tech",
    price: 180,
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=500&fit=crop",
    description: "Ergonomic wireless mouse with USB receiver",
    inStock: true,
  },
  {
    id: "26",
    name: "Laptop Stand",
    category: "tech",
    price: 320,
    image: "https://images.unsplash.com/photo-1625948515291-69613efd103f?w=400&h=500&fit=crop",
    description: "Adjustable aluminum laptop stand",
    inStock: true,
  },
  {
    id: "27",
    name: "Noise-Cancelling Headphones",
    category: "tech",
    price: 450,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=500&fit=crop",
    description: "Over-ear headphones with active noise cancellation",
    inStock: true,
  },
  {
    id: "28",
    name: "Webcam HD 1080p",
    category: "tech",
    price: 380,
    image: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400&h=500&fit=crop",
    description: "Full HD webcam with built-in microphone",
    inStock: true,
  },
  {
    id: "29",
    name: "External Hard Drive 1TB",
    category: "tech",
    price: 850,
    image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400&h=500&fit=crop",
    description: "Portable external hard drive with USB 3.0",
    inStock: true,
  },
  {
    id: "30",
    name: "Keyboard & Mouse Combo",
    category: "tech",
    price: 280,
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=500&fit=crop",
    description: "Wireless keyboard and mouse combo set",
    inStock: true,
  },
];

const CATEGORIES = [
  { key: "all" as Category, label: "All", icon: "square.grid.2x2" },
  { key: "textbooks" as Category, label: "Textbooks", icon: "book.fill" },
  { key: "stationery" as Category, label: "Stationery", icon: "pencil" },
  { key: "tech" as Category, label: "Tech", icon: "laptopcomputer" },
];

const FACULTIES = [
  { key: "all" as Faculty, label: "All Faculties" },
  { key: "engineering" as Faculty, label: "Engineering" },
  { key: "business" as Faculty, label: "Business" },
  { key: "science" as Faculty, label: "Science" },
  { key: "arts" as Faculty, label: "Arts & Humanities" },
  { key: "health" as Faculty, label: "Health Sciences" },
  { key: "law" as Faculty, label: "Law" },
];

export default function StudyMaterialScreen() {
  const colors = useColors();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<Category>("all");
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);

  const filteredProducts = PRODUCTS.filter((product) => {
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    const matchesFaculty = selectedFaculty === "all" || product.faculty === selectedFaculty;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesFaculty && matchesSearch;
  });

  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) {
      setCart(cart.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    Toast.show({
      type: "success",
      text1: "Added to Cart",
      text2: product.name,
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(cart.map((item) => {
      if (item.id === productId) {
        const newQuantity = item.quantity + delta;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }).filter((item) => item.quantity > 0));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = cart.length > 0 ? 50 : 0;
  const total = cartTotal + deliveryFee;

  const handleCheckout = () => {
    Toast.show({
      type: "success",
      text1: "Order Placed",
      text2: `Total: R${total.toFixed(2)}`,
    });
    setCart([]);
    setShowCart(false);
  };

  return (
    <ScreenContainer>
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity onPress={() => router.back()}>
              <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-foreground">Study Material</Text>
          </View>
          <TouchableOpacity onPress={() => setShowCart(true)} className="relative">
            <IconSymbol name="cart.fill" size={24} color={colors.foreground} />
            {cart.length > 0 && (
              <View className="absolute -top-2 -right-2 bg-primary rounded-full w-5 h-5 items-center justify-center">
                <Text className="text-white text-xs font-bold">{cart.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="px-4 py-3">
          <View className="bg-surface rounded-xl px-4 py-3 flex-row items-center gap-3 border border-border">
            <IconSymbol name="magnifyingglass" size={20} color={colors.muted} />
            <TextInput
              placeholder="Search products..."
              placeholderTextColor={colors.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 text-foreground"
            />
          </View>
        </View>

        {/* Category Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-4 mb-2"
          contentContainerStyle={{ gap: 8 }}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.key}
              onPress={() => setSelectedCategory(cat.key)}
              className={`px-4 py-2 rounded-full flex-row items-center gap-2 ${
                selectedCategory === cat.key ? "bg-primary" : "bg-surface border border-border"
              }`}
            >
              <IconSymbol
                name={cat.icon as any}
                size={16}
                color={selectedCategory === cat.key ? "white" : colors.foreground}
              />
              <Text
                className={`font-semibold ${
                  selectedCategory === cat.key ? "text-white" : "text-foreground"
                }`}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Faculty Filters (only for textbooks) */}
        {selectedCategory === "textbooks" || selectedCategory === "all" ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="px-4 mb-3"
            contentContainerStyle={{ gap: 8 }}
          >
            {FACULTIES.map((faculty) => (
              <TouchableOpacity
                key={faculty.key}
                onPress={() => setSelectedFaculty(faculty.key)}
                className={`px-3 py-1.5 rounded-full ${
                  selectedFaculty === faculty.key ? "bg-secondary" : "bg-surface border border-border"
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    selectedFaculty === faculty.key ? "text-white" : "text-foreground"
                  }`}
                >
                  {faculty.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : null}

        {/* Products Grid */}
        <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
          <View className="flex-row flex-wrap justify-between gap-4 pb-6">
            {filteredProducts.map((product) => (
              <TouchableOpacity
                key={product.id}
                className="bg-surface rounded-xl overflow-hidden border border-border"
                style={{ width: "48%" }}
              >
                <Image
                  source={{ uri: product.image }}
                  style={{ width: "100%", height: 150 }}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                />
                <View className="p-3">
                  <Text className="text-sm font-bold text-foreground mb-1" numberOfLines={2}>
                    {product.name}
                  </Text>
                  <Text className="text-xs text-muted mb-2" numberOfLines={2}>
                    {product.description}
                  </Text>
                  <View className="flex-row items-center justify-between">
                    <Text className="text-lg font-bold text-primary">R{product.price}</Text>
                    {product.inStock ? (
                      <TouchableOpacity
                        onPress={() => addToCart(product)}
                        className="bg-primary rounded-full p-2"
                      >
                        <IconSymbol name="plus" size={16} color="white" />
                      </TouchableOpacity>
                    ) : (
                      <Text className="text-xs text-error font-semibold">Out of Stock</Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Cart Modal */}
        <Modal visible={showCart} animationType="slide" transparent>
          <View className="flex-1 bg-black/50">
            <View className="flex-1 mt-20 bg-background rounded-t-3xl">
              <View className="flex-row items-center justify-between px-4 py-4 border-b border-border">
                <Text className="text-xl font-bold text-foreground">Shopping Cart</Text>
                <TouchableOpacity onPress={() => setShowCart(false)}>
                  <IconSymbol name="xmark" size={24} color={colors.foreground} />
                </TouchableOpacity>
              </View>

              <ScrollView className="flex-1 px-4 py-4">
                {cart.length === 0 ? (
                  <View className="items-center justify-center py-12">
                    <IconSymbol name="cart" size={64} color={colors.muted} />
                    <Text className="text-muted mt-4">Your cart is empty</Text>
                  </View>
                ) : (
                  cart.map((item) => (
                    <View
                      key={item.id}
                      className="bg-surface rounded-xl p-3 mb-3 flex-row gap-3 border border-border"
                    >
                      <Image
                        source={{ uri: item.image }}
                        style={{ width: 80, height: 80, borderRadius: 8 }}
                        contentFit="cover"
                      />
                      <View className="flex-1">
                        <Text className="text-sm font-bold text-foreground mb-1">{item.name}</Text>
                        <Text className="text-lg font-bold text-primary mb-2">
                          R{item.price * item.quantity}
                        </Text>
                        <View className="flex-row items-center gap-3">
                          <TouchableOpacity
                            onPress={() => updateQuantity(item.id, -1)}
                            className="bg-surface border border-border rounded-full w-8 h-8 items-center justify-center"
                          >
                            <IconSymbol name="minus" size={14} color={colors.foreground} />
                          </TouchableOpacity>
                          <Text className="text-foreground font-semibold">{item.quantity}</Text>
                          <TouchableOpacity
                            onPress={() => updateQuantity(item.id, 1)}
                            className="bg-primary rounded-full w-8 h-8 items-center justify-center"
                          >
                            <IconSymbol name="plus" size={14} color="white" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => removeFromCart(item.id)}
                            className="ml-auto"
                          >
                            <IconSymbol name="trash" size={18} color={colors.error} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  ))
                )}
              </ScrollView>

              {cart.length > 0 && (
                <View className="px-4 py-4 border-t border-border">
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-foreground">Subtotal</Text>
                    <Text className="text-foreground font-semibold">R{cartTotal.toFixed(2)}</Text>
                  </View>
                  <View className="flex-row justify-between mb-3">
                    <Text className="text-foreground">Delivery Fee</Text>
                    <Text className="text-foreground font-semibold">R{deliveryFee.toFixed(2)}</Text>
                  </View>
                  <View className="flex-row justify-between mb-4">
                    <Text className="text-lg font-bold text-foreground">Total</Text>
                    <Text className="text-lg font-bold text-primary">R{total.toFixed(2)}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={handleCheckout}
                    className="bg-primary py-4 rounded-xl items-center"
                  >
                    <Text className="text-white font-bold text-lg">Checkout</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </ScreenContainer>
  );
}
