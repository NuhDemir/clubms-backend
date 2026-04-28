# Health Check Guide

## 🏥 Sistem Sağlık Kontrolleri

ClubMS API, veritabanı ve Redis bağlantılarını test etmek için kapsamlı health check endpoint'leri sunar.

## 📍 Endpoint'ler

### 1. Basic Health Check

**Endpoint:** `GET /health`

**Açıklama:** API'nin çalışıp çalışmadığını kontrol eder.

**Kullanım:**
```bash
curl http://localhost:3000/health
```

**Response:**
```json
{
  "status": "UP",
  "message": "ClubMS API is running",
  "timestamp": "2026-04-19T15:30:00.000Z"
}
```

---

### 2. Detailed Health Check

**Endpoint:** `GET /health/detailed`

**Açıklama:** API, Database ve Redis'in tümünü kontrol eder.

**Kullanım:**
```bash
curl http://localhost:3000/health/detailed
```

**Response (Başarılı):**
```json
{
  "status": "UP",
  "timestamp": "2026-04-19T15:30:00.000Z",
  "checks": {
    "api": {
      "status": "UP",
      "message": "API server is running"
    },
    "database": {
      "status": "UP",
      "message": "Database connection successful",
      "responseTime": 15
    },
    "redis": {
      "status": "UP",
      "message": "Redis connection successful",
      "responseTime": 5
    }
  }
}
```

**Response (Hatalı):**
```json
{
  "status": "DEGRADED",
  "timestamp": "2026-04-19T15:30:00.000Z",
  "checks": {
    "api": {
      "status": "UP",
      "message": "API server is running"
    },
    "database": {
      "status": "DOWN",
      "message": "Connection timeout",
      "responseTime": 0
    },
    "redis": {
      "status": "UP",
      "message": "Redis connection successful",
      "responseTime": 5
    }
  }
}
```

---

### 3. Database Health Check

**Endpoint:** `GET /health/database`

**Açıklama:** PostgreSQL veritabanı bağlantısını ve detaylı bilgileri kontrol eder.

**Kullanım:**
```bash
curl http://localhost:3000/health/database
```

**Response:**
```json
{
  "status": "UP",
  "message": "Database connection successful",
  "responseTime": 15,
  "details": {
    "database": "clubms_prod",
    "user": "postgres",
    "version": "PostgreSQL 15.3",
    "sizeBytes": 8388608,
    "sizeMB": "8.00"
  },
  "timestamp": "2026-04-19T15:30:00.000Z"
}
```

**Ne Kontrol Eder:**
- ✅ Database bağlantısı
- ✅ Response time
- ✅ Database adı ve kullanıcı
- ✅ PostgreSQL versiyonu
- ✅ Database boyutu

---

### 4. Database Tables Info

**Endpoint:** `GET /health/database/tables`

**Açıklama:** Veritabanındaki tüm tabloları ve boyutlarını listeler.

**Kullanım:**
```bash
curl http://localhost:3000/health/database/tables
```

**Response:**
```json
{
  "status": "UP",
  "message": "Database tables retrieved successfully",
  "count": 15,
  "tables": [
    {
      "name": "events_events",
      "size": "256 kB"
    },
    {
      "name": "identity_users",
      "size": "128 kB"
    },
    {
      "name": "clubs_clubs",
      "size": "64 kB"
    },
    {
      "name": "infrastructure_outbox_events",
      "size": "32 kB"
    }
  ],
  "timestamp": "2026-04-19T15:30:00.000Z"
}
```

**Kullanım Senaryoları:**
- Migration'ların uygulandığını doğrulama
- Tablo boyutlarını izleme
- Database schema'yı kontrol etme

---

### 5. Redis Health Check

**Endpoint:** `GET /health/redis`

**Açıklama:** Redis bağlantısını ve detaylı bilgileri kontrol eder.

**Kullanım:**
```bash
curl http://localhost:3000/health/redis
```

**Response:**
```json
{
  "status": "UP",
  "message": "Redis connection successful",
  "responseTime": 5,
  "details": {
    "ping": "PONG",
    "version": "7.0.11",
    "memoryUsed": "2.5M",
    "connectedClients": "3",
    "uptimeDays": "15",
    "readWriteTest": "PASS"
  },
  "timestamp": "2026-04-19T15:30:00.000Z"
}
```

**Ne Kontrol Eder:**
- ✅ Redis bağlantısı (PING/PONG)
- ✅ Response time
- ✅ Redis versiyonu
- ✅ Memory kullanımı
- ✅ Bağlı client sayısı
- ✅ Uptime
- ✅ Read/Write testi

---

### 6. Redis Keys Info

**Endpoint:** `GET /health/redis/keys`

**Açıklama:** Redis'teki key'leri ve bilgilerini listeler.

**Parametreler:**
- `pattern` (optional): Key pattern (default: "*")
- `limit` (optional): Max key sayısı (default: 100)

**Kullanım:**
```bash
# Tüm key'ler
curl http://localhost:3000/health/redis/keys

# BullMQ job'ları
curl "http://localhost:3000/health/redis/keys?pattern=bull:*"

# User cache'leri
curl "http://localhost:3000/health/redis/keys?pattern=user:*&limit=50"
```

**Response:**
```json
{
  "status": "UP",
  "message": "Redis keys retrieved successfully",
  "pattern": "bull:*",
  "totalKeys": 250,
  "returnedKeys": 100,
  "keys": [
    {
      "key": "bull:email:1",
      "type": "hash",
      "ttl": "3600s",
      "memoryBytes": 512
    },
    {
      "key": "bull:email:completed",
      "type": "zset",
      "ttl": "no expiry",
      "memoryBytes": 1024
    }
  ],
  "timestamp": "2026-04-19T15:30:00.000Z"
}
```

**Kullanım Senaryoları:**
- BullMQ job queue'larını izleme
- Cache key'lerini kontrol etme
- Memory kullanımını analiz etme
- TTL'leri kontrol etme

---

## 🧪 Test Senaryoları

### Senaryo 1: İlk Deployment Sonrası

**Amaç:** Tüm bileşenlerin çalıştığını doğrulama

```bash
# 1. Detailed health check
curl https://clubms-backend-x3pa.onrender.com/health/detailed

# Beklenen: status: "UP", tüm checks "UP"

# 2. Database tables kontrolü
curl https://clubms-backend-x3pa.onrender.com/health/database/tables

# Beklenen: 15 tablo (identity, clubs, events, analytics, infrastructure)

# 3. Redis kontrolü
curl https://clubms-backend-x3pa.onrender.com/health/redis

# Beklenen: status: "UP", readWriteTest: "PASS"
```

---

### Senaryo 2: Migration Sonrası

**Amaç:** Yeni tabloların oluşturulduğunu doğrulama

```bash
# Migration öncesi tablo sayısı
curl http://localhost:3000/health/database/tables | jq '.count'
# Örnek: 12

# Migration çalıştır
npx prisma migrate deploy

# Migration sonrası tablo sayısı
curl http://localhost:3000/health/database/tables | jq '.count'
# Örnek: 15

# Yeni tabloları kontrol et
curl http://localhost:3000/health/database/tables | jq '.tables[] | select(.name | contains("infrastructure"))'
```

---

### Senaryo 3: Redis Queue Monitoring

**Amaç:** BullMQ job queue'larını izleme

```bash
# BullMQ job'larını listele
curl "http://localhost:3000/health/redis/keys?pattern=bull:*&limit=50"

# Email queue job'ları
curl "http://localhost:3000/health/redis/keys?pattern=bull:email:*"

# Push notification queue job'ları
curl "http://localhost:3000/health/redis/keys?pattern=bull:push:*"

# Completed job'ları kontrol et
curl "http://localhost:3000/health/redis/keys?pattern=bull:*:completed"
```

---

### Senaryo 4: Performance Monitoring

**Amaç:** Response time'ları izleme

```bash
# Database response time
curl http://localhost:3000/health/database | jq '.responseTime'

# Redis response time
curl http://localhost:3000/health/redis | jq '.responseTime'

# Detailed check ile tümünü kontrol
curl http://localhost:3000/health/detailed | jq '.checks | to_entries[] | {name: .key, responseTime: .value.responseTime}'
```

---

### Senaryo 5: Troubleshooting

**Amaç:** Sorun tespiti

```bash
# 1. Hangi bileşen down?
curl http://localhost:3000/health/detailed | jq '.checks | to_entries[] | select(.value.status == "DOWN")'

# 2. Database bağlantı hatası detayı
curl http://localhost:3000/health/database | jq '.error'

# 3. Redis bağlantı hatası detayı
curl http://localhost:3000/health/redis | jq '.error'

# 4. Database boyutu kontrolü (disk doldu mu?)
curl http://localhost:3000/health/database | jq '.details.sizeMB'

# 5. Redis memory kullanımı
curl http://localhost:3000/health/redis | jq '.details.memoryUsed'
```

---

## 🔄 Monitoring & Alerting

### GitHub Actions ile Otomatik Monitoring

`.github/workflows/health-check.yml`:

```yaml
name: Health Check Monitoring

on:
  schedule:
    - cron: '*/10 * * * *'  # Her 10 dakika
  workflow_dispatch:

jobs:
  health-check:
    runs-on: ubuntu-latest
    steps:
      - name: Check API Health
        run: |
          response=$(curl -s https://clubms-backend-x3pa.onrender.com/health/detailed)
          status=$(echo $response | jq -r '.status')
          
          if [ "$status" != "UP" ]; then
            echo "❌ Health check failed!"
            echo $response | jq '.'
            exit 1
          fi
          
          echo "✅ All systems operational"
```

---

### Uptime Monitoring Services

**1. UptimeRobot (Ücretsiz):**
```
Monitor Type: HTTP(s)
URL: https://clubms-backend-x3pa.onrender.com/health
Interval: 5 minutes
Alert: Email/SMS when down
```

**2. Better Uptime:**
```
Monitor: https://clubms-backend-x3pa.onrender.com/health/detailed
Check: JSON response contains "status": "UP"
Interval: 1 minute
```

**3. Render Dashboard:**
```
Render > Service > Metrics
- CPU Usage
- Memory Usage
- Request Count
- Response Time
```

---

## 📊 Swagger UI'da Test Etme

1. **Swagger UI'ya git:**
   ```
   http://localhost:3000/api-docs
   ```

2. **Health tag'ini bul:**
   - Sol tarafta "Health" sekmesine tıkla

3. **Endpoint'i test et:**
   - İstediğin endpoint'i aç
   - "Try it out" butonuna tıkla
   - "Execute" butonuna tıkla
   - Response'u görüntüle

4. **Parametreli test (Redis Keys):**
   - `/health/redis/keys` endpoint'ini aç
   - "Try it out" butonuna tıkla
   - `pattern` parametresine "bull:*" yaz
   - `limit` parametresine "50" yaz
   - "Execute" butonuna tıkla

---

## 🚨 Hata Kodları

| Status Code | Anlamı | Çözüm |
|-------------|--------|-------|
| 200 | Başarılı | Sistem sağlıklı |
| 503 | Service Unavailable | Database veya Redis down |
| 500 | Internal Server Error | Beklenmeyen hata |

---

## 💡 Best Practices

### 1. Production'da Düzenli Kontrol

```bash
# Cron job ile her 5 dakikada bir
*/5 * * * * curl -f https://clubms-backend-x3pa.onrender.com/health/detailed || echo "Health check failed"
```

### 2. Deployment Sonrası Doğrulama

```bash
# Deploy script'ine ekle
npm run deploy
sleep 30  # Serverin başlamasını bekle
curl -f https://clubms-backend-x3pa.onrender.com/health/detailed || exit 1
```

### 3. Load Testing Öncesi

```bash
# Baseline ölç
curl http://localhost:3000/health/detailed | jq '.checks | to_entries[] | {name: .key, responseTime: .value.responseTime}'

# Load test çalıştır
# ...

# Sonrası ölç ve karşılaştır
```

### 4. Database Migration Öncesi/Sonrası

```bash
# Öncesi: Backup al
pg_dump $DATABASE_URL > backup.sql

# Tablo sayısını kaydet
curl http://localhost:3000/health/database/tables | jq '.count' > before.txt

# Migration çalıştır
npx prisma migrate deploy

# Sonrası: Doğrula
curl http://localhost:3000/health/database/tables | jq '.count' > after.txt
diff before.txt after.txt
```

---

## 🔗 İlgili Dokümantasyon

- [API Documentation Guide](./API-DOCUMENTATION-GUIDE.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Post-Deployment Checklist](./POST-DEPLOYMENT-CHECKLIST.md)

---

**Son Güncelleme:** 2026-04-19
**Versiyon:** 1.0.0
