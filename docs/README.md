# ClubMS Backend Dokümantasyon Yapısı

Bu dizin, proje dokümantasyonunu konu bazlı ve ölçeklenebilir bir yapıda toplar.

## Dokümantasyon Klasörleme Standardı

- `01-architecture/`: Sistem sınırları, katmanlar, modül ilişkileri.
- `02-infrastructure/`: Docker, servis bağımlılıkları, çevresel altyapı.
- `03-data-model/`: Prisma şeması, veri modeli kararları, migration notları.
- `04-development/`: Geliştirme akışları, local çalışma adımları.
- `05-operations/`: Çalıştırma, izleme, bakım ve operasyon prosedürleri.
- `06-history/`: Teknik değişiklik geçmişi ve karar kayıtları.

## Mevcut Proje Yapısı (Özet)

```text
clubms-backend/
  .env
  .env.example
  .gitignore
  docker.compose.yaml
  package.json
  package-lock.json
  tsconfig.json
  prisma.config.ts
  prisma/
    schema.prisma
  docs/
    01-architecture/
    02-infrastructure/
    03-data-model/
    04-development/
    05-operations/
    06-history/
    README.md
```

## Son Yapılan Teknik İşlemler

1. Docker Compose başlatma hatası giderildi.
- Neden: Varsayılan adlarda compose dosyası bulunamadı.
- Çözüm: Compose dosyası açıkça belirtildi.
- Uygulanan komut: `docker compose -f docker.compose.yaml up -d`

2. Compose dosyası modernleştirildi.
- Neden: `version` alanı yeni Compose sürümlerinde obsolete.
- Çözüm: `docker.compose.yaml` içinden `version: '3.8'` satırı kaldırıldı.
- Sonuç: Uyarı kalktı, servisler sağlıklı şekilde çalışıyor.

## Operasyonel Durum

- PostgreSQL servisi: Running
- Redis servisi: Running
- Compose network ve volume'lar: Oluşturulmuş durumda

## Dokümantasyon Yönetim Notu

Bu yapı, ileride her konu başlığı için ayrı dosyalar eklenerek büyütülmelidir. Yeni dokümanlar ilgili numaralı klasör altında açılmalı ve kısa, teknik, versiyonlanabilir formatta tutulmalıdır.
