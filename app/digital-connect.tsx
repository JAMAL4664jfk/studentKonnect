import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Modal,
  Image as RNImage,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";

type DeviceCategory = "smartphones" | "laptops" | "tablets" | "accessories" | "textbooks";

interface DeviceSpecs {
  processor?: string;
  ram?: string;
  storage?: string;
  display?: string;
  camera?: string;
  battery?: string;
  author?: string;
  edition?: string;
  isbn?: string;
  pages?: string;
}

interface Device {
  id: string;
  name: string;
  category: DeviceCategory;
  price: number;
  image: string;
  brand: string;
  specs: DeviceSpecs;
  partner: string;
  inStock: boolean;
}

interface CartItem extends Device {
  quantity: number;
}

// Mock device data - in production this would come from API
const DEVICES: Device[] = [
  // Smartphones
  {
    id: "1",
    name: "iPhone 15 Pro",
    category: "smartphones",
    price: 18999,
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400",
    brand: "Apple",
    specs: {
      processor: "A17 Pro chip",
      ram: "8GB",
      storage: "256GB",
      display: "6.1-inch Super Retina XDR",
      camera: "48MP Main + 12MP Ultra Wide",
      battery: "Up to 23 hours video playback",
    },
    partner: "Takealot",
    inStock: true,
  },
  {
    id: "2",
    name: "Samsung Galaxy S24 Ultra",
    category: "smartphones",
    price: 24999,
    image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400",
    brand: "Samsung",
    specs: {
      processor: "Snapdragon 8 Gen 3",
      ram: "12GB",
      storage: "512GB",
      display: "6.8-inch Dynamic AMOLED 2X",
      camera: "200MP Main + 50MP Periscope",
      battery: "5000mAh",
    },
    partner: "Game",
    inStock: true,
  },
  {
    id: "3",
    name: "Samsung Galaxy A54",
    category: "smartphones",
    price: 8999,
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400",
    brand: "Samsung",
    specs: {
      processor: "Exynos 1380",
      ram: "8GB",
      storage: "256GB",
      display: "6.4-inch Super AMOLED",
      camera: "50MP Main + 12MP Ultra Wide",
      battery: "5000mAh",
    },
    partner: "Makro",
    inStock: true,
  },
  {
    id: "4",
    name: "Google Pixel 8 Pro",
    category: "smartphones",
    price: 17999,
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400",
    brand: "Google",
    specs: {
      processor: "Google Tensor G3",
      ram: "12GB",
      storage: "256GB",
      display: "6.7-inch LTPO OLED",
      camera: "50MP Main + 48MP Ultra Wide",
      battery: "5050mAh",
    },
    partner: "Takealot",
    inStock: true,
  },
  {
    id: "5",
    name: "Xiaomi 14 Pro",
    category: "smartphones",
    price: 13999,
    image: "https://images.unsplash.com/photo-1592286927505-2fd0d3e3f5f7?w=400",
    brand: "Xiaomi",
    specs: {
      processor: "Snapdragon 8 Gen 3",
      ram: "12GB",
      storage: "256GB",
      display: "6.73-inch AMOLED",
      camera: "50MP Main + 50MP Telephoto",
      battery: "4880mAh",
    },
    partner: "Game",
    inStock: true,
  },
  // Laptops
  {
    id: "9",
    name: "MacBook Air M2",
    category: "laptops",
    price: 21999,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400",
    brand: "Apple",
    specs: {
      processor: "Apple M2 chip",
      ram: "8GB",
      storage: "256GB SSD",
      display: "13.6-inch Liquid Retina",
      battery: "Up to 18 hours",
    },
    partner: "Takealot",
    inStock: true,
  },
  {
    id: "10",
    name: "HP Pavilion 15",
    category: "laptops",
    price: 12999,
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400",
    brand: "HP",
    specs: {
      processor: "Intel Core i5-12450H",
      ram: "16GB DDR4",
      storage: "512GB SSD",
      display: "15.6-inch FHD IPS",
      battery: "Up to 8 hours",
    },
    partner: "Makro",
    inStock: true,
  },
  {
    id: "11",
    name: "Dell XPS 13",
    category: "laptops",
    price: 24999,
    image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400",
    brand: "Dell",
    specs: {
      processor: "Intel Core i7-1355U",
      ram: "16GB LPDDR5",
      storage: "512GB SSD",
      display: "13.4-inch FHD+ InfinityEdge",
      battery: "Up to 12 hours",
    },
    partner: "Takealot",
    inStock: true,
  },
  {
    id: "12",
    name: "Lenovo IdeaPad Slim 3",
    category: "laptops",
    price: 8999,
    image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400",
    brand: "Lenovo",
    specs: {
      processor: "AMD Ryzen 5 7520U",
      ram: "8GB DDR4",
      storage: "256GB SSD",
      display: "15.6-inch FHD",
      battery: "Up to 10 hours",
    },
    partner: "Game",
    inStock: true,
  },
  {
    id: "13",
    name: "ASUS VivoBook 15",
    category: "laptops",
    price: 10499,
    image: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=400",
    brand: "ASUS",
    specs: {
      processor: "Intel Core i5-1235U",
      ram: "8GB DDR4",
      storage: "512GB SSD",
      display: "15.6-inch FHD",
      battery: "Up to 9 hours",
    },
    partner: "Makro",
    inStock: true,
  },
  // Tablets
  {
    id: "16",
    name: "iPad Air M1",
    category: "tablets",
    price: 14999,
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400",
    brand: "Apple",
    specs: {
      processor: "Apple M1 chip",
      ram: "8GB",
      storage: "256GB",
      display: "10.9-inch Liquid Retina",
      battery: "Up to 10 hours",
    },
    partner: "Takealot",
    inStock: true,
  },
  {
    id: "17",
    name: "Samsung Galaxy Tab S9",
    category: "tablets",
    price: 11999,
    image: "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=400",
    brand: "Samsung",
    specs: {
      processor: "Snapdragon 8 Gen 2",
      ram: "8GB",
      storage: "128GB",
      display: "11-inch Dynamic AMOLED 2X",
      battery: "8400mAh",
    },
    partner: "Game",
    inStock: true,
  },
  {
    id: "18",
    name: "Samsung Galaxy Tab A9",
    category: "tablets",
    price: 3999,
    image: "https://images.unsplash.com/photo-1585790050230-5dd28404f869?w=400",
    brand: "Samsung",
    specs: {
      processor: "MediaTek Helio G99",
      ram: "4GB",
      storage: "64GB",
      display: "11-inch LCD",
      battery: "7040mAh",
    },
    partner: "Makro",
    inStock: true,
  },
  // Accessories
  {
    id: "21",
    name: "AirPods Pro 2nd Gen",
    category: "accessories",
    price: 4999,
    image: "https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=400",
    brand: "Apple",
    specs: {
      battery: "Up to 6 hours listening",
      display: "Active Noise Cancellation",
    },
    partner: "Takealot",
    inStock: true,
  },
  {
    id: "22",
    name: "Samsung Galaxy Buds 2 Pro",
    category: "accessories",
    price: 3499,
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400",
    brand: "Samsung",
    specs: {
      battery: "Up to 5 hours with ANC",
      display: "360 Audio support",
    },
    partner: "Game",
    inStock: true,
  },
  {
    id: "23",
    name: "Sony WH-1000XM5",
    category: "accessories",
    price: 7999,
    image: "https://images.unsplash.com/photo-1545127398-14699f92334b?w=400",
    brand: "Sony",
    specs: {
      battery: "Up to 30 hours",
      display: "Industry-leading ANC",
    },
    partner: "Takealot",
    inStock: true,
  },
  {
    id: "26",
    name: "USB-C to USB-C Cable 2m",
    category: "accessories",
    price: 299,
    image: "https://images.unsplash.com/photo-1625948515291-69613efd103f?w=400",
    brand: "Anker",
    specs: {
      display: "100W Fast Charging, USB 3.2 Gen 2",
    },
    partner: "Takealot",
    inStock: true,
  },
  {
    id: "28",
    name: "65W GaN USB-C Charger",
    category: "accessories",
    price: 799,
    image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400",
    brand: "Anker",
    specs: {
      display: "3-Port, Foldable plug",
    },
    partner: "Makro",
    inStock: true,
  },
  {
    id: "29",
    name: "20000mAh Power Bank",
    category: "accessories",
    price: 999,
    image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400",
    brand: "Xiaomi",
    specs: {
      display: "22.5W Fast Charging, USB-C PD",
    },
    partner: "Takealot",
    inStock: true,
  },
  // Textbooks
  {
    id: "40",
    name: "Introduction to Algorithms (4th Edition)",
    category: "textbooks",
    price: 1299,
    image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400",
    brand: "MIT Press",
    specs: {
      author: "Cormen, Leiserson, Rivest, Stein",
      edition: "4th Edition",
      isbn: "978-0262046305",
      pages: "1312 pages",
    },
    partner: "Takealot",
    inStock: true,
  },
  {
    id: "41",
    name: "Calculus: Early Transcendentals",
    category: "textbooks",
    price: 899,
    image: "https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?w=400",
    brand: "Cengage",
    specs: {
      author: "James Stewart",
      edition: "9th Edition",
      isbn: "978-1337613927",
      pages: "1368 pages",
    },
    partner: "Game",
    inStock: true,
  },
  {
    id: "42",
    name: "Principles of Economics",
    category: "textbooks",
    price: 749,
    image: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=400",
    brand: "Cengage",
    specs: {
      author: "N. Gregory Mankiw",
      edition: "9th Edition",
      isbn: "978-0357038314",
      pages: "856 pages",
    },
    partner: "Makro",
    inStock: true,
  },
  {
    id: "43",
    name: "Organic Chemistry",
    category: "textbooks",
    price: 1099,
    image: "https://images.unsplash.com/photo-1476357471311-43c0db9fb2b4?w=400",
    brand: "Wiley",
    specs: {
      author: "David R. Klein",
      edition: "4th Edition",
      isbn: "978-1119659594",
      pages: "1344 pages",
    },
    partner: "Takealot",
    inStock: true,
  },
  {
    id: "44",
    name: "Campbell Biology",
    category: "textbooks",
    price: 1199,
    image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400",
    brand: "Pearson",
    specs: {
      author: "Lisa A. Urry",
      edition: "12th Edition",
      isbn: "978-0135188743",
      pages: "1488 pages",
    },
    partner: "Game",
    inStock: true,
  },
];

const CATEGORIES = [
  { id: "all", name: "All", icon: "square.grid.2x2" as const },
  { id: "smartphones", name: "Smartphones", icon: "iphone" as const },
  { id: "laptops", name: "Laptops", icon: "laptopcomputer" as const },
  { id: "tablets", name: "Tablets", icon: "ipad" as const },
  { id: "accessories", name: "Accessories", icon: "headphones" as const },
  { id: "textbooks", name: "Textbooks", icon: "book.fill" as const },
];

const PARTNERS = ["All", "Takealot", "Game", "Makro"];
const BRANDS = ["All", "Apple", "Samsung", "Google", "Xiaomi", "HP", "Dell", "Lenovo", "ASUS", "Sony", "Anker"];
const PRICE_RANGES = [
  { id: "all", label: "All Prices" },
  { id: "under10k", label: "Under R10,000" },
  { id: "10k-20k", label: "R10,000 - R20,000" },
  { id: "over20k", label: "Over R20,000" },
];

export default function DigitalConnectScreen() {
  const colors = useColors();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [selectedPartner, setSelectedPartner] = useState("All");
  const [priceRange, setPriceRange] = useState("all");
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<"delivery" | "pickup">("delivery");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [selectedStore, setSelectedStore] = useState("");

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const cartData = await AsyncStorage.getItem("digitalConnectCart");
      if (cartData) {
        setCart(JSON.parse(cartData));
      }
    } catch (error) {
      console.error("Failed to load cart:", error);
    }
  };

  const saveCart = async (newCart: CartItem[]) => {
    try {
      await AsyncStorage.setItem("digitalConnectCart", JSON.stringify(newCart));
    } catch (error) {
      console.error("Failed to save cart:", error);
    }
  };

  const filteredDevices = DEVICES.filter((device) => {
    const matchesSearch =
      device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || device.category === selectedCategory;
    const matchesBrand = selectedBrand === "All" || device.brand === selectedBrand;
    const matchesPartner = selectedPartner === "All" || device.partner === selectedPartner;

    let matchesPrice = true;
    if (priceRange === "under10k") matchesPrice = device.price < 10000;
    else if (priceRange === "10k-20k") matchesPrice = device.price >= 10000 && device.price < 20000;
    else if (priceRange === "over20k") matchesPrice = device.price >= 20000;

    return matchesSearch && matchesCategory && matchesBrand && matchesPartner && matchesPrice;
  });

  const addToCart = (device: Device) => {
    const existingItem = cart.find((item) => item.id === device.id);
    let newCart: CartItem[];
    if (existingItem) {
      newCart = cart.map((item) =>
        item.id === device.id ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      newCart = [...cart, { ...device, quantity: 1 }];
    }
    setCart(newCart);
    saveCart(newCart);
    Toast.show({
      type: "success",
      text1: "Added to cart",
      text2: `${device.name} has been added to your cart.`,
    });
  };

  const updateQuantity = (id: string, change: number) => {
    const newCart = cart
      .map((item) => {
        if (item.id === id) {
          const newQuantity = item.quantity + change;
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
        }
        return item;
      })
      .filter((item) => item.quantity > 0);
    setCart(newCart);
    saveCart(newCart);
  };

  const removeFromCart = (id: string) => {
    const newCart = cart.filter((item) => item.id !== id);
    setCart(newCart);
    saveCart(newCart);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = () => {
    if (deliveryMethod === "delivery" && !deliveryAddress) {
      Toast.show({
        type: "error",
        text1: "Address required",
        text2: "Please enter a delivery address.",
      });
      return;
    }

    if (deliveryMethod === "pickup" && !selectedStore) {
      Toast.show({
        type: "error",
        text1: "Store selection required",
        text2: "Please select a pickup location.",
      });
      return;
    }

    Toast.show({
      type: "success",
      text1: "Order placed successfully!",
      text2:
        deliveryMethod === "delivery"
          ? `Your order will be delivered to ${deliveryAddress}`
          : `Your order will be ready for pickup at ${selectedStore}`,
    });
    const emptyCart: CartItem[] = [];
    setCart(emptyCart);
    saveCart(emptyCart);
    setShowCheckout(false);
    setShowCart(false);
    setDeliveryAddress("");
    setSelectedStore("");
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedBrand("All");
    setSelectedPartner("All");
    setPriceRange("all");
  };

  const renderDevice = ({ item }: { item: Device }) => (
    <TouchableOpacity
      onPress={() => setSelectedDevice(item)}
      className="bg-surface rounded-2xl p-4 mb-4 border border-border active:opacity-70"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <Image
        source={{ uri: item.image }}
        className="w-full h-48 rounded-xl mb-3"
        contentFit="cover"
        transition={200}
        cachePolicy="memory-disk"
      />
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-1">
          <Text className="text-xs text-muted mb-1">{item.brand}</Text>
          <Text className="text-base font-semibold text-foreground mb-2" numberOfLines={2}>
            {item.name}
          </Text>
        </View>
        <View
          className="px-2 py-1 rounded-lg"
          style={{ backgroundColor: colors.primary + "20" }}
        >
          <Text className="text-xs font-medium" style={{ color: colors.primary }}>
            {item.partner}
          </Text>
        </View>
      </View>
      <View className="flex-row items-center justify-between">
        <Text className="text-2xl font-bold text-primary">
          R{item.price.toLocaleString()}
        </Text>
        {item.inStock ? (
          <View
            className="px-3 py-1 rounded-full"
            style={{ backgroundColor: colors.success + "20" }}
          >
            <Text className="text-xs font-medium" style={{ color: colors.success }}>
              In Stock
            </Text>
          </View>
        ) : (
          <View
            className="px-3 py-1 rounded-full"
            style={{ backgroundColor: colors.error + "20" }}
          >
            <Text className="text-xs font-medium" style={{ color: colors.error }}>
              Out of Stock
            </Text>
          </View>
        )}
      </View>
      <View className="flex-row gap-2 mt-3">
        <TouchableOpacity
          onPress={() => setSelectedDevice(item)}
          className="flex-1 bg-primary px-4 py-3 rounded-xl items-center active:opacity-70"
        >
          <Text className="text-white text-sm font-semibold">View Details</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => addToCart(item)}
          disabled={!item.inStock}
          className="px-4 py-3 rounded-xl items-center border-2 active:opacity-70"
          style={{
            borderColor: item.inStock ? colors.primary : colors.border,
            opacity: item.inStock ? 1 : 0.5,
          }}
        >
          <IconSymbol name="cart.fill" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-border">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity onPress={() => router.back()}>
              <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
            </TouchableOpacity>
            <View className="ml-4 flex-1">
              <Text className="text-2xl font-bold text-foreground">Digital Connect</Text>
              <Text className="text-sm text-muted">Purchase tech devices & textbooks</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => setShowCart(true)}
            className="relative ml-2"
          >
            <IconSymbol name="cart.fill" size={28} color={colors.foreground} />
            {cartItemCount > 0 && (
              <View
                className="absolute -top-2 -right-2 w-5 h-5 rounded-full items-center justify-center"
                style={{ backgroundColor: colors.primary }}
              >
                <Text className="text-white text-xs font-bold">{cartItemCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Partners Strip */}
        <View className="bg-surface py-4 px-4 border-b border-border">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row items-center gap-8">
              {PARTNERS.filter((p) => p !== "All").map((partner) => (
                <View key={partner} className="items-center">
                  <Text className="text-sm font-semibold" style={{ color: colors.primary }}>
                    {partner}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        <ScrollView className="flex-1">
          {/* Promotional Banner */}
          <View className="p-4">
            <View
              className="rounded-2xl p-6 overflow-hidden"
              style={{
                backgroundColor: colors.primary + "20",
                borderWidth: 1,
                borderColor: colors.primary + "40",
              }}
            >
              <View className="flex-row items-center gap-2 mb-2">
                <IconSymbol name="sparkles" size={20} color={colors.primary} />
                <Text className="text-lg font-bold" style={{ color: colors.primary }}>
                  Student Specials
                </Text>
              </View>
              <Text className="text-sm text-muted">
                Save up to 30% on select devices
              </Text>
            </View>
          </View>

          {/* Search */}
          <View className="px-4 mb-4">
            <View className="flex-row items-center gap-3 rounded-2xl px-4 py-3 bg-surface border border-border">
              <IconSymbol name="magnifyingglass" size={20} color={colors.muted} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search devices..."
                placeholderTextColor={colors.muted}
                className="flex-1 text-foreground text-base"
              />
            </View>
          </View>

          {/* Category Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-4"
            contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
          >
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setSelectedCategory(cat.id)}
                className="flex-row items-center gap-2 px-4 py-2 rounded-full"
                style={{
                  backgroundColor:
                    selectedCategory === cat.id ? colors.primary : colors.surface,
                  borderWidth: 1,
                  borderColor:
                    selectedCategory === cat.id ? colors.primary : colors.border,
                }}
              >
                <IconSymbol
                  name={cat.icon}
                  size={16}
                  color={selectedCategory === cat.id ? "#fff" : colors.foreground}
                />
                <Text
                  className="text-sm font-medium"
                  style={{
                    color: selectedCategory === cat.id ? "#fff" : colors.foreground,
                  }}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Filters */}
          <View className="px-4 mb-4">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="flex-row gap-2"
            >
              {/* Brand Filter */}
              <View className="bg-surface rounded-xl px-4 py-2 border border-border">
                <Text className="text-xs text-muted mb-1">Brand</Text>
                <TouchableOpacity
                  onPress={() => {
                    const currentIndex = BRANDS.indexOf(selectedBrand);
                    const nextIndex = (currentIndex + 1) % BRANDS.length;
                    setSelectedBrand(BRANDS[nextIndex]);
                  }}
                >
                  <Text className="text-sm font-semibold text-foreground">
                    {selectedBrand}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Partner Filter */}
              <View className="bg-surface rounded-xl px-4 py-2 border border-border">
                <Text className="text-xs text-muted mb-1">Partner</Text>
                <TouchableOpacity
                  onPress={() => {
                    const currentIndex = PARTNERS.indexOf(selectedPartner);
                    const nextIndex = (currentIndex + 1) % PARTNERS.length;
                    setSelectedPartner(PARTNERS[nextIndex]);
                  }}
                >
                  <Text className="text-sm font-semibold text-foreground">
                    {selectedPartner}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Price Filter */}
              <View className="bg-surface rounded-xl px-4 py-2 border border-border">
                <Text className="text-xs text-muted mb-1">Price</Text>
                <TouchableOpacity
                  onPress={() => {
                    const currentIndex = PRICE_RANGES.findIndex((r) => r.id === priceRange);
                    const nextIndex = (currentIndex + 1) % PRICE_RANGES.length;
                    setPriceRange(PRICE_RANGES[nextIndex].id);
                  }}
                >
                  <Text className="text-sm font-semibold text-foreground">
                    {PRICE_RANGES.find((r) => r.id === priceRange)?.label}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Clear Filters */}
              <TouchableOpacity
                onPress={clearFilters}
                className="bg-surface rounded-xl px-4 py-2 border border-border items-center justify-center active:opacity-70"
              >
                <Text className="text-sm font-semibold" style={{ color: colors.primary }}>
                  Clear All
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Device List */}
          <View className="px-4 pb-4">
            <FlatList
              data={filteredDevices}
              renderItem={renderDevice}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              ListEmptyComponent={
                <View className="items-center justify-center py-12">
                  <IconSymbol name="exclamationmark.triangle" size={48} color={colors.muted} />
                  <Text className="text-muted text-center mt-4">
                    No devices found matching your criteria
                  </Text>
                </View>
              }
            />
          </View>
        </ScrollView>
      </View>

      {/* Device Detail Modal */}
      <Modal visible={!!selectedDevice} animationType="slide" transparent>
        <View
          className="flex-1 justify-end"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <View
            className="rounded-t-3xl p-6"
            style={{ backgroundColor: colors.background, maxHeight: "90%" }}
          >
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
                Product Details
              </Text>
              <TouchableOpacity onPress={() => setSelectedDevice(null)}>
                <IconSymbol name="xmark" size={24} color={colors.foreground} />
              </TouchableOpacity>
            </View>

            {selectedDevice && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Image
                  source={{ uri: selectedDevice.image }}
                  className="w-full h-64 rounded-xl mb-4"
                  contentFit="cover"
                />

                <View className="flex-row items-start justify-between mb-4">
                  <View className="flex-1">
                    <Text className="text-sm text-muted mb-1">{selectedDevice.brand}</Text>
                    <Text className="text-2xl font-bold text-foreground mb-2">
                      {selectedDevice.name}
                    </Text>
                    <Text className="text-3xl font-bold text-primary">
                      R{selectedDevice.price.toLocaleString()}
                    </Text>
                  </View>
                </View>

                <View className="mb-4">
                  <Text className="text-lg font-semibold text-foreground mb-3">
                    {selectedDevice.category === "textbooks" ? "Book Details" : "Specifications"}
                  </Text>
                  <View className="bg-surface rounded-xl p-4 gap-2">
                    {selectedDevice.specs.author && (
                      <View className="flex-row">
                        <Text className="text-sm text-muted flex-1">Author:</Text>
                        <Text className="text-sm text-foreground flex-1">
                          {selectedDevice.specs.author}
                        </Text>
                      </View>
                    )}
                    {selectedDevice.specs.edition && (
                      <View className="flex-row">
                        <Text className="text-sm text-muted flex-1">Edition:</Text>
                        <Text className="text-sm text-foreground flex-1">
                          {selectedDevice.specs.edition}
                        </Text>
                      </View>
                    )}
                    {selectedDevice.specs.isbn && (
                      <View className="flex-row">
                        <Text className="text-sm text-muted flex-1">ISBN:</Text>
                        <Text className="text-sm text-foreground flex-1">
                          {selectedDevice.specs.isbn}
                        </Text>
                      </View>
                    )}
                    {selectedDevice.specs.pages && (
                      <View className="flex-row">
                        <Text className="text-sm text-muted flex-1">Pages:</Text>
                        <Text className="text-sm text-foreground flex-1">
                          {selectedDevice.specs.pages}
                        </Text>
                      </View>
                    )}
                    {selectedDevice.specs.processor && (
                      <View className="flex-row">
                        <Text className="text-sm text-muted flex-1">Processor:</Text>
                        <Text className="text-sm text-foreground flex-1">
                          {selectedDevice.specs.processor}
                        </Text>
                      </View>
                    )}
                    {selectedDevice.specs.ram && (
                      <View className="flex-row">
                        <Text className="text-sm text-muted flex-1">RAM:</Text>
                        <Text className="text-sm text-foreground flex-1">
                          {selectedDevice.specs.ram}
                        </Text>
                      </View>
                    )}
                    {selectedDevice.specs.storage && (
                      <View className="flex-row">
                        <Text className="text-sm text-muted flex-1">Storage:</Text>
                        <Text className="text-sm text-foreground flex-1">
                          {selectedDevice.specs.storage}
                        </Text>
                      </View>
                    )}
                    {selectedDevice.specs.display && (
                      <View className="flex-row">
                        <Text className="text-sm text-muted flex-1">Display:</Text>
                        <Text className="text-sm text-foreground flex-1">
                          {selectedDevice.specs.display}
                        </Text>
                      </View>
                    )}
                    {selectedDevice.specs.camera && (
                      <View className="flex-row">
                        <Text className="text-sm text-muted flex-1">Camera:</Text>
                        <Text className="text-sm text-foreground flex-1">
                          {selectedDevice.specs.camera}
                        </Text>
                      </View>
                    )}
                    {selectedDevice.specs.battery && (
                      <View className="flex-row">
                        <Text className="text-sm text-muted flex-1">Battery:</Text>
                        <Text className="text-sm text-foreground flex-1">
                          {selectedDevice.specs.battery}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                <View className="flex-row items-center gap-2 mb-6">
                  <View
                    className="px-3 py-1 rounded-lg"
                    style={{ backgroundColor: colors.primary + "20" }}
                  >
                    <Text className="text-sm font-medium" style={{ color: colors.primary }}>
                      {selectedDevice.partner}
                    </Text>
                  </View>
                  {selectedDevice.inStock ? (
                    <View
                      className="px-3 py-1 rounded-lg"
                      style={{ backgroundColor: colors.success + "20" }}
                    >
                      <Text className="text-sm font-medium" style={{ color: colors.success }}>
                        In Stock
                      </Text>
                    </View>
                  ) : (
                    <View
                      className="px-3 py-1 rounded-lg"
                      style={{ backgroundColor: colors.error + "20" }}
                    >
                      <Text className="text-sm font-medium" style={{ color: colors.error }}>
                        Out of Stock
                      </Text>
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  onPress={() => {
                    addToCart(selectedDevice);
                    setSelectedDevice(null);
                  }}
                  disabled={!selectedDevice.inStock}
                  className="py-4 rounded-xl items-center"
                  style={{
                    backgroundColor: selectedDevice.inStock
                      ? colors.primary
                      : colors.border,
                    opacity: selectedDevice.inStock ? 1 : 0.5,
                  }}
                >
                  <Text className="text-white font-semibold text-base">Add to Cart</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Cart Modal */}
      <Modal visible={showCart} animationType="slide" transparent>
        <View
          className="flex-1 justify-end"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <View
            className="rounded-t-3xl p-6"
            style={{ backgroundColor: colors.background, maxHeight: "90%" }}
          >
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
                Shopping Cart
              </Text>
              <TouchableOpacity onPress={() => setShowCart(false)}>
                <IconSymbol name="xmark" size={24} color={colors.foreground} />
              </TouchableOpacity>
            </View>

            {cart.length === 0 ? (
              <View className="items-center justify-center py-12">
                <IconSymbol name="cart.fill" size={48} color={colors.muted} />
                <Text className="text-muted text-center mt-4">Your cart is empty</Text>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                {cart.map((item) => (
                  <View
                    key={item.id}
                    className="flex-row items-center gap-3 p-4 mb-3 rounded-xl border border-border"
                    style={{ backgroundColor: colors.surface }}
                  >
                    <Image
                      source={{ uri: item.image }}
                      className="w-20 h-20 rounded-lg"
                      contentFit="cover"
                    />
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text className="text-xs text-muted">{item.brand}</Text>
                      <Text className="text-base font-bold text-primary mt-1">
                        R{item.price.toLocaleString()}
                      </Text>
                    </View>
                    <View className="items-center gap-2">
                      <View className="flex-row items-center gap-2">
                        <TouchableOpacity
                          onPress={() => updateQuantity(item.id, -1)}
                          className="w-8 h-8 rounded-full items-center justify-center"
                          style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
                        >
                          <IconSymbol name="minus" size={16} color={colors.foreground} />
                        </TouchableOpacity>
                        <Text className="text-base font-semibold text-foreground w-8 text-center">
                          {item.quantity}
                        </Text>
                        <TouchableOpacity
                          onPress={() => updateQuantity(item.id, 1)}
                          className="w-8 h-8 rounded-full items-center justify-center"
                          style={{ backgroundColor: colors.primary }}
                        >
                          <IconSymbol name="plus" size={16} color="#fff" />
                        </TouchableOpacity>
                      </View>
                      <TouchableOpacity onPress={() => removeFromCart(item.id)}>
                        <IconSymbol name="trash.fill" size={20} color={colors.error} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}

                <View className="border-t border-border pt-4 mt-2">
                  <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-lg font-semibold text-foreground">Total:</Text>
                    <Text className="text-2xl font-bold text-primary">
                      R{cartTotal.toLocaleString()}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      setShowCart(false);
                      setShowCheckout(true);
                    }}
                    className="py-4 rounded-xl items-center"
                    style={{ backgroundColor: colors.primary }}
                  >
                    <Text className="text-white font-semibold text-base">
                      Proceed to Checkout
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Checkout Modal */}
      <Modal visible={showCheckout} animationType="slide" transparent>
        <View
          className="flex-1 justify-end"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <View
            className="rounded-t-3xl p-6"
            style={{ backgroundColor: colors.background, maxHeight: "90%" }}
          >
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
                Checkout
              </Text>
              <TouchableOpacity onPress={() => setShowCheckout(false)}>
                <IconSymbol name="xmark" size={24} color={colors.foreground} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Order Summary */}
              <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: colors.surface }}>
                <Text className="text-sm text-muted mb-3">Order Summary</Text>
                {cart.map((item) => (
                  <View key={item.id} className="flex-row justify-between mb-2">
                    <Text className="text-sm text-foreground">
                      {item.name} x{item.quantity}
                    </Text>
                    <Text className="text-sm font-semibold text-foreground">
                      R{(item.price * item.quantity).toLocaleString()}
                    </Text>
                  </View>
                ))}
                <View className="border-t border-border mt-2 pt-2 flex-row justify-between">
                  <Text className="text-base font-bold text-foreground">Total:</Text>
                  <Text className="text-base font-bold text-primary">
                    R{cartTotal.toLocaleString()}
                  </Text>
                </View>
              </View>

              {/* Delivery Method */}
              <View className="mb-4">
                <Text className="text-base font-semibold text-foreground mb-3">
                  Fulfillment Method
                </Text>
                <View className="gap-2">
                  <TouchableOpacity
                    onPress={() => setDeliveryMethod("delivery")}
                    className="flex-row items-center gap-3 p-4 rounded-xl border"
                    style={{
                      backgroundColor:
                        deliveryMethod === "delivery" ? colors.primary + "20" : colors.surface,
                      borderColor:
                        deliveryMethod === "delivery" ? colors.primary : colors.border,
                    }}
                  >
                    <View
                      className="w-5 h-5 rounded-full border-2 items-center justify-center"
                      style={{
                        borderColor:
                          deliveryMethod === "delivery" ? colors.primary : colors.border,
                      }}
                    >
                      {deliveryMethod === "delivery" && (
                        <View
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: colors.primary }}
                        />
                      )}
                    </View>
                    <Text className="text-base font-medium text-foreground">
                      Home Delivery
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setDeliveryMethod("pickup")}
                    className="flex-row items-center gap-3 p-4 rounded-xl border"
                    style={{
                      backgroundColor:
                        deliveryMethod === "pickup" ? colors.primary + "20" : colors.surface,
                      borderColor:
                        deliveryMethod === "pickup" ? colors.primary : colors.border,
                    }}
                  >
                    <View
                      className="w-5 h-5 rounded-full border-2 items-center justify-center"
                      style={{
                        borderColor:
                          deliveryMethod === "pickup" ? colors.primary : colors.border,
                      }}
                    >
                      {deliveryMethod === "pickup" && (
                        <View
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: colors.primary }}
                        />
                      )}
                    </View>
                    <Text className="text-base font-medium text-foreground">
                      Pickup from Store
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Delivery Address or Store Selection */}
              {deliveryMethod === "delivery" ? (
                <View className="mb-6">
                  <Text className="text-base font-semibold text-foreground mb-2">
                    Delivery Address *
                  </Text>
                  <TextInput
                    value={deliveryAddress}
                    onChangeText={setDeliveryAddress}
                    placeholder="Enter your delivery address"
                    placeholderTextColor={colors.muted}
                    className="p-4 rounded-xl text-foreground"
                    style={{ backgroundColor: colors.surface }}
                    multiline
                    numberOfLines={3}
                  />
                </View>
              ) : (
                <View className="mb-6">
                  <Text className="text-base font-semibold text-foreground mb-2">
                    Select Store *
                  </Text>
                  <View className="gap-2">
                    {[
                      "Takealot - Johannesburg",
                      "Takealot - Cape Town",
                      "Game - Sandton City",
                      "Game - Gateway",
                      "Makro - Woodmead",
                      "Makro - Bellville",
                    ].map((store) => (
                      <TouchableOpacity
                        key={store}
                        onPress={() => setSelectedStore(store)}
                        className="p-4 rounded-xl border flex-row items-center gap-3"
                        style={{
                          backgroundColor:
                            selectedStore === store
                              ? colors.primary + "20"
                              : colors.surface,
                          borderColor:
                            selectedStore === store ? colors.primary : colors.border,
                        }}
                      >
                        <View
                          className="w-5 h-5 rounded-full border-2 items-center justify-center"
                          style={{
                            borderColor:
                              selectedStore === store ? colors.primary : colors.border,
                          }}
                        >
                          {selectedStore === store && (
                            <View
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: colors.primary }}
                            />
                          )}
                        </View>
                        <Text className="text-base text-foreground">{store}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              <TouchableOpacity
                onPress={handleCheckout}
                className="py-4 rounded-xl items-center"
                style={{ backgroundColor: colors.primary }}
              >
                <Text className="text-white font-semibold text-base">
                  Complete Purchase
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Toast />
    </ScreenContainer>
  );
}
