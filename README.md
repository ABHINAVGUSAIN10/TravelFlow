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
  - 🚌 Transport & vehicle options
  - 🙋 Local tour guides
- **Interactive Route Map:** Live tracking visualizations overlaid on darkened geography.

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | [Next.js 16 (App Router)](https://nextjs.org/) |
| **Library** | [React 19](https://react.dev/) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) |
| **Database** | [MongoDB Atlas](https://www.mongodb.com/atlas) + [Mongoose](https://mongoosejs.com/) |
| **Typography** | Google Fonts (Plus Jakarta Sans, Inter, JetBrains Mono) |
| **Icons** | Google Material Symbols Outlined |
| **Language** | TypeScript |

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20+)
- A [MongoDB Atlas](https://www.mongodb.com/atlas) account (free tier works) **or** a local MongoDB instance

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

   Create a `.env.local` file in the root directory:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/travelflow?retryWrites=true&w=majority
   ```
   > For local MongoDB, use: `mongodb://localhost:27017/travelflow`

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
