# API Documentation Guide

## 🎯 Genel Bakış

ClubMS API, 3 farklı modern arayüz ile kapsamlı dokümantasyon sunar. Her arayüz farklı kullanım senaryoları için optimize edilmiştir.

## 📱 Dokümantasyon Arayüzleri

### 1. Modern Landing Page

**URL:** `/api-docs/modern`

**Ne Zaman Kullanılır:**
- İlk kez API'yi keşfederken
- Hızlı genel bakış için
- Mobil cihazlardan erişirken

**Özellikler:**
- ✅ Responsive tasarım
- ✅ Tüm dokümantasyon linklerine hızlı erişim
- ✅ API özellikleri özeti
- ✅ Gradient modern tasarım
- ✅ Mobil uyumlu

**Ekran Görüntüsü:**
```
┌─────────────────────────────────────┐
│     🎓 ClubMS API                   │
│  Üniversite Kulüp Yönetim Sistemi  │
│        v1.0.0 • OpenAPI 3.0         │
├─────────────────────────────────────┤
│  [🚀 Swagger UI]  [📖 Redoc]       │
│  [📄 OpenAPI JSON]                  │
├─────────────────────────────────────┤
│  ✨ API Özellikleri                 │
│  🔐 Authentication                  │
│  👥 RBAC                            │
│  🏢 Kulüp Yönetimi                  │
│  📅 Etkinlik Sistemi                │
└─────────────────────────────────────┘
```

---

### 2. Swagger UI (İnteraktif)

**URL:** `/api-docs`

**Ne Zaman Kullanılır:**
- API endpoint'lerini test ederken
- Request/Response formatlarını öğrenirken
- Geliştirme sırasında hızlı test için

**Özellikler:**
- ✅ İnteraktif API testi
- ✅ "Try it out" özelliği
- ✅ Authentication token yönetimi
- ✅ Request/Response örnekleri
- ✅ Schema validation
- ✅ Syntax highlighting (Monokai theme)
- ✅ Filtreleme ve arama
- ✅ Persistent authorization

**Kullanım Adımları:**

1. **Authentication:**
   ```
   - Sağ üstteki "Authorize" butonuna tıklayın
   - Firebase ID Token'ı girin
   - "Authorize" butonuna tıklayın
   - Token tüm isteklerde otomatik eklenir
   ```

2. **Endpoint Test:**
   ```
   - İlgili endpoint'i bulun
   - "Try it out" butonuna tıklayın
   - Parametreleri doldurun
   - "Execute" butonuna tıklayın
   - Response'u görüntüleyin
   ```

3. **Schema İnceleme:**
   ```
   - Endpoint'in altındaki "Schemas" sekmesine tıklayın
   - Request/Response modellerini görüntüleyin
   - Validation kurallarını inceleyin
   ```

**Kısayollar:**
- `Ctrl/Cmd + K`: Arama
- `Expand/Collapse All`: Tüm endpoint'leri aç/kapat

---

### 3. Redoc (Temiz & Responsive)

**URL:** `/api-docs/redoc`

**Ne Zaman Kullanılır:**
- Dokümantasyonu okurken
- Mobil cihazlardan erişirken
- Temiz, profesyonel görünüm istediğinizde
- Print/PDF export için

**Özellikler:**
- ✅ Temiz, modern tasarım
- ✅ Mobil responsive
- ✅ Hızlı arama
- ✅ Kod örnekleri (multiple languages)
- ✅ Deep linking
- ✅ Print-friendly
- ✅ Dark mode desteği

**Navigasyon:**
- Sol sidebar: Endpoint listesi
- Sağ panel: Kod örnekleri
- Orta panel: Detaylı dokümantasyon

**Arama:**
- Üst kısımdaki arama kutusunu kullanın
- Endpoint, tag veya açıklama ile arama yapın
- Sonuçlar anında filtrelenir

---

### 4. OpenAPI JSON

**URL:** `/api-docs.json`

**Ne Zaman Kullanılır:**
- Client SDK generate ederken
- API testing tools ile entegrasyon
- Mock server oluşturma
- CI/CD pipeline'a entegrasyon

**Kullanım Örnekleri:**

**1. Client SDK Generation:**
```bash
# OpenAPI Generator ile
npx @openapitools/openapi-generator-cli generate \
  -i http://localhost:3000/api-docs.json \
  -g typescript-axios \
  -o ./generated-client

# Swagger Codegen ile
swagger-codegen generate \
  -i http://localhost:3000/api-docs.json \
  -l typescript-fetch \
  -o ./client-sdk
```

**2. Postman Import:**
```bash
# JSON'ı indir
curl http://localhost:3000/api-docs.json > clubms-api.json

# Postman'de:
# File > Import > Upload Files > clubms-api.json
```

**3. Mock Server:**
```bash
# Prism ile mock server
npx @stoplight/prism-cli mock \
  http://localhost:3000/api-docs.json
```

**4. API Testing:**
```bash
# Dredd ile API testing
dredd http://localhost:3000/api-docs.json \
  http://localhost:3000
```

---

## 🔐 Authentication

Tüm korumalı endpoint'ler Firebase ID Token gerektirir.

### Token Alma

**1. Register:**
```bash
POST /api/v1/auth/register
{
  "email": "user@example.com",
  "password": "Password123!",
  "studentNumber": "2021001",
  "fullName": "Test User"
}
```

**2. Login (Firebase):**
```javascript
// Frontend'de Firebase SDK ile
import { signInWithEmailAndPassword } from 'firebase/auth';

const userCredential = await signInWithEmailAndPassword(
  auth, 
  email, 
  password
);
const idToken = await userCredential.user.getIdToken();
```

**3. API'ye Gönderme:**
```bash
POST /api/v1/auth/login
{
  "idToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}

Response:
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Token Kullanımı

**Header:**
```
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Swagger UI'da:**
1. "Authorize" butonuna tıklayın
2. Token'ı yapıştırın (Bearer prefix olmadan)
3. "Authorize" butonuna tıklayın

**cURL'de:**
```bash
curl -X GET http://localhost:3000/api/v1/users/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📊 API Endpoint'leri

### Identity & Auth
- `POST /api/v1/auth/register` - Kullanıcı kaydı
- `POST /api/v1/auth/login` - Giriş yapma
- `GET /api/v1/users/me` - Profil bilgisi
- `GET /api/v1/users/:id` - Kullanıcı detayı

### Clubs
- `POST /api/v1/clubs` - Kulüp oluştur
- `GET /api/v1/clubs` - Kulüp listesi
- `GET /api/v1/clubs/:id` - Kulüp detayı
- `PATCH /api/v1/clubs/:id` - Kulüp güncelle
- `DELETE /api/v1/clubs/:id` - Kulüp sil

### Memberships
- `POST /api/v1/clubs/:clubId/memberships` - Üyelik başvurusu
- `GET /api/v1/clubs/:clubId/memberships` - Üye listesi
- `PATCH /api/v1/clubs/:clubId/memberships/:userId/role` - Rol değiştir
- `DELETE /api/v1/clubs/:clubId/memberships/:userId` - Üyelik sil

### Events
- `POST /api/v1/events` - Etkinlik oluştur
- `GET /api/v1/events` - Etkinlik listesi
- `GET /api/v1/events/:id` - Etkinlik detayı
- `PATCH /api/v1/events/:id` - Etkinlik güncelle
- `POST /api/v1/events/:id/publish` - Etkinlik yayınla

### Attendance
- `POST /api/v1/events/:eventId/attendance/qr` - QR check-in
- `POST /api/v1/events/:eventId/attendance/gps` - GPS check-in
- `POST /api/v1/events/:eventId/attendance/manual` - Manuel check-in
- `GET /api/v1/events/:eventId/attendance` - Katılımcı listesi

### Analytics
- `GET /api/v1/analytics/global` - Global istatistikler
- `GET /api/v1/analytics/clubs/:clubId` - Kulüp istatistikleri
- `GET /api/v1/analytics/events/:eventId` - Etkinlik istatistikleri

---

## 🎨 Customization

### Swagger UI Tema

`src/swagger.ts` dosyasında CSS özelleştirmesi:

```typescript
customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui { font-family: 'Inter', sans-serif }
    .swagger-ui .opblock { border-radius: 8px }
`
```

### Redoc Tema

Redoc otomatik olarak sistem temasını (light/dark) algılar.

---

## 📱 Responsive Tasarım

Tüm dokümantasyon arayüzleri mobil uyumludur:

**Breakpoints:**
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

**Mobile Optimizasyonlar:**
- Touch-friendly butonlar
- Collapsible sections
- Optimized font sizes
- Hamburger menu (Redoc)

---

## 🚀 Production URL'leri

**Development:**
- Landing: http://localhost:3000/api-docs/modern
- Swagger: http://localhost:3000/api-docs
- Redoc: http://localhost:3000/api-docs/redoc
- JSON: http://localhost:3000/api-docs.json

**Production:**
- Landing: https://clubms-backend-x3pa.onrender.com/api-docs/modern
- Swagger: https://clubms-backend-x3pa.onrender.com/api-docs
- Redoc: https://clubms-backend-x3pa.onrender.com/api-docs/redoc
- JSON: https://clubms-backend-x3pa.onrender.com/api-docs.json

---

## 🔍 Troubleshooting

### Swagger UI'da "Authorize" Çalışmıyor

**Sorun:** Token ekledikten sonra 401 hatası alıyorum.

**Çözüm:**
1. Token'ın "Bearer " prefix'i olmadan girildiğinden emin olun
2. Token'ın expire olmadığını kontrol edin
3. Firebase Console'da Authentication'ın aktif olduğunu doğrulayın

### Redoc Yüklenmiyor

**Sorun:** Redoc sayfası boş görünüyor.

**Çözüm:**
1. Browser console'u kontrol edin
2. `/api-docs.json` endpoint'inin çalıştığını doğrulayın
3. CDN bağlantısını kontrol edin (internet bağlantısı gerekli)

### OpenAPI JSON Hatalı

**Sorun:** JSON validation hatası alıyorum.

**Çözüm:**
1. `src/config/swagger.config.ts` dosyasını kontrol edin
2. YAML dosyalarında syntax hatası olup olmadığını kontrol edin
3. `npx swagger-cli validate api-docs.json` ile validate edin

---

## 📚 Ek Kaynaklar

- [OpenAPI Specification](https://swagger.io/specification/)
- [Swagger UI Documentation](https://swagger.io/tools/swagger-ui/)
- [Redoc Documentation](https://redocly.com/docs/redoc/)
- [OpenAPI Generator](https://openapi-generator.tech/)

---

**Son Güncelleme:** 2026-04-19
**Versiyon:** 1.0.0
