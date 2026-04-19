# ClubMS API Documentation

ClubMS Backend API için kapsamlı dokümantasyon.

## 📚 Dokümantasyon Türleri

### 1. Swagger/OpenAPI (İnteraktif)
**Erişim:** `http://localhost:3000/api-docs`

Tarayıcıdan erişilebilen interaktif API dokümantasyonu:
- Tüm endpoint'leri görüntüleme
- Request/Response şemalarını inceleme
- Doğrudan tarayıcıdan API test etme
- Authentication token yönetimi
- Filtreleme ve arama

**Özellikler:**
- ✅ Modüler yapı (route dosyaları temiz)
- ✅ YAML tabanlı şema tanımları
- ✅ Otomatik validation
- ✅ Try it out özelliği
- ✅ Syntax highlighting

### 2. Postman Collection
**Dosyalar:**
- `postman/ClubMS-API.postman_collection.json` - API Collection
- `postman/ClubMS-Environment.postman_environment.json` - Environment Variables

**Kurulum:**
1. Postman'i açın
2. Import > File seçin
3. Her iki JSON dosyasını da import edin
4. Environment'ı "ClubMS - Local" olarak seçin

**Kullanım:**
1. **Auth > Register** veya **Auth > Login** ile token alın
2. Token otomatik olarak environment'a kaydedilir
3. Diğer endpoint'leri test edin

**Otomatik Değişkenler:**
- `token` - Authentication token (otomatik kaydedilir)
- `userId` - Kullanıcı ID (otomatik kaydedilir)
- `clubId` - Kulüp ID (otomatik kaydedilir)
- `eventId` - Etkinlik ID (otomatik kaydedilir)

## 📁 Dosya Yapısı

```
api-docs/
├── README.md                          # Bu dosya
├── swagger.config.ts                  # Swagger konfigürasyonu (DEPRECATED - src/config/swagger.config.ts kullanın)
├── schemas/                           # OpenAPI şemaları
│   ├── common.yaml                    # Ortak şemalar ve enum'lar
│   ├── identity.yaml                  # User, Auth şemaları
│   ├── clubs.yaml                     # Club, Membership şemaları
│   ├── events.yaml                    # Event, Attendance şemaları
│   └── analytics.yaml                 # Analytics şemaları
├── modules/                           # Endpoint tanımları
│   ├── auth.yaml                      # Auth endpoints
│   ├── users.yaml                     # User endpoints
│   ├── clubs.yaml                     # Club & Membership endpoints
│   ├── events.yaml                    # Event & Attendance endpoints
│   └── analytics.yaml                 # Analytics endpoints
└── postman/                           # Postman collection
    ├── ClubMS-API.postman_collection.json
    └── ClubMS-Environment.postman_environment.json
```

## 🔐 Authentication

Tüm korumalı endpoint'ler için Firebase ID Token gereklidir:

```http
Authorization: Bearer <firebase-id-token>
```

### Token Alma

**1. Register:**
```bash
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "displayName": "John Doe"
}
```

**2. Login:**
```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Response'dan `data.token` değerini alın ve Authorization header'ında kullanın.

## 🎯 Hızlı Başlangıç

### Swagger UI ile Test

1. Sunucuyu başlatın:
```bash
npm run dev
```

2. Tarayıcıda açın:
```
http://localhost:3000/api-docs
```

3. "Authorize" butonuna tıklayın

4. Token'ı yapıştırın:
```
Bearer <your-firebase-token>
```

5. Endpoint'leri test edin!

### Postman ile Test

1. Collection ve Environment'ı import edin

2. **Auth > Register** request'ini çalıştırın
   - Token otomatik kaydedilir

3. Diğer endpoint'leri test edin
   - Token otomatik olarak eklenir

## 📊 Modüller

### 1. Identity (Auth & Users)
- ✅ Kullanıcı kaydı ve girişi
- ✅ Firebase Authentication
- ✅ Global rol yönetimi (SUPER_ADMIN, ADMIN, USER)
- ✅ Kullanıcı askıya alma

**Endpoints:**
- `POST /api/v1/auth/register` - Kayıt
- `POST /api/v1/auth/login` - Giriş
- `GET /api/v1/auth/me` - Profil
- `GET /api/v1/users` - Kullanıcı listesi (SUPER_ADMIN)
- `PATCH /api/v1/users/:id/suspend` - Askıya al (SUPER_ADMIN)

### 2. Clubs
- ✅ Kulüp CRUD işlemleri
- ✅ Üyelik başvuruları
- ✅ Rol yönetimi (PRESIDENT, VICE_PRESIDENT, MEMBER)
- ✅ Onay/Red sistemi

**Endpoints:**
- `GET /api/v1/clubs` - Kulüp listesi
- `POST /api/v1/clubs` - Kulüp oluştur (ADMIN)
- `POST /api/v1/clubs/:id/members` - Üyelik başvurusu
- `POST /api/v1/clubs/:clubId/members/:userId/approve` - Onayla
- `PATCH /api/v1/clubs/:clubId/members/:userId/role` - Rol değiştir

### 3. Events
- ✅ Etkinlik CRUD işlemleri
- ✅ State Machine (DRAFT → PUBLISHED → CANCELLED/COMPLETED)
- ✅ Kapasite yönetimi (Optimistic Locking)
- ✅ QR & GPS Check-in
- ✅ Katılımcı yönetimi

**Endpoints:**
- `GET /api/v1/clubs/:clubId/events` - Etkinlik listesi
- `POST /api/v1/clubs/:clubId/events` - Etkinlik oluştur
- `POST /api/v1/events/:id/publish` - Yayınla
- `GET /api/v1/events/:id/qrcode` - QR kod oluştur
- `POST /api/v1/events/:id/checkin/qr` - QR check-in
- `POST /api/v1/events/:id/checkin/gps` - GPS check-in

### 4. Analytics
- ✅ Global sistem istatistikleri
- ✅ Kulüp büyüme analizi
- ✅ Etkinlik katılım raporları
- ✅ Check-in yöntemleri dağılımı
- ✅ Snapshot Pattern (günlük cron)

**Endpoints:**
- `GET /api/v1/analytics/global` - Global stats
- `GET /api/v1/analytics/clubs/:clubId` - Kulüp stats
- `GET /api/v1/analytics/clubs/:clubId/growth` - Büyüme analizi
- `GET /api/v1/analytics/events/:eventId` - Etkinlik stats
- `GET /api/v1/analytics/events/:eventId/checkin-methods` - Check-in dağılımı

## 🔒 Güvenlik Özellikleri

### 1. TOTP-based QR Codes
- 30 saniyelik time window
- Event-specific secret keys
- Replay attack koruması
- ±30 saniye tolerance

### 2. GPS Check-in
- Haversine formula ile mesafe hesaplama
- 100 metre maksimum mesafe
- Latitude/Longitude validation

### 3. Optimistic Locking
- Version-based concurrency control
- Race condition koruması
- Retry mekanizması (max 3)

### 4. RBAC (Role-Based Access Control)
- Global roller: SUPER_ADMIN, ADMIN, USER
- Kulüp rolleri: PRESIDENT, VICE_PRESIDENT, MEMBER
- Middleware-based authorization

## 📝 Response Formatları

### Success Response
```json
{
  "success": true,
  "message": "İşlem başarılı",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Hata mesajı"
  }
}
```

### Validation Error
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Geçersiz veri",
    "details": [
      {
        "field": "email",
        "message": "Geçerli bir email adresi giriniz"
      }
    ]
  }
}
```

## 🚀 Yeni Endpoint Ekleme

### 1. Şema Tanımla (schemas/)

```yaml
# api-docs/schemas/mymodule.yaml
components:
  schemas:
    MyEntity:
      type: object
      properties:
        id:
          type: string
          format: uuid
        name:
          type: string
```

### 2. Endpoint Tanımla (modules/)

```yaml
# api-docs/modules/mymodule.yaml
paths:
  /api/v1/myentities:
    get:
      tags:
        - MyModule
      summary: List entities
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/MyEntity'
```

### 3. Postman'e Ekle

Collection JSON'a yeni request ekleyin:

```json
{
  "name": "List Entities",
  "request": {
    "method": "GET",
    "url": {
      "raw": "{{baseUrl}}/api/v1/myentities",
      "host": ["{{baseUrl}}"],
      "path": ["api", "v1", "myentities"]
    }
  }
}
```

### 4. Test Et

- Swagger UI'da görünmeli
- Postman'de çalışmalı
- Build başarılı olmalı

## 🛠️ Bakım

### Swagger Spec'i JSON olarak al

```bash
curl http://localhost:3000/api-docs.json > openapi.json
```

### Postman Collection'ı Güncelle

1. Postman'de değişiklikleri yap
2. Export > Collection v2.1
3. `api-docs/postman/` klasörüne kaydet

### Swagger Cache Temizle

Swagger spec cache'lenmiştir. Değişiklikler için sunucuyu yeniden başlatın:

```bash
npm run dev
```

## 📞 Destek

- **Swagger UI:** http://localhost:3000/api-docs
- **OpenAPI JSON:** http://localhost:3000/api-docs.json
- **Health Check:** http://localhost:3000/health

## 🎨 Özelleştirme

### Swagger UI Tema

`src/swagger.ts` dosyasında CSS özelleştirmesi:

```typescript
customCss: `
  .swagger-ui .topbar { display: none }
  .swagger-ui .info { margin: 20px 0 }
`
```

### Postman Pre-request Scripts

Collection'da otomatik token yönetimi için:

```javascript
// Login/Register response'dan token al
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set('token', response.data.token);
}
```

## ✅ Checklist

- [x] Swagger/OpenAPI entegrasyonu
- [x] Modüler YAML yapısı
- [x] Tüm endpoint'ler dokümante edildi
- [x] Postman Collection oluşturuldu
- [x] Environment variables yapılandırıldı
- [x] Otomatik token yönetimi
- [x] Request/Response örnekleri
- [x] Authentication dokümantasyonu
- [x] Error handling dokümantasyonu
- [x] README ve kullanım kılavuzu

## 🎯 Sonraki Adımlar

1. ✅ API Documentation tamamlandı
2. ⏭️ Unit Tests (Jest)
3. ⏭️ Integration Tests
4. ⏭️ Docker Configuration
5. ⏭️ CI/CD Pipeline
