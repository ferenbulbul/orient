// TR locale number/price/phone formatters

/** 1000 → "1.000" (TR binlik ayırıcı) */
export function formatNumber(n) {
  if (n == null) return '-'
  return Number(n).toLocaleString('tr-TR')
}

/** 25000 → "25.000 TL" */
export function formatPrice(n) {
  if (n == null) return '-'
  return `${Number(n).toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} TL`
}

/** Raw digits → (5XX) XXX XX XX format */
export function formatPhone(value) {
  const digits = value.replace(/\D/g, '')
  const num = digits.startsWith('90') ? digits.slice(2) : digits
  const limited = num.slice(0, 10)

  if (limited.length === 0) return ''
  if (limited.length <= 3) return `(${limited}`
  if (limited.length <= 6) return `(${limited.slice(0, 3)}) ${limited.slice(3)}`
  if (limited.length <= 8) return `(${limited.slice(0, 3)}) ${limited.slice(3, 6)} ${limited.slice(6)}`
  return `(${limited.slice(0, 3)}) ${limited.slice(3, 6)} ${limited.slice(6, 8)} ${limited.slice(8)}`
}

/** Formatted → +90XXXXXXXXXX */
export function phoneToRaw(formatted) {
  const digits = formatted.replace(/\D/g, '')
  return digits.length > 0 ? `+90${digits}` : ''
}

/** +90XXXXXXXXXX → (5XX) XXX XX XX */
export function rawToDisplay(raw) {
  if (!raw) return ''
  const digits = raw.replace(/\D/g, '')
  const num = digits.startsWith('90') ? digits.slice(2) : digits
  return formatPhone(num)
}

/** 10 hane girilmiş mi? */
export function isValidPhone(formatted) {
  const digits = formatted.replace(/\D/g, '')
  return digits.length === 10
}
