import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Image } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { WalletAPI } from '@/lib/wallet-api';
import Toast from 'react-native-toast-message';

interface ShoppingList {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  coupon_count?: number;
  valid_until?: string;
}

interface Coupon {
  id: string;
  title: string;
  description: string;
  discount: string;
  code?: string;
  merchant_name: string;
  valid_until: string;
  terms?: string;
}

export default function WalletShoppingScreen() {
  const colors = useColors();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
  const [selectedList, setSelectedList] = useState<ShoppingList | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const walletAPI = new WalletAPI();

  useEffect(() => {
    fetchShoppingLists();
  }, []);

  const fetchShoppingLists = async () => {
    try {
      setLoading(true);
      const response = await walletAPI.getShoppingLists();
      
      if (response.data && Array.isArray(response.data)) {
        setShoppingLists(response.data);
      } else if (response.success) {
        // Handle different response structures
        const lists = response.data?.lists || response.lists || [];
        setShoppingLists(lists);
      }
    } catch (error: any) {
      console.error('Failed to fetch shopping lists:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to load shopping deals',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchCoupons = async (listId: string) => {
    try {
      setLoadingCoupons(true);
      const response = await walletAPI.getShoppingListCoupons(listId);
      
      if (response.data && Array.isArray(response.data)) {
        setCoupons(response.data);
      } else if (response.success) {
        const coupons = response.data?.coupons || response.coupons || [];
        setCoupons(coupons);
      }
    } catch (error: any) {
      console.error('Failed to fetch coupons:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to load coupons',
      });
    } finally {
      setLoadingCoupons(false);
    }
  };

  const handleListPress = (list: ShoppingList) => {
    setSelectedList(list);
    fetchCoupons(list.id);
  };

  const handleBackToLists = () => {
    setSelectedList(null);
    setCoupons([]);
  };

  const onRefresh = () => {
    setRefreshing(true);
    if (selectedList) {
      fetchCoupons(selectedList.id);
    } else {
      fetchShoppingLists();
    }
  };

  if (loading) {
    return (
      <ScreenContainer>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 16, fontSize: 16, color: colors.text }}>Loading shopping deals...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView 
        style={{ flex: 1, backgroundColor: colors.background }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 60 }}>
          <TouchableOpacity
            onPress={() => selectedList ? handleBackToLists() : router.back()}
            style={{ marginRight: 16 }}
          >
            <IconSymbol name="chevron.left" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 28, fontWeight: '700', color: colors.text }}>
              {selectedList ? selectedList.title : 'Shopping Deals'}
            </Text>
            {selectedList && (
              <Text style={{ fontSize: 14, color: colors.muted, marginTop: 4 }}>
                {selectedList.description}
              </Text>
            )}
          </View>
        </View>

        {/* Shopping Lists View */}
        {!selectedList && (
          <View style={{ padding: 20, paddingTop: 0 }}>
            {shoppingLists.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 60 }}>
                <IconSymbol name="tag.fill" size={64} color={colors.muted} />
                <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text, marginTop: 16 }}>
                  No Deals Available
                </Text>
                <Text style={{ fontSize: 14, color: colors.muted, marginTop: 8, textAlign: 'center' }}>
                  Check back later for exclusive shopping deals and offers
                </Text>
              </View>
            ) : (
              shoppingLists.map((list) => (
                <TouchableOpacity
                  key={list.id}
                  onPress={() => handleListPress(list)}
                  style={{
                    backgroundColor: colors.card,
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  {list.image_url && (
                    <Image
                      source={{ uri: list.image_url }}
                      style={{ width: 60, height: 60, borderRadius: 12, marginRight: 16 }}
                    />
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text }}>
                      {list.title}
                    </Text>
                    <Text style={{ fontSize: 14, color: colors.muted, marginTop: 4 }}>
                      {list.description}
                    </Text>
                    {list.coupon_count && (
                      <Text style={{ fontSize: 12, color: colors.primary, marginTop: 8, fontWeight: '600' }}>
                        {list.coupon_count} coupons available
                      </Text>
                    )}
                  </View>
                  <IconSymbol name="chevron.right" size={20} color={colors.muted} />
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {/* Coupons View */}
        {selectedList && (
          <View style={{ padding: 20, paddingTop: 0 }}>
            {loadingCoupons ? (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={{ marginTop: 16, fontSize: 14, color: colors.muted }}>
                  Loading coupons...
                </Text>
              </View>
            ) : coupons.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 60 }}>
                <IconSymbol name="ticket.fill" size={64} color={colors.muted} />
                <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text, marginTop: 16 }}>
                  No Coupons Available
                </Text>
                <Text style={{ fontSize: 14, color: colors.muted, marginTop: 8, textAlign: 'center' }}>
                  All coupons for this list have been claimed or expired
                </Text>
              </View>
            ) : (
              coupons.map((coupon) => (
                <View
                  key={coupon.id}
                  style={{
                    backgroundColor: colors.card,
                    borderRadius: 16,
                    padding: 20,
                    marginBottom: 16,
                    borderWidth: 2,
                    borderColor: colors.primary + '20',
                    borderStyle: 'dashed',
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>
                        {coupon.title}
                      </Text>
                      <Text style={{ fontSize: 14, color: colors.muted, marginTop: 4 }}>
                        {coupon.merchant_name}
                      </Text>
                    </View>
                    <View style={{
                      backgroundColor: colors.primary + '20',
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 8,
                    }}>
                      <Text style={{ fontSize: 16, fontWeight: '700', color: colors.primary }}>
                        {coupon.discount}
                      </Text>
                    </View>
                  </View>

                  <Text style={{ fontSize: 14, color: colors.text, marginTop: 12, lineHeight: 20 }}>
                    {coupon.description}
                  </Text>

                  {coupon.code && (
                    <View style={{
                      backgroundColor: colors.background,
                      padding: 12,
                      borderRadius: 8,
                      marginTop: 12,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}>
                      <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 4 }}>
                        Coupon Code
                      </Text>
                      <Text style={{ fontSize: 18, fontWeight: '700', color: colors.primary, letterSpacing: 2 }}>
                        {coupon.code}
                      </Text>
                    </View>
                  )}

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.border }}>
                    <View>
                      <Text style={{ fontSize: 12, color: colors.muted }}>Valid Until</Text>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginTop: 2 }}>
                        {new Date(coupon.valid_until).toLocaleDateString()}
                      </Text>
                    </View>
                    {coupon.terms && (
                      <TouchableOpacity
                        onPress={() => {
                          Toast.show({
                            type: 'info',
                            text1: 'Terms & Conditions',
                            text2: coupon.terms,
                          });
                        }}
                      >
                        <Text style={{ fontSize: 14, color: colors.primary, fontWeight: '600' }}>
                          View Terms
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenContainer>
  );
}
