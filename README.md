# Bolajon ERP — Multi-Tenant Kindergarten SaaS & Mobile Platform

Full-stack **Kindergarten Management SaaS (ERP)** and **Parent / Teacher Mobile Platform** supporting multi-branch operations, strict role-based access control (RBAC), clinical/medical monitoring, automated warehouse inventory deduction, bank card & receipt verification workflow, and real-time targeted notifications.

---

## Key Features & Roles

- **SaaS Superadmin (`/superadmin`)**
  - Multi-tenant kindergarten onboarding, plan/subscription management, billing invoices, audit logs, suspension, and safe hard-delete controls.
- **Director (`/dashboard`, `/branches`, `/staff`, `/groups`, `/children`)**
  - Multi-branch switcher, group & staff management, child admissions (auto-provisioning linked parent portal accounts), financial and attendance KPIs.
- **Teacher (`/attendance`, `/groups`, `/children`)**
  - Group-level daily attendance & morning health temperature triage, automated daily menu ingredient deduction from warehouse inventory, and targeted parent alerts.
- **Nurse (`/medical`, `/attendance`)**
  - Dedicated Medical Control Center: daily triage alerts (`> 37.2°C` / symptoms), checkups, vaccinations & illness journal, child allergy passports, and daily menu allergen safety cross-checks.
- **Chief Accountant (`/dashboard`, `/payments`, `/expenses`, `/warehouse`)**
  - Role-tailored financial dashboard, multi-card bank details management (`Uzcard`, `Humo`, `Visa`, `Mastercard`), receipt review queue (`Approve` counts toward monthly revenue; `Reject` notifies parent with reason), expenses ledger, and warehouse stock tracking.
- **Parent Portal Web (`/parent/*`) & Mobile (`mobile/`)**
  - Multi-child switcher, live daily attendance & temperature status, medical records & vaccination history, daily menu with allergy warnings, absence notice submission, and online card payment receipt upload (drag-and-drop image compression).
- **Cross-Cutting Capabilities**
  - JWT access + refresh rotation (1-day token expiry & server-side session verification), login rate-limiting, `UZ / RU / EN` i18n localization, Light/Dark theme tokens, and circular profile avatars with drag-and-drop upload.

---

## Repository Structure

- `backend/` — Node.js, Express, TypeScript, Prisma ORM, PostgreSQL, Zod validation (`/api` & `/api/v1`)
- `frontend/` — React 19, TypeScript, Vite, Zustand state management, role-protected routing & responsive UI
- `mobile/` — React Native + Expo SDK mobile app for Parents and Teachers
- `.github/workflows/android-apk.yml` — Automated Android `.apk` build & GitHub Releases workflow

---

## Tech Stack

- **Backend:** Node.js, Express, TypeScript, Prisma ORM, PostgreSQL, Zod, Helmet, JWT, bcryptjs
- **Frontend:** React, TypeScript, Vite, React Router, Zustand, Axios, React Toastify
- **Mobile:** React Native, Expo, TanStack Query, React Navigation, Lucide Icons

---

## Local Setup

1. **Copy environment templates** (never commit `.env` files):
   - `backend/.env.example` -> `backend/.env`
   - `frontend/.env.example` -> `frontend/.env`
   - `mobile/.env.example` -> `mobile/.env`

2. **Install & Run:**

```bash
# Backend
cd backend
npm install
npx prisma generate
npx prisma db push
npm run dev

# Frontend
cd frontend
npm install
npm run dev

# Mobile (Expo)
cd mobile
npm install
npx expo start -c
```

## Android APK Releases

Automated Android builds are available in the repository **Releases** section:
`https://github.com/eventuallyawaken/bolajon/releases`
