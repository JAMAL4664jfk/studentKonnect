import { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ActivityIndicator,
  Modal,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

// Import the councillor data directly (bundled with the app)
import councillorData from "@/assets/data/councillors.json";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;

type Councillor = {
  province: string;
  municipality: string;
  party: string;
  wardListOrder: string;
  surname: string;
  fullName: string;
  seatType: string;
};

const ALL_PROVINCES = [
  "All Provinces",
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "North West",
  "Northern Cape",
  "Western Cape",
];

/** Returns a short two-letter abbreviation for a party name */
function partyInitials(party: string): string {
  const words = party.split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return words
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

/** Deterministic pastel colour based on party name */
function partyColor(party: string): string {
  const palette = [
    "#3b82f6", // blue
    "#10b981", // green
    "#f59e0b", // amber
    "#ef4444", // red
    "#8b5cf6", // violet
    "#ec4899", // pink
    "#06b6d4", // cyan
    "#f97316", // orange
    "#84cc16", // lime
    "#6366f1", // indigo
  ];
  let hash = 0;
  for (let i = 0; i < party.length; i++) {
    hash = (hash * 31 + party.charCodeAt(i)) & 0xffffffff;
  }
  return palette[Math.abs(hash) % palette.length];
}

const COUNCILLORS: Councillor[] = councillorData as Councillor[];

export default function CouncillorsScreen() {
  const colors = useColors();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("All Provinces");
  const [showProvinceModal, setShowProvinceModal] = useState(false);
  const [selectedCouncillor, setSelectedCouncillor] = useState<Councillor | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 40;

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return COUNCILLORS.filter((c) => {
      const matchProvince =
        selectedProvince === "All Provinces" || c.province === selectedProvince;
      if (!matchProvince) return false;
      if (!q) return true;
      return (
        c.surname.toLowerCase().includes(q) ||
        c.fullName.toLowerCase().includes(q) ||
        c.party.toLowerCase().includes(q) ||
        c.municipality.toLowerCase().includes(q) ||
        c.wardListOrder.toLowerCase().includes(q)
      );
    });
  }, [searchQuery, selectedProvince]);

  const paginated = useMemo(() => filtered.slice(0, page * PAGE_SIZE), [filtered, page]);

  const handleLoadMore = useCallback(() => {
    if (paginated.length < filtered.length) {
      setPage((p) => p + 1);
    }
  }, [paginated.length, filtered.length]);

  const renderCard = useCallback(
    ({ item }: { item: Councillor }) => {
      const color = partyColor(item.party);
      const initials = partyInitials(item.party);
      return (
        <TouchableOpacity
          onPress={() => setSelectedCouncillor(item)}
          style={{
            width: CARD_WIDTH,
            backgroundColor: colors.card,
            borderRadius: 14,
            padding: 14,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: colors.border,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.07,
            shadowRadius: 6,
            elevation: 3,
          }}
          activeOpacity={0.85}
        >
          {/* Avatar circle */}
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: color + "22",
              borderWidth: 2,
              borderColor: color + "55",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 10,
            }}
          >
            <Text style={{ color, fontWeight: "700", fontSize: 16 }}>{initials}</Text>
          </View>

          {/* Name */}
          <Text
            style={{ color: colors.foreground, fontWeight: "700", fontSize: 13, marginBottom: 2 }}
            numberOfLines={1}
          >
            {item.surname}
          </Text>
          <Text
            style={{ color: colors.mutedForeground, fontSize: 11, marginBottom: 8 }}
            numberOfLines={1}
          >
            {item.fullName}
          </Text>

          {/* Party badge */}
          <View
            style={{
              backgroundColor: color + "18",
              borderRadius: 6,
              paddingHorizontal: 6,
              paddingVertical: 3,
              marginBottom: 6,
            }}
          >
            <Text
              style={{ color, fontSize: 9, fontWeight: "700", textTransform: "uppercase" }}
              numberOfLines={2}
            >
              {item.party}
            </Text>
          </View>

          {/* Municipality */}
          <Text
            style={{ color: colors.mutedForeground, fontSize: 10 }}
            numberOfLines={2}
          >
            {item.municipality}
          </Text>
        </TouchableOpacity>
      );
    },
    [colors]
  );

  const renderFooter = () => {
    if (paginated.length >= filtered.length) return null;
    return (
      <View style={{ alignItems: "center", paddingVertical: 16 }}>
        <ActivityIndicator color={colors.primary} />
        <Text style={{ color: colors.mutedForeground, fontSize: 12, marginTop: 4 }}>
          Loading more…
        </Text>
      </View>
    );
  };

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      {/* Header */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 12,
          borderBottomWidth: 0.5,
          borderBottomColor: colors.border,
          backgroundColor: colors.background,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <TouchableOpacity onPress={() => router.back()}>
            <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.foreground, fontSize: 20, fontWeight: "700" }}>
              Elected Councillors
            </Text>
            <Text style={{ color: colors.mutedForeground, fontSize: 12 }}>
              2021 General Elections · {COUNCILLORS.length.toLocaleString()} councillors
            </Text>
          </View>
        </View>

        {/* Search bar */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.card,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
            paddingHorizontal: 12,
            paddingVertical: 8,
            gap: 8,
            marginBottom: 10,
          }}
        >
          <IconSymbol name="magnifyingglass" size={18} color={colors.mutedForeground} />
          <TextInput
            style={{ flex: 1, color: colors.foreground, fontSize: 14 }}
            placeholder="Search name, party, municipality…"
            placeholderTextColor={colors.mutedForeground}
            value={searchQuery}
            onChangeText={(t) => {
              setSearchQuery(t);
              setPage(1);
            }}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => { setSearchQuery(""); setPage(1); }}>
              <IconSymbol name="xmark.circle.fill" size={18} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>

        {/* Province filter */}
        <TouchableOpacity
          onPress={() => setShowProvinceModal(true)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.primary + "15",
            borderRadius: 10,
            paddingHorizontal: 12,
            paddingVertical: 8,
            gap: 6,
            alignSelf: "flex-start",
          }}
        >
          <IconSymbol name="map.fill" size={14} color={colors.primary} />
          <Text style={{ color: colors.primary, fontWeight: "600", fontSize: 13 }}>
            {selectedProvince}
          </Text>
          <IconSymbol name="chevron.down" size={12} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Results count */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 8, backgroundColor: colors.background }}>
        <Text style={{ color: colors.mutedForeground, fontSize: 12 }}>
          {filtered.length.toLocaleString()} result{filtered.length !== 1 ? "s" : ""}
          {searchQuery ? ` for "${searchQuery}"` : ""}
        </Text>
      </View>

      {/* Card grid */}
      <FlatList
        data={paginated}
        keyExtractor={(item, index) =>
          `${item.province}-${item.municipality}-${item.surname}-${item.fullName}-${index}`
        }
        renderItem={renderCard}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between", paddingHorizontal: 16 }}
        contentContainerStyle={{ paddingBottom: 32, paddingTop: 8 }}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingTop: 60 }}>
            <IconSymbol name="person.3.fill" size={48} color={colors.mutedForeground} />
            <Text style={{ color: colors.mutedForeground, marginTop: 12, fontSize: 15 }}>
              No councillors found
            </Text>
          </View>
        }
        removeClippedSubviews
        maxToRenderPerBatch={20}
        windowSize={10}
        initialNumToRender={20}
      />

      {/* Province picker modal */}
      <Modal
        visible={showProvinceModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowProvinceModal(false)}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: "#00000055" }}
          activeOpacity={1}
          onPress={() => setShowProvinceModal(false)}
        />
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: colors.background,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingBottom: 32,
          }}
        >
          <View
            style={{
              width: 40,
              height: 4,
              backgroundColor: colors.border,
              borderRadius: 2,
              alignSelf: "center",
              marginTop: 12,
              marginBottom: 16,
            }}
          />
          <Text
            style={{
              color: colors.foreground,
              fontSize: 16,
              fontWeight: "700",
              paddingHorizontal: 20,
              marginBottom: 12,
            }}
          >
            Select Province
          </Text>
          <ScrollView>
            {ALL_PROVINCES.map((prov) => (
              <TouchableOpacity
                key={prov}
                onPress={() => {
                  setSelectedProvince(prov);
                  setPage(1);
                  setShowProvinceModal(false);
                }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingHorizontal: 20,
                  paddingVertical: 14,
                  borderBottomWidth: 0.5,
                  borderBottomColor: colors.border,
                  backgroundColor:
                    selectedProvince === prov ? colors.primary + "10" : "transparent",
                }}
              >
                <Text
                  style={{
                    color:
                      selectedProvince === prov ? colors.primary : colors.foreground,
                    fontWeight: selectedProvince === prov ? "700" : "400",
                    fontSize: 15,
                  }}
                >
                  {prov}
                </Text>
                {selectedProvince === prov && (
                  <IconSymbol name="checkmark" size={16} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* Councillor detail modal */}
      <Modal
        visible={!!selectedCouncillor}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedCouncillor(null)}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: "#00000066", justifyContent: "center", padding: 24 }}
          activeOpacity={1}
          onPress={() => setSelectedCouncillor(null)}
        >
          {selectedCouncillor && (
            <TouchableOpacity activeOpacity={1}>
              <View
                style={{
                  backgroundColor: colors.background,
                  borderRadius: 20,
                  padding: 24,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                {/* Avatar */}
                <View style={{ alignItems: "center", marginBottom: 16 }}>
                  <View
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: 36,
                      backgroundColor: partyColor(selectedCouncillor.party) + "22",
                      borderWidth: 3,
                      borderColor: partyColor(selectedCouncillor.party) + "55",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 10,
                    }}
                  >
                    <Text
                      style={{
                        color: partyColor(selectedCouncillor.party),
                        fontWeight: "800",
                        fontSize: 22,
                      }}
                    >
                      {partyInitials(selectedCouncillor.party)}
                    </Text>
                  </View>
                  <Text
                    style={{ color: colors.foreground, fontSize: 20, fontWeight: "800" }}
                  >
                    {selectedCouncillor.surname}, {selectedCouncillor.fullName}
                  </Text>
                </View>

                {/* Details */}
                {[
                  { label: "Party", value: selectedCouncillor.party },
                  { label: "Province", value: selectedCouncillor.province },
                  { label: "Municipality", value: selectedCouncillor.municipality },
                  { label: "Ward / List Order", value: selectedCouncillor.wardListOrder },
                  { label: "Seat Type", value: selectedCouncillor.seatType },
                ].map(({ label, value }) => (
                  <View
                    key={label}
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      paddingVertical: 10,
                      borderBottomWidth: 0.5,
                      borderBottomColor: colors.border,
                    }}
                  >
                    <Text style={{ color: colors.mutedForeground, fontSize: 13, flex: 1 }}>
                      {label}
                    </Text>
                    <Text
                      style={{
                        color: colors.foreground,
                        fontSize: 13,
                        fontWeight: "600",
                        flex: 2,
                        textAlign: "right",
                      }}
                    >
                      {value}
                    </Text>
                  </View>
                ))}

                <TouchableOpacity
                  onPress={() => setSelectedCouncillor(null)}
                  style={{
                    marginTop: 20,
                    backgroundColor: colors.primary,
                    borderRadius: 12,
                    paddingVertical: 12,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>Close</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      </Modal>
    </ScreenContainer>
  );
}
