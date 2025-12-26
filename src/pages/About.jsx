const stats = [
  { label: 'Yıllık baskı kapasitesi', value: '45M+' },
  { label: 'Aktif müşteri', value: '800+' },
  { label: 'Üretim hattı', value: '12' },
  { label: 'Teslim süresi ort.', value: '5 gün' },
]

function About() {
  return (
    <div className="bg-white text-slate-900">
      <section className="relative w-full overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1600&q=80"
          alt="Orient Matbaa tesisleri"
          className="h-[340px] w-full object-cover sm:h-[420px]"
        />
        <div className="absolute inset-0 bg-slate-950/70" />
        <div className="absolute inset-0 mx-auto flex max-w-5xl flex-col justify-center px-6 text-white">
          <p className="text-sm uppercase tracking-[0.4em] text-amber-300">Orient Matbaa</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
            Hakkımızda
          </h1>
          <p className="mt-4 max-w-2xl text-base text-slate-100 sm:text-lg">
            35 yılı aşkın süredir matbaa sektöründe faaliyet gösteren Orient, ofset
            ve dijital baskı teknolojilerini bir araya getirerek, markalara tutarlı ve
            güvenilir üretim ortağı sunar.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-2">
          <article>
            <p className="text-xs uppercase tracking-[0.3em] text-amber-500">
              Biz Kimiz
            </p>
            <h2 className="mt-4 text-3xl font-semibold">Türkiye’nin üretim odaklı matbaa ekiplerinden biriyiz.</h2>
            <p className="mt-4 text-slate-600">
              Orient Matbaa, kurulduğu günden bu yana ofset, dijital baskı ve özel
              uygulama çözümleri konusunda kapsamlı hizmet sunar. Tasarım
              danışmanlığından lojistiğe kadar tüm süreç tek ekip tarafından
              yönetilir.
            </p>
          </article>
          <article className="rounded-3xl bg-slate-50 p-8 shadow-[0_25px_60px_rgba(15,23,42,0.08)]">
            <h3 className="text-2xl font-semibold">Neler Üretiyoruz</h3>
            <p className="mt-3 text-slate-600">
              Kartvizit, katalog, broşür, afiş, ambalaj ve kişiselleştirilmiş dijital
              baskılar dahil farklı ihtiyaçlara özel üretim hatları kurduk.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-slate-600">
              <li>• Ofset baskı ve sıcak yaldız</li>
              <li>• UV kaplama, lak ve kabartma uygulamaları</li>
              <li>• Özel kesim, kutu ve etiket çözümleri</li>
              <li>• Dijital baskı ile düşük tirajlı üretimler</li>
            </ul>
          </article>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-2">
          <article className="rounded-3xl border border-slate-200 p-8">
            <p className="text-xs uppercase tracking-[0.3em] text-amber-500">
              Kalite & Süreç
            </p>
            <h3 className="mt-4 text-2xl font-semibold">Kayıt altına alınmış süreçlerle kusursuz üretim.</h3>
            <p className="mt-4 text-slate-600">
              ISO 9001 standartlarına uygun olarak dokümante edilen iş akışlarımız,
              renk eşleştirme, maket baskı ve sevkiyat aşamalarında tam şeffaflık sunar.
            </p>
            <p className="mt-4 text-slate-600">
              Her proje için üretim takvimi oluşturur, müşterilerimizle düzenli rapor
              paylaşırız. Dijital takip sistemlerimiz tirajları anlık olarak izlememizi sağlar.
            </p>
          </article>
          <article className="rounded-3xl bg-slate-950 p-8 text-white">
            <p className="text-xs uppercase tracking-[0.3em] text-amber-300">
              Rakamlarla Biz
            </p>
            <div className="mt-6 grid grid-cols-2 gap-6">
              {stats.map((item) => (
                <div key={item.label}>
                  <p className="text-3xl font-semibold text-amber-300">{item.value}</p>
                  <p className="text-sm text-slate-300">{item.label}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-sm text-slate-300">
              Veriler 2024 yılı üretim raporlarından derlenmiştir. Orient Matbaa, her
              ölçekte marka için güvenilir çözüm ortağıdır.
            </p>
          </article>
        </div>
      </section>
    </div>
  )
}

export default About
