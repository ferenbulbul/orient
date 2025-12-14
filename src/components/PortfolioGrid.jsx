const works = [
  {
    id: 'kurumsal-kitapcik',
    title: 'Kurumsal Kitapçık',
    subtitle: 'Tamamen özel tasarım, iplik dikiş cilt',
  },
  {
    id: 'afis-serisi',
    title: 'Poster Serisi',
    subtitle: 'UV baskı, dış mekan dayanımı',
  },
  {
    id: 'ambalaj',
    title: 'Premium Ambalaj',
    subtitle: 'Özel kesim ve sıcak yaldız',
  },
]

function PortfolioGrid() {
  return (
    <section className="w-full bg-white px-6 py-16 sm:px-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-amber-500">
          Örnek Çalışmalar
        </p>
        <h2 className="text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
          İş ortaklarımız için ürettiğimiz seçkiler.
        </h2>
        <p className="text-base text-slate-500 sm:text-lg">
          {/* Placeholder görseller kullanılıyor. */}
          Görseller placeholder olarak kullanılmaktadır. Talebinize göre detaylı
          referans listesi sunabiliriz.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {works.map((work) => (
          <article key={work.id} className="group relative overflow-hidden rounded-[32px]">
            <img
              src={`https://source.unsplash.com/520x320/?printing,press&sig=${work.id}`}
              alt={work.title}
              className="h-72 w-full object-cover transition duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-slate-950/70 opacity-0 transition duration-300 group-hover:opacity-100" />
            <div className="absolute inset-0 flex flex-col justify-end p-6 text-white opacity-0 transition duration-300 group-hover:opacity-100">
              <h3 className="text-2xl font-semibold">{work.title}</h3>
              <p className="text-sm text-slate-200">{work.subtitle}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default PortfolioGrid
