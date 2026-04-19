# ClubMS Backend API

🎓 Üniversite Kulüp Yönetim Sistemi - RESTful API

## 📋 İçindekiler

- [Özellikler](#-özellikler)
- [Teknoloji Stack](#-teknoloji-stack)
- [Kurulum](#-kurulum)
- [API Dokümantasyonu](#-api-dokümantasyonu)
- [Mimari](#-mimari)
- [Güvenlik](#-güvenlik)
- [Geliştirme](#-geliştirme)

## ✨ Özellikler

### 🔐 Identity & Authentication
- Firebase Authentication entegrasyonu
- Role-Based Access Control (RBAC)
- Global roller: SUPER_ADMIN, ADMIN, USER
- Kulüp rolleri: PRESIDENT, VICE_PRESIDENT, MEMBER
- JWT token yönetimi

### 🏢 Kulüp Yönetimi
- Kulüp CRUD işlemleri
- Üyelik başvuru sistemi
- Onay/Red mekanizması
- Rol yönetimi
- Soft delete

### 📅 Etkinlik Yönetimi
- Etkinlik CRUD işlemleri
- State Machine (DRAFT → PUBLISHED → CANCELLED/COMPLETED)
- Kapasite yönetimi (Optimistic Locking)
- Tag sistemi
- GPS koordinat desteği

### ✅ Check-in Sistemleri
- **QR Kod Check-in**: TOTP tabanlı güvenli QR kodlar (30 saniye geçerli)
- **GPS Check-in**: Haversine formula ile konum doğrulama (100m içinde)
- **Manuel Check-in**: Standart katılım
- Check-in zaman kontrolü (30 dk önce - bitiş saati)

### 📊 Analytics & Reporting
- Global sistem istatistikleri
- Kulüp büyüme analizi
- Etkinlik katılım raporları
- Check-in yöntemleri dağılımı
- Snapshot Pattern (günlük cron job)

### 🔔 Bildirim Sistemi
- Transactional Outbox Pattern
- BullMQ + Redis job queue
- Email bildirimleri
- Push notification desteği
- At-least-once delivery garantisi

## 🛠️ Teknoloji Stack

### Core
- **Runtime**: Node.js 20.x
- **Language**: TypeScript 5.x
- **Framework**: Express.js
- **Database**: PostgreSQL 15
- **ORM**: Prisma 6.x

### Authentication & Security
- **Auth**: Firebase Admin SDK
- **Validation**: Zod
- **QR Codes**: otplib (TOTP), qrcode
- **Encryption**: bcrypt, crypto

### Background Jobs
- **Queue**: BullMQ
- **Cache**: Redis
- **Scheduler**: node-cron

### Architecture & Patterns
- **DI Container**: Awilix
- **Architecture**: Clean Architecture + DDD
- **Patterns**: Repository, Service Layer, Outbox, Snapshot, State Machine

### Documentation
- **API Docs**: Swagger/OpenAPI 3.0
- **Collection**: Postman

### Development
- **Linting**: ESLint
- **Formatting**: Prettier
- **Testing**: Jest (planned)

## 🚀 Kurulum

### Gereksinimler

- Node.js 20.x veya üzeri
- PostgreSQL 15.x
- Redis 7.x
- Firebase Project (Authentication için)

### Local Development

#### 1. Repository'yi Klonlayın

```bash
git clone <repository-url>
cd clubms-backend
```

#### 2. Bağımlılıkları Kurun

```bash
npm install
```

#### 3. Environment Variables

`.env` dosyası oluşturun:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/clubms"

# Firebase
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_PRIVATE_KEY="your-private-key"
FIREBASE_CLIENT_EMAIL="your-client-email"

# Redis
REDIS_HOST="localhost"
REDIS_PORT=6379
REDIS_PASSWORD=""

# QR Code Security
QR_SECRET_BASE="change-this-in-production"

# Server
PORT=3000
NODE_ENV="development"
```

#### 4. Database Migration

```bash
npx prisma migrate dev
```

#### 5. Sunucuyu Başlatın

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm run build
npm start
```

### 🌐 Production Deployment (Render)

#### Hızlı Deployment

```bash
# Build'i doğrula
npm run verify:build

# Deploy et
npm run deploy
```

#### Manuel Deployment

Detaylı adımlar için: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

**Özet:**
1. Render hesabı oluşturun
2. GitHub repository'yi bağlayın
3. `render.yaml` otomatik algılanır
4. Environment variables ekleyin
5. Deploy!

**Gerekli Environment Variables:**
- `FIREBASE_PROJECT_ID`
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_CLIENT_EMAIL`
- `QR_SECRET_BASE` (auto-generated)
- `DATABASE_URL` (auto-populated)
- `REDIS_*` (auto-populated)

#### GitHub Actions

**Keep-Alive (Cold Start Prevention):**
- Her 10 dakikada bir health check
- Render free tier'ı aktif tutar
- Otomatik çalışır

**CI/CD Pipeline:**
- Her push'ta otomatik build
- Test ve validation
- Otomatik deployment
- Health check verification

**Manuel Deploy:**
```bash
# GitHub Actions sekmesinde
# "Manual Deploy to Render" workflow'unu çalıştırın
```

## 📚 API Dokümantasyonu

### Modern Dokümantasyon Arayüzleri

API dokümantasyonuna 3 farklı arayüzden erişebilirsiniz:

#### 1. 🎨 Modern Landing Page

```
http://localhost:3000/api-docs/modern
```

**Özellikler:**
- Responsive tasarım
- Tüm dokümantasyon seçeneklerine hızlı erişim
- API özellikleri özeti
- Mobil uyumlu

#### 2. 🚀 Swagger UI (İnteraktif)

```
http://localhost:3000/api-docs
```

**Özellikler:**
- Tüm endpoint'leri görüntüleme
- Request/Response şemalarını inceleme
- Doğrudan tarayıcıdan API test etme
- Authentication token yönetimi
- Try it out özelliği
- Syntax highlighting

#### 3. 📖 Redoc (Temiz & Responsive)

```
http://localhost:3000/api-docs/redoc
```

**Özellikler:**
- Temiz, modern tasarım
- Mobil uyumlu
- Kolay okunabilir
- Hızlı arama
- Kod örnekleri
- Responsive layout

### OpenAPI Spesifikasyonu

**JSON Format:**
```bash
curl http://localhost:3000/api-docs.json > openapi.json
```

**Kullanım Alanları:**
- Kod generation (client SDK'lar)
- API testing tools
- Mock server oluşturma
- CI/CD entegrasyonu

### Postman Collection

**Web'den İndir:**
```
http://localhost:3000/api-docs/postman
http://localhost:3000/api-docs/postman/environment
```

**Manuel Import:**

1. Postman'i açın
2. Import > File
3. `api-docs/postman/ClubMS-API.postman_collection.json` dosyasını seçin
4. `api-docs/postman/ClubMS-Environment.postman_environment.json` dosyasını seçin
5. Environment'ı "ClubMS - Local" olarak ayarlayın

**Otomatik Token Yönetimi:**
- Register/Login sonrası token otomatik kaydedilir
- Tüm isteklerde otomatik eklenir

**Production URL:**
- Base URL: `https://clubms-backend-x3pa.onrender.com`
- Postman environment'ı güncelleyin

Detaylı dokümantasyon için: [api-docs/README.md](api-docs/README.md)

## 🏗️ Mimari

### Clean Architecture + DDD

```
src/
├── core/                      # Çekirdek katman
│   ├── container/            # DI Container (Awilix)
│   ├── filters/              # Global error handling
│   └── middleware/           # Auth, RBAC middleware
├── modules/                   # İş mantığı modülleri
│   ├── identity/             # Kullanıcı & Auth
│   ├── clubs/                # Kulüp yönetimi
│   ├── events/               # Etkinlik yönetimi
│   ├── analytics/            # İstatistikler
│   └── notifications/        # Bildirimler
└── shared/                    # Paylaşılan kaynaklar
    └── redis/                # Redis client
```

### Modül Yapısı

Her modül kendi içinde katmanlı:

```
module/
├── domain/                    # Domain entities (business logic)
├── services/                  # Application services (orchestration)
├── repositories/              # Data access layer
├── controllers/               # HTTP handlers
├── dtos/                      # Data transfer objects (Zod)
├── interfaces/                # Contracts
└── module.router.ts          # Route definitions
```

### Design Patterns

- **Repository Pattern**: Data access abstraction
- **Service Layer Pattern**: Business logic orchestration
- **Dependency Injection**: Awilix container
- **Outbox Pattern**: Reliable messaging
- **Snapshot Pattern**: Analytics data
- **State Machine**: Event lifecycle
- **Optimistic Locking**: Concurrency control

## 🔒 Güvenlik

### Authentication
- Firebase ID Token validation
- Bearer token authentication
- Token expiration handling

### Authorization
- Role-based access control (RBAC)
- Global roles (SUPER_ADMIN, ADMIN, USER)
- Club-specific roles (PRESIDENT, VICE_PRESIDENT, MEMBER)
- Middleware-based permission checks

### QR Code Security
- TOTP (Time-based One-Time Password)
- 30 saniyelik time window
- Event-specific secret keys
- Replay attack koruması
- ±30 saniye tolerance

### Data Validation
- Zod schema validation
- Input sanitization
- SQL injection koruması (Prisma)
- XSS koruması

### Concurrency Control
- Optimistic locking (version field)
- Race condition koruması
- Retry mekanizması

## 🧪 Testing (Planned)

```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# Coverage
npm run test:coverage
```

## 🐳 Docker (Planned)

```bash
# Build
docker-compose build

# Run
docker-compose up -d

# Logs
docker-compose logs -f
```

## 📊 Database Schema

### Contexts (Bounded Contexts)

1. **Identity Context**
   - IdentityUser
   - IdentityGlobalRole

2. **Clubs Context**
   - ClubsClub
   - ClubsMembership
   - ClubsDocument

3. **Events Context**
   - EventsEvent
   - EventsAttendance
   - EventsTag
   - EventsEventTag

4. **Analytics Context**
   - AnalyticsGlobalSnapshot
   - AnalyticsClubSnapshot
   - AnalyticsEventSnapshot

5. **Infrastructure Context**
   - InfrastructureOutbox

### Soft FK Pattern

Cross-context ilişkiler için Soft Foreign Key kullanılır:
- Prisma'da `@relation` yok
- Manuel validation
- Loose coupling

## 🔄 Background Jobs

### Cron Jobs
- **Snapshot Job**: Her gün 02:00'da analytics snapshot oluşturur

### Queue Jobs (BullMQ)
- **Email Queue**: Email gönderimi (concurrency: 5)
- **Push Queue**: Push notification (concurrency: 10)

### Outbox Processor
- 5 saniyede bir polling
- Pending mesajları işler
- At-least-once delivery

## 📈 Monitoring

### Health Check

```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "status": "UP",
  "message": "ClubMS API is running"
}
```

### Logs

```bash
# Development
npm run dev

# Production
npm start | tee logs/app.log
```

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'feat: Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

### Commit Convention

```
feat: Yeni özellik
fix: Bug düzeltme
docs: Dokümantasyon
style: Kod formatı
refactor: Kod iyileştirme
test: Test ekleme
chore: Bakım işleri
```

## 📝 License

MIT License - Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 👥 Ekip

ClubMS Team - [support@clubms.com](mailto:support@clubms.com)

## 🙏 Teşekkürler

- Firebase Team
- Prisma Team
- Express.js Community
- Open Source Contributors

---

**Geliştirme Durumu:** ✅ Faz 7 Tamamlandı (QR & GPS Check-in + Security)

**Sonraki Adımlar:**
- [ ] Unit Tests (Jest)
- [ ] Integration Tests
- [ ] Docker Configuration
- [ ] CI/CD Pipeline
- [ ] Performance Optimization
