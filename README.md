# Bolajon ERP

Bog‘cha boshqaruvi (SaaS ERP) va Ota-onalar / Tarbiyachilar mobil platformasi.

## Loyiha tuzilmasi

- `backend/` — Express + TypeScript + Prisma + PostgreSQL API (`http://localhost:5000/api`)
- `frontend/` — React + Vite veb boshqaruv paneli (`tokens.css` Light & Dark rejim)
- `mobile/` — React Native + Expo SDK 58 mobil ilovasi (Ota-ona va Tarbiyachi)
- `.github/workflows/android-apk.yml` — Android `.apk` avtomatik yig‘ish va GitHub Releases chiqarish

## Android APK yuklab olish

Repository **Releases** bo‘limidan tayyor `.apk` faylni telefoningizga yuklab olib o‘rnatishingiz mumkin:
`https://github.com/eventuallyawaken/bolajon/releases`

## Lokal ishga tushirish

```bash
# Backend
cd backend && npm install && npx prisma migrate dev && npm run dev

# Frontend
cd frontend && npm install && npm run dev

# Mobile (Expo Go)
cd mobile && npm install && npx expo start -c
```
