function Contact() {
  return (
    <div className="bg-white text-slate-900">
      <header className="section section--narrow">
        <p className="eyebrow">İletişime Geçin</p>
        <h1>Ofisimizi ziyaret edin ya da hemen arayın.</h1>
        <p>
          Baskı süreçlerinizi planlamak için randevu alabilir veya dosyalarınızı dijital olarak
          iletebilirsiniz. Ekibimiz hafta içi 09:00-19:00 saatleri arasında aktiftir.
        </p>
      </header>

      <section className="px-4 py-12">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-[0_25px_60px_rgba(15,23,42,0.08)]">
            <p className="eyebrow">Genel Merkez</p>
            <h2 className="text-3xl font-semibold text-slate-900">Orient Matbaa</h2>
            <p className="mt-3 text-sm text-slate-500">
              İkitelli OSB Mah. Matbaa Cad. No:12 Başakşehir / İstanbul
            </p>

            <div className="mt-8 space-y-6 text-sm text-slate-600">
              <InfoRow
                label="Adres"
                icon="📍"
                value="İkitelli OSB Mah. Matbaa Cad. No:12 Başakşehir / İstanbul"
              />
              <InfoRow
                label="Telefon"
                icon="☎️"
                value="+90 (216) 000 00 00"
                href="tel:+902160000000"
              />
              <InfoRow
                label="E-posta"
                icon="✉️"
                value="info@orientmatbaa.com"
                href="mailto:info@orientmatbaa.com"
              />
              <InfoRow
                label="Çalışma Saatleri"
                icon="⏱️"
                value="Hafta içi 09:00 – 19:00"
                subValue="Cumartesi randevu ile açığız."
              />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-3 shadow-[0_25px_60px_rgba(15,23,42,0.08)]">
            <iframe
              title="Orient Matbaa Konumu"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3009.149621621108!2d28.807430076631054!3d41.0370015187357!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cab062bcbac84f%3A0x4b3e9c5b2dc9f629!2s%C4%B0kitelli%20Organize%20Sanayi%20B%C3%B6lgesi!5e0!3m2!1str!2str!4v1700000000000!5m2!1str!2str"
              className="h-[400px] w-full rounded-2xl"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </div>
  )
}

export default Contact

function InfoRow({ label, icon, value, subValue, href }) {
  return (
    <div className="flex items-baseline gap-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-lg">
        <span>{icon}</span>
      </div>
      <div className="flex-1">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-400">{label}</p>
        {href ? (
          <a
            href={href}
            className="mt-2 inline-flex items-center gap-2 text-base font-semibold text-slate-900 transition hover:text-rose-600"
          >
            {value}
          </a>
        ) : (
          <p className="mt-2 text-base font-semibold text-slate-900">{value}</p>
        )}
        {subValue && <p className="text-sm text-slate-500">{subValue}</p>}
      </div>
    </div>
  )
}
