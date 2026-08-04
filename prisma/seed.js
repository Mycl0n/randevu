const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Veritabanı başlangıç verileri yükleniyor...");

  // SETTINGS
  const settings = [
    { key: "site_name", value: "Royal Barber" },
    { key: "site_description", value: "Modern erkek kuaförü ve berber hizmetleri" },
    { key: "logo_url", value: "" },
    { key: "hero_title", value: "Modern Berber Deneyimi" },
    { key: "hero_subtitle", value: "Stilinizi tamamlamak için buradayız" },
    { key: "about_title", value: "Hakkımızda" },
    { key: "about_text", value: "Royal Barber, 2010 yılından beri erkek kuaförlüğünde kalite ve memnuniyeti ön planda tutan bir işletmedir. Deneyimli ekibimizle sizlere en iyi hizmeti sunmak için çalışıyoruz." },
    { key: "address", value: "Bağdat Caddesi No:123, Kadıköy/İstanbul" },
    { key: "phone", value: "+90 555 123 45 67" },
    { key: "email", value: "info@royalbarber.com" },
    { key: "instagram", value: "https://instagram.com/royalbarber" },
    { key: "facebook", value: "https://facebook.com/royalbarber" },
    { key: "whatsapp", value: "905551234567" },
    { key: "work_start", value: "09:00" },
    { key: "work_end", value: "19:00" },
  ];

  for (const s of settings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }

  // SERVICES
  const existingServices = await prisma.service.count();
  if (existingServices === 0) {
    const services = [
      { name: "Saç Kesimi", duration: 45, price: 250.00, description: "Modern saç kesimi ve şekillendirme", sortOrder: 1 },
      { name: "Sakal Tıraşı", duration: 30, price: 150.00, description: "Ustura sakal tıraşı ve şekillendirme", sortOrder: 2 },
      { name: "Saç & Sakal Paketi", duration: 60, price: 350.00, description: "Saç kesimi + sakal tıraşı paket hizmeti", sortOrder: 3 },
      { name: "Yüz Bakımı", duration: 45, price: 200.00, description: "Cilt tipinize uygun modern yüz bakımı", sortOrder: 4 },
      { name: "Çocuk Saç Kesim", duration: 30, price: 150.00, description: "12 yaş altı çocuklar için saç kesimi", sortOrder: 5 },
    ];

    for (const s of services) {
      await prisma.service.create({ data: s });
    }
  }

  // BARBERS
  const existingBarbers = await prisma.barber.count();
  if (existingBarbers === 0) {
    const barbers = [
      { name: "Ahmet Yılmaz", title: "Usta Berber", bio: "15 yıllık deneyim", sortOrder: 1 },
      { name: "Mehmet Demir", title: "Senior Berber", bio: "10 yıllık deneyim", sortOrder: 2 },
      { name: "Ali Kaya", title: "Berber", bio: "5 yıllık deneyim", sortOrder: 3 },
    ];

    for (const b of barbers) {
      const barber = await prisma.barber.create({ data: b });
      for (let day = 0; day < 7; day++) {
        await prisma.workingHour.create({
          data: {
            barberId: barber.id,
            dayOfWeek: day,
            openTime: "09:00",
            closeTime: "19:00",
            isWorking: day !== 0,
          },
        });
      }
    }
  }

  // BREAK TIMES
  const existingBreaks = await prisma.breakTime.count();
  if (existingBreaks === 0) {
    const breakTimes = [
      { name: "Öğle Molası", startTime: "12:00", endTime: "13:00", isActive: true },
      { name: "İkindi Molası", startTime: "16:00", endTime: "16:30", isActive: true },
    ];

    for (const b of breakTimes) {
      await prisma.breakTime.create({ data: b });
    }
  }

  console.log("✅ Seed başarıyla tamamlandı!");
  console.log("📧 Admin: admin@berber.com");
  console.log("🔑 Şifre: admin123");
}

main()
  .catch((e) => {
    console.error("Seed hatası:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());