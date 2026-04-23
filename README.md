# TravelFlow ✦

![TravelFlow Hero](https://images.unsplash.com/photo-1506929562872-bb421503ef21?q=80&w=2068&auto=format&fit=crop)

TravelFlow is an interactive, cinematic web application that redefines travel planning. Designed with a dark, premium aesthetic and smooth micro-animations, it offers travelers an immersive way to explore **50+ stunning Indian destinations**, curate experiences, read captivating journal entries, and build their ultimate itineraries — all powered by a live MongoDB backend.

## ✨ Features

- **Cinematic Landing Page:** Immersive hero backgrounds with auto-advancing carousel, glassmorphism UI elements, and a dense, floating search bar.
- **Dynamic Exploration:**
  - 🌍 **Destinations:** 50+ locations across India, dynamically fetched from MongoDB. Filterable by **11 categories** (Beaches, Mountains, Monuments, Cities, Forests, Lakes, Deserts, Valleys, Hill Stations, Waterfalls, Islands) with full-text search.
  - 📍 **Destination Detail Pages:** Rich detail pages featuring:
    - Detailed descriptions & top highlights
    - 🎉 Local festivals & events with timing
    - 💡 Fun facts & trivia
    - 🧳 Season-wise packing essentials (e.g., trekking shoes for mountains, sunscreen for beaches)
    - 📅 Best time to visit recommendations
  - 🎫 **Experiences:** Curated activities (from white-water rafting to Taj Mahal sunrise tours) with details on duration, rating, and inclusions.
  - 📖 **Journals:** Engaging travel essays with a clean, medium-style reading layout.
- **Itinerary Command Center (`/plan`):** A context-aware itinerary planner where users can seamlessly switch between:
  - 🕒 Timeline views
  - 🏨 Available hotel stays
  - 🚌 Transport & vehicle options (with **Interactive Seat & Cabin Selection** and dynamic budget tracking)
  - 🙋 Local tour guides
- **Interactive Route Map:** Live tracking visualizations using **Leaflet** overlaid on darkened geography.
- **User Authentication & Profiles:** Secure login via Google OAuth or Email/Password (using NextAuth). Users can manage their upcoming trips, view past itineraries, and cancel bookings within a 48-hour window.
- **Smart Routing Engine:** Intelligent multi-modal routing (Flight, Train, Bus, Road) powered by free OSM APIs (Overpass, Photon, OSRM).

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | [Next.js 16 (App Router)](https://nextjs.org/) |
| **Auth** | [NextAuth.js (v4)](https://next-auth.js.org/) |
| **Library** | [React 19](https://react.dev/) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) |
| **Database** | [MongoDB Atlas](https://www.mongodb.com/atlas) + [Mongoose](https://mongoosejs.com/) |
| **Maps & Routing** | [Leaflet](https://leafletjs.com/), Overpass, Photon, OSRM |
| **Typography** | Google Fonts (Plus Jakarta Sans, Inter, JetBrains Mono) |
| **Icons** | Google Material Symbols Outlined |
| **Language** | TypeScript |

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20+)
- A [MongoDB Atlas](https://www.mongodb.com/atlas) account (free tier works) **or** a local MongoDB instance
- A [SerpAPI](https://serpapi.com/) account for Google Hotels API live data

### Obtaining API Keys

1. **MongoDB Atlas (`MONGODB_URI`)**:
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas/database) and create a free cluster.
   - Go to **Database Access** and create a user with a password.
   - Go to **Network Access** and allow your IP address (or `0.0.0.0/0` for universal access).
   - Click **Connect** on your cluster, choose **Connect your application**, and copy the connection string. Replace `<password>` with the password you created.

2. **Google OAuth (Optional, for Google Login)**:
   - Go to the [Google Cloud Console](https://console.cloud.google.com/).
   - Create a new project and configure the OAuth consent screen.
   - Create OAuth 2.0 Client IDs.
   - Set Authorized redirect URIs to `http://localhost:3000/api/auth/callback/google`.
   - Copy the Client ID (`GOOGLE_CLIENT_ID`) and Client Secret (`GOOGLE_CLIENT_SECRET`).

3. **NextAuth Secret (`NEXTAUTH_SECRET`)**:
   - Generate a random string (e.g., using `openssl rand -base64 32`) to secure your sessions.

4. **SerpAPI (`SERPAPI_KEY`)**:
   - Head over to [SerpAPI](https://serpapi.com/) and register for a free account.
   - Once logged in, navigate to your **Dashboard**.
   - Copy your private API Key from the "Your Private API Key" section.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/TravelFlow.git
   cd TravelFlow
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**

   Copy the `.env.example` file to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   Then, update `.env.local` with your database and API keys:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   SERPAPI_KEY=your_serpapi_private_key
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_generated_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

   > **Note for Collaborators:** You can either use your own local/Atlas database (recommended) or ask the project owner for access to the shared development database.

4. **Seed the database:**
   ```bash
   npm run seed      # Inserts 50 locations
   npm run enrich    # Adds fun facts, festivals, packing essentials
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) to see the app.

### Available Scripts

| Command | Description |
|---------|------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run seed` | Seed MongoDB with 50 Indian locations |
| `npm run enrich` | Add rich detail data (fun facts, festivals, packing lists) |
| `npm run lint` | Run ESLint |

## 📂 Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Cinematic landing page with carousel
│   ├── destinations/
│   │   ├── page.tsx                # Category-filtered destinations grid
│   │   └── [id]/page.tsx           # Rich destination detail page
│   ├── experiences/                # Curated activity listings
│   ├── journal/                    # Travel journal entries
│   ├── plan/                       # Itinerary command center
│   │   └── _components/            # Planner sub-components
│   ├── about/                      # About page
│   └── api/
│       └── locations/
│           ├── route.ts            # GET /api/locations (list + filter)
│           └── [id]/route.ts       # GET /api/locations/:id (detail)
├── components/
│   └── Navigation.tsx              # Shared navigation bar
├── lib/
│   ├── data.ts                     # Static mock data (experiences, journals)
│   └── mongodb.ts                  # MongoDB connection utility
├── models/
│   └── Location.ts                 # Mongoose schema & model
scripts/
├── seed.ts                         # Database seeding script
└── enrich.ts                       # Rich data enrichment script
public/
└── images/                         # Local destination images
```

## 🗂️ Location Categories

The 50+ destinations span **11 categories** across India:

| Category | Examples |
|----------|---------|
| 🏖️ Beaches | Palolem, Radhanagar, Varkala, Kovalam, Om Beach |
| 🏔️ Mountains | Gulmarg, Roopkund, Spiti Valley, Auli, Nanda Devi |
| 🏛️ Monuments | Taj Mahal, Hawa Mahal, Hampi, Konark, Meenakshi Temple |
| 🏙️ Cities | Varanasi, Udaipur, Jaisalmer, Jodhpur, Pondicherry |
| 🌲 Forests | Sundarbans, Jim Corbett, Kaziranga, Periyar, Silent Valley |
| 🏞️ Lakes | Pangong Tso, Dal Lake, Chilika, Nainital, Loktak |
| 🏜️ Deserts | Thar Desert, Rann of Kutch, Nubra Valley |
| 🏕️ Valleys | Mechuka, Valley of Flowers, Ziro, Dzukou, Araku |
| ⛰️ Hill Stations | Munnar, Shimla, Darjeeling, Manali, Ooty, Coorg |
| 💧 Waterfalls | Dudhsagar, Jog Falls, Nohkalikai Falls |
| 🏝️ Islands | Lakshadweep, Neil Island, Majuli Island |

## 🎨 Design Philosophy

TravelFlow uses a **"Dark Navy/Charcoal"** theme with vibrant accent colors (Amber, Neon Cyan, Hot Pink, Acid Green). Glassmorphism, floating elements, and large typography create a premium aesthetic where the planning phase is as exciting as the journey itself.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
