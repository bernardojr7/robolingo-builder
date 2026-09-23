import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen, SectionTitle, StatPill, TopBar } from '@/components/RobolingoUI';
import { useAppState } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';

const shopItems = [
  { id: 'hair_blue', title: 'Cabelo neon', category: 'Visual', price: 180, icon: 'color-palette-outline' as const },
  { id: 'glasses_star', title: 'Óculos estrela', category: 'Acessório', price: 240, icon: 'glasses-outline' as const },
  { id: 'jacket_space', title: 'Jaqueta espacial', category: 'Roupa', price: 320, icon: 'shirt-outline' as const },
  { id: 'pet_bot', title: 'Mini bot', category: 'Companheiro', price: 420, icon: 'paw-outline' as const },
];

export default function ShopScreen() {
  const colors = useColors();
  const { player, buyItem, hasItem } = useAppState();
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <Screen>
      <TopBar title="Loja do Robolingo" subtitle="Personalize sua aventura" />
      <View style={styles.balanceRow}>
        <StatPill icon="wallet-outline" value={player.coins} label="moedas disponíveis" tone="purple" />
        <StatPill icon="diamond-outline" value={player.gems} label="gems" tone="primary" />
      </View>

      <SectionTitle title="Itens em destaque" />
      {notice ? (
        <View style={[styles.notice, { backgroundColor: colors.secondary }]}>
          <Ionicons name="information-circle-outline" size={18} color={colors.secondaryForeground} />
          <Text style={[styles.noticeText, { color: colors.secondaryForeground }]}>{notice}</Text>
        </View>
      ) : null}
      <View style={styles.itemGrid}>
        {shopItems.map((item) => {
          const owned = hasItem(item.id);
          return (
            <View key={item.id} style={[styles.itemCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.itemVisual, { backgroundColor: colors.secondary }]}>
                <Ionicons name={item.icon} size={36} color={colors.primary} />
                {owned ? (
                  <View style={[styles.ownedBadge, { backgroundColor: colors.success }]}>
                    <Ionicons name="checkmark" size={12} color={colors.primaryForeground} />
                  </View>
                ) : null}
              </View>
              <Text style={[styles.itemCategory, { color: colors.mutedForeground }]}>{item.category}</Text>
              <Text style={[styles.itemTitle, { color: colors.foreground }]}>{item.title}</Text>
              <Pressable
                disabled={owned}
                onPress={() => {
                  const purchased = buyItem(item.id, item.price);
                  setNotice(purchased ? `${item.title} adicionado ao seu armário.` : 'Você precisa de mais moedas para este item.');
                }}
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.buyButton,
                  {
                    backgroundColor: owned ? colors.muted : colors.primary,
                    opacity: pressed ? 0.78 : 1,
                  },
                ]}
              >
                <Text style={[styles.buyText, { color: owned ? colors.mutedForeground : colors.primaryForeground }]}>
                  {owned ? 'Adquirido' : `${item.price} moedas`}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  balanceRow: {
    flexDirection: 'row',
    gap: 9,
  },
  notice: {
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  noticeText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    flex: 1,
  },
  itemGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 11,
  },
  itemCard: {
    width: '48%',
    borderWidth: 1,
    borderRadius: 20,
    padding: 10,
  },
  itemVisual: {
    height: 106,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  ownedBadge: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 23,
    height: 23,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemCategory: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    marginTop: 10,
  },
  itemTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    marginTop: 3,
    minHeight: 33,
  },
  buyButton: {
    borderRadius: 12,
    minHeight: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 9,
  },
  buyText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
  },
});