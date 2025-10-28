export const snakeCase = (str: string): string => {
  if (!str) return '';
  return str
    .replace(/([A-Z])/g, '_$1')
    .replace(/([a-z])([0-9])/g, '$1_$2')
    .toLowerCase();
};

export const formatWhatsAppNumber = (number: string | undefined | null): string => {
    if (!number) return '';
    let sanitizedNumber = number.replace(/\D/g, '');
    if (sanitizedNumber.length > 0 && !sanitizedNumber.startsWith('55')) {
        sanitizedNumber = `55${sanitizedNumber}`;
    }
    return sanitizedNumber;
};