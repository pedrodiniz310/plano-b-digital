export function maskPhone(phone: string): string {
  return `(${phone.slice(0, 2)}) •••••-${phone.slice(-4)}`;
}

export function maskEmail(email: string): string {
  const at = email.indexOf('@');
  return `${email[0]}•••${email.slice(at)}`;
}
