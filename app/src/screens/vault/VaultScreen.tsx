import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, ActivityIndicator, Animated, AppState, Easing, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as LocalAuthentication from 'expo-local-authentication';
import { getRandomBytes } from 'expo-crypto';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../../components/Button';
import { deleteVaultItem, fetchVaultItems, saveVaultItem } from '../../api/vault';
import { VAULT_PROMPTS } from '../../content/vault';
import { decryptEntry, encryptEntry, getOrCreateVaultKey, vaultAad } from '../../lib/vaultCrypto';
import type { RootStackParamList } from '../../navigation/types';
import { useAppStore } from '../../state/store';
import { Icon } from '../../theme/Icon';
import { useTheme } from '../../theme/ThemeProvider';

type Props = NativeStackScreenProps<RootStackParamList, 'Vault'>;
type OpenItem = { value: string; label?: string; unreadable?: boolean };
type Editor = { promptId: string; label: string; value: string; custom: boolean };

const LOCK_MS = 45_000;
const SCAN_MS = 1_400;

function customId(): string {
  return `c-${Array.from(getRandomBytes(8), (byte) => byte.toString(16).padStart(2, '0')).join('')}`;
}

export function VaultScreen({ navigation }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const userId = useAppStore((state) => state.user?.id);
  const [unlocked, setUnlocked] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [manualUnlock, setManualUnlock] = useState(false);
  const [items, setItems] = useState<Record<string, OpenItem>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [editor, setEditor] = useState<Editor | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const keyRef = useRef<Uint8Array | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const epochRef = useRef(0);
  const [scanPosition] = useState(() => new Animated.Value(-34));

  function lock() {
    epochRef.current++;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    keyRef.current = null;
    setItems({});
    setRevealed({});
    setEditor(null);
    setUnlocked(false);
    setLoaded(false);
    setScanning(false);
    setBusy(false);
    setError(null);
  }

  function touch() {
    if (!keyRef.current) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(lock, LOCK_MS);
  }

  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion).catch(() => {});
  }, []);

  useEffect(() => {
    if (!scanning || reduceMotion) return;
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(scanPosition, { toValue: 34, duration: SCAN_MS / 2, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(scanPosition, { toValue: -34, duration: SCAN_MS / 2, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ]));
    animation.start();
    return () => animation.stop();
  }, [scanning, reduceMotion, scanPosition]);

  useEffect(() => {
    const epoch = epochRef;
    const key = keyRef;
    const timer = timerRef;
    const appSubscription = AppState.addEventListener('change', (state) => {
      if (state === 'background') lock();
    });
    const blurSubscription = navigation.addListener('blur', lock);
    return () => {
      appSubscription.remove();
      blurSubscription();
      epoch.current++;
      key.current = null;
      if (timer.current) clearTimeout(timer.current);
    };
  }, [navigation]);

  useEffect(() => {
    const timer = setTimeout(lock, 0);
    return () => clearTimeout(timer);
  }, [userId]);

  async function loadItems(key: Uint8Array, epoch: number) {
    if (!userId) return;
    try {
      const response = await fetchVaultItems();
      const next: Record<string, OpenItem> = {};
      for (const item of response.items) {
        try {
          const parsed: unknown = JSON.parse(decryptEntry(key, item, vaultAad(userId, item.promptId)));
          if (typeof parsed !== 'object' || parsed === null || !('value' in parsed) || typeof parsed.value !== 'string') throw new Error('invalid');
          const label = 'label' in parsed && typeof parsed.label === 'string' ? parsed.label : undefined;
          if (item.promptId.startsWith('c-') && !label) throw new Error('invalid');
          next[item.promptId] = { value: parsed.value, label };
        } catch {
          next[item.promptId] = { value: '', unreadable: true };
        }
      }
      if (epoch === epochRef.current) { setItems(next); setLoaded(true); setError(null); }
    } catch {
      if (epoch === epochRef.current) setError('Não foi possível carregar o cofre. Verifique sua conexão e tente novamente.');
    }
  }

  async function open(explicitFallback = false) {
    if (!userId || scanning) return;
    const epoch = ++epochRef.current;
    setError(null);
    setScanning(true);
    try {
      if (!explicitFallback) {
        const [hardware, enrolled] = await Promise.all([
          LocalAuthentication.hasHardwareAsync(), LocalAuthentication.isEnrolledAsync(),
        ]);
        if (!hardware || !enrolled) {
          if (epoch === epochRef.current) setManualUnlock(true);
          return;
        }
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Desbloquear Cofre de Preparação',
          cancelLabel: 'Cancelar',
          disableDeviceFallback: false,
        });
        if (!result.success) return;
      }
      const [key] = await Promise.all([
        getOrCreateVaultKey(),
        reduceMotion ? Promise.resolve() : new Promise<void>((resolve) => setTimeout(resolve, SCAN_MS)),
      ]);
      if (epoch !== epochRef.current) return;
      keyRef.current = key;
      setUnlocked(true);
      touch();
      await loadItems(key, epoch);
    } catch {
      if (epoch === epochRef.current) setError('Não foi possível desbloquear o cofre. Tente novamente.');
    } finally {
      if (epoch === epochRef.current) setScanning(false);
    }
  }

  function edit(promptId: string, custom: boolean) {
    touch();
    const item = items[promptId];
    setEditor({ promptId, custom, label: item?.label ?? '', value: item?.value ?? '' });
    setError(null);
  }

  async function save() {
    if (!editor || !keyRef.current || !userId || busy) return;
    touch();
    if (!editor.value.trim() || (editor.custom && !editor.label.trim())) {
      setError('Preencha o valor e, para informações personalizadas, o rótulo.');
      return;
    }
    const epoch = epochRef.current;
    setBusy(true);
    setError(null);
    try {
      const plaintext = JSON.stringify(editor.custom
        ? { label: editor.label.trim(), value: editor.value }
        : { value: editor.value });
      const encrypted = encryptEntry(keyRef.current, plaintext, vaultAad(userId, editor.promptId));
      await saveVaultItem(editor.promptId, encrypted);
      if (epoch === epochRef.current) {
        setItems((current) => ({ ...current, [editor.promptId]: { value: editor.value, ...(editor.custom ? { label: editor.label.trim() } : {}) } }));
        setEditor(null);
        touch();
      }
    } catch {
      if (epoch === epochRef.current) setError('Não foi possível salvar. Verifique sua conexão e tente novamente.');
    } finally {
      if (epoch === epochRef.current) setBusy(false);
    }
  }

  async function remove(promptId: string) {
    if (busy) return;
    touch();
    const epoch = epochRef.current;
    setBusy(true);
    setError(null);
    try {
      await deleteVaultItem(promptId);
      if (epoch === epochRef.current) {
        setItems((current) => { const next = { ...current }; delete next[promptId]; return next; });
        setEditor(null);
      }
    } catch {
      if (epoch === epochRef.current) setError('Não foi possível excluir. Verifique sua conexão e tente novamente.');
    } finally {
      if (epoch === epochRef.current) setBusy(false);
    }
  }

  const catalog = VAULT_PROMPTS.map((prompt) => ({ ...prompt, item: items[prompt.id], custom: false }));
  const custom = Object.entries(items).filter(([id]) => id.startsWith('c-')).map(([id, item]) => ({
    id, title: item.label ?? 'Informação personalizada', glyph: 'lock' as const, tag: 'Personalizado', item, custom: true,
  }));

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }} onTouchStart={touch}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 30, paddingHorizontal: theme.spacing.marginX, flexGrow: 1 }}>
        <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={() => navigation.goBack()} style={styles.back}>
          <Icon glyph="back" size={20} color={theme.colors.text} />
        </Pressable>
        {!unlocked ? (
          <View style={styles.locked}>
            <View style={[styles.lockIcon, { backgroundColor: theme.colors.tint }]}>
              <Icon glyph="lock" size={50} color={theme.colors.blue} />
              {scanning && !reduceMotion ? <Animated.View style={[styles.scanLine, { backgroundColor: theme.colors.blue, transform: [{ translateY: scanPosition }] }]} /> : null}
            </View>
            <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.typography.screenTitle.family }]}>Cofre de Preparação</Text>
            <Text style={[styles.explanation, { color: theme.colors.text2 }]}>Suas informações críticas ficam protegidas. Confirme sua identidade para abrir.</Text>
            <Button label="Desbloquear com biometria" loading={scanning} onPress={() => void open()} />
            {manualUnlock ? (
              <>
                <Text style={[styles.notice, { color: theme.colors.text2 }]}>Ative um bloqueio de tela neste aparelho para proteger melhor o cofre.</Text>
                <Button label="Desbloquear sem biometria" variant="secondary" onPress={() => void open(true)} />
              </>
            ) : null}
            {error ? <Text accessibilityRole="alert" style={[styles.error, { color: theme.colors.red }]}>{error}</Text> : null}
          </View>
        ) : (
          <>
            <View style={styles.heading}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.typography.screenTitle.family }]}>Cofre de Preparação</Text>
                <Text style={{ color: theme.colors.text2 }}>Bloqueia automaticamente após inatividade</Text>
              </View>
              <Pressable accessibilityRole="button" accessibilityLabel="Bloquear" onPress={lock} style={[styles.lockButton, { borderColor: theme.colors.border }]}>
                <Text style={{ color: theme.colors.text }}>Bloquear</Text>
              </Pressable>
            </View>
            {error ? <Text accessibilityRole="alert" style={[styles.error, { color: theme.colors.red }]}>{error}</Text> : null}
            {error?.includes('carregar') ? <Button label="Tentar carregar novamente" variant="secondary" onPress={() => { if (keyRef.current) void loadItems(keyRef.current, epochRef.current); }} /> : null}
            {loaded ? [...catalog, ...custom].map(({ id, title, glyph, tag, item, custom: isCustom }) => (
              <View key={id} style={[styles.item, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
                <View style={styles.itemHeading}>
                  <View style={[styles.itemIcon, { backgroundColor: theme.colors.tint }]}><Icon glyph={glyph} size={18} color={theme.colors.blueInk} /></View>
                  {/* The callback reads the timer ref only when the user presses it. */}
                  {/* eslint-disable-next-line react-hooks/refs */}
                  <Pressable accessibilityRole="button" accessibilityLabel={`Editar ${title}`} onPress={() => edit(id, isCustom)} style={{ flex: 1, minHeight: 44, justifyContent: 'center' }}>
                    <Text style={{ color: theme.colors.text, fontFamily: theme.typography.listItem.family }}>{title}</Text>
                    <Text style={{ color: theme.colors.text2, fontSize: 11, textTransform: 'uppercase' }}>{tag}</Text>
                  </Pressable>
                  {item && !item.unreadable ? (
                    <Pressable accessibilityRole="button" accessibilityLabel={revealed[id] ? 'Ocultar' : 'Mostrar'} onPress={() => { touch(); setRevealed((current) => ({ ...current, [id]: !current[id] })); }} style={styles.eye}>
                      <Icon glyph={revealed[id] ? 'eyeOff' : 'eye'} size={19} color={theme.colors.text2} />
                    </Pressable>
                  ) : null}
                </View>
                {item?.unreadable ? <Text style={{ color: theme.colors.red }}>Cifrado em outro aparelho — não é possível ler aqui</Text> : (
                  <Pressable accessibilityRole="button" accessibilityLabel={`Editar ${title}`} onPress={() => edit(id, isCustom)} style={[styles.value, { backgroundColor: theme.colors.soft }]}>
                    <Text style={{ color: theme.colors.text }}>{item ? revealed[id] ? item.value : '••••' : 'Toque para adicionar'}</Text>
                  </Pressable>
                )}
                {item ? <Pressable accessibilityRole="button" accessibilityLabel={`Excluir ${title}`} onPress={() => void remove(id)} style={styles.delete}><Text style={{ color: theme.colors.red }}>Excluir</Text></Pressable> : null}
              </View>
            )) : null}
            {loaded && editor ? (
              <View style={[styles.editor, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                <Text style={{ color: theme.colors.text, fontFamily: theme.typography.listItem.family }}>Editar informação</Text>
                {editor.custom ? <TextInput accessibilityLabel="Rótulo" placeholder="Rótulo" placeholderTextColor={theme.colors.text2} value={editor.label} onChangeText={(label) => { touch(); setEditor({ ...editor, label }); }} style={[styles.field, { color: theme.colors.text, borderColor: theme.colors.border }]} /> : null}
                <TextInput accessibilityLabel="Valor" placeholder="Informação" placeholderTextColor={theme.colors.text2} value={editor.value} onChangeText={(value) => { touch(); setEditor({ ...editor, value }); }} multiline style={[styles.field, styles.multiline, { color: theme.colors.text, borderColor: theme.colors.border }]} />
                <Button label="Salvar informação" loading={busy} onPress={() => void save()} />
                <Button label="Cancelar" variant="secondary" onPress={() => setEditor(null)} />
              </View>
            ) : loaded ? <Button label="Adicionar informação" variant="dashed" onPress={() => edit(customId(), true)} /> : null}
            {busy ? <ActivityIndicator color={theme.colors.blue} /> : null}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  back: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  locked: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20, paddingBottom: 50 },
  lockIcon: { width: 112, height: 112, borderRadius: 38, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  scanLine: { position: 'absolute', left: 14, right: 14, top: 55, height: 2 },
  title: { fontSize: 24, letterSpacing: -0.6 },
  explanation: { maxWidth: 290, textAlign: 'center', lineHeight: 24 },
  notice: { textAlign: 'center', lineHeight: 21 },
  error: { marginVertical: 10, lineHeight: 21 },
  heading: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', marginBottom: 20 },
  lockButton: { borderWidth: 1, borderRadius: 13, paddingHorizontal: 12, minHeight: 44, justifyContent: 'center' },
  item: { padding: 16, borderWidth: 1, borderRadius: 18, marginBottom: 10 },
  itemHeading: { flexDirection: 'row', gap: 11, alignItems: 'center', marginBottom: 8 },
  itemIcon: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  eye: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  value: { padding: 12, borderRadius: 12, minHeight: 44, justifyContent: 'center' },
  delete: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-end' },
  editor: { gap: 12, padding: 16, borderWidth: 1, borderRadius: 18, marginVertical: 12 },
  field: { minHeight: 54, borderWidth: 1, borderRadius: 16, paddingHorizontal: 14 },
  multiline: { minHeight: 90, textAlignVertical: 'top', paddingTop: 12 },
});
