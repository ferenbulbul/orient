import logo from '../assets/logo.svg'
import { useLanguage } from '../context/LanguageContext'

function Footer() {
  const { isEN } = useLanguage()
  const year = new Date().getFullYear()

  return (
    <footer className="w-full bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 md:grid-cols-3 md:items-center">
          <div className="flex flex-col items-start gap-3">
            <img src={logo} alt="Euromat Print logo" className="h-14 w-auto object-contain brightness-0 invert" />
            <p className="max-w-xs text-xs leading-relaxed text-slate-300 break-words">
              EUROMAT BASIM YAYIN AMBALAJ
              <br />
              SAN.VE TİC ANONİM ŞİRKETİ
            </p>
          </div>

          <div className="max-w-md text-sm text-slate-300 md:self-center md:text-center">
            <p>
              {isEN
                ? 'From prepress to distribution, we manage all printing processes under one roof and provide consistent, on-time solutions for your brand.'
                : 'Kalıp hazırlıktan dağıtıma kadar tüm baskı süreçlerini tek çatı altında yönetir, markanız için tutarlı ve zamanında çözümler sunarız.'}
            </p>
          </div>

          <div className="text-sm text-slate-300 md:justify-self-start md:text-left">
            <p className="font-semibold text-white">{isEN ? 'Contact' : 'İletişim'}</p>
            <p className="mt-2">{isEN ? 'Tel' : 'Tel'}: +90 212 549 65 85</p>
            <p>{isEN ? 'E-mail' : 'E-posta'}: info@euromatprint.com</p>
            <p>
              {isEN ? (
                <>
                  Address: IKITELLI OSB MAH. GIYIM SANATKARLARI 5A-6A BLOK No: 315 - 304, 34490
                  <br />
                  BASAKSEHIR / ISTANBUL
                </>
              ) : (
                'Adres: İKİTELLİ OSB MAH. GİYİM SANATKARLARI 5A-6A BLOK No: 315 - 304, 34490 Başakşehir / İstanbul'
              )}
            </p>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-sm text-slate-500 break-words">
          © {year} EUROMAT BASIM YAYIN AMBALAJ SAN.VE TİC ANONİM ŞİRKETİ. {isEN ? 'All rights reserved.' : 'Tüm hakları saklıdır.'}
        </div>
      </div>
    </footer>
  )
}

export default Footer
