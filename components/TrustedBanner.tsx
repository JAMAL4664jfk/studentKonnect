import { View, Text, ScrollView, Animated } from "react-native";
import { Image } from "expo-image";
import { useEffect, useRef } from "react";

interface Logo {
  name: string;
  source: any;
}

const UNIVERSITIES: Logo[] = [
  { name: "UNISA", source: require("@/assets/images/universities/unisa-logo.png") },
  { name: "Wits", source: require("@/assets/images/universities/wits-logo.jpg") },
  { name: "UCT", source: require("@/assets/images/universities/uct-logo.png") },
  { name: "UJ", source: require("@/assets/images/universities/uj-logo.png") },
  { name: "Stellenbosch", source: require("@/assets/images/universities/stellenbosch-logo.jpg") },
  { name: "Pretoria", source: require("@/assets/images/universities/pretoria-logo.png") },
  { name: "UKZN", source: require("@/assets/images/universities/ukzn-logo.png") },
  { name: "NWU", source: require("@/assets/images/universities/nwu-logo.png") },
  { name: "Rhodes", source: require("@/assets/images/universities/rhodes-logo.png") },
  { name: "TUT", source: require("@/assets/images/universities/tut-logo.jpg") },
];

const BRANDS: Logo[] = [
  { name: "NSFAS", source: require("@/assets/images/brands/nsfas-logo.png") },
  { name: "Vodacom", source: require("@/assets/images/brands/vodacom-logo.webp") },
  { name: "Shoprite", source: require("@/assets/images/brands/shoprite-logo.png") },
  { name: "TymeBank", source: require("@/assets/images/brands/tymebank-logo.png") },
  { name: "Betway", source: require("@/assets/images/brands/betway-logo.png") },
  { name: "Apple", source: require("@/assets/images/brands/apple-logo.jpg") },
  { name: "KFC", source: require("@/assets/images/brands/kfc-logo.png") },
  { name: "Nike", source: require("@/assets/images/brands/nike-logo.jpg") },
  { name: "Samsung", source: require("@/assets/images/brands/samsung-logo-new.png") },
  { name: "Lenovo", source: require("@/assets/images/brands/lenovo-logo.png") },
];

interface TrustedBannerProps {
  type: "universities" | "brands";
  title?: string;
}

export function TrustedBanner({ type, title }: TrustedBannerProps) {
  const scrollX = useRef(new Animated.Value(0)).current;
  const logos = type === "universities" ? UNIVERSITIES : BRANDS;
  const doubledLogos = [...logos, ...logos, ...logos]; // Triple for smooth infinite scroll

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(scrollX, {
        toValue: -1,
        duration: 20000,
        useNativeDriver: true,
      })
    );
    animation.start();

    return () => animation.stop();
  }, [scrollX]);

  return (
    <View className="py-6">
      {title && (
        <Text className="text-center text-sm font-semibold text-muted mb-4">{title}</Text>
      )}
      <View style={{ overflow: "hidden" }}>
        <Animated.View
          style={{
            flexDirection: "row",
            transform: [
              {
                translateX: scrollX.interpolate({
                  inputRange: [-1, 0],
                  outputRange: [-(logos.length * 120), 0],
                }),
              },
            ],
          }}
        >
          {doubledLogos.map((logo, index) => (
            <View
              key={`${logo.name}-${index}`}
              className="mx-3"
              style={{ width: 100, height: 60 }}
            >
              <Image
                source={logo.source}
                style={{ width: "100%", height: "100%", borderRadius: 8 }}
                contentFit="contain"
              />
            </View>
          ))}
        </Animated.View>
      </View>
    </View>
  );
}
