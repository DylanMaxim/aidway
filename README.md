# AidFlow - LeicesterCS Hackathon 2025-26 · Team 8

> A humanitarian aid platform connecting charities, camp correspondents, and refugee camp residents - AI-powered sanitary product request management with QR codes, demand heatmaps, and real-time Firebase data.

---

## The Problem

Refugee camps struggle to communicate sanitary product needs to aid organisations. There is no structured way for residents to submit requests, no real-time visibility for charities on what is needed where, and field workers lack the tools to relay information efficiently.

---

## The Solution

AidFlow provides an end-to-end digital platform with three user roles:

| Role | What they do |
|---|---|
| **Charity Admin** | Logs in, generates camp access codes, views demand analytics |
| **Camp Correspondent** | Enters camp code, generates QR codes, opens chatbot or form |
| **Camp Resident** | Scans QR code, chats with AI assistant or fills in a form |

---

## Features

- Secure email/password login for charities and correspondents (Firestore + bcrypt)
- Camp access code generation - registered in Firestore, verified on entry
- QR code generator - deep-links residents to their camp's request flow
- AI Health Chatbot - Google Gemini conversational intake, exports structured JSON
- Request form - speech-to-text enabled, pre-fills camp code from QR scan
- Demand heatmap - per-product, per-camp colour-coded analytics table
- Interactive camp map - Leaflet map with risk-level circle markers
- Pad demand prediction - custom ML model forecasts next-month needs

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router + Pages Router), React 19, TypeScript |
| Styling | Tailwind CSS v4 |
| Database | Firebase Firestore |
| Auth | Firebase Admin SDK + bcrypt |
| AI / Chatbot | Google Gemini API (`gemini-2.0-flash-lite`) |
| ML | Custom Python-trained pad demand prediction model |
| QR Codes | `qrcode` npm package (client-side canvas, no external API) |
| Maps | Leaflet + React-Leaflet |

---

## User Flows

### 1. Charity Admin
```
/charity/login → /charity/dashboard
```
- Generate camp access codes (saved to Firestore `camps` collection)
- View heatmap, camp summary, pad demand prediction, and camp map
- Download QR codes for each camp

### 2. Camp Correspondent
```
user.localhost:3000/group/login → /group/dashboard
```
- Enter and verify a camp access code against Firestore
- Generate QR code linking residents to `/user/landing?code=CAMPCODE`
- Open AI chatbot or camp form directly

### 3. Camp Resident (QR Scan)
```
/user/landing?code=CAMPCODE
├── /chatbot       - AI-guided conversational intake
└── /test/camp     - Direct request form (code pre-filled)
```

---

## Getting Started

### Prerequisites
- Node.js ≥ 18
- Firebase project with Firestore enabled
- Google Gemini API key

### Install

```bash
cd frontend
npm install
```

### Environment Variables

Create `frontend/.env.local`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

Add your Firebase service account key at:
```
frontend/backend/serviceAccountKey.json
```

### Run

```bash
cd frontend
npm run dev
```

### Key URLs

| URL | Description |
|---|---|
| `http://localhost:3000/admin` | Admin QR dashboard |
| `http://localhost:3000/charity/login` | Charity login |
| `http://localhost:3000/charity/dashboard` | Charity analytics dashboard |
| `http://user.localhost:3000/group/login` | Correspondent login |
| `http://user.localhost:3000/group/dashboard` | Correspondent dashboard |
| `http://localhost:3000/chatbot` | AI health chatbot |
| `http://localhost:3000/test/camp` | Camp request form |

> **Subdomain routing:** The middleware automatically maps `user.localhost` → `/user/*` paths and root → charity/admin flows.

---

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── api/                  # Serverless API routes
│   │   │   ├── charity_login/    # Auth
│   │   │   ├── correspondent_login/
│   │   │   ├── register-camp-code/
│   │   │   ├── verify-camp-code/
│   │   │   ├── submit-request/   # Request creation + AI classification
│   │   │   ├── camp-summary/
│   │   │   ├── heatmap-data/
│   │   │   └── camp-map-data/    # Map + ML prediction
│   │   ├── charity/              # Charity login + dashboard
│   │   ├── chatbot/              # AI chatbot page + Gemini API route
│   │   ├── user/                 # Resident & correspondent pages
│   │   └── test/                 # Prototype pages (camp form, charity)
│   ├── pages/admin/              # Admin QR dashboard (Pages Router)
│   ├── components/default/       # Shared UI: Navbar, Login, Button
│   └── middleware.ts             # Subdomain routing logic
└── backend/
    ├── firebaseAdmin.js          # Firebase Admin SDK init
    ├── classifyRequest.js        # Gemini request classification
    ├── generateCampCode.js       # Random hex code generator
    └── getPadPrediction.js       # ML model integration
```

---

## Team

**LeicesterCS Hackathon 2025-2026 - Team 8**
