# 💧 JalRakshak Health AI

**Smart Health Surveillance & Disease Early Warning System**

An AI-powered health surveillance system for rural India that predicts disease outbreaks, visualizes risk hotspots on interactive maps, and triggers early warnings to protect communities.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ installed
- **npm** or **yarn**

### Installation

```bash
cd website
npm install
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
website/
├── src/
│   ├── app/
│   │   ├── page.tsx           # Landing page
│   │   ├── layout.tsx         # Root layout
│   │   ├── globals.css        # Design system
│   │   ├── report/page.tsx    # Health report form
│   │   ├── dashboard/page.tsx # Surveillance dashboard
│   │   ├── admin/page.tsx     # Admin control panel
│   │   └── awareness/page.tsx # Multilingual health awareness
│   ├── components/
│   │   ├── Navbar.tsx         # Navigation bar
│   │   ├── MapView.tsx        # Leaflet map component
│   │   ├── Charts.tsx         # Recharts visualizations
│   │   └── AlertPopup.tsx     # Outbreak alert system
│   └── lib/
│       ├── mockData.ts        # Mock data & risk calculation
│       └── offlineStorage.ts  # localStorage offline support
├── package.json
├── tsconfig.json
├── next.config.ts
└── postcss.config.mjs
```

---

## 📱 Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with hero, pipeline, and features |
| `/report` | Mobile-friendly health report form with offline support |
| `/dashboard` | Interactive map, charts, and reports table |
| `/admin` | Stats, high-risk villages, active alerts |
| `/awareness` | Multilingual health education (EN/HI/BN) |

---

## 🧠 AI/ML Pipeline (Frontend Simulation)

The frontend simulates the hybrid AI model:

1. **Rule-Based Risk**: `fever*2 + diarrhea*3 + vomiting*2 + (20 if contaminated)`
2. **ML Prediction**: Simple threshold-based simulation
3. **Hybrid Score**: ML outbreak prediction adds +30 to risk
4. **Risk Levels**: LOW (<50), MEDIUM (50-79), HIGH (≥80)

---

## 🗺️ Map System

- **Leaflet.js** with dark CARTO tiles
- Color-coded circle markers (Green/Yellow/Red)
- Glow rings for HIGH risk areas
- Custom popups with risk data
- Legend overlay

---

## 📡 Offline Support

- Reports stored in `localStorage` when offline
- Visual indicator shows online/offline status
- "Sync" button sends all stored reports when back online

---

## 🌐 Multilingual

The `/awareness` page supports:
- 🇬🇧 English
- 🇮🇳 Hindi (हिन्दी)
- 🇮🇳 Bengali (বাংলা)

---

## 🏗️ Tech Stack

- **Next.js 15** (App Router)
- **Tailwind CSS v4**
- **Leaflet.js** (Maps)
- **Recharts** (Charts)
- **TypeScript**

---

## 🎯 Demo Flow

1. Submit a health report at `/report`
2. AI processes symptoms and calculates risk
3. Risk score and level displayed instantly
4. Dashboard map updates with color-coded markers
5. High-risk areas glow red
6. Alert popups trigger for risk > 80%

---

Built with ❤️ for India's rural communities | Hackathon 2026
