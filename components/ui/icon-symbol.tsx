// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight, SymbolViewProps } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconMapping = Record<SymbolViewProps["name"], ComponentProps<typeof MaterialIcons>["name"]>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  "house.fill": "home",
  "paperplane.fill": "send",
  "camera.fill": "camera",
  "photo.fill": "photo",
  "eye.fill": "visibility",
  "person.fill": "person",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.right": "chevron-right",
  "chevron.left": "chevron-left",
  "arrow.left": "arrow-back",
  "arrow.right": "arrow-forward",
  "arrow.down.circle.fill": "file-download",
  "phone.fill": "phone",
  "phone.down.fill": "call-end",
  "antenna.radiowaves.left.and.right": "wifi",
  "bolt.fill": "bolt",
  "sportscourt.fill": "sports-basketball",
  "gift.fill": "card-giftcard",
  "tv.fill": "tv",
  "xmark.circle.fill": "cancel",
  "xmark": "close",
  "wallet.fill": "account-balance-wallet",
  "bell.fill": "notifications",
  "banknote.fill": "attach-money",
  "banknote": "attach-money",
  "chart.line.uptrend.xyaxis": "trending-up",
  "chart.bar.fill": "bar-chart",
  "creditcard.fill": "credit-card",
  "cart.fill": "shopping-cart",
  "dollarsign.circle.fill": "attach-money",
  "heart.fill": "favorite",
  "briefcase.fill": "work",
  "message.fill": "chat",
  "book.fill": "book",
  "building.fill": "business",
  "graduationcap.fill": "school",
  "lightbulb.fill": "lightbulb",
  "car.fill": "directions-car",
  "music.note": "music-note",
  "plus.circle.fill": "add-circle",
  "plus": "add",
  "gear": "settings",
  "lock.fill": "lock",
  "video.fill": "videocam",
  "person.3.fill": "group",
  "person.2.fill": "people",
  "person.crop.circle.badge.xmark": "person-off",
  "circle.fill": "circle",
  "clock.fill": "access-time",
  "magnifyingglass": "search",
  "laptopcomputer": "laptop",
  "iphone": "smartphone",
  "airplane": "flight",
  "target": "track-changes",
  "qrcode": "qr-code",
  "brain": "psychology",
  "checkmark.circle.fill": "check-circle",
  "wind": "air",
  "sunrise.fill": "wb-sunny",
  "moon.fill": "nightlight",
  "play.fill": "play-arrow",
  "figure.walk": "directions-walk",
  "calendar": "event",
  "star.fill": "star",
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
