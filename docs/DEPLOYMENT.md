# ClubMS Backend - Render Deployment Guide

Bu dokümantasyon, ClubMS Backend API'sini Render'a deploy etme adımlarını içerir.

## 📋 Ön Gereksinimler

- [x] GitHub hesabı
- [x] Render hesabı (https://render.com)
- [x] Firebase projesi (Authentication için)
- [x] Repository GitHub'da

## 🚀 Adım 1: Render'da Yeni Servis Oluşturma

### 1.1 Render Dashboard'a Giriş

1. https://dashboard.render.com adresine gidin
2. "New +" butonuna tıklayın
3. "Blueprint" seçeneğini seçin

### 1.2 Repository Bağlama

1. GitHub repository'nizi seçin
2. `render.yaml` dosyası otomatik algılanacak
3. "Apply" butonuna tıklayın

## 🔧 Adım 2: Environment Variables Ayarlama

Render Dashboard'da her servis için environment variables ekleyin:

### Backend Service (clubms-backend)

**Otomatik Eklenenler:**
- ✅ `DATABASE_URL` - PostgreSQL connection string
- ✅ `REDIS_HOST` - Redis host
- ✅ `REDIS_PORT` - Redis port
- ✅ `REDIS_PASSWORD` - Redis password
- ✅ `QR_SECRET_BASE` - Auto-generated

**Manuel Eklemeniz Gerekenler:**

#### Firebase Credentials

1. Firebase Console'a gidin: https://console.firebase.google.com
2. Project Settings > Service Accounts
3. "Generate New Private Key" butonuna tıklayın
4. İndirilen JSON dosyasından şu değerleri alın:

```bash
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
Your private key here (keep the quotes and newlines)
-----END PRIVATE KEY-----"
```

**ÖNEMLI:** `FIREBASE_PRIVATE_KEY` değerini eklerken:
- Tırnak işaretlerini koruyun
- `\n` karakterlerini gerçek newline'lara çevirin
- Veya Render'da "Multiline" seçeneğini kullanın

#### CORS Origin (Opsiyonel)

```bash
CORS_ORIGIN=https://your-frontend-domain.com
```

Production'da frontend URL'inizi ekleyin. Development için `*` bırakabilirsiniz.

## 🔐 Adım 3: GitHub Secrets Ekleme

GitHub repository'nizde Settings > Secrets and variables > Actions:

```bash
RENDER_SERVICE_URL=https://clubms-backend.onrender.com
RENDER_DEPLOY_HOOK_URL=https://api.render.com/deploy/srv-xxxxx?key=xxxxx
```

**Deploy Hook URL'i almak için:**
1. Render Dashboard > clubms-backend service
2. Settings > Deploy Hook
3. "Create Deploy Hook" butonuna tıklayın
4. URL'i kopyalayın

## 📦 Adım 4: İlk Deployment

### 4.1 Otomatik Deploy

`render.yaml` dosyası sayesinde:
1. PostgreSQL database oluşturulur
2. Redis instance oluşturulur
3. Backend service deploy edilir
4. Migrations otomatik çalışır

### 4.2 Deployment İzleme

1. Render Dashboard > clubms-backend
2. "Logs" sekmesine gidin
3. Build ve deploy loglarını izleyin

**Beklenen Loglar:**
```
Building...
✓ npm install completed
✓ Prisma generate completed
✓ TypeScript build completed
Starting...
✓ Prisma migrations deployed
✓ Server started on port 10000
📚 Swagger documentation available at /api-docs
```

### 4.3 İlk Health Check

Deploy tamamlandıktan sonra:

```bash
curl https://clubms-backend.onrender.com/health
```

Beklenen response:
```json
{
  "status": "UP",
  "message": "ClubMS API is running"
}
```

## 🤖 Adım 5: GitHub Actions Kurulumu

### 5.1 Keep-Alive Action

Render free tier 15 dakika inaktivite sonrası uyur. Bunu önlemek için:

1. `.github/workflows/keep-alive.yml` dosyası zaten hazır
2. Her 10 dakikada bir health endpoint'i ping eder
3. Otomatik olarak çalışır

**Manuel Test:**
```bash
# GitHub'da Actions sekmesine gidin
# "Keep Render Service Alive" workflow'unu seçin
# "Run workflow" butonuna tıklayın
```

### 5.2 CI/CD Pipeline

Her `main` branch'e push'ta:
1. Build ve test çalışır
2. Otomatik deploy tetiklenir
3. Health check yapılır

**Manuel Deploy:**
```bash
# GitHub'da Actions sekmesine gidin
# "Manual Deploy to Render" workflow'unu seçin
# "Run workflow" butonuna tıklayın
```

## 🔍 Adım 6: Doğrulama

### 6.1 API Endpoints Test

**Health Check:**
```bash
curl https://clubms-backend.onrender.com/health
```

**API Documentation:**
```
https://clubms-backend.onrender.com/api-docs
```

**OpenAPI JSON:**
```bash
curl https://clubms-backend.onrender.com/api-docs.json
```

### 6.2 Postman ile Test

1. `api-docs/postman/ClubMS-API.postman_collection.json` import edin
2. Environment'ı düzenleyin:
   ```json
   {
     "baseUrl": "https://clubms-backend.onrender.com"
   }
   ```
3. Auth > Register ile test kullanıcısı oluşturun
4. Diğer endpoint'leri test edin

### 6.3 Database Kontrolü

Render Dashboard'da:
1. clubms-db service'e gidin
2. "Connect" butonuna tıklayın
3. Connection string'i kopyalayın
4. Yerel psql veya pgAdmin ile bağlanın

```bash
psql "postgresql://user:pass@host/database"
```

## 📊 Adım 7: Monitoring

### 7.1 Render Dashboard

**Metrics:**
- CPU Usage
- Memory Usage
- Request Count
- Response Time

**Logs:**
- Real-time logs
- Error tracking
- Request logs

### 7.2 Health Check Monitoring

GitHub Actions her 10 dakikada bir:
- Health endpoint'i kontrol eder
- API docs'u kontrol eder
- Başarısız olursa bildirim gönderir

### 7.3 Custom Monitoring (Opsiyonel)

**Sentry Integration:**
```bash
# Render'da environment variable ekleyin
SENTRY_DSN=https://your-sentry-dsn
```

**Log Aggregation:**
- Render logs otomatik saklanır
- External log service entegrasyonu yapılabilir

## 🔄 Adım 8: Güncelleme ve Bakım

### 8.1 Kod Güncellemeleri

```bash
# Local'de değişiklik yapın
git add .
git commit -m "feat: New feature"
git push origin main

# Otomatik deploy tetiklenir
```

### 8.2 Database Migration

**Yeni migration oluşturma:**
```bash
# Local'de
npx prisma migrate dev --name add_new_field

# Git'e push edin
git add prisma/migrations
git commit -m "db: Add new field"
git push origin main

# Render otomatik migrate deploy çalıştırır
```

### 8.3 Environment Variables Güncelleme

1. Render Dashboard > Service > Environment
2. Variable'ı düzenleyin
3. "Save Changes" butonuna tıklayın
4. Service otomatik restart olur

### 8.4 Manual Restart

Render Dashboard'da:
1. Service'i seçin
2. "Manual Deploy" > "Clear build cache & deploy"

## 🐛 Troubleshooting

### Build Hatası

**Hata:** `npm install failed`
```bash
# Çözüm: package-lock.json'ı commit edin
git add package-lock.json
git commit -m "chore: Add package-lock.json"
git push
```

**Hata:** `Prisma generate failed`
```bash
# Çözüm: Prisma schema'yı kontrol edin
npx prisma validate
```

### Runtime Hatası

**Hata:** `DATABASE_URL not found`
```bash
# Çözüm: Render Dashboard'da environment variable'ı kontrol edin
# Database service'in bağlı olduğundan emin olun
```

**Hata:** `Firebase authentication failed`
```bash
# Çözüm: Firebase credentials'ı kontrol edin
# FIREBASE_PRIVATE_KEY'in doğru formatda olduğundan emin olun
```

### Cold Start Problemi

**Semptom:** İlk request 30+ saniye sürüyor

**Çözüm:**
1. Keep-alive GitHub Action'ın çalıştığından emin olun
2. Render Dashboard > Service > Settings
3. "Auto-Deploy" açık olmalı
4. Health check path: `/health`

### Memory Limit

**Hata:** `Out of memory`

**Çözüm:**
1. Render free tier: 512MB RAM
2. Paid plan'e geçin veya
3. Memory kullanımını optimize edin:
   ```typescript
   // Connection pool'u küçült
   pool: { min: 1, max: 5 }
   ```

## 📈 Performance Optimization

### 1. Database Connection Pooling

```typescript
// src/config/production.ts
pool: {
  min: 2,
  max: 10,
  acquireTimeoutMillis: 30000
}
```

### 2. Redis Caching

```typescript
// Frequently accessed data'yı cache'le
await redis.setex('key', 3600, JSON.stringify(data));
```

### 3. Response Compression

```typescript
// app.ts
import compression from 'compression';
app.use(compression());
```

### 4. Rate Limiting

```typescript
// Zaten aktif
rateLimit: {
  windowMs: 15 * 60 * 1000,
  max: 100
}
```

## 🔒 Security Checklist

- [x] Environment variables güvenli
- [x] Firebase credentials doğru
- [x] CORS origin production URL'i
- [x] Rate limiting aktif
- [x] HTTPS zorunlu (Render otomatik)
- [x] Database SSL bağlantısı
- [x] Redis password korumalı
- [x] QR secret güçlü ve unique

## 📞 Destek

**Render Support:**
- Dashboard: https://dashboard.render.com
- Docs: https://render.com/docs
- Community: https://community.render.com

**ClubMS:**
- API Docs: https://clubms-backend.onrender.com/api-docs
- GitHub Issues: Repository issues sekmesi
- Email: support@clubms.com

## ✅ Deployment Checklist

- [ ] Render hesabı oluşturuldu
- [ ] GitHub repository bağlandı
- [ ] Firebase credentials eklendi
- [ ] Environment variables ayarlandı
- [ ] İlk deployment başarılı
- [ ] Health check çalışıyor
- [ ] API docs erişilebilir
- [ ] GitHub Actions kuruldu
- [ ] Keep-alive action çalışıyor
- [ ] Postman collection test edildi
- [ ] Database migrations çalıştı
- [ ] Redis bağlantısı çalışıyor
- [ ] CORS ayarları doğru
- [ ] Monitoring aktif

## 🎉 Tebrikler!

ClubMS Backend API başarıyla Render'a deploy edildi!

**Erişim Linkleri:**
- API: https://clubms-backend.onrender.com
- Docs: https://clubms-backend.onrender.com/api-docs
- Health: https://clubms-backend.onrender.com/health
