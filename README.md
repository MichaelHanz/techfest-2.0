# ✈️ Smart Travel Planner

**An AI-powered, multi-agent orchestration engine for hyper-personalized, stress-free travel planning.**

---

[![React](https://img.shields.io/badge/React%2019-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Google ADK](https://img.shields.io/badge/Google%20ADK-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev)
[![Python](https://img.shields.io/badge/Python%203.12-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS%204-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

---

## 📉 The Problem: Planning Fatigue

Travel planning today is broken. You're juggling 20+ browser tabs, cross-referencing hotel reviews, manually building spreadsheets for budgets, and second-guessing every decision. The process is exhausting, time-consuming, and leaves you stressed before your trip even begins.

**Smart Travel Planner transforms you from an overwhelmed researcher into an empowered traveler.** Instead of drowning in information, a coordinated swarm of AI agents works in parallel—one orchestrating the workflow, another curating local experiences, and a third handling financials with surgical precision. In minutes, you get a hyper-personalized itinerary, hotel recommendations, local food suggestions, and an exact budget breakdown—all localized in Malaysian Ringgit (RM).

---

## ✨ Key Features

1. 🤖 **Multi-Agent Orchestration (Google ADK)**  
   The Orchestrator Agent routes tasks intelligently instead of relying on a single, hallucination-prone LLM. Each agent specializes in its domain, ensuring accuracy and reducing computational waste.

2. 🌍 **Hyper-Local Curation**  
   The Travel & Culture Agent discovers hidden gems, builds chronological itineraries, and recommends authentic local experiences—not generic tourist traps. Every suggestion is grounded in real-time research.

3. 💰 **Intelligent Financials**  
   The Logistics Agent calculates exact budget splits across accommodation, food, transport, and activities—all in Malaysian Ringgit. No guesswork. No currency confusion.

4. ✨ **Fluid Agentic UI**  
   Watch agents "think" in real-time with a responsive, high-contrast React interface powered by `framer-motion`. The AgentNetworkStatus component visualizes the multi-agent system at work, making the AI transparent and engaging.

5 📊 **Interactive Budget Visualization**  
   Recharts-powered pie charts with real-time hover interactions. Adjust allocations with sliders and see the breakdown update instantly.

6. 📄 **PDF Export**  
   Download your complete trip plan as a beautifully formatted PDF—perfect for sharing with travel companions or keeping as a reference.

7. 💾 **Trip History & Persistence**  
   Save all your generated trips to a secure database. Revisit, compare, and refine past plans anytime.

---

## 🏗️ Architectural Overview

Smart Travel Planner is built on a **decoupled, serverless-ready architecture** designed for scalability and maintainability:

### Frontend Engine
- **React 19** with **Vite** for lightning-fast development and production builds
- **Tailwind CSS 4** for utility-first, responsive design with a dark industrial aesthetic
- **Framer Motion** for smooth, physics-based animations and micro-interactions

### State & Animation
- **tRPC** for end-to-end type-safe API communication
- **TanStack Query** for intelligent server state management and caching
- **Framer Motion** for real-time agent status visualization and loading states

### Backend & API
- **Python 3.12** with **FastAPI** for high-performance, async request handling
- **Drizzle ORM** with **MySQL/TiDB** for type-safe database operations
- **Uvicorn** server with automatic OpenAPI documentation

### AI Integration
- **Google ADK (Agent Development Kit)** for multi-agent orchestration
- **google_search** tool integration for real-time destination research
- **invokeLLM** helper for structured LLM calls with JSON schema validation
- **Manus OAuth** for seamless user authentication and session management

### Data Flow
```
User Input (Destination, Duration, Budget)
    ↓
FastAPI /api/plan-trip Endpoint
    ↓
Orchestrator Agent (Google ADK)
    ├→ Travel & Culture Agent (Itinerary, Hotels, Local Experiences)
    └→ Logistics Agent (Weather, Budget Allocation)
    ↓
Structured JSON Response
    ↓
React Frontend (Real-time Visualization)
    ↓
Trip Saved to Database (MySQL/TiDB)
```

---

## 🔒 Security & Best Practices

**No secrets are hardcoded.** All sensitive credentials—including the `GOOGLE_API_KEY`, database connection strings, and OAuth tokens—are strictly managed via environment variables loaded from a `.env` file.

### Environment Variables
- `GOOGLE_API_KEY`: Google ADK authentication token
- `DATABASE_URL`: MySQL/TiDB connection string
- `JWT_SECRET`: Session cookie signing secret
- `VITE_APP_ID`: Manus OAuth application ID
- `OAUTH_SERVER_URL`: OAuth backend base URL

### Best Practices
- ✅ All API keys stored in `.env` (never committed to version control)
- ✅ Database credentials encrypted in transit via TLS
- ✅ User authentication via OAuth (no password storage)
- ✅ Session tokens signed with `JWT_SECRET`
- ✅ CORS configured for trusted origins only
- ✅ Input validation on all endpoints (Pydantic models)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 22+ and pnpm
- Python 3.12+
- MySQL/TiDB database

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/smart-travel-planner.git
   cd smart-travel-planner
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your credentials:
   # - GOOGLE_API_KEY
   # - DATABASE_URL
   # - JWT_SECRET
   # - VITE_APP_ID
   # - OAUTH_SERVER_URL
   ```

4. **Run database migrations**
   ```bash
   pnpm db:push
   ```

5. **Start development server**
   ```bash
   pnpm dev
   ```

6. **Open in browser**
   ```
   http://localhost:3000
   ```

---

## 📁 Project Structure

```
smart-travel-planner/
├── client/                    # React frontend
│   ├── src/
│   │   ├── pages/            # Page components (Home, TripPlanning, History, Detail)
│   │   ├── components/       # Reusable UI components
│   │   ├── lib/              # tRPC client, utilities
│   │   └── index.css         # Global styles & theme
│   └── index.html
├── server/                    # FastAPI backend
│   ├── agents.ts             # Multi-agent orchestration logic
│   ├── routers.ts            # tRPC procedure definitions
│   ├── db.ts                 # Database query helpers
│   ├── pdf-generator.ts      # PDF export utility
│   └── _core/                # Framework internals
├── drizzle/                   # Database schema & migrations
│   └── schema.ts             # Drizzle ORM table definitions
├── shared/                    # Shared types & constants
├── package.json
└── README.md
```

---

## 🎯 Core Workflows

### Trip Planning Workflow
1. User enters destination, duration, and budget
2. Frontend sends request to `/api/plan-trip`
3. Orchestrator Agent receives request and delegates:
   - **Travel & Culture Agent**: Generates itinerary, finds hotels, curates local experiences
   - **Logistics Agent**: Fetches weather, calculates budget allocation
4. Results aggregated and returned to frontend
5. User views interactive itinerary, budget chart, and hotel recommendations
6. User can adjust budget allocations with real-time chart updates
7. Trip saved to database for future reference

### Real-Time Agent Visualization
- **AgentNetworkStatus** component displays which agent is currently "thinking"
- Color-coded nodes (Orchestrator: purple, Travel & Culture: green, Logistics: blue)
- Terminal log with typewriter effect shows agent communication
- Data flow packets animate along SVG connection lines

---

## 🧪 Testing

Run the test suite:
```bash
pnpm test
```

Tests cover:
- tRPC procedure logic
- Trip CRUD operations
- Agent orchestration
- Database queries

---

## 📦 Deployment

Smart Travel Planner is optimized for serverless deployment on Manus or similar platforms:

1. **Create a checkpoint**
   ```bash
   webdev_save_checkpoint
   ```

2. **Click "Publish" in the Manus dashboard**

3. **Your app is live** at `https://your-domain.manus.space`

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Google ADK** for the powerful multi-agent orchestration framework
- **React & Tailwind CSS** communities for exceptional developer experience
- **Manus** for seamless deployment and OAuth infrastructure
- **TanStack** for industry-leading data management tools

---

**Built with ❤️ for travelers who deserve better.**
