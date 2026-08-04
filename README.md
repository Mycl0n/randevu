# Berber Randevu Sistemi

Tam kapsamlı, dinamik berber salonu randevu ve yönetim sistemi. Sıfır yazılım bilgisi olan kişilerin bile kullanabileceği, kullanıcı dostu admin paneli ile tüm site içeriğini ve hizmetleri yönetmenize olanak tanır.

## Teknolojiler

- **Frontend:** Next.js 14, React 18, Tailwind CSS
- **Backend:** Next.js API Routes (server-side)
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Auth:** JWT (jose + bcryptjs)
- **Icons:** react-icons

## Özellikler

### Müşteri Arayüzü
- Modern ve responsive tasarım
- Hizmetleri, fiyatları ve berber bilgilerini görüntüleme
- Tarih, saat, hizmet ve personel seçerek kolay randevu alma
- Gerçek zamanlı müsaitlik kontrolü

### Admin Paneli
- **Tam dinamik hizmet yönetimi** - hizmet ekleme, düzenleme, fiyat/süre güncelleme
- **İçerik yönetimi** - logo, başlıklar, hakkımızda metni, iletişim bilgileri, sosyal medya linkleri
- **Randevu yönetimi** - listeleme, onaylama, reddetme, bilgi notu ekleme
- **Mesai yönetimi** - çalışma saatleri, mola süreleri, tatil günleri
- **Berber yönetimi** - personel ekleme, düzenleme, aktif/pasif yapma

## Veritabanı Şeması

- **settings** - site ayarları (key-value)
- **services** - hizmetler (isim, fiyat, süre, açıklama)
- **barbers** - berberler (isim, ünvan, biyografi)
- **working_hours** - her berberin günlük çalışma saatleri
- **break_times** - genel mola zamanları
- **holidays** - tatil günleri
- **appointments** - randevular (müşteri bilgisi, hizmet, berber, saat, durum)

## Dosya Yapısı

```
randevu_sistemi/
├── prisma/
│   ├── schema.prisma       # Veritabanı şeması
│   └── seed.js             # Başlangıç verileri
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── admin/      # Admin API route'ları
│   │   │   ├── appointments/ # Randevu API
│   │   │   ├── barbers/    # Berber API
│   │   │   ├── services/   # Hizmet API
│   │   │   ├── settings/   # Ayarlar API
│   │   │   └── slots/      # Boş saat API
│   │   ├── admin/           # Admin panel sayfaları
│   │   ├── berberler/       # Müşteri berberler sayfası
│   │   ├── hizmetler/       # Müşteri hizmetler sayfası
│   │   ├── randevu/         # Randevu alma sayfası
│   │   ├── globals.css     # Global stiller
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Ana sayfa
│   ├── components/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   └── lib/
│       ├── prisma.ts       # Prisma client
│       ├── auth.ts         # Auth middleware
│       └── utils.ts        # Yardımcı fonksiyonlar
├── .env.example
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
└── next.config.js
```

## Adım Adım Kurulum

### 1. Gereksinimler
- **Node.js** 18+ ([nodejs.org](https://nodejs.org))
- **PostgreSQL** veritabanı (yerel veya cloud)
- **Git** (opsiyonel)

### 2. Projeyi Klonla
```bash
cd randevu_sistemi
```

### 3. Bağımlılıkları Yükle
```bash
npm install
```

### 4. Veritabanı Ayarları

PostgreSQL'de bir veritabanı oluşturun:
```sql
CREATE DATABASE berber_randevu;
```

`.env` dosyasını kendi veritabanı bilgilerinizle düzenleyin:
```env
DATABASE_URL="postgresql://kullanici:sifre@localhost:5432/berber_randevu?schema=public"
NEXTAUTH_SECRET="kendi-guclu-anahtariyazin"
NEXTAUTH_URL="http://localhost:3000"
ADMIN_EMAIL="admin@berber.com"
ADMIN_PASSWORD="admin123"
```

### 5. Prisma Migration ve Seed
```bash
# Migration oluştur ve uygula
npx prisma db push

# Prisma Client'i oluştur
npx prisma generate

# Başlangıç verileri yükle
npm run db:seed
```

### 6. Geliştirme Sunucusunu Başlat
```bash
npm run dev
```

### 7. Erişim
- **Site URL:** http://localhost:3000
- **Admin Panel:** http://localhost:3000/admin
- **Admin Giriş Şifresi:** admin123

### 8. Prisma Studio İle Veritabanı Görüntüleme
```bash
npm run db:studio
```

## Admin Panel Kullanımı

### Hizmet Ekleme
1. Admin Panel > Hizmetler'e gidin
2. "Yeni Hizmet Ekle" butonuna tıklayın
3. Hizmet adı, fiyatlama ve süre bilgilerini girin

### Randevu Onaylama
1. Admin Panel > Randevular'a gidin
2. Bekleyen görmek için filtre kullanın
3. Onayla veya İptal butonlarını kullanın

### Site Ayarları Değiştirme
1. Admin Panel > Ayarlar'a gidin
2. Site adı, iletişim bilgileri, sosyal medya linklerini düzenleyin
3. "Kaydet" butonuna tıklayın

### Mesai Düzenleme
1. Admin Panel > Mesai Saatleri'ne gidin
2. Berber seçin, açılış/kapanış saatlerini ayarlayın
3. Mola saatlerini ekleyin/düzenleyin

## Dinamik Hizmet Sistemi - Önemli Not

Sistemde hiçbir hizmet koda gömülü değildir. Tüm hizmetler admin panelinden dinamik olarak yönetilir:

- Hizmet ekleme/silme
- Fiyat güncelleme
- Süre değiştirme (randevu telafi otomatik aydıralanır)
- Sıralama değişthirme

Her hizmetin sürü, o hizmet için schedule'da ayrılacak zaman dilimini belirler. Örneğin 45 dk'lık bir 'Saç Kesimi', 15 dk'lık bir 'Saçlar Temizleme'den daha uzun bir slot kaplayacaktır.

## Production Build

```bash
npm run build
npm start
```

## Lisans

MIT