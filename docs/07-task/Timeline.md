# ClubMS — MVP Görev Dağılımı & Timeline
> Başlangıç: 01.04.2026 · Süre: 8 Hafta · Ekip: 5 Kişi

---

## Ekip

| Kişi | Alan | Sorumluluk |
|------|------|------------|
| Ferhan | Backend | Identity modülü, Auth, RBAC middleware |
| Selim | Backend | Clubs modülü, Memberships, Events modülü |
| Nuh | Backend | Asenkron altyapı (BullMQ/Outbox), Notifications, CI/CD |
| Ibrahim | Frontend | Auth akışları, Layout, Routing, Zustand store |
| Abshir | Frontend | Club & Event UI, Component sistemi, Admin panel |

---

## Sprint Planı

### Sprint 1 — Altyapı & Auth (01.04 – 14.04)

| Görev | Kişi |
|-------|------|
| Proje iskeleti, Docker, Prisma, tsconfig | Selim,Nuh |
| Identity schema migration | Nuh |
| `UserEntity`, `IUserRepository` (domain katman) | Nuh |
| `AuthService` — register + Firebase entegrasyonu | Ferhan |
| `PrismaUserRepository` implementasyonu | Nuh |
| Auth middleware (Firebase token doğrulama) | Ferhan |
| Global error handler, AppError sınıfı | Nuh |
| DI Container (Awilix) kurulumu | Selim |
| Frontend proje iskeleti (Vite + React + TS) | Ibrahim |
| Zustand auth store kurulumu | Ibrahim |
| Login / Register sayfaları (UI) | Ibrahim |
| Firebase client entegrasyonu (frontend) | Abshir |

**Sprint 1 Çıktısı:** Register + Login API çalışıyor. Frontend auth akışı tamamlandı.

---

### Sprint 2 — Clubs Modülü (15.04 – 25.04)

| Görev | Kişi |
|-------|------|
| Clubs schema (clubs, memberships, documents) | Selim |
| `ClubEntity`, `IClubRepository` | Selim |
| `ClubsService` — CRUD + üyelik yönetimi | Selim |
| `PrismaClubRepository` implementasyonu | Selim |
| Clubs API endpointleri (`/clubs`, `/members`) | Selim |
| RBAC middleware — club rol kontrolü | Ferhan |
| Kulüp listesi & detay sayfası (UI) | Abshir |
| Üyelik talebi & onay akışı (UI) | Abshir |
| Zustand club store | Ibrahim |
| API client katmanı (axios/fetch wrapper) | Ibrahim |

**Sprint 2 Çıktısı:** Kulüp oluşturma, üyelik başvurusu ve onay akışı çalışıyor.

---

### Sprint 3 — Events Modülü (25.04 – 01.05)

| Görev | Kişi |
|-------|------|
| Events schema (events, attendances, tags) | Selim |
| `EventEntity` + state machine (DRAFT/PUBLISHED/CANCELLED) | Selim |
| `IEventRepository`, Optimistic Locking implementasyonu | Selim |
| `EventsService` — CRUD + katılım use case'leri | Selim |
| Events API endpointleri | Selim |
| BullMQ + Redis kurulumu | Nuh |
| Outbox pattern implementasyonu | Nuh |
| Email worker (bildirim kuyruğu) | Nuh |
| Etkinlik listesi & detay sayfası (UI) | Abshir |
| Katılım butonu + kapasite göstergesi (UI) | Abshir |
| Etkinlik oluşturma formu — başkan view (UI) | Ibrahim |

**Sprint 3 Çıktısı:** Etkinlik oluşturma, yayınlama, katılım ve asenkron bildirim çalışıyor.

---

### Sprint 4 — QR Yoklama, Analytics & Polish (01.05 – 13.05)

| Görev | Kişi |
|-------|------|
| QR check-in endpoint (TOTP tabanlı) | Ferhan |
| Geofence check-in endpoint (GPS) | Selim |
| Analytics snapshot cron job | Nuh |
| CI/CD pipeline (GitHub Actions) | Nuh |
| Admin panel — kulüp & kullanıcı yönetimi (UI) | Abshir |
| Dashboard — başkan analytics view (UI) | Ibrahim |
| QR kod ekranı — mobil uyumlu (UI) | Ibrahim |
| E2E test senaryoları (kritik akışlar) | Ferhan + Selim |
| UI polish, responsive düzeltmeler | Abshir + Ibrahim |

**Sprint 4 Çıktısı:** MVP tamamlandı. Tüm kritik akışlar test edildi.

---

## Timeline Özeti

```
NİSAN                          MAYIS
01   08   15   22   29   06   13   20   26
|----S1----|----S2----|----S3----|----S4----|
 Altyapı   Clubs      Events     Polish+QR
```

---

## Definition of Done (Bitti Sayılma Kriteri)

Her görev şu kriterleri sağladığında bitti sayılır:

- [ ] Kod `develop` branch'ine merge edildi
- [ ] Unit test yazıldı (service/entity seviyesi)
- [ ] Postman koleksiyonuna endpoint eklendi
- [ ] PR review yapıldı (en az 1 kişi)

---

## Kritik Bağımlılıklar

- Clubs modülü → Identity modülünün bitmesini bekler (Sprint 1 → Sprint 2)
- Events modülü → Clubs modülünün bitmesini bekler (Sprint 2 → Sprint 3)
- Frontend auth → Backend register/login endpoint'lerini bekler
- BullMQ kurulumu → Events modülüyle paralel gidebilir

---

*ClubMS · Bartın Üniversitesi · MVP v1.0 · 2026*