const compactFormatter = new Intl.NumberFormat("pt-BR", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const integerFormatter = new Intl.NumberFormat("pt-BR");

const MONTHS_SHORT = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
];

const MONTHS_LONG = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export function formatCompact(value: number) {
  return compactFormatter.format(value);
}

export function formatNumber(value: number) {
  return integerFormatter.format(value);
}

export function formatDecimal(value: number, digits = 1) {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatSigned(value: number, digits = 1) {
  const formatted = formatDecimal(Math.abs(value), digits);
  return `${value >= 0 ? "+" : "−"}${formatted}%`;
}

export function parseISODate(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return { year, month, day };
}

export function formatShortDate(iso: string) {
  const { year, month, day } = parseISODate(iso);
  return `${String(day).padStart(2, "0")} ${MONTHS_SHORT[month - 1]} ${year}`;
}

export function formatDay(iso: string) {
  const { day } = parseISODate(iso);
  return String(day).padStart(2, "0");
}

export function formatMonth(iso: string) {
  const { month } = parseISODate(iso);
  return MONTHS_SHORT[month - 1];
}

export function formatMonthYear(iso: string) {
  const { year, month } = parseISODate(iso);
  return `${MONTHS_LONG[month - 1]} ${year}`;
}

export function formatMonthKey(key: string) {
  const [year, month] = key.split("-").map(Number);
  return `${MONTHS_LONG[month - 1]} ${year}`;
}

export function formatMonthShortKey(key: string) {
  const [year, month] = key.split("-").map(Number);
  return `${MONTHS_SHORT[month - 1]}/${String(year).slice(2)}`;
}
