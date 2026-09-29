import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../../components/Button';
import { deleteContact, fetchContact, saveContact, type TrustedContact } from '../../api/contact';
import type { RootStackParamList } from '../../navigation/types';
import { useAppStore } from '../../state/store';
import { Icon } from '../../theme/Icon';
import { useTheme } from '../../theme/ThemeProvider';

type Props = NativeStackScreenProps<RootStackParamList, 'Contact'>;
type Field = 'name' | 'relation' | 'phone' | 'email' | 'note';

export function ContactScreen({ navigation }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const setHasTrustedContact = useAppStore((state) => state.setHasTrustedContact);
  const [contact, setContact] = useState<TrustedContact | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<Field, string>>({ name: '', relation: '', phone: '', email: '', note: '' });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<Field, string>>>({});

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchContact();
      setContact(result);
      setHasTrustedContact(result !== null);
    } catch {
      setError('Não foi possível carregar o contato. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    void fetchContact().then((result) => {
      if (!active) return;
      setContact(result);
      setHasTrustedContact(result !== null);
    }).catch(() => {
      if (active) setError('Não foi possível carregar o contato. Verifique sua conexão.');
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [setHasTrustedContact]);

  function update(field: Field, value: string) {
    setFields((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  }

  function validate(): boolean {
    const next: Partial<Record<Field, string>> = {};
    if (fields.name.trim().length < 2 || fields.name.trim().length > 80) next.name = 'Informe um nome de 2 a 80 caracteres.';
    if (!fields.relation.trim() || fields.relation.trim().length > 40) next.relation = 'Informe uma relação de até 40 caracteres.';
    if (!/^\d{10,11}$/.test(fields.phone.replace(/\D/g, ''))) next.phone = 'Informe um telefone com 10 ou 11 dígitos.';
    if (fields.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) next.email = 'Informe um e-mail válido.';
    if (fields.note.length > 500) next.note = 'Use no máximo 500 caracteres.';
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  async function save() {
    if (!validate() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const result = await saveContact({
        name: fields.name.trim(),
        relation: fields.relation.trim(),
        phone: fields.phone,
        ...(fields.email.trim() ? { email: fields.email.trim() } : {}),
        ...(fields.note ? { note: fields.note } : {}),
      });
      setContact(result);
      setHasTrustedContact(true);
      setFields({ name: '', relation: '', phone: '', email: '', note: '' });
    } catch {
      setError('Não foi possível cadastrar o contato. Verifique sua conexão e tente novamente.');
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await deleteContact();
      setContact(null);
      setHasTrustedContact(false);
    } catch {
      setError('Não foi possível remover o contato. Tente novamente.');
    } finally {
      setBusy(false);
    }
  }

  function confirmRemove() {
    Alert.alert('Remover contato', 'Deseja remover seu contato de confiança?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover contato', style: 'destructive', onPress: () => void remove() },
    ]);
  }

  const input = (field: Field, label: string, placeholder: string, multiline = false) => (
    <View style={styles.fieldGroup} key={field}>
      <Text style={{ color: theme.colors.text2, fontFamily: theme.typography.listItem.family }}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.text2}
        value={fields[field]}
        onChangeText={(value) => update(field, value)}
        keyboardType={field === 'phone' ? 'phone-pad' : field === 'email' ? 'email-address' : 'default'}
        autoCapitalize={field === 'email' ? 'none' : 'sentences'}
        autoComplete={field === 'phone' ? 'tel' : field === 'email' ? 'email' : 'off'}
        multiline={multiline}
        style={[styles.input, multiline && styles.multiline, { borderColor: fieldErrors[field] ? theme.colors.red : theme.colors.border, backgroundColor: theme.colors.surface, color: theme.colors.text }]}
      />
      {fieldErrors[field] ? <Text accessibilityRole="alert" style={{ color: theme.colors.red }}>{fieldErrors[field]}</Text> : null}
    </View>
  );

  return (
    <ScrollView style={{ backgroundColor: theme.colors.bg }} contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 30, paddingHorizontal: theme.spacing.marginX, flexGrow: 1 }}>
      <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={() => navigation.goBack()} style={styles.back}>
        <Icon glyph="back" size={20} color={theme.colors.text} />
      </Pressable>
      <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.typography.screenTitle.family }]}>Contato de confiança</Text>
      {loading ? <ActivityIndicator color={theme.colors.blue} /> : null}
      {error ? <Text accessibilityRole="alert" style={[styles.error, { color: theme.colors.red }]}>{error}</Text> : null}
      {error?.includes('carregar') ? <Button label="Tentar novamente" variant="secondary" onPress={() => void load()} /> : null}
      {!loading && !contact && !error?.includes('carregar') ? (
        <>
          <Text style={[styles.intro, { color: theme.colors.text2 }]}>Escolha alguém que possa confirmar sua identidade e agir com você em uma emergência.</Text>
          {input('name', 'Nome', 'Ex.: Marina Alves')}
          {input('relation', 'Relação', 'Ex.: irmã, cônjuge, amigo')}
          {input('phone', 'Telefone', '(11) 90000-0000')}
          {input('note', 'O que essa pessoa deve fazer', 'Ex.: confirmar por ligação antes de qualquer transferência', true)}
          {input('email', 'E-mail (opcional)', 'Ex.: marina@exemplo.com')}
          <Button label="Cadastrar contato" loading={busy} onPress={() => void save()} />
        </>
      ) : null}
      {contact ? (
        <>
          <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <View style={styles.person}>
              <View style={[styles.avatar, { backgroundColor: theme.colors.deep }]}><Text style={styles.initial}>{contact.name[0]?.toUpperCase()}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.name, { color: theme.colors.text }]}>{contact.name}</Text>
                <Text style={{ color: theme.colors.text2 }}>{contact.relation}</Text>
              </View>
            </View>
            <View style={[styles.details, { borderColor: theme.colors.border }]}>
              <Text style={{ color: theme.colors.text }}>{contact.phoneMasked}</Text>
              {contact.emailMasked ? <Text style={{ color: theme.colors.text2 }}>{contact.emailMasked}</Text> : null}
              {contact.note ? <Text style={{ color: theme.colors.text2 }}>{contact.note}</Text> : null}
            </View>
          </View>
          <Button label="Ver Protocolo familiar" variant="secondary" onPress={() => navigation.navigate('FamilyProtocol')} />
          <Pressable accessibilityRole="button" accessibilityLabel="Remover contato" onPress={confirmRemove} style={styles.remove}>
            <Text style={{ color: theme.colors.red }}>Remover contato</Text>
          </Pressable>
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  back: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 25, marginBottom: 18 },
  intro: { fontSize: 14, lineHeight: 23, marginBottom: 20 },
  fieldGroup: { gap: 7, marginBottom: 15 },
  input: { minHeight: 54, borderWidth: 1.5, borderRadius: 16, paddingHorizontal: 16 },
  multiline: { minHeight: 98, textAlignVertical: 'top', paddingTop: 14 },
  error: { marginBottom: 16 },
  card: { padding: 22, borderRadius: 22, borderWidth: 1, gap: 18, marginBottom: 18 },
  person: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  avatar: { width: 56, height: 56, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  initial: { color: '#fff', fontSize: 21, fontWeight: '600' },
  name: { fontSize: 18, fontWeight: '600' },
  details: { gap: 9, borderTopWidth: 1, paddingTop: 16 },
  remove: { minHeight: 52, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
});
