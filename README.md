# Wandr.ai 🌍✈️

![Wandr.ai Hero Banner](https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=1200&auto=format&fit=crop)

Wandr.ai is a next-generation, AI-powered travel planning application. It generates highly detailed, personalized, day-by-day itineraries based on your destination, budget, and specific interests. Built with a sleek, modern glassmorphism aesthetic and real-time streaming AI capabilities.

## ✨ Features

- **🪄 AI-Powered Itineraries:** Generates a full day-by-day travel plan using Groq's blazing-fast Llama 3 models.
- **🗺️ Interactive Maps:** Automatically plots all your activities on a beautiful interactive map using Leaflet.
- **⛅ Live Weather Forecasts:** Fetches 5-day weather forecasts for your destination using the Open-Meteo API.
- **📅 Calendar Export:** Download your entire itinerary as an `.ics` file directly to Apple Calendar, Google Calendar, or Outlook.
- **💬 Real-Time AI Chat Assistant:** Ask follow-up questions or request modifications to your itinerary using the floating chat widget.
- **🎨 Premium UI/UX:** A stunning dark mode interface with deep colors, frosted-glass cards, and Framer Motion animations.
- **🏨 Smart Hotel & Budget Breakdowns:** AI recommends hotels matching your tier and provides a granular cost breakdown.

## 🛠️ Technology Stack

- **Frontend:** Next.js 15, React, Tailwind CSS v4, Framer Motion, React-Leaflet
- **Backend:** Node.js, Express, TypeScript, Server-Sent Events (SSE)
- **Database:** MongoDB & Mongoose
- **AI & Integrations:** Groq (Llama 3), Open-Meteo API, `ics` Calendar Export

## 🚀 Getting Started

### Prerequisites

You need Node.js (v18+) and a MongoDB database (local or Atlas). You also need an API key from [Groq](https://console.groq.com/).

### 1. Clone the repository
```bash
git clone https://github.com/narang25/Wandr-ai.git
cd Wandr-ai
```

### 2. Install dependencies
Install dependencies for both the frontend and the backend:
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 3. Environment Variables
Create a `.env` file in the **root directory** (for the frontend):
```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

Create a `.env` file in the **`backend/` directory**:
```env
PORT=5001
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/wandrai
JWT_SECRET=your_super_secret_jwt_key
GROQ_API_KEY=your_groq_api_key_here
CORS_ORIGINS=http://localhost:3000
```
> **Note:** Your API keys are safe. `.env` and `.env.local` files are ignored by git via `.gitignore`.

### 4. Run the development servers
Open two terminal windows.

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
npm run dev
```

Navigate to [http://localhost:3000](http://localhost:3000) to start planning your next adventure!

## 📦 Production Deployment

Wandr.ai is configured to be easily deployed:
- **Backend**: Pre-configured with a `railway.json` file for 1-click deployment on Railway.app.
- **Frontend**: Optimized for deployment on Vercel.

Be sure to update your `CORS_ORIGINS` in your production backend to match your Vercel URL!

---
*Built with ❤️ for modern travelers.*
