import { MapPin, Phone, Mail, Clock, Navigation, Building2 } from "lucide-react";

const CONTACT_INFO = [
  {
    icon: MapPin,
    label: "Adres",
    value: "İkitelli OSB Mah. Matbaa Cad. No:12",
    subValue: "Başakşehir / İstanbul"
  },
  {
    icon: Phone,
    label: "Telefon",
    value: "+90 (216) 002 00 00",
    href: "tel:+902160000000"
  },
  {
    icon: Mail,
    label: "E-posta",
    value: "info@euromatprint.com",
    href: "mailto:info@euromatprint.com"
  },
  {
    icon: Clock,
    label: "Çalışma Saatleri",
    value: "Hafta içi 09:00 – 19:00",
    subValue: "Cumartesi randevu ile açığız"
  }
];

function Contact() {
  return (
    <div className="bg-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white py-24">
        <div className="absolute top-0 right-1/4 h-96 w-96 rounded-full bg-amber-100/20 blur-3xl" />
        
        <div className="relative z-10 mx-auto max-w-6xl px-6">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-100 to-amber-50 px-4 py-2 shadow-sm">
              <Navigation className="h-4 w-4 text-amber-600" />
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">
                İletişime Geçin
              </span>
            </div>

            <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl leading-tight">
              Ofisimizi ziyaret edin{" "}
              <span className="bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">
                ya da hemen arayın
              </span>
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-slate-600 max-w-3xl mx-auto">
              Baskı süreçlerinizi planlamak için randevu alabilir veya dosyalarınızı 
              dijital olarak iletebilirsiniz. Ekibimiz hafta içi 09:00-19:00 saatleri 
              arasında aktiftir.
            </p>
          </div>
        </div>
      </section>

      {/* Main Contact Section */}
      <section className="relative py-20">
        <div className="absolute bottom-0 left-1/4 h-96 w-96 rounded-full bg-slate-200/50 blur-3xl" />
        
        <div className="relative z-10 mx-auto max-w-6xl px-6">
          <div className="grid gap-8 lg:grid-cols-2">
            
            {/* Left: Contact Information */}
            <div className="space-y-6">
              {/* Header Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-300 shadow-lg shadow-amber-400/20">
                    <Building2 className="h-7 w-7 text-white" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-amber-600">
                      Genel Merkez
                    </p>
                    <h2 className="mt-1 text-2xl font-bold text-slate-900">
                      Euromat Print
                    </h2>
                  </div>
                </div>
              </div>

              {/* Contact Details */}
              <div className="space-y-4">
                {CONTACT_INFO.map((info, idx) => (
                  <InfoCard key={idx} {...info} />
                ))}
              </div>

              {/* Quick Actions */}
              <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 shadow-sm">
                <p className="text-sm font-semibold text-slate-900">Hızlı İletişim</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <a
                    href="tel:+902160000000"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-300 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-400/30 transition-all hover:shadow-xl hover:scale-105"
                  >
                    <Phone className="h-4 w-4" />
                    Hemen Ara
                  </a>
                  <a
                    href="mailto:info@euromatprint.com"
                    className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition-all hover:border-amber-300 hover:bg-amber-50"
                  >
                    <Mail className="h-4 w-4" />
                    E-posta Gönder
                  </a>
                </div>
              </div>
            </div>

            {/* Right: Map */}
            <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
              <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-900/20 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none" />
              <iframe
                title="Euromat Print Konumu"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3009.149621621108!2d28.807430076631054!3d41.0370015187357!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cab062bcbac84f%3A0x4b3e9c5b2dc9f629!2s%C4%B0kitelli%20Organize%20Sanayi%20B%C3%B6lgesi!5e0!3m2!1str!2str!4v1700000000000!5m2!1str!2str"
                className="h-full min-h-[500px] w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              
              {/* Map Overlay Badge */}
              <div className="absolute bottom-6 left-6 right-6 z-20 rounded-xl border border-white/20 bg-white/95 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-400">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">İkitelli OSB</p>
                    <p className="text-xs text-slate-600">1,700 m² Üretim Tesisi</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative bg-white py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-8 shadow-sm">
            <p className="text-lg leading-relaxed text-slate-700">
              <span className="font-semibold text-amber-600">Projeleriniz için</span>{" "}
              en uygun çözümü birlikte belirleyelim.{" "}
              <span className="font-semibold text-slate-900">Ücretsiz danışmanlık</span>{" "}
              için bizimle iletişime geçin.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Contact;

function InfoCard({ icon: Icon, label, value, subValue, href }) {
  const content = (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-amber-300 hover:shadow-md">
      <div className="absolute top-0 right-0 h-24 w-24 translate-x-12 -translate-y-12 rounded-full bg-amber-100 opacity-0 blur-2xl transition-opacity group-hover:opacity-100" />
      
      <div className="relative flex items-start gap-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 transition-all group-hover:from-amber-100 group-hover:to-amber-50">
          <Icon className="h-6 w-6 text-slate-600 transition-colors group-hover:text-amber-600" strokeWidth={2} />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {label}
          </p>
          <p className="mt-1.5 text-base font-semibold text-slate-900 break-words">
            {value}
          </p>
          {subValue && (
            <p className="mt-1 text-sm text-slate-600">
              {subValue}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block">
        {content}
      </a>
    );
  }

  return content;
}