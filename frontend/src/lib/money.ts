export function parseMinorUnits(amount: string | number): bigint {
  const value = (typeof amount === 'number' ? amount.toString() : amount).trim();
  if (!value) return BigInt(0);

  const negative = value.startsWith('-');
  const digits = negative ? value.slice(1) : value;
  const [wholePart = '', fractionPart = ''] = digits.split('.');
  const whole = wholePart === '' ? '0' : wholePart;
  const fraction = (fractionPart + '00').slice(0, 2);

  let minor: bigint;
  try {
    minor = BigInt(whole) * BigInt(100) + BigInt(fraction);
  } catch {
    return BigInt(0);
  }

  return negative ? -minor : minor;
}

export function minorUnitsToDecimal(minor: bigint): string {
  const negative = minor < BigInt(0);
  const value = negative ? -minor : minor;
  const whole = value / BigInt(100);
  const fraction = value % BigInt(100);
  const fractionText = fraction.toString().padStart(2, '0');
  return `${negative ? '-' : ''}${whole.toString()}.${fractionText}`;
}

export function sumMinorUnits(amounts: Array<string | number>): bigint {
  return amounts.reduce<bigint>(
    (total, amount) => total + parseMinorUnits(amount),
    BigInt(0),
  );
}

export function formatKes(amount: string | number | bigint): string {
  const minor = typeof amount === 'bigint' ? amount : parseMinorUnits(amount);
  const negative = minor < BigInt(0);
  const value = negative ? -minor : minor;
  const whole = value / BigInt(100);
  const fraction = value % BigInt(100);
  const grouped = whole.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const base =
    fraction === BigInt(0)
      ? grouped
      : `${grouped}.${fraction.toString().padStart(2, '0')}`;
  return `${negative ? '-' : ''}KES ${base}`;
}

export function approvalTierForAmount(amount: string | number): 'MANAGER' | 'MANAGER_AND_FINANCE' {
  return parseMinorUnits(amount) > BigInt(5000000)
    ? 'MANAGER_AND_FINANCE'
    : 'MANAGER';
}
