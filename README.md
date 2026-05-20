# Smart Travel Planner

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/yourusername/smart-travel-planner)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.12+-blue)](https://www.python.org/)
[![Node.js](https://img.shields.io/badge/node.js-22.13+-green)](https://nodejs.org/)

## Overview

**Smart Travel Planner** is an AI-powered travel planning platform that eliminates the fatigue of itinerary creation through a specialized **Multi-Agent System (MAS)**. Users input their destination, duration, and budget in Malaysian Ringgit (RM), and a coordinated team of intelligent agents autonomously generates hyper-personalized itineraries, curates hotel recommendations, and calculates precise budget allocations—all in real-time with transparent, interactive visualizations.

## Multi-Agent Architecture

The Smart Travel Planner employs a three-node agent system powered by **Google ADK (Agent Development Kit)**, each with a distinct responsibility:

```mermaid
graph TD
    User["👤 User Input<br/>(Destination, Days, Budget)"]
    Orchestrator["🎯 Orchestrator Agent<br/>(Coordinator)"]
    Travel["✈️ Travel & Culture Agent<br/>(Itinerary & Experiences)"]
    Logistics["📊 Logistics Agent<br/>(Budget & Weather)"]
    Output["📋 Trip Plan<br/>(Itinerary + Budget)"]
    
    User -->|Request| Orchestrator
    Orchestrator -->|Delegate| Travel
    Orchestrator -->|Delegate| Logistics
    Travel -->|Results| Orchestrator
    Logistics -->|Results| Orchestrator
    Orchestrator -->|Synthesize| Output
```

### Agent Roles

- **Orchestrator Agent:** Routes user requests, maintains session context, and synthesizes sub-agent outputs into a cohesive trip plan.
- **Travel & Culture Agent:** Generates day-by-day itineraries, recommends hotels, and surfaces local attractions and dining experiences using real-time web search.
- **Logistics Agent:** Calculates budget allocations across accommodation, food, transport, and activities; fetches weather forecasts for optimal planning.

## Key Features

- **🤖 Multi-Agent Orchestration:** Specialized agents collaborate to produce comprehensive, balanced travel plans.
- **📅 Dynamic Itineraries:** Day-by-day breakdowns with activities, dining recommendations, and local insights.
- **💰 Real-Time Budget Math:** Transparent budget allocation in Malaysian Ringgit with interactive sliders for custom adjustments.
- **🎨 Live Agent Status Visualization:** Watch agents "think" in real-time with an animated node graph and live terminal log showing agent communication.
- **📊 Interactive Budget Charts:** Recharts-powered pie charts with hover-synchronized breakdown tables.
- **📱 Collapsible Timeline:** Expand/collapse individual days or toggle all days at once for flexible exploration.
- **💾 Trip History:** Save and revisit past trip plans with full edit capabilities.
- **📄 PDF Export:** Download complete itineraries and budget breakdowns as professional PDFs.
- **🌙 Dark Industrial Aesthetic:** Brutalist-inspired design with monochromatic grayscale palette and high-contrast typography.

## Tech Stack

### Backend
- **Python 3.12** – Core runtime
- **FastAPI** – RESTful API framework
- **Google ADK** – Multi-agent orchestration and LLM integration
- **Drizzle ORM** – Type-safe database queries
- **MySQL/TiDB** – Persistent data storage

### Frontend
- **React 19** – UI framework
- **Vite** – Build tool and dev server
- **Tailwind CSS 4** – Utility-first styling
- **Framer Motion** – Advanced animations
- **Recharts** – Data visualization
- **tRPC** – End-to-end type-safe API communication

## Quick Start

### Prerequisites
- **Python 3.12+**
- **Node.js 22.13+** and **pnpm**
- **MySQL 8.0+** or **TiDB**

### Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/smart-travel-planner.git
   cd smart-travel-planner
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with the following critical variables:
   ```env
   # Backend
   DATABASE_URL=mysql://user:password@localhost:3306/travel_planner
   GOOGLE_API_KEY=your_google_api_key_here
   JWT_SECRET=your_jwt_secret_here
   
   # Frontend
   VITE_OAUTH_PORTAL_URL=https://your-oauth-provider.com
   VITE_APP_ID=your_app_id
   ```

3. **Install backend dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Install frontend dependencies:**
   ```bash
   pnpm install
   ```

5. **Run database migrations:**
   ```bash
   pnpm drizzle-kit generate
   pnpm drizzle-kit migrate
   ```

6. **Start the development server:**
   ```bash
   # Terminal 1: Backend (FastAPI)
   python -m uvicorn main:app --reload --port 8000
   
   # Terminal 2: Frontend (React + Vite)
   pnpm dev
   ```

   The application will be available at `http://localhost:5173` (frontend) and `http://localhost:8000/docs` (API docs).

## Project Structure

```
smart-travel-planner/
├── server/
│   ├── agents.ts                 # Multi-agent orchestration logic
│   ├── routers.ts                # tRPC procedure definitions
│   ├── db.ts                     # Database query helpers
│   ├── pdf-generator.ts          # PDF export utility
│   └── _core/                    # Framework plumbing
├── client/
│   ├── src/
│   │   ├── pages/                # Page components
│   │   │   ├── Home.tsx          # Landing page
│   │   │   ├── TripPlanningPage.tsx
│   │   │   ├── TripHistoryPage.tsx
│   │   │   └── TripDetailPage.tsx
│   │   ├── components/           # Reusable UI components
│   │   │   ├── AgentNetworkStatus.tsx
│   │   │   ├── TripForm.tsx
│   │   │   ├── ItineraryTimeline.tsx
│   │   │   ├── BudgetChart.tsx
│   │   │   └── PDFExportButton.tsx
│   │   ├── App.tsx               # Route definitions
│   │   └── main.tsx              # React entry point
│   └── public/                   # Static assets
├── drizzle/
│   ├── schema.ts                 # Database schema
│   └── migrations/               # Generated SQL migrations
├── requirements.txt              # Python dependencies
├── package.json                  # Node.js dependencies
└── README.md                     # This file
```

## API Endpoints

### Trip Planning
- `POST /api/trpc/trips.plan` – Generate a new trip plan
- `GET /api/trpc/trips.history` – Retrieve user's trip history
- `GET /api/trpc/trips.getById` – Fetch a specific trip
- `DELETE /api/trpc/trips.delete` – Delete a trip
- `POST /api/trpc/trips.exportPDF` – Export trip as PDF

### Authentication
- `POST /api/oauth/callback` – OAuth callback handler
- `GET /api/trpc/auth.me` – Get current user
- `POST /api/trpc/auth.logout` – Logout user

## Configuration

### Agent Prompts
Agent behavior is controlled via system prompts in `server/agents.ts`. Key directives:

- **Logistics Agent:** All budget calculations are in Malaysian Ringgit (RM). No USD or other currencies.
- **Travel & Culture Agent:** Prioritize local, authentic experiences; include dining recommendations and cultural insights.
- **Orchestrator Agent:** Synthesize outputs into a cohesive, readable trip plan with clear day-by-day structure.

### Styling & Theme
The application uses a dark industrial aesthetic with a monochromatic grayscale palette. Customize colors in `client/src/index.css` by modifying CSS variables in the `:root` selector.

## Testing

Run the test suite with:
```bash
pnpm test
```

Tests are located in `server/*.test.ts` and use **Vitest** for fast, type-safe testing.

## Deployment

### Manus Platform
The application is configured for deployment on **Manus** with built-in support for:
- OAuth authentication
- Database hosting
- Static asset storage (S3)
- Custom domain management

To deploy:
1. Create a checkpoint: `webdev_save_checkpoint`
2. Click "Publish" in the Manus dashboard

### External Hosting
For deployment to external platforms (Railway, Render, Vercel):
- Ensure `DATABASE_URL` and `GOOGLE_API_KEY` are set in environment variables
- Build the frontend: `pnpm build`
- Start the backend: `python -m uvicorn main:app --host 0.0.0.0 --port 8000`

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -am 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Submit a pull request

## License

This project is licensed under the **MIT License**. See [LICENSE](LICENSE) for details.

## Support & Feedback

For issues, feature requests, or feedback, please open a GitHub issue or contact the maintainers at [support@smarttravelplanner.com](mailto:support@smarttravelplanner.com).

---

**Built with ❤️ using AI agents and modern web technologies.**
