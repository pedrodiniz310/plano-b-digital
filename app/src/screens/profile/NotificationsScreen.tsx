import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NOTIFICATIONS } from '../../content/notifications';
import { useAppStore } from '../../state/store';
import { Icon } from '../../theme/Icon';
import { useTheme } from '../../theme/ThemeProvider';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Notifications'>;

export function NotificationsScreen({ navigation }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const hasTrustedContact = useAppStore((s) => s.hasTrustedContact);
  const items = NOTIFICATIONS.filter((item) => item.id !== 'n2' || !hasTrustedContact);
  return (
    <ScrollView style={{ backgroundColor: theme.colors.surface }} contentContainerStyle={{ paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24, paddingHorizontal: theme.spacing.marginX, gap: 18 }}>
      <View style={styles.header}>
        <Text style={{ color: theme.colors.text, fontFamily: theme.typography.sectionTitle.family, fontSize: 20 * theme.fontScale }}>Notificações</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Fechar notificações" onPress={() => navigation.goBack()} style={styles.close}><Text style={{ color: theme.colors.text, fontSize: 24 * theme.fontScale }}>×</Text></Pressable>
      </View>
      {items.map((item) => (
        <View key={item.id} style={[styles.row, { borderColor: theme.colors.border }]}>
          <View style={[styles.icon, { backgroundColor: theme.colors.tint }]}><Icon glyph={item.glyph} size={20} color={theme.colors.blueInk} /></View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: theme.colors.text, fontSize: 14 * theme.fontScale, fontFamily: theme.typography.listItem.family }}>{item.title}</Text>
            <Text style={{ color: theme.colors.text2, fontSize: 12 * theme.fontScale, lineHeight: 18 * theme.fontScale }}>{item.description}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', gap: 12, borderBottomWidth: 1, paddingVertical: 14 },
  icon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});
