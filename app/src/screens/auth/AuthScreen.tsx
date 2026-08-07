import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../../components/Button';
import { TextField } from '../../components/TextField';
import { Icon } from '../../theme/Icon';
import { useTheme } from '../../theme/ThemeProvider';
import { useAppStore } from '../../state/store';
import { secureStore } from '../../state/secureStore';
import { guest, login, signup } from '../../api/auth';
import { ApiError, refreshSession } from '../../api/client';
import { passwordStrength, validateLogin, validateSignup, type FieldErrors } from '../../lib/authValidation';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Auth'>;

type Mode = 'signup' | 'login';

export function AuthScreen({ route, navigation }: Props) {
  const theme = useTheme();
  const setSession = useAppStore((s) => s.setSession);

  const [mode, setMode] = useState<Mode>(route.params?.mode ?? 'signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [pass2, setPass2] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [canUseBiometrics, setCanUseBiometrics] = useState(false);

  useEffect(() => {
    (async () => {
      const [hardware, storedRefresh] = await Promise.all([
        LocalAuthentication.hasHardwareAsync(),
        secureStore.getRefreshToken(),
      ]);
      setCanUseBiometrics(hardware && !!storedRefresh);
    })();
  }, []);

  const isSignup = mode === 'signup';
  const strength = isSignup ? passwordStrength(pass) : null;

  function clearFieldError(field: keyof FieldErrors) {
    setErrors((e) => {
      if (!e[field]) return e;
      const next = { ...e };
      delete next[field];
      return next;
    });
  }

  async function goToApp(label: string) {
    navigation.replace('Verifying', { label });
  }

  async function handleSubmit() {
    setFormError('');
    const err = isSignup ? validateSignup({ name, email, pass, pass2 }) : validateLogin({ email, pass });
    if (Object.keys(err).length) {
      setErrors(err);
      return;
    }
    setSubmitting(true);
    try {
      const session = isSignup
        ? await signup({ name: name.trim(), email: email.trim(), password: pass })
        : await login({ email: email.trim(), password: pass });
      await setSession(session.user, session);
      await goToApp(isSignup ? 'Criando seu espaço seguro' : 'Entrando na sua conta');
    } catch (e) {
      setFormError(e instanceof ApiError ? e.message : 'Não foi possível continuar. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGuest() {
    setSubmitting(true);
    setFormError('');
    try {
      const session = await guest();
      await setSession(session.user, session);
      await goToApp('Preparando modo visitante');
    } catch (e) {
      setFormError(e instanceof ApiError ? e.message : 'Não foi possível entrar como visitante agora.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleBiometrics() {
    setFormError('');
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Confirme sua identidade',
      cancelLabel: 'Cancelar',
    });
    if (!result.success) return;
    setSubmitting(true);
    try {
      const session = await refreshSession();
      if (!session) {
        setFormError('Sua sessão expirou. Entre novamente com e-mail e senha.');
        return;
      }
      await setSession(session.user, session);
      await goToApp('Confirmando sua identidade');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.bg }}
      contentContainerStyle={[styles.container, { paddingHorizontal: theme.spacing.marginX, paddingTop: theme.spacing.screenTop }]}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.typography.screenTitle.family }]}>
        {isSignup ? 'Criar sua conta' : 'Bem-vindo de volta'}
      </Text>
      <Text style={[styles.subtitle, { color: theme.colors.text2, fontFamily: theme.typography.body.family }]}>
        {isSignup ? 'Leva menos de um minuto. Você pode revisar tudo depois.' : 'Entre para retomar seu Plano B de onde parou.'}
      </Text>

      <View style={[styles.tabs, { backgroundColor: theme.colors.soft }]}>
        {(['signup', 'login'] as Mode[]).map((m) => {
          const active = mode === m;
          return (
            <Pressable
              key={m}
              accessibilityRole="button"
              onPress={() => {
                setMode(m);
                setErrors({});
                setFormError('');
              }}
              style={[
                styles.tab,
                { backgroundColor: active ? theme.colors.surface : 'transparent' },
                active ? theme.shadow.card : null,
              ]}
            >
              <Text style={{ color: active ? theme.colors.text : theme.colors.text2, fontWeight: active ? '600' : '400' }}>
                {m === 'signup' ? 'Criar conta' : 'Entrar'}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.form}>
        {isSignup ? (
          <TextField label="Nome" value={name} onChangeText={(v) => { setName(v); clearFieldError('name'); }} error={errors.name} autoCapitalize="words" />
        ) : null}
        <TextField
          label="E-mail"
          value={email}
          onChangeText={(v) => { setEmail(v); clearFieldError('email'); }}
          error={errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextField
          label="Senha"
          value={pass}
          onChangeText={(v) => { setPass(v); clearFieldError('pass'); }}
          error={errors.pass}
          secure
        />
        {strength ? (
          <View style={styles.strengthWrap}>
            <View style={[styles.strengthTrack, { backgroundColor: theme.colors.soft }]}>
              <View style={[styles.strengthFill, { width: `${strength.widthPercent}%`, backgroundColor: strength.color }]} />
            </View>
            <Text style={[styles.strengthLabel, { color: theme.colors.text2 }]}>{strength.label}</Text>
          </View>
        ) : null}
        {isSignup ? (
          <TextField label="Confirmar senha" value={pass2} onChangeText={(v) => { setPass2(v); clearFieldError('pass2'); }} error={errors.pass2} secure />
        ) : null}

        {!isSignup ? (
          <Pressable accessibilityRole="button" onPress={() => navigation.navigate('Recover')}>
            <Text style={[styles.link, { color: theme.colors.blueInk }]}>Esqueci meu acesso</Text>
          </Pressable>
        ) : null}

        {formError ? <Text style={[styles.formError, { color: theme.colors.red }]}>{formError}</Text> : null}

        <Button label={isSignup ? 'Criar conta' : 'Entrar'} onPress={handleSubmit} loading={submitting} />
      </View>

      <View style={styles.dividerRow}>
        <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
        <Text style={{ color: theme.colors.text2 }}>ou</Text>
        <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
      </View>

      {canUseBiometrics ? (
        <Button label="Entrar com biometria" variant="secondary" onPress={handleBiometrics} disabled={submitting} />
      ) : null}
      <View style={{ height: 12 }} />
      <Button label="Continuar como visitante" variant="dashed" onPress={handleGuest} disabled={submitting} />

      <View style={[styles.footerNote, { backgroundColor: theme.colors.tint }]}>
        <Icon glyph="lock" size={16} color={theme.colors.blueInk} />
        <Text style={[styles.footerNoteText, { color: theme.colors.blueInk }]}>
          Seus dados são protegidos com criptografia e usados só para o seu Plano B.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 48, gap: 4 },
  title: { fontSize: 25 },
  subtitle: { fontSize: 15, marginTop: 6, marginBottom: 20 },
  tabs: { flexDirection: 'row', borderRadius: 99, padding: 4, marginBottom: 24 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 99, alignItems: 'center' },
  form: { gap: 16 },
  strengthWrap: { gap: 4, marginTop: -8 },
  strengthTrack: { height: 4, borderRadius: 2, overflow: 'hidden' },
  strengthFill: { height: 4, borderRadius: 2 },
  strengthLabel: { fontSize: 12 },
  link: { fontSize: 13, textAlign: 'right' },
  formError: { fontSize: 13 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 24 },
  dividerLine: { flex: 1, height: 1 },
  footerNote: { flexDirection: 'row', gap: 10, alignItems: 'center', padding: 14, borderRadius: 14, marginTop: 24 },
  footerNoteText: { flex: 1, fontSize: 12, lineHeight: 17 },
});
