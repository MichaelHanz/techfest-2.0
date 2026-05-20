# Smart Travel Planner

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/yourusername/smart-travel-planner)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.12-3776ab?logo=python&logoColor=white)](https://www.python.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22.13.0-339933?logo=node.js&logoColor=white)](https://nodejs.org/)

## 🎯 Overview

Smart Travel Planner is an **AI-powered travel planning platform** that eliminates travel planning fatigue by leveraging a sophisticated **Multi-Agent System** to autonomously generate hyper-personalized itineraries, recommend accommodations, and calculate intelligent budget allocations—all localized in **Malaysian Ringgit (RM)** for the Penang market.

---

## 🏗️ Tech Stack Showcase

### **Backend Architecture**
```
┌─────────────────────────────────────────────────────────┐
│  Python 3.12 + FastAPI + Google ADK (Agent Dev Kit)    │
│  ▸ Real-time WebSocket agent progress tracking         │
│  ▸ Multi-agent orchestration & delegation              │
│  ▸ Server-Sent Events for streaming responses          │
└─────────────────────────────────────────────────────────┘
```

| Technology | Purpose | Color |
|-----------|---------|-------|
| **Python 3.12** | Core backend runtime | ![#3776ab](https://via.placeholder.com/15/3776ab/3776ab) Blue |
| **FastAPI** | High-performance REST API framework | ![#009688](https://via.placeholder.com/15/009688/009688) Teal |
| **Google ADK** | Multi-agent orchestration & LLM integration | ![#4285f4](https://via.placeholder.com/15/4285f4/4285f4) Google Blue |
| **Uvicorn** | ASGI server for async operations | ![#2d3436](https://via.placeholder.com/15/2d3436/2d3436) Dark |

### **Frontend Stack**
```
┌─────────────────────────────────────────────────────────┐
│  React 19 + Vite + Tailwind CSS 4 + Framer Motion      │
│  ▸ Real-time agent status visualization                │
│  ▸ Interactive budget allocation with live charts      │
│  ▸ Smooth scroll navigation & micro-interactions       │
└─────────────────────────────────────────────────────────┘
```

| Technology | Purpose | Color |
|-----------|---------|-------|
| **React 19** | Component-based UI framework | ![#61dafb](https://via.placeholder.com/15/61dafb/61dafb) Cyan |
| **Vite** | Lightning-fast build tool & dev server | ![#646cff](https://via.placeholder.com/15/646cff/646cff) Purple |
| **Tailwind CSS 4** | Utility-first styling framework | ![#06b6d4](https://via.placeholder.com/15/06b6d4/06b6d4) Sky |
| **Framer Motion** | Advanced animation library | ![#0055ff](https://via.placeholder.com/15/0055ff/0055ff) Motion Blue |
| **Recharts** | Composable charting library | ![#8884d8](https://via.placeholder.com/15/8884d8/8884d8) Chart Blue |

### **Database & Infrastructure**
```
┌─────────────────────────────────────────────────────────┐
│  MySQL/TiDB + Drizzle ORM + tRPC                       │
│  ▸ Type-safe database queries & migrations             │
│  ▸ End-to-end type safety across stack                 │
│  ▸ Real-time WebSocket connections                     │
└─────────────────────────────────────────────────────────┘
```

| Technology | Purpose | Color |
|-----------|---------|-------|
| **MySQL/TiDB** | Relational database | ![#00758f](https://via.placeholder.com/15/00758f/00758f) MySQL Blue |
| **Drizzle ORM** | Type-safe SQL query builder | ![#c5b358](https://via.placeholder.com/15/c5b358/c5b358) Gold |
| **tRPC** | End-to-end type-safe APIs | ![#398ccb](https://via.placeholder.com/15/398ccb/398ccb) tRPC Blue |
| **WebSocket** | Real-time bidirectional communication | ![#2d3436](https://via.placeholder.com/15/2d3436/2d3436) Dark |

---

## 🤖 Multi-Agent Architecture

The application uses a sophisticated **3-node Multi-Agent System** coordinated through Google ADK:

```mermaid
graph TD
    User["👤 User Input<br/>(Destination, Days, Budget)"]
    
    User -->|Request| Orchestrator["⚡ Orchestrator Agent<br/>(Coordinator)"]
    
    Orchestrator -->|Delegate| Travel["🗺️ Travel & Culture Agent<br/>(Itinerary Expert)"]
    Orchestrator -->|Delegate| Logistics["📊 Logistics Agent<br/>(Budget & Weather)"]
    
    Travel -->|Research| GoogleSearch["🔍 google_search Tool"]
    Travel -->|Return| TravelResult["Hotel Recommendations<br/>Day-by-Day Itinerary<br/>Local Attractions"]
    
    Logistics -->|Calculate| BudgetCalc["💰 Budget Allocation<br/>in RM"]
    Logistics -->|Fetch| Weather["🌤️ Weather Data"]
    Logistics -->|Return| LogisticsResult["Budget Breakdown<br/>Weather Overview"]
    
    TravelResult -->|Compile| Orchestrator
    LogisticsResult -->|Compile| Orchestrator
    
    Orchestrator -->|Final Plan| Results["✅ Complete Trip Plan<br/>with Itinerary & Budget"]
    
    Results -->|Display| Frontend["🎨 React Frontend<br/>with Real-time Metrics"]
```

**Agent Roles:**
- **Orchestrator Agent**: Routes user requests, maintains session context, delegates to sub-agents, compiles final results
- **Travel & Culture Agent**: Generates itineraries, recommends hotels, suggests local food & attractions using `google_search` tool
- **Logistics Agent**: Calculates budget allocations in RM, fetches real-time weather data, provides financial constraints

---

## ✨ Key Features

### 🎯 **Dynamic Itinerary Generation**
- AI-powered day-by-day trip planning with activities, dining, and attractions
- Collapsible timeline view with smooth scroll navigation
- Real-time agent progress visualization during planning

### 💰 **Intelligent Budget Management**
- Automatic budget allocation across accommodation, food, transport, and activities
- Interactive sliders for manual budget adjustment with live pie chart updates
- All calculations in Malaysian Ringgit (RM) for local market
- Bidirectional hover effects between chart and breakdown table

### 📊 **Agent Performance Metrics Dashboard**
- Real-time tracking of execution time per agent
- Token usage and API call counts
- WebSocket-powered live metrics updates
- Color-coded agent status indicators

### 🔄 **Real-Time Agent Communication**
- Live terminal log showing agent-to-agent communication
- Character-by-character typewriter effect for authenticity
- WebSocket integration for genuine real-time progress
- Agent-specific color coding (Purple: Orchestrator, Green: Travel, Blue: Logistics)

### 📱 **Trip History & Export**
- Save and manage multiple trip plans
- PDF export with dark theme styling and formatted budget tables
- Trip detail view with full itinerary and budget breakdown
- One-click export from history or fresh results

### 🎨 **Professional UI/UX**
- Dark industrial brutalist aesthetic with monochromatic grayscale palette
- Smooth animations and micro-interactions throughout
- Responsive design for mobile and desktop
- High-contrast typography for readability

---

## 🚀 Quick Start

### Prerequisites
- Python 3.12+
- Node.js 22.13.0+
- MySQL/TiDB database
- Google API credentials (for ADK integration)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/smart-travel-planner.git
   cd smart-travel-planner
   ```

2. **Set up backend environment**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Configure environment variables**
   ```bash
   # Create .env file in backend directory
   cp .env.example .env
   
   # Add your credentials:
   # GOOGLE_API_KEY=your_google_api_key
   # DATABASE_URL=your_database_url
   # JWT_SECRET=your_jwt_secret
   ```

4. **Set up frontend**
   ```bash
   cd ../client
   pnpm install
   ```

5. **Start development servers**
   ```bash
   # Terminal 1: Backend
   cd backend
   uvicorn main:app --reload --port 8000
   
   # Terminal 2: Frontend
   cd client
   pnpm dev
   ```

6. **Access the application**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:8000`
   - API Docs: `http://localhost:8000/docs`

---

## 📁 Project Structure

```
smart-travel-planner/
├── backend/
│   ├── main.py                 # FastAPI application entry point
│   ├── agents.ts              # Multi-agent orchestration logic
│   ├── agent-progress.ts      # Real-time agent tracking service
│   ├── pdf-generator.ts       # PDF export functionality
│   ├── requirements.txt        # Python dependencies
│   └── ...
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AgentNetworkStatus.tsx    # Real-time agent visualization
│   │   │   ├── AgentMetricsDisplay.tsx   # Performance metrics dashboard
│   │   │   ├── BudgetChart.tsx           # Interactive budget pie chart
│   │   │   ├── ItineraryTimeline.tsx     # Collapsible day-by-day timeline
│   │   │   ├── TripForm.tsx              # Trip planning input form
│   │   │   └── ...
│   │   ├── pages/
│   │   │   ├── Home.tsx                  # Landing page with smooth scroll nav
│   │   │   ├── TripPlanningPage.tsx      # Main planning interface
│   │   │   ├── TripHistoryPage.tsx       # Saved trips management
│   │   │   └── TripDetailPage.tsx        # Single trip view
│   │   ├── App.tsx             # Main app routing
│   │   └── index.css           # Global theme & styling
│   ├── package.json
│   └── ...
├── drizzle/
│   ├── schema.ts               # Database schema definitions
│   └── migrations/             # Database migrations
├── README.md
└── .env.example
```

---

## 🔌 API Endpoints

### Trip Planning
- **POST** `/api/trpc/trips.plan` - Generate a new trip plan
- **GET** `/api/trpc/trips.list` - Retrieve user's trip history
- **GET** `/api/trpc/trips.getById` - Get a specific trip
- **DELETE** `/api/trpc/trips.delete` - Delete a trip
- **POST** `/api/trpc/trips.exportPDF` - Export trip as PDF

### WebSocket Events
- `agent_start` - Agent begins processing
- `agent_update` - Agent progress update
- `agent_complete` - Agent finished execution
- `metrics_update` - Performance metrics update

---

## 🧪 Testing

```bash
# Run backend tests
cd backend
pytest

# Run frontend tests
cd client
pnpm test

# Run all tests
pnpm test:all
```

---

## 📝 Environment Variables

Create a `.env` file in the backend directory:

```env
# Database
DATABASE_URL=mysql://user:password@localhost:3306/smart_travel_planner

# Google API
GOOGLE_API_KEY=your_google_api_key_here

# Authentication
JWT_SECRET=your_jwt_secret_here
OAUTH_SERVER_URL=https://api.manus.im

# Application
APP_ENV=development
DEBUG=true
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with [Google ADK](https://github.com/google/generative-ai-python) for multi-agent orchestration
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Animations powered by [Framer Motion](https://www.framer.com/motion/)
- Charts by [Recharts](https://recharts.org/)
- Database ORM by [Drizzle](https://orm.drizzle.team/)

---

## 📧 Support

For support, email support@smarttravelplanner.com or open an issue on GitHub.

**Made with ❤️ for travelers in Penang, Malaysia**
