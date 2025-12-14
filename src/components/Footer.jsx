function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="w-full bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-400 text-lg font-semibold text-slate-950">
              OR
            </div>
            <div>
              <p className="text-lg font-semibold text-white">Orient Matbaa</p>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Kurumsal Baskı
              </p>
            </div>
          </div>

          <div className="max-w-md text-sm text-slate-300">
            Kalıp hazırlıktan dağıtıma kadar tüm baskı süreçlerini tek çatı altında
            yönetir, markanız için tutarlı ve zamanında çözümler sunarız.
          </div>

          <div className="text-sm text-slate-300">
            <p className="font-semibold text-white">İletişim</p>
            <p className="mt-2">Tel: +90 (216) 000 00 00</p>
            <p>E-posta: info@orientmatbaa.com</p>
            <p>Adres: İkitelli OSB, İstanbul</p>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-sm text-slate-500">
          © {year} Orient. Tüm hakları saklıdır.
        </div>
      </div>
    </footer>
  )
}

export default Footer
