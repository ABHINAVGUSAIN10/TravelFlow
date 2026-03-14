# TravelFlow ✦

![TravelFlow Hero](https://images.unsplash.com/photo-1506929562872-bb421503ef21?q=80&w=2068&auto=format&fit=crop)

TravelFlow is an interactive, cinematic web application that redefines travel planning. Designed with a dark, premium aesthetic and smooth micro-animations, it offers travelers an immersive way to explore stunning destinations, curate curated experiences, read captivating journal entries, and build their ultimate itineraries.

## ✨ Features

- **Cinematic Landing Page:** Immersive hero backgrounds, glassmorphism UI elements, and a dense, floating search bar.
- **Dynamic Exploration:** 
  - 🌍 **Destinations:** High-quality imagery, top highlights, and cultural descriptions for exotic locations.
  - 🎫 **Experiences:** Curated activities (from white-water rafting to Taj Mahal sunrise tours) with details on duration, rating, and inclusions.
  - 📖 **Journals:** Engaging travel essays with a clean, medium-style reading layout.
- **Itinerary Command Center (`/plan`):** A context-aware itinerary planner where users can seamlessly switch between:
  - 🕒 Timeline views
  - 🏨 Available hotel stays
  - 🚌 Transport & vehicle options
  - 🙋 Local tour guides
- **Interactive Route Map:** Live tracking visualizations overlaid on darkened geography.
- **Dynamic Routing:** Next.js dynamic routes (`[id]`) connected to centralized mock data for real-world application feel.

## 🛠️ Tech Stack

- **Framework:** [Next.js 14+ (App Router)](https://nextjs.org/)
- **Library:** [React](https://react.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Typography:** Google Fonts (Plus Jakarta Sans, Inter, JetBrains Mono)
- **Icons:** Google Material Symbols Outlined
- **Language:** TypeScript

## 🚀 Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/TravelFlow.git
   ```

2. Navigate into the project directory:
   ```bash
   cd TravelFlow
   ```

3. Install the dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📂 Project Structure

- `src/app/`
  - `page.tsx`: The cinematic landing page.
  - `destinations/`, `experiences/`, `journal/`: Index grids for exploration.
  - `plan/`: The interactive itinerary planner.
    - `_components/`: Modular, extracted planner components (Sidebar, TimelineTab, HotelsTab, etc.)
- `src/components/`: Reusable UI components (e.g., `Navigation`).
- `src/lib/`: External logic and dummy databases (`data.ts`).

## 🎨 Design Philosophy

TravelFlow abandons generic, bright interfaces in favor of a "Dark Navy/Charcoal" theme juxtaposed with vibrant accent colors (Amber/Yellow, Neon Cyan, Hot Pink, and Acid Green). Using glassmorphism, floating elements, and large typography, the UI is engineered to wow at first glance and make the planning phase as exciting as the journey itself.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
