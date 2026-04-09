# ClubMS — Sprint Timeline & Teknik Detaylar

> **Mimari:** Modular Monolith · Clean Architecture · Node.js + Express.js + TypeScript + Prisma  
> **Üniversite:** Bartın Üniversitesi · **Geliştirici:** Tek kişi  
> **Toplam Süre:** ~6 Sprint (12 hafta MVP)

---

## Okuma Kılavuzu

| Sembol | Anlam |
|--------|-------|
| ✅ | Tamamlandı |
| 🔲 | Yapılacak |
| ⚠️ | Kritik dikkat noktası |
| 💡 | Teknik açıklama / öğretici not |
| 🔗 | Bağımlılık — önce şu bitmeli |

---

## FAZ 01 — Altyapı, Veritabanı ve Proje İskeleti ✅

**Sprint 1 · Hafta 1–2**  
**Hedef:** Çalışan bir iskelet. `npm run start:dev` → `/health` → `200 OK`

---

### Micro Task Listesi

- ✅ `mkdir clubms-backend && git init`
- ✅ `npm init -y` + production bağımlılıkları kur
- ✅ `npm install -D typescript ts-node nodemon prisma jest supertest ts-jest eslint @types/jest`
- ✅ `tsconfig.json` oluştur — `rootDir: ./src`, `outDir: ./dist`, path alias `@modules/*`
- ✅ `docker-compose.yml` yaz — PostgreSQL 15 + Redis 7
- ✅ `.env` dosyası oluştur — `DATABASE_URL`, `REDIS_URL`, `PORT`
- ✅ `docker-compose up -d` ile servisleri ayağa kaldır
- ✅ `npx prisma init` → `schema.prisma` güncelle
- ✅ Identity Context tablolarını yaz: `IdentityUser`, `IdentityGlobalRole`
- ✅ `npx prisma migrate dev --name init_identity_context`
- ✅ `src/shared/prisma/prisma.client.ts` → Singleton PrismaClient
- ✅ Klasör yapısını oluştur: `core/`, `shared/`, `modules/`
- ✅ `src/app.ts` → Express + CORS + JSON middleware
- ✅ `src/main.ts` → bootstrap + port dinle
- ✅ `/health` endpoint → `{ status: 'UP' }`
- ✅ `package.json` scripts: `start:dev`, `build`, `start`
- ✅ İlk commit: `feat: phase 1 - project skeleton`

---

### ⚠️ Dikkat Noktaları — Faz 01

> **Singleton PrismaClient**  
> `new PrismaClient()` her import'ta çağrılırsa veritabanı "Too many connections" hatasıyla çöker.  
> Çözüm: `prisma.client.ts` içinde tek instance oluştur, her yerden bunu import et.

> **`tsconfig.json` path alias**  
> `@modules/*` gibi alias'lar tanımlandıktan sonra `ts-node` bunları çözemez.  
> Çözüm: `tsconfig-paths` paketini kur ve `nodemon` scriptine ekle.

> **Docker healthcheck**  
> `api` servisi `postgres`'tan önce başlarsa bağlantı hatası alırsın.  
> Çözüm: `depends_on: postgres: condition: service_healthy` kullan.

> **`.env` dosyası**  
> Asla `git add .env` yapma. `.gitignore`'a ilk commit'ten önce ekle.

---

## FAZ 02 — Identity Modülü: Domain → Repository → Service → Controller

**Sprint 2 · Hafta 3–4**  
**Hedef:** `POST /api/v1/auth/register` ve `POST /api/v1/auth/login` çalışıyor

---

### 💡 Bu Fazda Ne Öğreniyorsun?

Clean Architecture'da kodlama sırası şudur:

```
Domain Entity → Repository Interface → Service (Use Case) → Repository Impl → Controller → Router
```

**Neden bu sıra?**  
Her adım bir sonrakinin bağımlılığını tanımlar. Entity'yi bilmeden interface yazamazsın.  
Interface'i bilmeden service yazamazsın. Service'i bilmeden controller yazamazsın.

---

### Micro Task Listesi

#### Adım 1 — Domain Entity

- 🔲 `src/modules/identity/domain/User.entity.ts` oluştur
- 🔲 Constructor alanları: `id (string/UUID)`, `email`, `studentNumber`, `fullName`, `firebaseUid`, `emailVerified`, `status`
- 🔲 `UserStatus` type'ı tanımla: `'ACTIVE' | 'SUSPENDED'`
- 🔲 `isActive(): boolean` → `return this.status === 'ACTIVE'`
- 🔲 `canLogin(): boolean` → `return this.isActive() && this.emailVerified`
- 🔲 `UserEntity.create(params)` static factory method yaz
  - `emailVerified: false` — yeni kullanıcı henüz doğrulamamış
  - `status: 'ACTIVE'` — yeni kullanıcı varsayılan aktif
- 🔲 Unit test yaz: `UserEntity.canLogin()` → doğrulanmamış kullanıcı false döner mi?

> 💡 **Factory Method neden gerekli?**  
> `new UserEntity(...)` ile her yerde farklı başlangıç değerleri verilebilir → tutarsızlık.  
> `UserEntity.create(params)` ile başlangıç değerleri tek yerden yönetilir.  
> Geçersiz state'de (örn: negatif kapasite) hata fırlatılabilir.

---

#### Adım 2 — Repository Interface

- 🔲 `src/modules/identity/domain/IUserRepository.ts` oluştur
- 🔲 `findById(id: string): Promise<UserEntity | null>`
- 🔲 `findByEmail(email: string): Promise<UserEntity | null>`
- 🔲 `findByFirebaseUid(uid: string): Promise<UserEntity | null>`
- 🔲 `save(user: UserEntity): Promise<void>`

> 💡 **Bu dosyada Prisma import'u OLMAMALI**  
> Interface = sözleşme. "Veri lazım" demek. "Prisma ile al" demek değil.  
> Test sırasında `MockUserRepository` bu interface'i implement eder, gerçek DB çağrısı olmaz.

---

#### Adım 3 — DTO (Data Transfer Object)

- 🔲 `src/modules/identity/dtos/RegisterUser.dto.ts` oluştur
- 🔲 `email` alanı: `@bartin.edu.tr` domain regex kontrolü
- 🔲 `studentNumber`, `fullName`, `password` alanları
- 🔲 `class-validator` dekoratörleri: `@IsEmail()`, `@Matches()`, `@IsNotEmpty()`
- 🔲 `LoginUser.dto.ts`: `firebaseIdToken` alanı

> 💡 **DTO nedir?**  
> HTTP isteğinin body'sinden gelen ham veriyi doğrulamak için kullanılan sade sınıf.  
> Controller, DTO'yu validate eder → geçerliyse Service'e iletir.  
> Entity değil — içinde iş mantığı yoktur.

> ⚠️ **`@bartin.edu.tr` domain kısıtlaması**  
> Regex: `/.+@bartin\.edu\.tr$/`  
> Bu kural DTO'da mı olmalı, Service'te mi? → DTO'da! Çünkü bu bir **girdi doğrulama** kuralı,  
> domain iş kuralı değil. Geçersiz domain → 400 Bad Request, hiç Service'e ulaşmaz.

---

#### Adım 4 — Service (Use Case)

- 🔲 `src/modules/identity/services/auth.service.ts` oluştur
- 🔲 Constructor'a inject et: `IUserRepository`, Firebase Admin SDK, EventEmitter
- 🔲 `register(dto: RegisterUserDto): Promise<UserEntity>` yaz:
  1. Email daha önce kayıtlı mı? → `findByEmail` → varsa `409 Conflict`
  2. Firebase'de kullanıcı oluştur: `firebaseAdmin.createUser()`
  3. `UserEntity.create(params)` → factory method çağır
  4. `userRepo.save(user)` → veritabanına kaydet
  5. Outbox kaydı oluştur: `USER_REGISTERED` event
  6. `UserEntity` döndür
- 🔲 `verifyFirebaseToken(idToken: string): Promise<UserEntity>` yaz:
  1. `firebaseAdmin.verifyIdToken(idToken)`
  2. `findByFirebaseUid(uid)` → kullanıcıyı getir
  3. `canLogin()` kontrolü → false ise `403`

> ⚠️ **Service, Prisma'yı bilmez**  
> Service'in constructor'ında `PrismaUserRepository` değil, `IUserRepository` olmalı.  
> Hangi implementasyonun geldiğini Service umursamaz → bu Dependency Inversion Prensibi.

> ⚠️ **Firebase hata yönetimi**  
> `firebaseAdmin.createUser()` email zaten varsa hata fırlatır.  
> Bu hatayı yakala → `AppError` sınıfıyla anlamlı mesaja çevir.

---

#### Adım 5 — Repository Implementation

- 🔲 `src/modules/identity/repositories/user.repository.ts` oluştur
- 🔲 `PrismaUserRepository implements IUserRepository`
- 🔲 Constructor'a `PrismaClient` inject et
- 🔲 `findById`: `prisma.identityUser.findUnique({ where: { id } })`
- 🔲 `findByEmail`: `prisma.identityUser.findUnique({ where: { email } })`
- 🔲 `save`: `prisma.identityUser.create({ data: ... })` — Entity'den Prisma modeline map et

> 💡 **Entity → Prisma Mapping**  
> `UserEntity` ile Prisma'nın `IdentityUser` modeli birebir aynı olmak zorunda değil.  
> Repository, ikisi arasında çevirmen görevi görür.  
> `fromPrisma(record): UserEntity` gibi private bir mapper metodu yaz.

---

#### Adım 6 — Firebase Admin SDK

- 🔲 `src/shared/firebase/firebase.admin.ts` oluştur
- 🔲 Singleton Firebase Admin instance
- 🔲 `.env`'e ekle: `FIREBASE_PROJECT_ID`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL`

> ⚠️ **Firebase Service Account**  
> Firebase Console → Project Settings → Service Accounts → JSON indir.  
> Bu dosyayı asla repoya commit etme. `.env` üzerinden environment variable olarak yönet.

---

#### Adım 7 — Controller

- 🔲 `src/modules/identity/controllers/auth.controller.ts` oluştur
- 🔲 `register` handler: DTO validate → `authService.register()` → `201 Created`
- 🔲 `login` handler: DTO validate → `authService.verifyFirebaseToken()` → `200 OK`
- 🔲 Controller içinde **Prisma çağrısı OLMAMALI** — sadece HTTP katmanı

> 💡 **Controller'ın tek görevi**  
> 1. HTTP isteğini al  
> 2. DTO'ya dönüştür ve validate et  
> 3. Service'i çağır  
> 4. HTTP yanıtını oluştur  
> İş mantığı YOKTUR. Validasyon YOKTUR (DTO'da). DB çağrısı YOKTUR (Repository'de).

---

#### Adım 8 — Middleware

- 🔲 `src/core/middleware/auth.middleware.ts` oluştur
- 🔲 `Authorization: Bearer <token>` header'ından token'ı çıkar
- 🔲 `firebaseAdmin.verifyIdToken(token)` → `req.user` objesine ekle
- 🔲 Token yoksa veya geçersizse → `401 Unauthorized`

> ⚠️ **Middleware sırası önemli**  
> `auth.middleware` → `rbac.middleware` sırasıyla çalışmalı.  
> Önce "kim olduğunu" doğrula, sonra "ne yapabileceğini" kontrol et.

---

#### Adım 9 — Router ve DI Container

- 🔲 `src/modules/identity/identity.router.ts` oluştur
- 🔲 `POST /auth/register`, `POST /auth/login`, `GET /auth/me` route'larını ekle
- 🔲 `src/core/container.ts` → Awilix container'a Identity bağımlılıklarını kaydet:
  - `userRepository: asClass(PrismaUserRepository).scoped()`
  - `authService: asClass(AuthService).scoped()`
- 🔲 `src/app.ts`'e identity router'ı ekle: `app.use('/api/v1', identityRouter)`

> 💡 **`scoped()` ne anlama gelir?**  
> Her HTTP isteğinde yeni bir instance oluşturulur, istek bitince yok edilir.  
> Alternatifler: `singleton()` (uygulama ömrü boyunca tek), `transient()` (her kullanımda yeni).  
> Service'ler için `scoped()` güvenli default'tur.

---

#### Adım 10 — AppError Sınıfı

- 🔲 `src/infrastructure/errors/AppError.ts` oluştur
- 🔲 `constructor(message, statusCode, errorCode?)`
- 🔲 `src/core/filters/globalError.filter.ts` → Express 4-parametre error handler
- 🔲 `AppError` yakala → standart JSON yanıt döndür:
  ```json
  { "success": false, "error": { "code": "...", "message": "...", "statusCode": 409 } }
  ```

---

#### Adım 11 — Testler

- 🔲 `UserEntity` unit testleri:
  - `canLogin()` → emailVerified false → false döner
  - `canLogin()` → status SUSPENDED → false döner
  - `UserEntity.create()` → emailVerified başlangıçta false
- 🔲 `AuthService` unit testleri (mock repository ile):
  - Kayıtlı email → `409` fırlatır
  - Geçerli kayıt → `UserEntity` döner
- 🔲 Integration test: `POST /api/v1/auth/register` → `201`

---

### ⚠️ Dikkat Noktaları — Faz 02

> **Circular Dependency Tehlikesi**  
> `AuthService` → `IUserRepository` → `PrismaUserRepository` → `prisma.client`  
> Bu zincirde döngü oluşursa Node.js `undefined` import döner.  
> Çözüm: Her katmanın bağımlılık yönünü tek yönlü tut (içe doğru).

> **Password hiçbir zaman entity'de tutulmamalı**  
> Şifre yönetimi Firebase'in sorumluluğundadır.  
> `UserEntity`'de `password` alanı OLMAZ.

> **`studentNumber` email'den türetilmez**  
> `ahmet.yilmaz@bartin.edu.tr` → studentNumber `ahmet.yilmaz` değil.  
> Register DTO'sunda ayrı alan olarak alınır.

---

## FAZ 03 — Clubs Modülü: Üyelik ve Rol Yönetimi

**Sprint 3 · Hafta 5–6**  
**Hedef:** Kulüp oluşturma, üyelik başvurusu, PRESIDENT onayı

---

### Micro Task Listesi

- 🔲 `schema.prisma`'ya Clubs Context ekle: `ClubsClub`, `ClubsMembership`, `ClubsDocument`
- 🔲 `npx prisma migrate dev --name clubs_context`
- 🔲 `Club.entity.ts` domain entity yaz
- 🔲 `Membership.entity.ts` domain entity yaz — `MembershipRole` type: `'PRESIDENT' | 'VICE_PRESIDENT' | 'MEMBER' | 'PENDING'`
- 🔲 `IClubRepository` interface yaz
- 🔲 `IMembershipRepository` interface yaz
- 🔲 `ClubsService` yaz:
  - `createClub(dto)` → sadece `SUPER_ADMIN`
  - `applyMembership(userId, clubId)` → `PENDING` kaydı oluştur
  - `approveMembership(userId, clubId, presidnetId)` → `MEMBER`'a çevir
  - `rejectMembership(userId, clubId, presidentId)` → kaydı sil
- 🔲 `IClubServicePublic` interface yaz — Events modülü bu interface üzerinden çağırır
- 🔲 `checkPermission(userId, clubId, minRole)` metodu → rol hiyerarşisi kontrolü
- 🔲 RBAC middleware: `rbac.middleware.ts` → `req.user` rolünü kontrol et
- 🔲 `clubs.router.ts` → tüm endpoint'leri ekle
- 🔲 Container'a Clubs bağımlılıklarını kaydet

> ⚠️ **Soft FK Kuralı**  
> `clubs_memberships.userId` → `identity_users.id`'ye Prisma `@relation` YAZILMAZ.  
> Cross-context referans sadece UUID olarak tutulur.  
> `userId`'nin gerçekten var olduğunu uygulama katmanında `identityService.verifyUser()` ile doğrula.

> 💡 **Rol Hiyerarşisi**  
> `['PENDING', 'MEMBER', 'VICE_PRESIDENT', 'PRESIDENT']`  
> `hierarchy.indexOf(userRole) >= hierarchy.indexOf(minRole)` → yeterli rol mü?  
> Bu mantık `Membership.entity.ts` içinde bir domain metodu olabilir.

---

## FAZ 04 — Events Modülü: Etkinlik ve Optimistic Locking

**Sprint 4 · Hafta 7–8**  
**Hedef:** Etkinlik CRUD, katılım kaydı, race condition koruması

---

### Micro Task Listesi

- 🔲 `schema.prisma`'ya Events Context ekle: `EventsEvent`, `EventsAttendance`, `EventsTag`
- 🔲 `version Int @default(1)` kolonunun schema'da var olduğunu doğrula
- 🔲 `npx prisma migrate dev --name events_context`
- 🔲 `Event.entity.ts` domain entity yaz:
  - `canAcceptAttendee(): boolean` → `status === 'PUBLISHED' && currentAttendees < capacity`
  - `publish(): void` → sadece `DRAFT`'tan geçiş
  - `cancel(): void` → `COMPLETED`'dan geçiş yasak
  - State Machine: `DRAFT → PUBLISHED → CANCELLED/COMPLETED`
- 🔲 `IEventRepository` interface yaz — `attendWithOptimisticLock()` dahil
- 🔲 `EventsService` yaz:
  - `createEvent(dto)` → `DRAFT` olarak oluştur
  - `publishEvent(id)` → `entity.publish()` → kaydet
  - `attendEvent(eventId, userId)` → tam use case akışı
  - `cancelEvent(id)` → `entity.cancel()` → EventEmitter emit
- 🔲 `PrismaEventRepository` yaz — `attendWithOptimisticLock` Prisma `$transaction` içinde
- 🔲 `events.router.ts` → tüm endpoint'leri ekle
- 🔲 Optimistic Lock unit testi yaz

> ⚠️ **Optimistic Locking — Kritik Detay**  
> `updateMany({ where: { id, version: currentVersion }, data: { version: { increment: 1 } } })`  
> `result.count === 0` ise → başka bir transaction version'ı değiştirmiş → `409 Conflict` döndür.  
> Naif yaklaşım: önce SELECT, sonra INSERT → race condition garantili.  
> Doğru yaklaşım: tek `updateMany` ile hem kontrol hem güncelleme atomik.

> 💡 **`$transaction()` neden gerekli?**  
> `currentAttendees++` ve `eventsAttendance.create()` iki ayrı işlem.  
> Biri başarılı diğeri başarısız olursa → veri tutarsızlığı.  
> `$transaction()` → ikisi ya birlikte başarılı ya ikisi rollback.

> ⚠️ **Outbox kaydı aynı transaction içinde**  
> `infrastructureOutboxEvent.create()` → aynı `$transaction` bloğu içinde.  
> Sunucu notification göndermeden çökerse → outbox kaydı kalır → worker tekrar dener.

---

## FAZ 05 — Notifications: BullMQ ve Outbox Pattern

**Sprint 5 · Hafta 9–10**  
**Hedef:** Email bildirimleri asenkron, sunucu çökse bile kayıp yok

---

### Micro Task Listesi

- 🔲 `src/shared/redis/redis.client.ts` → Singleton ioredis bağlantısı
- 🔲 `src/modules/notifications/queues/notification.queue.ts` → `emailQueue`, `pushQueue`
- 🔲 Queue config: `attempts: 3`, `backoff: { type: 'exponential', delay: 1000 }`
- 🔲 `src/modules/notifications/workers/email.worker.ts` → `concurrency: 5`
- 🔲 `src/modules/notifications/listeners/event.listener.ts` → EventEmitter listener
  - `attendance.recorded` → `emailQueue.add()`
  - `event.cancelled` → tüm üyelere bildirim kuyruğa ekle
- 🔲 `src/infrastructure/outbox/outbox.processor.ts` → periyodik polling
  - `published: false` kayıtları bul
  - BullMQ'ya ekle
  - `published: true` yap
- 🔲 BullMQ dashboard (optional): Bull Board entegrasyonu

> ⚠️ **EventEmitter vs Outbox — Ne Zaman Hangisi?**  
> `EventEmitter`: hızlı, basit, sunucu çökerse kaybolur → düşük öncelikli bildirimler  
> `Outbox Pattern`: yavaş, garantili, sunucu çökse bile çalışır → kritik bildirimler  
> ClubMS'te ikisi birlikte kullanılır: EventEmitter tetikler, Outbox garantiler.

> 💡 **Exponential Backoff neden gerekli?**  
> Mail sunucusu geçici olarak yanıt vermiyorsa sistemi boğmadan tekrar denenmesi için.  
> 1. deneme: 1 saniye bekle → 2. deneme: 2 saniye → 3. deneme: 4 saniye.  
> Çok yüksek `concurrency` → SMTP rate limit'e çarpar.  
> Güvenli başlangıç: `concurrency: 5`.

---

## FAZ 06 — Frontend, Analytics ve Deploy

**Sprint 6 · Hafta 11–12**  
**Hedef:** React SPA çalışıyor, CI/CD pipeline aktif, MVP teslime hazır

---

### Micro Task Listesi

#### Frontend

- 🔲 `create-react-app` veya Vite ile React + TypeScript projesi başlat
- 🔲 Zustand store: `useAuthStore` → `user`, `globalRole`, `clubRoles`, `isAuthenticated`
- 🔲 `persist` middleware → localStorage'a kaydet (sayfa yenilenince login kalır)
- 🔲 `hasClubRole(clubId, minRole)` helper → rol hiyerarşisi kontrolü
- 🔲 Atomic Design klasör yapısı: `atoms/`, `molecules/`, `organisms/`, `templates/`, `pages/`
- 🔲 `AuthLayout` ve `DashboardLayout` template bileşenleri
- 🔲 `EventCard` bileşeni → `React.memo()` ile optimize et
- 🔲 Axios instance → `Authorization: Bearer` header otomatik ekle
- 🔲 Firebase SDK entegrasyonu → login sonrası `idToken` al → backend'e gönder

#### Analytics

- 🔲 `schema.prisma`'ya Analytics tabloları ekle: snapshot verileri
- 🔲 `src/modules/analytics/jobs/snapshot.cron.ts` → `node-cron` ile günlük çalışır
- 🔲 Kulüp büyüme, etkinlik katılım oranları hesapla

#### Deploy

- 🔲 `Dockerfile` yaz — multi-stage build (builder + production)
- 🔲 `HEALTHCHECK` ekle: `wget -qO- http://localhost:3000/health || exit 1`
- 🔲 `.github/workflows/ci.yml` yaz:
  - `npm ci` → `tsc --noEmit` → `eslint` → `jest --coverage` → `npm run build`
  - PostgreSQL ve Redis servislerini CI ortamında ayağa kaldır
- 🔲 Codecov entegrasyonu

> ⚠️ **Multi-stage Build**  
> Stage 1 (builder): TypeScript derle → `dist/` üret  
> Stage 2 (production): sadece `dist/` + `node_modules` (devDependencies hariç) kopyala  
> Sonuç: ~200MB → ~80MB image boyutu.

> ⚠️ **`npx prisma generate` Docker içinde**  
> Production image'da `prisma generate` çalıştırılmalı — aksi hâlde Prisma Client bulunamaz hatası alırsın.

---

## Genel Mimari Kurallar (Her Fazda Geçerli)

| Kural | Açıklama |
|-------|----------|
| Domain → içe bağımlı | Entity, Prisma/Express/Firebase import etmez |
| Soft FK | Cross-context tablolar arası `@relation` yasak |
| Tek Prisma instance | Singleton pattern — `Too many connections` önlenir |
| Service → interface | `IUserRepository`, `IEventRepository` — implementasyon değil |
| Controller → sadece HTTP | İş mantığı, DB çağrısı controller'da olmaz |
| AppError | Tüm hatalar `AppError` sınıfından türer |
| Outbox + transaction | Kritik async işlemler outbox ile garantilenir |
| Test piramidi | Unit (100+) > Integration (20-50) > E2E (5-10) |

---

## Bağımlılık Grafiği (Modüller Arası)

```
Identity ←── Clubs ←── Events ──→ Notifications
                           │
                           └──→ Analytics
                           
Tüm modüller ──→ Infrastructure (Prisma, Redis, Firebase)

YASAK: Notifications → Events (döngüsel bağımlılık)
YASAK: Identity → Clubs (döngüsel bağımlılık)
```

---

## Karar Özeti (ADR)

| # | Karar | Seçilen | Reddedilen |
|---|-------|---------|------------|
| 1 | Mimari stil | Modular Monolith | Microservices |
| 2 | Framework | Express.js + TS | NestJS |
| 3 | ORM | Prisma | TypeORM |
| 4 | Auth | Firebase Auth | Custom JWT |
| 5 | Queue | BullMQ + Redis | Kafka |
| 6 | Concurrency | Optimistic Locking | Pessimistic Lock |
| 7 | Async garanti | Outbox Pattern | EventEmitter only |
| 8 | Frontend state | Zustand | Redux Toolkit |
| 9 | Cross-context FK | Soft FK (UUID) | Hard FK |
| 10 | DI | Awilix | Manuel new() |

---

*ClubMS · Bartın Üniversitesi · v1.0.0 · 2026*