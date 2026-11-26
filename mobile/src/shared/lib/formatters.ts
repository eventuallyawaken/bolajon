/**
 * Utility formatters for Bolajon ERP Mobile
 */

export const formatCurrency = (amount: number | string | bigint): string => {
  const num = typeof amount === 'bigint' ? Number(amount) : Number(amount) || 0;
  return `${num.toLocaleString('uz-UZ').replace(/,/g, ' ')} so‘m`;
};

export const formatDate = (dateStr?: string | Date): string => {
  if (!dateStr) return '';
  const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  if (isNaN(d.getTime())) return String(dateStr);
  return d.toLocaleDateString('uz-UZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const formatTime = (timeStr?: string): string => {
  if (!timeStr) return '';
  return timeStr.slice(0, 5);
};

export const formatPhone = (phone: string): string => {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('998')) {
    return `+998 (${digits.slice(3, 5)}) ${digits.slice(5, 8)}-${digits.slice(8, 10)}-${digits.slice(10, 12)}`;
  }
  return phone;
};
