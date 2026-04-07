# Backend Bootstrap ve Prisma Gecisi

Tarih: 2026-04-08
Kapsam: Ilk backend iskeleti, lokal altyapi, Prisma 7 uyumlulugu, gelistirme akisi stabilizasyonu.

## Amac

- Lokal gelistirme ortamini hizli ve tekrar edilebilir hale getirmek.
- Kimlik baglami icin temel veri modelini olusturmak.
- Node + TypeScript servis baslangic akisini ayaga kaldirmak.

## Ne Yapildi

1. Altyapi ve ortam
- Docker Compose ile PostgreSQL ve Redis servisleri eklendi.
- Ortam degiskenleri standardize edildi: .env.example olusturuldu.

2. Prisma ve veritabani
- Prisma 7 konfig yapisina gecildi.
- schema.prisma icindeki datasource url tanimi kaldirildi.
- Baglanti bilgisi prisma.config.ts icine tasindi.
- Identity tablolari icin migration uretildi ve uygulandi.

3. Uygulama iskeleti
- src altinda moduler klasor yapisi olusturuldu.
- identity modulu icin alt klasorler acildi: controllers, services, repositories, interfaces, dtos.
- app.ts, main.ts ve Prisma client dosyasi eklendi.
- Health endpoint tanimlandi.

4. Gelistirme scriptleri
- start:dev scripti Windows uyumlu hale getirildi.
- nodemon + ts-node calisma akisi duzenlendi.

## Neden Bu Sekilde

- Docker tabanli servisler ekip ici ayni calisma kosulunu saglar.
- Prisma 7, baglanti URL yonetimini schema disina tasidigi icin yeni yapi zorunludur.
- Moduler klasorleme, buyuyen kod tabaninda sorumluluk ayrimini korur.
- Windows uyumlu script, gelistirme ortami kaynakli calisma kesintilerini azaltir.

## Nasil Uygulandi

1. Servisleri baslat
- docker compose -f docker.compose.yaml up -d

2. Migration calistir
- npx prisma migrate dev --name init_identity_context

3. Uygulamayi gelistirme modunda baslat
- npm run start:dev

## Beklenen Sonuc

- PostgreSQL ve Redis calisir durumda.
- Prisma migration kayitlari olusmus durumda.
- Uygulama ayaga kalkar ve health endpoint cevap verir.

## Risk ve Notlar

- start:dev calismasi icin localde node_modules icinde ts-node bulunmali.
- Prisma surum yukseltilirken schema/config ayrimi korunmali.
- Yeni moduller ayni klasorleme standardi ile acilmalidir.
