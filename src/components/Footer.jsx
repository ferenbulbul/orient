import logo from '../assets/logo.svg'

function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="w-full bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="flex items-center gap-4">
            <img src={logo} alt="Euromat Print logo" className="h-14 w-auto object-contain brightness-0 invert" />
          </div>

          <div className="max-w-md text-sm text-slate-300">
            Kalıp hazırlıktan dağıtıma kadar tüm baskı süreçlerini tek çatı altında
            yönetir, markanız için tutarlı ve zamanında çözümler sunarız.
          </div>

          <div className="text-sm text-slate-300">
            <p className="font-semibold text-white">İletişim</p>
            <p className="mt-2">Tel: +90 (216) 000 00 00</p>
            <p>E-posta: info@euromatprint.com</p>
            <p>Adres: İkitelli OSB, İstanbul</p>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-sm text-slate-500">
          © {year} EuromatPrint. Tüm hakları saklıdır.
        </div>
      </div>
    </footer>
  )
}

export default Footer
