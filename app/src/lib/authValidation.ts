const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i;

export interface SignupForm {
  name: string;
  email: string;
  pass: string;
  pass2: string;
}

export interface LoginForm {
  email: string;
  pass: string;
}

export type FieldErrors = Partial<Record<'name' | 'email' | 'pass' | 'pass2', string>>;

export function validateSignup(f: SignupForm): FieldErrors {
  const err: FieldErrors = {};
  if (f.name.trim().length < 2) err.name = 'Informe seu primeiro nome.';
  if (!EMAIL_RE.test(f.email.trim())) err.email = 'Digite um e-mail válido, como nome@email.com.';
  if (f.pass.length < 8) err.pass = 'Use ao menos 8 caracteres.';
  else if (!/\d/.test(f.pass)) err.pass = 'Inclua ao menos um número.';
  if (f.pass2 !== f.pass) err.pass2 = 'As senhas não são iguais.';
  return err;
}

export function validateLogin(f: LoginForm): FieldErrors {
  const err: FieldErrors = {};
  if (!EMAIL_RE.test(f.email.trim())) err.email = 'Digite um e-mail válido, como nome@email.com.';
  if (f.pass.length < 8) err.pass = 'Use ao menos 8 caracteres.';
  return err;
}

export function validateEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim());
}

export interface PasswordStrength {
  widthPercent: number;
  label: string;
  color: string;
}

/** 0-1 pontos = fraca, 2 = média, 3 = forte (ver README, seção Login e cadastro). */
export function passwordStrength(pass: string): PasswordStrength | null {
  if (!pass) return null;
  let points = 0;
  if (pass.length >= 8) points++;
  if (/\d/.test(pass) && /[a-zA-Z]/.test(pass)) points++;
  if (pass.length >= 12 || /[^a-zA-Z0-9]/.test(pass)) points++;

  if (points <= 1) return { widthPercent: 33, label: 'Senha fraca', color: '#E5484D' };
  if (points === 2) return { widthPercent: 66, label: 'Senha média', color: '#F4B740' };
  return { widthPercent: 100, label: 'Senha forte', color: '#2DBE78' };
}

/** E-mail mascarado: duas primeiras letras + pontos + domínio (ex. `pe•••@gmail.com`). */
export function maskEmail(email: string): string {
  const [name, domain] = email.split('@');
  if (!domain) return '';
  return name.slice(0, 2) + '•'.repeat(Math.max(3, name.length - 2)) + '@' + domain;
}
