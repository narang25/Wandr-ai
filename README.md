# Wandr.ai 🌍✈️

Wandr.ai is a next-generation, AI-powered travel planning application. It generates highly detailed, personalized, day-by-day itineraries using Groq's Llama 3 model. Users provide their destination, budget, and interests and receive a complete trip plan — which they can then modify, regenerate, and export.

## ✨ Features

### Core
- **🪄 AI-Powered Itineraries** — Generates full day-by-day plans with activities, times, costs, and GPS coordinates
- **✏️ Editable Itinerary** — Remove activities, add your own custom ones, or regenerate an entire day with new AI instructions
- **💰 Budget Estimation** — AI breaks down cost into flights, accommodation, food, activities, and transport
- **🏨 Hotel Suggestions** — AI-recommended hotels matched to your budget tier with ratings and amenities
- **💬 Real-Time AI Chat** — SSE-streamed conversational assistant for follow-up travel questions

### Advanced
- **🗺️ Interactive Maps** — Dark-themed Leaflet map plotting every activity with markers and popups
- **⛅ Live Weather Forecasts** — 5-day forecast for your destination via Open-Meteo API
- **📅 Calendar Export** — Download your entire itinerary as an `.ics` file for Apple/Google/Outlook Calendar

---

## 🛠️ Technology Stack

| Layer | Tech | Justification |
|-------|------|---------------|
| Frontend | **Next.js 15** | App router, server components, and excellent DX for a React-based SPA |
| Styling | **Tailwind CSS v4** | Utility-first CSS with custom design tokens for a consistent premium aesthetic |
| Animations | **Framer Motion** | Declarative animations with layout transitions for a polished feel |
| Backend | **Node.js + Express** | Lightweight, fast, and well-suited for REST API + SSE streaming |
| Database | **MongoDB + Mongoose** | Flexible document schema is ideal for storing AI-generated JSON itineraries |
| AI | **Groq (Llama 3.3 70B)** | Blazing-fast inference (< 2s) with structured JSON output mode |
| Maps | **React-Leaflet** | Free, no API key required, beautiful CartoDB Dark Matter tiles |
| Weather | **Open-Meteo API** | Free, no API key, accurate global weather data |
| Language | **TypeScript** | End-to-end type safety across frontend and backend |

---

## 🏗️ High-Level Architecture

```
┌──────────────────────────┐     ┌────────────────────────┐
│   Next.js Frontend       │     │   Express Backend      │
│   (localhost:3000)        │────▶│   (localhost:5001)     │
│                          │     │                        │
│  • App Router Pages      │     │  • REST API Routes     │
│  • React Components      │     │  • JWT Auth Middleware  │
│  • Tailwind + Framer     │     │  • Mongoose Models     │
│  • React-Leaflet Maps    │     │  • Groq AI Service     │
└──────────────────────────┘     └───────────┬────────────┘
                                             │
                                ┌────────────▼────────────┐
                                │   MongoDB Atlas          │
                                │   (Users, Trips)         │
                                └────────────┬────────────┘
                                             │
                                ┌────────────▼────────────┐
                                │   Groq API (Llama 3)     │
                                │   • Itinerary Generation │
                                │   • Day Regeneration     │
                                │   • Chat Streaming (SSE) │
                                └─────────────────────────┘
```

**Data flow:**
1. User fills out the trip wizard (destination, dates, budget, interests)
2. Frontend `POST`s to `/api/trips` → creates a pending trip in MongoDB
3. Frontend `POST`s to `/api/trips/:id/generate` → backend fires off a background Groq API call
4. AI returns structured JSON (itinerary, hotels, budget, coordinates) → saved to MongoDB
5. Frontend polls until `status === 'ready'`, then renders the full trip view
6. User can edit (add/remove activities, regenerate days) via `PUT`/`POST` endpoints
7. Chat widget streams AI responses in real-time via Server-Sent Events

---

## 🔐 Authentication & Authorization

### Approach
- **JWT-based stateless auth** — No server-side sessions, tokens stored in `localStorage`
- **bcrypt** password hashing with 12 salt rounds
- **Middleware enforcement** — `authenticateToken` middleware applied at the router level to all `/api/trips` and `/api/chat` routes

### Data Isolation
Every database query includes `userId: req.user.userId` as a filter condition. This ensures:
- Users can only see their own trips
- Users can only modify their own itineraries
- Users can only chat about their own trips
- No endpoint exists that returns data across users

### Security Measures
- Rate limiting on auth endpoints (prevents brute force)
- Rate limiting on AI generation endpoints (prevents abuse)
- Identical error messages for wrong email vs wrong password (prevents user enumeration)
- Input validation via `express-validator` on all mutation endpoints

---

## 🤖 AI Agent Design

### Model & Provider
We use **Groq** with the **Llama 3.3 70B Versatile** model. Groq was chosen for its extremely fast inference speed (typically < 2 seconds for a full itinerary), which is critical for user experience during trip generation.

### Structured Output
The AI prompt enforces a strict JSON schema using Groq's `response_format: { type: 'json_object' }` mode. The prompt includes an example JSON structure that the model must match exactly, including:
- Day-by-day activities with `id`, `time`, `name`, `description`, `category`, `estimatedCost`, and `location` (lat/lng)
- Budget breakdown with 5 cost categories
- Hotel suggestions with ratings, amenities, and pricing
- Quick facts with GPS coordinates for map centering

### Day Regeneration
The regenerate-day feature uses a **targeted prompt** that only asks the AI to produce one day's worth of activities. Users can optionally provide natural language instructions like _"More outdoor activities"_ or _"Focus on food and nightlife"_ which are injected into the prompt.

### Chat (SSE Streaming)
The chat endpoint uses Groq's streaming API. The backend reads the stream chunk-by-chunk and forwards each token to the frontend via Server-Sent Events, creating a real-time typing effect.

---

## 🎨 Creative / Custom Feature

### Interactive Maps + Weather + Calendar Export

**Problem solved:** Most AI trip planners give you a wall of text. You can't visualize *where* things are, *what the weather will be like*, or easily *put activities on your calendar*. These three features turn Wandr.ai from a planning tool into a practical travel companion.

1. **Maps** — The AI generates real GPS coordinates for every activity. These are plotted on a beautiful dark-themed Leaflet map so you can see spatial relationships between activities and plan routes.

2. **Weather** — The Open-Meteo API provides real 5-day forecasts. This helps users decide what to pack and whether to adjust outdoor activities.

3. **Calendar Export** — One click generates a standard `.ics` file with every activity placed on the correct date and time, calculated from the trip's start date. This imports directly into any calendar app.

**Engineering judgment:** All three features use **free APIs with no keys required** (Leaflet/OSM, Open-Meteo). This was intentional — it eliminates deployment friction and keeps costs at zero.

---

## ⚖️ Key Design Decisions & Trade-offs

| Decision | Rationale | Trade-off |
|----------|-----------|-----------|
| Background AI generation | Prevents HTTP timeout on long AI calls; returns immediately with status polling | Requires client-side polling instead of a single request-response |
| SSE for chat (not WebSocket) | Simpler server implementation; works over standard HTTP; no socket library needed | Unidirectional (server→client only); each message needs a new POST request |
| Mongoose Mixed schema for itinerary | Flexible enough to store whatever the AI returns without rigid schema migration | Requires `markModified()` calls; less type safety on nested documents |
| `localStorage` for JWT | Simple implementation; works immediately | Vulnerable to XSS (acceptable for this scope; production would use httpOnly cookies) |
| Tailwind v4 | Latest version with native CSS variables and improved performance | Newer ecosystem; fewer community resources vs v3 |
| No WebSocket for itinerary updates | Edits are user-initiated and infrequent; REST is simpler | If collaborative editing were needed, WebSocket would be required |

---

## ⚠️ Known Limitations

1. **No collaborative editing** — Trips are single-user only; no sharing or multi-user editing
2. **AI coordinate accuracy** — GPS coordinates from the LLM are approximate; they may not pinpoint exact venue locations
3. **No image generation** — Hotel and activity cards use icons/emojis instead of real photos
4. **Budget estimates are illustrative** — AI-generated costs are not connected to real pricing APIs
5. **JWT in localStorage** — Production deployment should use httpOnly cookies for better XSS protection
6. **No offline support** — Requires internet for all features including viewing saved trips

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or [Atlas](https://www.mongodb.com/atlas))
- [Groq API Key](https://console.groq.com/)

### 1. Clone the repository
```bash
git clone https://github.com/narang25/Wandr-ai.git
cd Wandr-ai
```

### 2. Install dependencies
```bash
# Frontend
npm install

# Backend
cd backend && npm install && cd ..
```

### 3. Environment Variables

**Root `.env.local`** (frontend):
```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

**`backend/.env`** (backend):
```env
PORT=5001
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/wandrai
JWT_SECRET=your_super_secret_jwt_key
GROQ_API_KEY=your_groq_api_key_here
CORS_ORIGINS=http://localhost:3000
```

> **Security:** All `.env` and `.env.local` files are in `.gitignore`. Your API keys are never committed to Git.

### 4. Run locally
```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start planning!

---

## 📦 Deployment

- **Backend:** Pre-configured with `railway.json` for Railway.app
- **Frontend:** Optimized for Vercel (`next build` works out of the box)
- Update `CORS_ORIGINS` in your production backend to match your Vercel domain

---

*Built with ❤️ for modern travelers.*
