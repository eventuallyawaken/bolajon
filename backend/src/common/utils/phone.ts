/**
 * Telefon raqamlarini turlicha kiritish formatlarini (bo'sh joyli/bo'sh joysiz) moslashtirish yordamchilari
 */

export function normalizePhoneCompact(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (!digits) return phone.trim();
  if (digits.startsWith('998') && digits.length === 12) {
    return `+${digits}`;
  }
  if (digits.length === 9) {
    return `+998${digits}`;
  }
  return `+${digits}`;
}

export function formatUzPhoneSpaced(phone: string): string {
  const compact = normalizePhoneCompact(phone);
  const digits = compact.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('998')) {
    return `+998 ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10, 12)}`;
  }
  return compact;
}

export function buildPhoneVariants(phone: string): string[] {
  const trimmed = phone.trim();
  const compact = normalizePhoneCompact(trimmed);
  const spaced = formatUzPhoneSpaced(trimmed);
  const noPlus = compact.replace(/^\+/, '');
  const local9 = noPlus.startsWith('998') ? noPlus.slice(3) : noPlus;

  return Array.from(new Set([trimmed, compact, spaced, noPlus, local9].filter(Boolean)));
}
