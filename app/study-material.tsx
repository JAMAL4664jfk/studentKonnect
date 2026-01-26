import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image as RNImage, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import Toast from "react-native-toast-message";

type Category = "all" | "textbooks" | "stationery" | "tech";

type Product = {
  id: string;
  name: string;
  category: "textbooks" | "stationery" | "tech";
  price: number;
  image: string;
  description: string;
  inStock: boolean;
};

type CartItem = Product & { quantity: number };

const PRODUCTS: Product[] = [
  // Textbooks
  {
    id: "1",
    name: "Introduction to Psychology",
    category: "textbooks",
    price: 450,
    image: "https://via.placeholder.com/200x250/4A90E2/FFFFFF?text=Psychology",
    description: "Comprehensive psychology textbook for first-year students",
    inStock: true,
  },
  {
    id: "2",
    name: "Calculus: Early Transcendentals",
    category: "textbooks",
    price: 520,
    image: "https://via.placeholder.com/200x250/E94B3C/FFFFFF?text=Calculus",
    description: "Advanced mathematics textbook with solutions manual",
    inStock: true,
  },
  {
    id: "3",
    name: "Principles of Economics",
    category: "textbooks",
    price: 480,
    image: "https://via.placeholder.com/200x250/6BB6FF/FFFFFF?text=Economics",
    description: "Microeconomics and macroeconomics fundamentals",
    inStock: true,
  },
  {
    id: "4",
    name: "Organic Chemistry",
    category: "textbooks",
    price: 590,
    image: "https://via.placeholder.com/200x250/50C878/FFFFFF?text=Chemistry",
    description: "Complete guide to organic chemistry with lab manual",
    inStock: false,
  },
  {
    id: "5",
    name: "Business Law Essentials",
    category: "textbooks",
    price: 420,
    image: "https://via.placeholder.com/200x250/9B59B6/FFFFFF?text=Law",
    description: "South African business law textbook",
    inStock: true,
  },
  // Stationery
  {
    id: "6",
    name: "A4 Notebook Pack (5)",
    category: "stationery",
    price: 85,
    image: "https://via.placeholder.com/200x250/F39C12/FFFFFF?text=Notebooks",
    description: "5 ruled A4 notebooks, 200 pages each",
    inStock: true,
  },
  {
    id: "7",
    name: "Pen Set (12 Pack)",
    category: "stationery",
    price: 45,
    image: "https://via.placeholder.com/200x250/3498DB/FFFFFF?text=Pens",
    description: "Blue and black ballpoint pens",
    inStock: true,
  },
  {
    id: "8",
    name: "Scientific Calculator",
    category: "stationery",
    price: 250,
    image: "https://via.placeholder.com/200x250/34495E/FFFFFF?text=Calculator",
    description: "Casio FX-82ZA PLUS II scientific calculator",
    inStock: true,
  },
  {
    id: "9",
    name: "Highlighter Set (6)",
    category: "stationery",
    price: 55,
    image: "https://via.placeholder.com/200x250/E74C3C/FFFFFF?text=Highlighters",
    description: "Assorted color highlighters",
    inStock: true,
  },
  {
    id: "10",
    name: "A4 Paper Ream",
    category: "stationery",
    price: 120,
    image: "https://via.placeholder.com/200x250/95A5A6/FFFFFF?text=Paper",
    description: "500 sheets of premium A4 paper",
    inStock: true,
  },
  // Tech
  {
    id: "11",
    name: "USB Flash Drive 32GB",
    category: "tech",
    price: 150,
    image: "https://via.placeholder.com/200x250/1ABC9C/FFFFFF?text=USB",
    description: "High-speed USB 3.0 flash drive",
    inStock: true,
  },
  {
    id: "12",
    name: "Wireless Mouse",
    category: "tech",
    price: 180,
    image: "https://via.placeholder.com/200x250/2ECC71/FFFFFF?text=Mouse",
    description: "Ergonomic wireless mouse with USB receiver",
    inStock: true,
  },
  {
    id: "13",
    name: "Laptop Stand",
    category: "tech",
    price: 320,
    image: "https://via.placeholder.com/200x250/E67E22/FFFFFF?text=Stand",
    description: "Adjustable aluminum laptop stand",
    inStock: true,
  },
  {
    id: "14",
    name: "Headphones with Mic",
    category: "tech",
    price: 280,
    image: "https://via.placeholder.com/200x250/8E44AD/FFFFFF?text=Headphones",
    description: "Over-ear headphones with built-in microphone",
    inStock: true,
  },
];

export default function StudyMaterialScreen() {
  const colors = useColors();
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = PRODUCTS.filter((product) => {
    const matchesCategory = activeCategory === "all" || product.category === activeCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
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

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(cart.map((item) => (item.id === productId ? { ...item, quantity } : item)));
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      Toast.show({
        type: "error",
        text1: "Cart Empty",
        text2: "Add items to cart before checkout",
      });
      return;
    }
    Toast.show({
      type: "success",
      text1: "Order Placed",
      text2: `Total: R${getTotalPrice().toFixed(2)}`,
    });
    setCart([]);
    setShowCart(false);
  };

  const categories = [
    { id: "all", label: "All", icon: "square.grid.2x2" },
    { id: "textbooks", label: "Textbooks", icon: "book.fill" },
    { id: "stationery", label: "Stationery", icon: "pencil" },
    { id: "tech", label: "Tech", icon: "desktopcomputer" },
  ];

  return (
    <ScreenContainer className="p-4" edges={["top", "left", "right"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-2xl font-bold text-foreground">Study Material</Text>
          <Text className="text-sm text-muted">Books & Stationery</Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowCart(true)}
          className="bg-primary rounded-full p-3 relative"
        >
          <IconSymbol name="cart.fill" size={24} color="white" />
          {getTotalItems() > 0 && (
            <View className="absolute -top-1 -right-1 bg-error rounded-full w-6 h-6 items-center justify-center">
              <Text className="text-white text-xs font-bold">{getTotalItems()}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View className="bg-surface rounded-2xl px-4 py-3 mb-4 flex-row items-center border border-border">
        <IconSymbol name="magnifyingglass" size={20} color={colors.muted} />
        <TextInput
          placeholder="Search products..."
          placeholderTextColor={colors.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          className="flex-1 ml-2 text-foreground"
        />
      </View>

      {/* Category Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mb-4"
        contentContainerStyle={{ gap: 8 }}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            onPress={() => setActiveCategory(category.id as Category)}
            className={`px-5 py-3 rounded-full flex-row items-center gap-2 ${
              activeCategory === category.id ? "bg-primary" : "bg-surface border border-border"
            }`}
          >
            <IconSymbol
              name={category.icon as any}
              size={18}
              color={activeCategory === category.id ? "white" : colors.foreground}
            />
            <Text
              className={`font-semibold ${
                activeCategory === category.id ? "text-white" : "text-foreground"
              }`}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Products Grid */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        <View className="flex-row flex-wrap gap-3">
          {filteredProducts.map((product) => (
            <View
              key={product.id}
              className="bg-surface rounded-2xl border border-border overflow-hidden"
              style={{ width: "48%" }}
            >
              <RNImage
                source={{ uri: product.image }}
                style={{ width: "100%", height: 150 }}
                resizeMode="cover"
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
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Cart Modal */}
      {showCart && (
        <View
          className="absolute inset-0 bg-background"
          style={{ zIndex: 1000 }}
        >
          <View className="flex-1 p-4">
            {/* Cart Header */}
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-2xl font-bold text-foreground">Shopping Cart</Text>
              <TouchableOpacity onPress={() => setShowCart(false)}>
                <IconSymbol name="xmark.circle.fill" size={28} color={colors.muted} />
              </TouchableOpacity>
            </View>

            {cart.length === 0 ? (
              <View className="flex-1 items-center justify-center">
                <IconSymbol name="cart" size={64} color={colors.muted} />
                <Text className="text-lg text-muted mt-4">Your cart is empty</Text>
              </View>
            ) : (
              <>
                <ScrollView className="flex-1 mb-4">
                  {cart.map((item) => (
                    <View
                      key={item.id}
                      className="bg-surface rounded-2xl p-4 mb-3 border border-border flex-row"
                    >
                      <RNImage
                        source={{ uri: item.image }}
                        style={{ width: 80, height: 80, borderRadius: 12 }}
                        resizeMode="cover"
                      />
                      <View className="flex-1 ml-3">
                        <Text className="text-sm font-bold text-foreground mb-1">
                          {item.name}
                        </Text>
                        <Text className="text-lg font-bold text-primary mb-2">
                          R{item.price}
                        </Text>
                        <View className="flex-row items-center gap-2">
                          <TouchableOpacity
                            onPress={() => updateQuantity(item.id, item.quantity - 1)}
                            className="bg-border rounded-full w-8 h-8 items-center justify-center"
                          >
                            <IconSymbol name="minus" size={16} color={colors.foreground} />
                          </TouchableOpacity>
                          <Text className="text-foreground font-semibold w-8 text-center">
                            {item.quantity}
                          </Text>
                          <TouchableOpacity
                            onPress={() => updateQuantity(item.id, item.quantity + 1)}
                            className="bg-primary rounded-full w-8 h-8 items-center justify-center"
                          >
                            <IconSymbol name="plus" size={16} color="white" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => removeFromCart(item.id)}
                            className="ml-auto"
                          >
                            <IconSymbol name="trash" size={20} color={colors.error} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  ))}
                </ScrollView>

                {/* Checkout Section */}
                <View className="bg-surface rounded-2xl p-4 border border-border">
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-muted">Subtotal</Text>
                    <Text className="text-foreground font-semibold">
                      R{getTotalPrice().toFixed(2)}
                    </Text>
                  </View>
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-muted">Delivery</Text>
                    <Text className="text-foreground font-semibold">R50.00</Text>
                  </View>
                  <View className="h-px bg-border my-2" />
                  <View className="flex-row justify-between mb-4">
                    <Text className="text-lg font-bold text-foreground">Total</Text>
                    <Text className="text-lg font-bold text-primary">
                      R{(getTotalPrice() + 50).toFixed(2)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={handleCheckout}
                    className="bg-primary rounded-full py-4 items-center"
                  >
                    <Text className="text-white font-bold text-lg">Checkout</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      )}
    </ScreenContainer>
  );
}
