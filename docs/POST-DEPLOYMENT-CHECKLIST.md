# Post-Deployment Checklist

## ✅ Deployment Başarılı!

API şu anda live: https://clubms-backend-x3pa.onrender.com

## 🔧 Yapılması Gerekenler

### 1. ❌ Eksik Migration'ı Uygula

**Sorun:** `infrastructure_outbox_events` tablosu veritabanında yok.

**Çözüm:**

```bash
# Local'de migration oluşturuldu:
# prisma/migrations/20260419160000_add_infrastructure_and_analytics_contexts/

# Production'a uygulamak için:
git add prisma/migrations/
git commit -m "db: Add infrastructure and analytics contexts"
git push origin main

# Render otomatik olarak migration'ı çalıştıracak
```

**Alternatif (Manuel):**

Render Dashboard > clubms-backend > Shell:

```bash
npx prisma migrate deploy
```

### 2. ⚠️ Redis Eviction Policy Ayarı

**Sorun:** BullMQ, Redis'in `allkeys-lru` eviction policy kullandığını uyarıyor.

**Çözüm (Upstash):**

1. Upstash Dashboard'a git: https://console.upstash.com
2. Redis instance'ı seç (pure-wren-102117)
3. Configuration sekmesi
4. **"Eviction" seçeneğini KAPALI tut** (disabled)
5. Eğer açıksa, kapat ve kaydet

**Not:** Upstash'te eviction kapalıysa, BullMQ uyarısı görmezden gelinebilir. Bu normal bir uyarıdır.

### 3. ✅ API Endpoint'lerini Test Et

**Health Check:**
```bash
curl https://clubms-backend-x3pa.onrender.com/health
```

**API Documentation:**
```
https://clubms-backend-x3pa.onrender.com/api-docs
```

**Test User Oluştur:**
```bash
curl -X POST https://clubms-backend-x3pa.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "studentNumber": "2021001",
    "fullName": "Test User"
  }'
```

### 4. 📊 Monitoring Kurulumu

**Render Dashboard:**
- Metrics sekmesinde CPU, Memory, Request count'u izle
- Logs sekmesinde hataları takip et

**GitHub Actions:**
- Keep-Alive action'ın çalıştığını kontrol et
- Her 10 dakikada bir health check yapıyor

**Upstash Redis:**
- Dashboard'da storage kullanımını izle
- Free tier: 256 MB limit
- Commands/sec metriklerini kontrol et

### 5. 🔐 Güvenlik Kontrolleri

**Environment Variables:**
- [ ] `FIREBASE_PROJECT_ID` doğru
- [ ] `FIREBASE_PRIVATE_KEY` doğru format
- [ ] `FIREBASE_CLIENT_EMAIL` doğru
- [ ] `QR_SECRET_BASE` güçlü ve unique
- [ ] `CORS_ORIGIN` production URL'i (opsiyonel)

**Firebase Console:**
- Authentication > Sign-in method > Email/Password enabled
- Project Settings > Service Accounts > Admin SDK aktif

**Database:**
- SSL bağlantısı aktif (Render otomatik)
- Connection pooling ayarları doğru

### 6. 📝 Dokümantasyon Güncellemeleri

**README.md:**
- [x] Deployment bölümü eklendi
- [x] Production URL eklendi
- [ ] Ekip bilgileri güncelle
- [ ] License ekle

**API Docs:**
- [x] Swagger UI erişilebilir
- [x] Postman collection güncel
- [ ] Production base URL'i Postman environment'a ekle

### 7. 🧪 Fonksiyonel Testler

**Identity & Auth:**
- [ ] Register endpoint çalışıyor
- [ ] Login endpoint çalışıyor
- [ ] Token validation çalışıyor

**Clubs:**
- [ ] Kulüp oluşturma çalışıyor
- [ ] Üyelik başvurusu çalışıyor
- [ ] Rol değiştirme çalışıyor

**Events:**
- [ ] Etkinlik oluşturma çalışıyor
- [ ] QR kod check-in çalışıyor
- [ ] GPS check-in çalışıyor

**Analytics:**
- [ ] Snapshot cron job çalışıyor (02:00'da kontrol et)
- [ ] Analytics endpoint'leri çalışıyor

**Notifications:**
- [ ] Outbox processor çalışıyor
- [ ] Email queue çalışıyor
- [ ] Push notification queue çalışıyor

### 8. 🚨 Bilinen Sorunlar ve Çözümleri

**Cold Start (15 dakika inaktivite sonrası):**
- ✅ Keep-Alive GitHub Action aktif
- İlk request 30+ saniye sürebilir
- Sonraki request'ler hızlı

**Upstash Redis Storage Limit (256 MB):**
- BullMQ job'ları storage kullanır
- Completed job'ları düzenli temizle
- Job retention policy ayarla

**Prisma Connection Pool:**
- Free tier: Max 5 connection
- Production'da pool size ayarlandı
- Connection timeout: 30 saniye

### 9. 📈 Performance Optimization

**Yapılabilecekler:**
- [ ] Response compression aktif et
- [ ] Database query optimization
- [ ] Redis caching stratejisi
- [ ] CDN entegrasyonu (static files)

**Monitoring Tools (Opsiyonel):**
- [ ] Sentry (error tracking)
- [ ] New Relic (APM)
- [ ] Datadog (monitoring)

### 10. 🔄 Backup ve Recovery

**Database Backup:**
- Render otomatik backup yapıyor (paid plan)
- Free tier: Manuel backup önerilir

**Manuel Backup:**
```bash
# Render Dashboard > Database > Connect
# Connection string'i al

pg_dump "postgresql://..." > backup_$(date +%Y%m%d).sql
```

**Recovery:**
```bash
psql "postgresql://..." < backup_20260419.sql
```

## 📞 Destek ve Kaynaklar

**Render:**
- Dashboard: https://dashboard.render.com
- Docs: https://render.com/docs
- Status: https://status.render.com

**Upstash:**
- Console: https://console.upstash.com
- Docs: https://docs.upstash.com
- Status: https://status.upstash.com

**Firebase:**
- Console: https://console.firebase.google.com
- Docs: https://firebase.google.com/docs

**ClubMS:**
- API Docs: https://clubms-backend-x3pa.onrender.com/api-docs
- GitHub: [Repository URL]
- Support: support@clubms.com

## ✅ Checklist Özeti

- [ ] Migration'ı production'a uygula
- [ ] Redis eviction policy kontrol et
- [ ] API endpoint'lerini test et
- [ ] Monitoring kur
- [ ] Güvenlik kontrollerini yap
- [ ] Dokümantasyonu güncelle
- [ ] Fonksiyonel testleri çalıştır
- [ ] Performance optimization planla
- [ ] Backup stratejisi belirle

## 🎉 Sonraki Adımlar

1. **Hemen Yapılacaklar:**
   - Migration'ı push et
   - Redis ayarlarını kontrol et
   - Test user oluştur ve API'yi test et

2. **Bu Hafta:**
   - Tüm endpoint'leri test et
   - Monitoring metrikleri izle
   - Dokümantasyonu tamamla

3. **Gelecek:**
   - Unit test'leri yaz
   - Integration test'leri ekle
   - Performance optimization yap
   - Frontend entegrasyonu başlat

---

**Son Güncelleme:** 2026-04-19
**Deployment URL:** https://clubms-backend-x3pa.onrender.com
**Status:** ✅ Live (Migration pending)
