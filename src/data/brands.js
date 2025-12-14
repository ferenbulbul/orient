const encode = (color) => color.replace(/#/g, '%23')

const createLogo = (primary, accent, stroke = '#ffffff') => {
  const p = encode(primary)
  const a = encode(accent)
  const s = encode(stroke)

  return `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'><rect width='120' height='120' rx='26' fill='${p}'/><circle cx='60' cy='48' r='28' fill='${a}' opacity='0.9'/><path d='M20 96L60 28L100 96' fill='none' stroke='${s}' stroke-width='6' stroke-linecap='round' stroke-linejoin='round'/><path d='M28 84h64' stroke='${a}' stroke-width='4' stroke-linecap='round' opacity='0.35'/></svg>`
}

export const BRAND_LOGOS = [
  { id: 'atlas', name: 'Atlas Holding', logo: createLogo('#0f172a', '#facc15') },
  { id: 'nova', name: 'Nova Enerji', logo: createLogo('#111827', '#38bdf8') },
  { id: 'meridian', name: 'Meridian Lojistik', logo: createLogo('#0f172a', '#34d399') },
  { id: 'sterling', name: 'Sterling Finans', logo: createLogo('#0b1120', '#f472b6') },
  { id: 'kule', name: 'Kule Yapı', logo: createLogo('#020617', '#fb7185') },
  { id: 'horizon', name: 'Horizon Medya', logo: createLogo('#0f172a', '#c084fc') },
  { id: 'lumen', name: 'Lumen Dijital', logo: createLogo('#0a0f1e', '#22d3ee') },
  { id: 'prizma', name: 'Prizma Sağlık', logo: createLogo('#020617', '#fbbf24') },
  { id: 'delta', name: 'Delta Teknoloji', logo: createLogo('#0f172a', '#4ade80') },
  { id: 'aurum', name: 'Aurum Tekstil', logo: createLogo('#0b1120', '#f97316') },
  { id: 'tarla', name: 'Tarla Gıda', logo: createLogo('#0f172a', '#a3e635') },
  { id: 'zenith', name: 'Zenith Turizm', logo: createLogo('#020617', '#f472b6') },
]
