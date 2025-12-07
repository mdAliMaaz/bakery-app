const defaultFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export const formatINR = (value: number, options?: Intl.NumberFormatOptions): string => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return defaultFormatter.format(0);
  }

  if (!options) {
    return defaultFormatter.format(value);
  }

  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    ...options,
  });

  return formatter.format(value);
};

