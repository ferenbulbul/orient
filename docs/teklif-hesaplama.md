# Teklif Fiyatlandırma — Hesaplama Formalizasyonu

Kaynak: EuromatFMS "Teklif Fiyatlandırma" ekranları (örnek iş: Bilim Kurgu Seti,
5.000 adet, 12,5×19,5, 144 sayfa, Amerikan Cilt). Tüm formüller ekrandaki
gerçek rakamlarla doğrulanmıştır; doğrulama örnekleri her bölümün altındadır.

> **UYGULAMA DURUMU (28.07.2026):** Bu dokümandaki formüllerin tamamı
> `src/lib/teklifHesap.js` motorunda uygulandı ve buradaki doğrulama
> örnekleri `scripts/teklifHesap.test.mjs` içinde 51 test olarak koşuyor
> (`node scripts/teklifHesap.test.mjs`). Katalog şeması + tohum:
> `supabase-add-teklif.sql`. Formül değişikliği = önce bu doküman, sonra
> motor + test güncellenir. §8 deney planı tarihsel kayıttır; sonuçlar
> ilgili bölümlere işlenmiştir.

---

## 0. Girdiler (semboller)

### İş bilgileri
| Sembol | Alan | Örnek |
|---|---|---|
| `Q` | Adet (tiraj) | 5.000 |
| `en_i × boy_i` | İşin ebadı (cm) | 12,5 × 19,5 |
| `S` | Toplam sayfa | 144 |
| `C` | Ciltte (cilt formasında sayfa) | 16 |
| `r1 / r2` | Renk (ön / arka) | 1/1 (iç), 4/0 (kapak) |

### Kağıt (stok kartından)
| Sembol | Alan | Örnek |
|---|---|---|
| `En × Boy` | Tabaka (baskı) ebadı, cm | 57 × 82 |
| `G` | Gramaj (g/m²) | 70 |
| `T` | Tbk'da — bir tabakadaki sayfa sayısı (çift yüz) | 32 |
| `V` | Verim — bir tabakadan çıkan iş adedi (kapak gibi tek parça işler) | 1 (iç), 10 (kapak) |
| `P_usd` | Kağıt fiyatı (**USD/kg**) | 1,100 |

Stok kartı ilişkisi: `T` ve `V`, tabaka ebadı + iş ebadı eşleşmesinden gelir
(57×82 tabakaya 12,5×19,5 iş → yüz başına 4×4 = 16 sayfa, çift yüz `T = 32`).

### Genel parametreler
| Sembol | Alan | Örnek |
|---|---|---|
| `K_usd` | USD kuru (teklif tarihli) | 46,9630 |
| `KO` | Malzeme katsayısı, % | 5 |
| `kar` | Karlı satış oranı, % | 5 |
| `BFire` | Forma başına fire (tabaka) | 200 |

### İşlem kataloğundan (makine/işlem başına) — güncel anlamlar (§10)
| Sembol | Alan | Örnek |
|---|---|---|
| `F_klp` | Kalıp fiyatı (₺/kalıp; `Adet_dahil` tiraj dahil) | 750 (Tek), 900 (5_Renk) |
| `Adet_dahil` | Kalıp fiyatına dahil tiraj eşiği | 3.000 (makineler), 1.000 (cilt) |
| `F_tiraj` | Tiraj birimi (₺/adet·YÜZ, eşik üstü) | 0,150 / 0,175 |
| `F_m2` | Selefon m² fiyatı (**$/m²**, ₺ = × kur) | 0,13 $ (Parlak) |
| `F_forma` | Cilt forma fiyatı (₺/forma·adet) | 0,4 (kart), işte 0,25–0,4 |
| `MinForma` | Cilt minimum forma çarpanı | 10 (Amerikan Cilt) |
| `F_paket` | Shrink paket fiyatı (₺/paket) | 10 (elle; kart 3) |
| `Min_klp` | İşlem taban/kalıp ücreti (₺) | 750, 800, 4.000 |

---

## 1. Türetilen büyüklükler

### 1.0 İki farklı "forma" kavramı (ÖNEMLİ)

Matbaacılıkta forma, büyük tabakaya yerleştirilip baskı sonrası katlanan sayfa
grubudur; formadaki sayfa sayısı sabit değildir (4/8/16/32 olabilir, kitapta
en yaygını 16). Ekranlarda bu kavram iki ayrı yerde iki ayrı değerle geçer:

| Kavram | Formül | Örnek (144 sf) | Nerede kullanılır |
|---|---|---|---|
| **Cilt forması** | `forma_cilt = S / C` | 144/16 = **9** | İş başlığındaki "Forma" alanı; cilt (mücellit) fiyatı |
| **Baskı forması** | `forma_baski = S / T` | 144/32 = **4,5** | Tabaka, kalıp ve +1000 tiraj hesabı |

İlişki: bir baskı tabakası (57×82, T=32) katlanınca/kesilince **2 adet**
16 sayfalık cilt forması verir → `forma_cilt = forma_baski × (T / C)`.
Stok kartındaki "Böl" alanı bu kesimle ilgilidir.

Kapak forma hesabına **dahil değildir** — ayrı kağıt ve ayrı satır olarak
fiyatlanır (cilt fiyatında ise +1 istasyon olarak eklenir, bkz. §4.2).

Sayfa sayısı tam formaya bölünmüyorsa küsurat **tam formaya tamamlanır** ya da
iş tam + küsurat olarak iki satıra bölünür. Eski ekranda ikisi de görüldü:
144 sf bir versiyonda tek satır 4,5 baskı forması, diğer versiyonda
128 sf (4 tam forma) + 16 sf (yarım forma) iki satır olarak girilmişti.
Yeni sistemde: kullanıcıya `S/T` küsuratlıysa "tek satır küsuratlı" veya
"tam + kalan ayrı satır" seçeneği sunulabilir; hesap iki yolda da aynı
formüllerle yürür.

### 1.1 Baskı forması sayısı (iç sayfalar)
```
forma = S / T          (bundan sonra "forma" = baskı forması)
```
Küsuratlı olabilir: `144 / 32 = 4,5`.

### 1.2 Tabaka ihtiyacı
```
İç   :  Tabaka_net = Q × forma
Kapak:  Tabaka_net = Q / V          (yukarı yuvarlanır)
Fire :  Fire = BFire × ceil(forma)   (kapakta forma = 1 kabul edilir)
Tabaka = Tabaka_net + Fire
```

**Doğrulama**
| Satır | Hesap | Ekran |
|---|---|---|
| İç 128 sf (T=32, forma=4) | 5.000×4 + 200×4 = 20.800 | 20.800 ✓ |
| İç 16 sf (forma=0,5) | 5.000×0,5 + 200×1 = 2.700 | 2.700 ✓ |
| İç 144 sf (forma=4,5; fire elle 0) | 5.000×4,5 + 0 = 22.500 | 22.500 ✓ |
| Kapak (V=10) | 5.000/10 + 200 = 700 | 700 ✓ |

> Not: Ekranda `BFire` alanı satır bazında elle değiştirilebiliyor
> (144 sf örneğinde 0 girilmiş). Yeni sistemde de satır bazında ezilebilir olmalı.

### 1.3 Kalıp sayısı — KESİNLEŞTİ (B.Şekli'ne bağlı; Deney 12 + Revolta işleri)

Kalıp sayısı tek formül değil, **B.Şekli seçiminin sonucudur** (§7):

```
tek_yuz   : Klp = ceil(forma × r1)             Y = 1
on_arka   : Klp = ceil(forma × (r1 + r2))      Y = 2
perfektor : Klp = ceil(forma × (r1 + r2))      Y = 2
cevirme   : Klp = ceil(forma) × r1             Y = 2   (ön+arka aynı kalıpta)
```
`Y` = tiraj farkındaki yüz çarpanı (§3).

**Doğrulama:** 4 forma 1/1 perfektör → 8 ✓ · 4,5 forma 1/1 ön/arka → 9 ✓ ·
kapak 1 forma 4/0 tek yüz → 4 ✓ · tek yüz 1/0 → Klp 1, Y=1 (Deney 12 ✓) ·
Revolta 0,5 ve 0,25 forma 4/4 → 4 kalıp ✓ (gerçek işler).
Tarihsel not: "4,5 forma → 9 ama 0,5 forma → 2" bilmecesi (eski AÇIK
KONU-1) B.Şekli farkıyla çözüldü — 144sf işinde yarım forma çevirme,
16sf ayrı satırı perfektör basılmıştı. Otomatik hesap + satırda elle ezme
uygulanıyor.

---

## 2. Malzeme (kağıt) maliyeti

```
kg      = Tabaka × En × Boy × G / 10.000.000        (cm, cm, g/m² → kg)
Tutar_₺ = kg × P_satis × Kur_pb × (1 + KO/100)
```
- `P_satis` = kağıt kartındaki **SATIŞ birim fiyatı** (alış değil; stok
  kartları fiyat ekranıyla doğrulandı: 1.Hamur satış 1,10 $ → teklifte
  1,100 ✓; Bristol satış 1,00 $ → teklifte 1,000 ✓).
- `Kur_pb` = **kağıdın kendi para biriminin** kuru — para birimi kağıt
  bazında değişir: kuşe/Holmen/kitap kağıdı **€**, 1.Hamur/Bristol **$**
  (26.07 stok fiyat ekranı). Kağıt kartında `para_birimi` alanı zorunlu.

**Doğrulama (KO = %5, K_usd = 46,9630)**
| Kağıt | Tabaka | kg | P_usd | Hesap | Ekran |
|---|---|---|---|---|---|
| 55 gr 53×82 | 20.800 | 497,2 | 1,568 | 38.444 | 38.442 ✓ |
| 55 gr 53×82 | 2.700 | 64,5 | 1,568 | 4.990 | 4.990 ✓ |
| 220 gr 70×100 Bristol | 700 | 107,8 | 1,120 | 5.954 | 5.954 ✓ |
| 70 gr 57×81,5 1.Hamur | 22.500 | 731,7 | 1,100 | 39.690 | 39.687 ✓ |

(Küçük farklar ara yuvarlamadan.)

---

## 3. Baskı maliyeti — KESİNLEŞTİ (Deney 3 revize, 26.07.2026)

```
Tutar_₺ = Klp × F_klp  +  forma × max(0, T_f − Adet_dahil) × Y × F_tiraj

T_f        = forma başına baskıya giren net tabaka (iç işlerde = Q,
             kapakta = Q/Verim; fire DAHİL DEĞİL)
Adet_dahil = makine kartındaki "Adet" eşiği (5_Renk ve Tek için 3.000) —
             kalıp fiyatına dahil edilen tiraj
Y          = basılan yüz sayısı (çift yüzlü işlerde 2, tek yüzde 1)
F_tiraj    = makine kartındaki birim (0,175 / 0,150) — YÜZ BAŞINA fiyat
```

**Deney verisiyle doğrulama (32 sf, 1 forma, 1/1 → Y=2, 5_Renk):**
| Adet | Hesap | Ekran |
|---|---|---|
| 2.000 | 2×900 + 0 | 1.800 ✓ |
| 3.000 | 2×900 + 0 (tam eşikte) | 1.800 ✓ |
| 3.100 | 1.800 + 100×2×0,175 | 1.835 ✓ |
| 5.000 | 1.800 + 2.000×2×0,175 | 2.500 ✓ |

**Eski ekran verisiyle çapraz doğrulama (hepsi Q=5.000):**
| Satır | Hesap | Ekran |
|---|---|---|
| İç 128 sf, 8 klp, Tek, perfektör | 8×750 + 4×2.000×2×0,150 | 8.400 ✓ |
| İç 32 sf, 2 klp, Tek | 2×750 + 1×2.000×2×0,150 | 2.100 ✓ |
| İç 144 sf, 9 klp, 5_Renk | 9×900 + 4,5×2.000×2×0,175 | 11.250 ✓ |
| Kapak, 4 klp (T_f=500<3.000) | 4×900 + 0 | 3.600 ✓ |

> Tarihçe: Q=5.000'de eski `(Q−1000)×birim` modeli ile doğru model
> `(Q−3000)×2×birim` tesadüfen aynı sonucu verir (4.000=4.000); Q=3.100
> deneyi ikisini ayırdı. Perfektör de tabaka başına 2 yüz sayar (tek
> geçişte iki yüz basılsa da).

⚠️ **AÇIK KONU-2 (daraldı):** Eski ekranda 16 sf (0,5 forma, perfektör)
satırında tiraj farkı eklenmemiş (1.500; formül 1.800 der). Elle müdahale
varsayılıyor. Yeni sistemde formül uygulanır, satır tutarı elle ezilebilir.

✅ **KONU-7 KAPANDI (Deney 11, 26.07):** Q=10.000'de kullanıcı formülün
tuttuğunu bildirdi → tek kademe `(Q−3000)×2×birim` (beklenen 4.250;
tam rakam teyidi bekleniyor — 4.150 çıktıysa kademe var demektir,
kullanıcıya soruldu). Katalogdaki "8000/0,15" sütunlarının anlamı ayrıca
netleşecek.

**Gerçek işlerden ek bulgular (26.07):**
- **Revolta** = çevirme (EMR) ekranda bu adla geçiyor. Forma < 1 satırlarda
  kullanılıyor; **Klp = renk sayısı** (4/4'te 4 kalıp — ön+arka aynı kalıpta):
  16 sf (0,5 forma) Revolta → Klp 4 ✓; 8 sf (0,25 forma) Revolta → Klp 4 ✓.
  Tabaka = Q × forma + fire (16 sf: 1.450 ✓; 8 sf: 825 ✓).
- **Makine kalıp fiyatı ve +1000 birimi kağıt gramajıyla kademeli:**
  65gr → 725-750 / 0,140 · 70gr → 750 / 0,160 · 80gr → 800 / 0,175 ·
  90gr kuşe → 900 / 0,200 (8_Renk işlerinde). Kademe tablosu makine
  kartından okunacak. **AÇIK KONU-10.**
- Çok modelli teklif mümkün: tek kayıtta İç 1 / İç 2 (iki kitap) +
  ortak kapak ("2 kapak birlikte" notuyla) — v1'de zorunlu değil, not edildi.

✅ **KONU-8 KAPANDI (Deney 12, 26.07):** Q=5.000, Cmyk 1/0 + Tek Yüz →
Klp 1, Tutar 1.250 ✓; Perfektör 1/1 → Klp 2, Tutar 2.500 ✓.
**Y = basılan yüz sayısı doğrulandı** (tek yüz 1, çift yüz 2 — perfektör
dahil). Kalıp sayısı da doğrulandı: `Klp = forma × (r1 + r2)`
(tek yüzde r2=0). B.Şekli'nin kalıba etkisi: Tek Yüz yüz düşürür,
Perfektör/Ön-Arka aynı kalıp sayısını verir; Çevirme (EMR) kalıbı yarılar
(eski 144sf işindeki 9 kalıp örneği).

---

## 4. Baskı sonrası işlemler

### 4.1 Selefon / Lak (m² bazlı) — KESİNLEŞTİ
```
F_m2    = kart fiyatı ($/m²) × USD kuru        (kartlar DOLAR bazlı!)
Tutar_₺ = Tabaka × (En_işlem × Boy_işlem / 10.000) × F_m2      (taban: Min_klp)
```
27.07 kart okuması: Parlak Selefon 0,13 $/m² → üç günün kuruyla ekrandaki
6,105 / 6,147 / 6,152 birebir ✓✓. İşlem kartlarında da `para_birimi` var
(makineler ₺, selefonlar $).
İşlem ebadı = bağlanan baskı satırının TABAKA ebadı (otomatik).
- Parlak Selefon: 700 × 0,70 m² × 6,105 = **2.991** ✓
- DENEY: 200 × 0,70 × 6,152 = **861** ✓ (B.Şekli seçilmeden kalıp değeri
  yazılıyor — eksik satır davranışı)
- Gerçek işler: 450×0,585×6,147 = **1.618** ✓; 1.700×0,504×6,142 =
  **5.262** ✓; 700×0,585×6,147 = **2.517** ✓ (üç farklı tabaka ebadı)
- Emboss Lak: 700 × 0,70 × 1,5 = 735 → min 800 tabana takılır → **800** ✓

### 4.2 Cilt (Amerikan Cilt) — KESİNLEŞTİ (8 iş üzerinde, 26.07.2026)
```
forma_cilt = S / C            (yukarı yuvarlanır: 7,5 → 8)
çarpan     = max(forma_cilt + 1, MinForma)     MinForma = 10 (işlem kartı "Forma")
Tutar_₺    = max( Q × çarpan × F_forma , Kalıp_taban )
```
Doğrulama (8/8):
| İş | Q | forma | F | Ekran | Hesap |
|---|---|---|---|---|---|
| KİTAP-2 (160sf) | 3.000 | 10 | 0,4 | 13.200 | 3.000×11×0,4 ✓ |
| UNTER Q=1.000 | 1.000 | 9 | 0,4 | 4.500 | max(4.000; taban 4.500) ✓ |
| AJAN (136sf) | 5.000 | 9 | 0,25 | 12.500 | 5.000×10×0,25 ✓ |
| ÇANAKKALE (128sf) | 2.500 | 8 | 0,25 | 6.250 | ✓ |
| ÇOCUKLAR (120sf) | 2.500 | 8 | 0,25 | 6.250 | ✓ |
| YAZUKİ (96sf) | 5.000 | 6 | 0,25 | 12.500 | ✓ |
| DENEY (32sf) | 2.000 | 2 | 0,08 | 1.600 | 2.000×10×0,08 ✓ |
| BİLİM KURGU (144sf) | 5.000 | 9 | 0,35 | 17.500 | 5.000×10×0,35 ✓ |

- **+1 kapak istasyonu** Amerikan ciltte hep var (tanım gereği kapaklı).
- **Kırım (katlama) satırları 0 ₺** — cilt fiyatına dahil, ayrı ücret yok
  (gerçek işlerde Kırım İki/Üç satırları fiyatsız listeleniyor).
- ⚠️ AÇIK: F_forma sayfa/kalınlıkla kademeli görünüyor (32sf→0,08;
  96–136sf→0,25; 144–160sf→0,35–0,4) ve Kalıp_taban 4.000/4.500/1.200
  değişken — kademe tablosu işlem kartından (Acoro) okunacak.
- Katalogda ayrıca `Min_klp = 1.200` var (küçük işlerde taban).

### 4.3 Shrink / paketleme
```
Tutar_₺ = ceil(Q / paket_içi) × F_paket
```
- 5.000 / 20 = 250 paket × 10 = **2.500** ✓

### 4.4 Serbest satır
Katalogda olmayan işlemler için ad + miktar + birim fiyat elle girilir,
`Tutar = Miktar × Fiyat`.

---

## 5. Toplam ve satış

```
Fiyatlama    = Σ Baskı + Σ Malzeme + Σ BaskıSonrası
KarlıSatış   = Fiyatlama × (1 + kar/100)
SatışTutarı  = elle girilir (KarlıSatış yukarı yuvarlanarak; öneri olarak gösterilir)
BirimFiyat   = SatışTutarı / Q
```

**Doğrulama:** 13.500 + 49.386 + 23.791 = **86.677** ✓ →
× 1,05 = **91.011** ✓ → elle **92.000** → 92.000/5.000 = **18,40 ₺** ✓

---

## 6. Sayfa yapısı (blok blok, kararlaştırılan)

### Blok 1: İş bilgileri ✅ (karar verildi; uygulandı)
- **Firma (cari)**: v1'de serbest metin (`firma_adi`); cari listesine
  bağlama (musteri_id) sonraya bırakıldı.
- **İşin adı**: serbest metin, zorunlu.
- **Cinsi**: Kitap/Dergi/Katalog/Broşür… — **sadece etiket, hesabı etkilemez.**
- **Adet (Q)**: sayı, zorunlu.
- **Ebat (En × Boy)**: cm, zorunlu.
- **Sayfa (S)**: **kapak hariç iç sayfa** girilir, zorunlu.
- **Ciltte (C)**: 4/8/16/32 seçimi; yanında salt-okunur `Forma (cilt) = S/C`.
- **Cilt türü**: seçim (Amerikan Cilt, İplik Dikiş, Tel Dikiş…).
- **Kapak var mı**: evet/hayır → kapak baskı satırını açar.
- **Temsilci**: **giriş yapan kullanıcıdan otomatik**, elle seçim yok.
- Bandrol/Termin/Not: ikincil, hesap dışı.

### Blok 2: Genel parametreler ✅ (GÜNCELLENDİ — artık DB'de)
- KO, kar, varsayılan fire, sırt kalınlığı, shrink paket içi →
  `teklif_parametreler` tablosu (Katalog → Parametreler sekmesi).
- Kurlar → `teklif_kurlar` tablosu (günlük elle giriş; teklif son kur
  kaydını çeker ve kayda snapshot'lar). TCMB otomatik çekme v2.
- Komisyon alanı v1'de yok (eski ekranda tutar üretmiyordu).

### Blok 3–4 yapısal bulgular (eski ekran davranışı)
- **Otomatik iskelet (26.07 doğrulandı):** Yeni işte "+Kapak" + Cilt türü
  seçilince program kendisi üretiyor → Baskı: İç + Kapak satırları;
  Baskı Sonrası: Kapak satırı ("Selefon belirtiniz" notuyla) + 3 İç satırı
  (işlemleri kullanıcı seçiyor). Yeni sistemde aynı desen uygulanacak.
- **Kurlar günlük kayıttan otomatik** doluyor (26.07.26 → 47,3206 $;
  11.07.26 → 46,9630 $). Kur ekranda elle de değiştirilebiliyor.
- **Açıklama** alanı serbest metin + öneri; hesaba girmez. Aynı işte çok sayıda
  baskı satırı girilebilir.
- **Baskı Sonrası satırının Açıklama'sı, Baskı satırlarında girilenler
  arasından seçtirilir** → baskı sonrası satırı bir baskı satırına bağlanır;
  miktar/ebat oradan türetilir. Yeni sistemde bu ilişki açıkça
  `baskiSatirId` referansı olarak modellenecek.
- **Makine** ve **kağıt**: `teklif_makineler` / `teklif_kagitlar`
  tablolarından (dummy aşaması bitti; tohum `supabase-add-teklif.sql`).
- **M düğmesi** = stok kartları penceresi (montaj): tabaka ebadı + iş ebadına
  göre Böl / Tbk'da / Verim / Ciltte döndürüyor. Yeni sistemde bu pencereye
  gerek kalmadan otomatik hesaplanacak (bkz. Deney 7 hipotezi).
- **Kapak ebadı 25,72×19,5 = açılmış kapak**: 12,5 (ön) + 12,5 (arka) +
  0,72 (sırt). Yani kapak satırının ebadı = `2×en_i + sırt`. Sırt kalınlığı
  ayrı girdi (Deney 8'de doğrulanacak).

## 7. Baskı şekli (B.Şekli) — terminoloji araştırması

Ofsette bir formanın iki yüzünü basmanın 4 yolu var; kalıp sayısını ve
makineden geçiş sayısını farklı etkilerler:

| B.Şekli | Nasıl çalışır | Kalıp | Geçiş (tiraj) |
|---|---|---|---|
| **Tek Yüz** | sadece ön yüz basılır | `forma × r1` | tabaka × 1 |
| **Ön/Arka (çift yüz)** | ön ve arka ayrı kalıp seti, tabaka çevrilip 2. geçiş | `forma × (r1+r2)` | tabaka × 2 |
| **Çevirme / Dönderme (EMR, work-and-turn)** | ön+arka AYNI kalıba yan yana monte edilir; tabaka çevrilip aynı kalıpla 2. geçiş; her tabakadan 2 iş çıkar | `forma × r1` (yarıya iner) | tabaka × 2 |
| **Perfektör** | makine tabakayı içeride çevirir, tek geçişte iki yüz | `forma × (r1+r2)` | tabaka × 1 |

**Bu tablo 4,5 forma → 9 kalıp bilmecesini çözüyor:** 4 tam forma Ön/Arka
(4×2=8 kalıp) + yarım forma (16 sf) **çevirme** ile tek kalıba montajlanmış
(+1) = **9** ✓. Eski versiyonda aynı 16 sayfa ayrı satırda **Perfektör**
girildiği için 2 kalıptı. Yani kalıp sayısı formül değil, **B.Şekli seçiminin
sonucu** — yeni sistemde B.Şekli seçimine göre otomatik hesaplanıp elle
ezilebilecek. (Doğrulama: Deney 1–2.)

Kaynaklar: [Matbaa Ankara — terimler (EMR/çevirme)](https://matbaaankara.web.tr/matbaaya-yolculuk/),
[Matbaafix — matbaa terimleri](https://matbaafix.com/matbaa-terimleri),
[Tek Ofset — matbaa terimleri](https://www.tekofsetdavetiye.com.tr/matbaa-terimleri),
[avammatbaa — forma](https://www.avammatbaa.com/2021/04/23/matbaacilikta-1-forma-kac-sayfadir/)

## 8. Deney planı — eski programda tersine mühendislik

Amaç: hangi girdinin hangi hesaba girdiğini **tek değişken değiştirerek**
kesinleştirmek. Her deneyde: tek alanı değiştir → "Güncel Fiyat" →
şu hücreleri not et: **Klp, satır Fiyat, satır Tutar (baskı), malzeme Miktar,
malzeme Tutar, Fiyatlama**. Sonra alanı eski haline döndür.

### Deney 0 — Taban iş (referans)
Yeni teklif: Q=2.000, ebat 12,5×19,5, Sayfa 32, Ciltte 16, kağıt 70gr 57×82
1.Hamur, makine 5_Renk, renk 1/1, fire 0, B.Şekli **Ön/Arka**.
**Beklenen:** forma 1; Klp 2; baskı = 2×900 + 1.000×0,175 = **1.975**;
malzeme Miktar **2.000**.
→ Tutmazsa formüllerin tamamı yeniden ele alınır; önce bunu doğrula.

### Deney 1 — B.Şekli etkisi (tam forma)
Taban işte sadece B.Şekli'ni sırayla değiştir: Ön/Arka → Perfektör →
Tek Yüz → (varsa) Çevirme/Dönderme.
**Hipotez:** Klp: 2 / 2 / 1 / 1. Tabaka: 2.000 / 2.000 / 2.000 / 1.000(?).
+1000 birimi değişiyor mu?

### Deney 2 — Yarım forma (AÇIK KONU-1 ve 2'yi çözer)
Sayfa=16 (0,5 forma) yap; B.Şekli'ni sırayla değiştir.
**Kaydet:** Klp (1 mi 2 mi?), +1000 farkı ekleniyor mu, malzeme Miktar
(1.000 mi 2.000 mi?).

### Deney 3 — Adet eşiği
Sayfa=32'ye dön; Q = 800 / 1.000 / 1.200 dene.
**Hipotez:** baskı = 1.800 / 1.800 / 1.835. Eşik tam 1.000 mi,
fire eşiğe dahil mi (Q=1.000 + fire 200 iken fark çıkıyor mu)?

### Deney 4 — Fire'ın kapsamı
Q=2.000, fire 0 → 500.
**Hipotez:** malzeme Miktar 2.000→2.500; baskı Tutar DEĞİŞMEZ (1.975).
Değişirse +1000 hesabı tabaka bazlıdır, adet bazlı değil.

### Deney 5 — Renk (Cmyk)
1/1 → 4/4 → 4/0 (B.Şekli Ön/Arka sabit).
**Hipotez:** Klp 2→8→4; kalıp birim fiyatı sabit 900; +1000 birimi
renkten bağımsız (0,175 kalır).

### Deney 6 — Gramaj
70 → 90 gr.
**Hipotez:** baskı Tutar sabit; malzeme kg ve Tutar 90/70 oranında artar.

### Deney 7 — Montaj formülü (M penceresi / Tbk'da)
İş ebadını değiştirerek (ör. 12,5×19,5 → 16×23 → 19×27) M penceresindeki
**Böl / Tbk'da / Verim / Ciltte** değerlerini tablola.
**Hipotez:** yüz başına sayfa = `max( floor(En/en)×floor(Boy/boy),
floor(En/boy)×floor(Boy/en) )`; Tbk'da = 2 × yüz başına sayfa
(57×82 + 12,5×19,5: 4×4=16 → 32 ✓).

### Deney 8 — Kapak verimi ve sırt
Kapak satırında ebadı 25,72×19,5 → 26,72×19,5 (sırt +1) ve tabakayı
70×100 → 64×90 değiştir; malzeme Miktar'dan verimi geri hesapla.
**Hipotez:** verim = max-yönelim yerleşimi (70×100'de 2×5=10 ✓).

### Deney 9 — Selefon minimumu
Q'yu düşürerek (ör. 500) selefon tutarının hesap yerine Kalıp (750/800)
tabanına takıldığı noktayı bul.
**Hipotez:** Tutar = max(tabaka × m² × fiyat, Kalıp).

### Deney 10 — Cilt +1 kapak istasyonu
"+Kapak" işaretini kaldır (kapaksız iş).
**Hipotez:** Amerikan Cilt = Q × forma_cilt × 0,35 (10 yerine 9 çarpanı).

Sonuçlar geldikçe §1–4'teki formüller kesinleştirilecek ve
§9'daki açık konular kapatılacak.

### Deney sonuçları (26.07.2026)

**Deney 7 (M penceresi) — SONUÇLANDI:** İş ebadı değiştirilince stok
kartındaki Tbk'da/Verim OTOMATİK GÜNCELLENMİYOR; kartlar elle tutulan ana
veri (Böl/Tbk'da/Verim/Ciltte kart üstünde elle düzeltiliyor, popup'taki
grid sadece görselleştirme). → Yeni sistemde üstünlük: Tbk'da/Verim
katlama kısıtlı montaj formülüyle otomatik önerilecek + elle ezilebilecek.
Liste, baskı satırındaki Gr + Kağıt Cinsi'ne göre filtreleniyor;
İşin Ebadı/Sayfa sütunları işten gelen bağlam.

**Deney 0 (taban, Q=2.000, 32 sf, 70gr 57×82, 5_Renk, 1/1, fire 0, Ön/Arka):**
- Klp **2** ✓, Fiyat **900** ✓, +1000 birimi **0,175** ✓ (makineden otomatik).
- Malzeme: Miktar **2.000** ✓, Fiyat 1,100 $ → Tutar **3.549** ✓✓
  (2.000 × 0,57×0,82×70 g = 65,44 kg × 1,100 $ × 46,9630 × 1,05 = 3.549,4 —
  **malzeme formülü §2 KESİNLEŞTİ, KO %5 dahil**).
- Fiyatlama 5.349 = 1.800 + 3.549 ✓; Satış 5.616,87 = ×1,05 ✓;
  Birim 2,80843 = /2.000 ✓ (**§5 toplam zinciri KESİNLEŞTİ**).
- **SÜRPRİZ:** Baskı Tutar **1.800** = sadece 2×900. Beklenen +175 tiraj
  farkı (Q−1000)×0,175 EKLENMEDİ. Q=5.000 örneklerinde fark hep
  (Q−1000) bazıyla eklenmişti → tiraj farkının devreye girdiği eşik
  2.000 < Q ≤ 5.000 arasında bir yerde. → **Deney 3 revize:** Q'yu
  3.000 → 4.000 → 5.000 yaparak Tutar'ı izle; farkın ilk çıktığı Q'yu
  ve tutarını not et.
- Not: satırdaki İşin Ebadı **12**×19,5 görünüyor (12,5 olmalı — En alanı
  eksik aktarılmış). Malzeme hesabını etkilemedi (tabaka ebadı kullanılıyor)
  ama sağdaki **kg 53** alanı bununla tutarlı: kg ≈ Q × (S/2) × en×boy×gr/10⁷
  = 52,4 → 53. **kg alanı = bitmiş ürün ağırlığı hipotezi güçlendi**
  (eski 549 örneğiyle tam oturmuyor, açık konu olarak duruyor).

**DENEY KİTAP (kapaklı tam iş, 26.07 18:41):**
- İç satırı: 1.800 ✓, malzeme 2.000 tb → **3.576** (yeni kurla tahmin
  kuruşu kuruşuna tuttu ✓✓).
- Kapak satırı: Klp 4 ✓, 3.600 ✓; malzeme 200 tb ✓ (verim 10),
  1,000 $ → 1.530 ✓.
- **SIRT FORMÜLÜ BULUNDU:** Kapak İşin Ebadı OTOMATİK **25,16**×19,5 geldi
  = 2×12,5 + sırt 0,16. Sırt = yaprak × 0,1 mm: 32 sf → 16 yaprak → 1,6 mm ✓.
  Eski iş de tutuyor: 144 sf → 72 yaprak → 7,2 mm → 25,72 ✓✓.
  → `sırt_cm = (S/2) × 0,01` (kalınlık kağıt cinsine göre parametre olmalı,
  v1'de 0,1 mm/yaprak sabit).
- Cilt satırı: Forma **2** otomatik türedi ✓ (32/16, §1.0 doğrulandı);
  Kalıp 1.200, Fiyat **,08**, Tutar **1.600**. ⚠️ Eski modelle
  (Q×(forma+1)×fiyat) uyuşmuyor: 2.000×3×0,08 = 480 ≠ 1.600.
  Eski VE yeni veriyi aynı anda tutan tek aday: **Tutar = Q × fiyat × 10**
  (kart çarpanı "Forma 10"?): 2.000×0,08×10 = 1.600 ✓ ve
  5.000×0,35×10 = 17.500 ✓. Fiyatın (,08/,35) nereden türediği belirsiz →
  işlem kartı (Acoro) sütunları okunacak. **AÇIK KONU-9.**
- Selefon satırı: B.Şekli boşken Tutar = Kalıp değeri 750 (eksik satır
  davranışı); **B.Şekli = Tek Yüz seçilince Tutar = 861 ✓✓** →
  `Tutar = tabaka × (İşlem Ebadı m²) × m² fiyatı` (200×0,7×6,152)
  **KESİNLEŞTİ**. İşlem Ebadı 70×100 (kağıdın tabaka ebadı) otomatik ✓.
  Taban (min 750) kuralı küçük adetle ayrıca test edilecek.
- Bu yeni kayıtta Karlı Satış oranı girilmemiş → Satış Tutarı 12.856,77 =
  parçaların toplamı (kar %0). Kar oranının kayıt bazında girildiği
  doğrulandı.
- kg 78 ≈ iç 54,6 + kapak 21,6 = 76,2 (ürün ağırlığı hipoteziyle uyumlu,
  ufak sapma sürüyor).

## 9. Montaj (stok kartı) hesabı ve görselleştirme

Eski programda Tbk'da/Verim/Böl kart üstünde elle tutuluyor (Deney 7).
Yeni sistemde bunlar hesaplanacak ve montaj şeması çizilecek.

### 9.1 Katlama kısıtı — neden serbest yerleştirme değil

Cilt formasına girecek sayfalar tabakaya rastgele dizilemez; katlama
şemasına oturmalıdır. Geçerli yüz-başına gridler (sayfa dik, satırlar
baş başa):

| Forma (Tbk'da) | Yüz başına sayfa | Grid (sütun × satır) | Gereken alan |
|---|---|---|---|
| 4  | 2  | 2 × 1 | 2·en × 1·boy |
| 8  | 4  | 2 × 2 | 2·en × 2·boy |
| 16 | 8  | 4 × 2 | 4·en × 2·boy |
| 32 | 16 | 4 × 4 | 4·en × 4·boy |
| 64 | 32 | 8 × 4 | 8·en × 4·boy |

### 9.2 Algoritma

```
Girdi: en_i × boy_i (iş), En × Boy (tabaka), C (ciltte), Böl (vars. 1)
Baskı ebadı = tabaka / Böl (Böl=1 → tabaka)

1) Tbk'da: tablodaki en büyük formadan küçüğe in;
   gereken alan (w×h), baskı ebadına DÜZ ya da 90° DÖNMÜŞ sığıyorsa dur.
   Tbk'da = o forma.
2) Verim: seçilen yerleşimin tabakaya kaç kez sığdığı
   (packing; tipik 1). Verim > 1 ise tabaka başına aynı montaj Verim kez.
3) Cilt forması / tabaka = Tbk'da / C   (32/16 = 2 → tabaka kesilince
   2 cilt forması çıkar; "Böl" kesimi baskı ÖNCESİ, bu kesim SONRASI).
4) Tek parça işler (kapak, föy):
   Verim = max( floor(En/en)·floor(Boy/boy), floor(En/boy)·floor(Boy/en) )
   Tbk'da kavramı yok; tabaka = Q / Verim.
```

**Doğrulama 1 — 12,5×19,5 iş, 18 kart (70gr 1.Hamur):** 32'lik forma
50×78 cm ister; listedeki her tabakaya (57×80 … 86×62, 70×100 dahil) düz
veya dönmüş sığar; 64'lük forma 100×78 ister, hiçbirine sığmaz →
hepsi **Tbk'da 32, Verim 1** ✓ (ekranla birebir).

**Doğrulama 2 — 19,5×27,5 iş, 9 kart (65gr Holmen), 26.07.2026 — KESİNLEŞTİ:**
32'lik forma 78×110 ister → hiçbir tabakaya sığmaz (hiçbir kart 32 değil ✓);
16'lık forma 55×78 ister → 57×82…70×100 sekiz karta sığar → **16** ✓;
**53×78 tabakaya sığmaz (55 > 53)** → 8'lik forma 39×55 sığar → **8** ✓✓.
Sınır vakası dahil 9/9 kart formülle birebir. Verim hepsinde 1 ✓.

**Kapak doğrulaması:** 25,72×19,5 açık kapak, 70×100 tabaka →
floor(70/25,72)·floor(100/19,5) = 2·5 = **10** ✓ (dönmüş 3·3=9 < 10).

### 9.3 Bilinçli sadeleştirmeler (v1)

- Makas/etek kenar payı parametresi yok — eski program da salt geometrik
  sığdırma yapıyor (57×82'de 7×4 cm boşluk kalıyor, pay oradan çıkıyor).
  İleride "kenar payı" ayarı eklenebilir.
- Karışık yönelimli (döndürerek karma) yerleştirme yok; iki saf yönelimin
  iyisi alınır.
- Böl kullanıcı girdisi (vars. 1); makine maks. ebadına göre otomatik
  Böl önerisi v2.

### 9.4 Görselleştirme

Baskı satırında kağıt seçilince SVG şema çizilir:
- Tabaka dikdörtgeni (ölçekli, En×Boy etiketli), içinde grid hücreleri
  (her hücre = bir sayfa, en_i×boy_i etiketli), kullanılmayan alan taralı.
- Üstünde özet: "Tbk'da 32 · Verim 1 · 4×4 yüz montajı · tabakadan
  2 cilt forması (16'lık)".
- Tbk'da/Verim alanları önerilen değerle dolu gelir, elle ezilebilir
  (ezilince şema "elle" rozetiyle yeniden çizilir).
- Kapak satırında grid yerine yan yana kapak yerleşimi (2×5 = 10) çizilir.

## 10. İşlem kataloğu — kart şeması (26.07 kart okuması ile KESİNLEŞTİ)

Eski "İşlem Fiyatlandırma" listesinin sütun anlamları (deneylerle eşleşti):
- **Adet** = kalıp fiyatına dahil tiraj eşiği (5_Renk/8_Renk: 3.000 —
  Deney 3'te bulunan eşik kartta; Amerikan Cilt: 1.000)
- **Forma** = minimum forma çarpanı (Amerikan Cilt: 10 → `max(forma+1,10)`)
- **Kalıp 1 / Fiyat 1** = taban ₺ / birim fiyat (1. kademe)
- **Ebat** = 2. kademe eşiği; **Kalıp 2 / Fiyat 2** = kademe-2 değerleri
  (5_Renk: 8000 üstü 800/0,15; ciltte iki kademe aynı: 4000/0,4)
- Okunan kartlar: 5_Renk `3.000·1·900·0,175·8000·800·0,15`,
  8_Renk `3.000·1·850·0,175·8000·750·0,15`,
  Amerikan Cilt `1.000·10·4000·0,4·8000·4000·0,4`,
  AC Kulaklı `…·10·5000·0,5`, AC Silikon `…·10·7000·0,7`.
- Gerçek işlerdeki 0,25/0,35 cilt ve 725-900 makine fiyatları kart
  değerlerinden sapıyor → operatör satır bazında ezmiş (ya da
  gramaj/ebat kademesi). Yeni sistemde: kartta kademe tablosu +
  satırda elle ezme.

**Yeni sistem işlem kartı şeması:**
```
ad · kategori (baskı/cilt/kaplama/paket/sevk/serbest) · hesap_tipi
dahil_adet · min_forma_carpani · taban_tl · birim_fiyat
kademe_esigi · kademe2_taban · kademe2_birim
(ops.) sayfa/gramaj kademeleri
```
Admin ekranından CRUD; teklif satırı karttan varsayılanları çeker,
her alan satırda ezilebilir. Makine ve kağıt kartları da aynı desende
(makine: kalıp fiyatı + dahil adet + birim; kağıt: cins/gramaj/ebat +
**satış fiyatı + para_birimi (€/$)** + alış fiyatı (ops.) + kalınlık).
Kağıt tohumu 26.07 stok fiyat ekranından okunacak (kuşe 1,35 €,
Bristol 1,00 $, Holmen 1,25 €, kitap 1,20 €, 1.Hamur 1,10 $ …).
Not: eski sistemin stok ekranı giren/çıkan da tutuyor — Orient'teki
mevcut kağıt stok modülüyle (paper_entries, cins+gramaj+ebat kırılımı)
ileride birleştirilebilir; v1'de teklif kataloğu ayrı tablo.

## 11. Açık konular — güncel durum (28.07.2026)

**Çözülenler (arşiv):**
- ~~Kalıp sayısı yarım formada~~ → §1.3 (B.Şekli kuralı, Deney 12 + Revolta).
- ~~+1000 tiraj farkı~~ → §3 (eşik 3.000 + yüz çarpanı, Deney 0/3/11/12).
- ~~KO / kar ayrımı~~ → KO yalnız malzemeye, kar toplama; ikisi
  `teklif_parametreler`'de ayrı kayıt.
- ~~Kur kaynağı~~ → v1: günlük elle giriş (`teklif_kurlar`), teklif kayda
  snapshot alır; TCMB otomatik v2.
- ~~Komisyon alanı~~ → eski ekranda tutar üretmiyordu; v1'e alınmadı.

**Hâlâ açık (fiyatı etkilemeyen ya da kart verisiyle çözülecek):**
1. **Cilt birim fiyatı kademesi** — işlerde sayfayla artıyor (32sf→0,08 ·
   96–136sf→0,25 · 144–160sf→0,35–0,4) ama kartta tek değer (0,4).
   Muhasebeye sorulacak: resmi kademe mi, göz kararı mı? Şimdilik satırda
   elle ezme ile idare ediliyor (§4.2).
2. **Makine fiyatının gramaj kademesi (KONU-10)** — 8_Renk işlerinde
   65gr→0,140 · 70gr→0,160 · 80gr→0,175 · 90gr→0,200 gözlendi; kart tek
   kademe tutuyor. Kural netleşirse makine kartına kademe tablosu eklenir.
3. **Makine kartı kademe-2'nin (Ebat 8000 → 800/0,15) tetiklenme koşulu** —
   Q=10.000'de bile kademe-1 çalıştı; v1 motoru hep kademe-1 kullanır.
4. **kg alanının birebir formülü** — ürün ağırlığı yaklaşımı (±%3) motorda
   `urunKg` olarak var; sevkiyat bilgisi amaçlı, fiyata etkisi yok.
5. **Sevkiyat tarifesi tutarsızlığı** — tohumda 1 ton 2.000 ₺ / 2 ton 500 ₺
   okundu (bariz ters); katalog ekranından düzeltilecek.
6. **Tohumdaki `?` işaretli hücreler** — `katalog-tohum.md` sonundaki liste;
   kartlarda "teyit edilecek" notuyla duruyor.
