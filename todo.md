# Smart Travel Planner - Project TODO

## Database & Backend Infrastructure
- [x] Update drizzle schema with trips table (id, userId, destination, duration, budget, itinerary, budgetBreakdown, createdAt, updatedAt)
- [x] Generate and apply database migration
- [x] Add trip query helpers in server/db.ts (createTrip, getUserTrips, getTripById)
- [x] Create tRPC procedures for trip CRUD operations

## Multi-Agent Backend (tRPC + LLM)
- [x] Implement Orchestrator Agent procedure (receives destination, duration, budget; orchestrates sub-agents)
- [x] Implement Travel & Culture Agent (generates itinerary, hotels, food, attractions)
- [x] Implement Logistics Agent (weather overview, budget breakdown)
- [x] Create agent communication/delegation pattern using invokeLLM
- [x] Add streaming/real-time agent status updates to frontend via tRPC

## Frontend Components - Dark Industrial Aesthetic
- [x] Update global theme and CSS variables for dark brutalist aesthetic
- [x] Build TripForm component (destination, duration, budget inputs with validation)
- [x] Build AgentStatus component (real-time visual indicator for agent execution)
- [x] Build ItineraryTimeline component (day-by-day chronological display)
- [x] Build BudgetChart component (Recharts pie/donut chart for budget allocation)
- [x] Build TripResults component (combines ItineraryTimeline and BudgetChart)

## Frontend Pages & Integration
- [x] Update Home.tsx as landing page with TripForm entry point
- [x] Create TripPlanningPage (main planning interface with form, status, results)
- [x] Create TripHistoryPage (list of saved trips with ability to view/delete)
- [x] Create TripDetailPage (view a single past trip plan)
- [x] Wire up tRPC calls in components (useQuery/useMutation)

## UI/UX Polish & Animations
- [x] Add smooth loading states and skeleton screens
- [x] Implement streaming animation for agent status transitions
- [x] Add micro-interactions (button press feedback, hover states)
- [x] Ensure responsive design across mobile and desktop
- [x] Add empty states and error handling

## Testing & Deployment
- [x] Write vitest tests for tRPC procedures
- [x] Test agent orchestration and LLM integration
- [x] Test trip history CRUD operations
- [x] Manual testing of full user flow
- [x] Create checkpoint and deploy

## PDF Export Feature
- [x] Install PDF generation dependencies (jsPDF, html2pdf.js, canvas, jspdf-autotable)
- [x] Create backend PDF generation helper function with dark theme styling
- [x] Create tRPC procedure for generating trip PDF (trips.exportPDF)
- [x] Add export button to TripResults component
- [x] Implement PDF download in frontend with base64 decoding
- [x] Style PDF output to match dark theme aesthetic (monochromatic grayscale)
- [x] Modify createTrip to return trip ID for immediate export
- [x] Update trips.plan to return tripId so fresh results can be exported
- [x] Add PDF export button to trip history cards
- [x] Test PDF generation and export functionality
- [x] Update checkpoint with PDF export feature


## AgentNetworkStatus Component (Advanced Loading Visualization)
- [x] Create AgentNetworkStatus component with node graph visualization
- [x] Implement SVG connections between Orchestrator and sub-agents
- [x] Add Framer Motion animations for node pulsing and active states
- [x] Implement data flow packet animations along connection lines
- [x] Build live terminal log with typewriter effect
- [x] Create mock log sequence for agent communication
- [x] Integrate AgentNetworkStatus into TripPlanningPage loading state
- [x] Test animations and ensure smooth performance
- [x] Update checkpoint with AgentNetworkStatus feature


## Malaysian Ringgit (RM) Currency Localization
- [x] Update Logistics Agent prompt to enforce RM currency in all calculations
- [x] Update Travel & Culture Agent prompt to format prices in RM
- [x] Update TripForm component budget input label and placeholder for RM
- [x] Update BudgetChart component to display RM formatting
- [x] Update ItineraryTimeline component to display RM formatting for hotel prices
- [x] Update TripResults component to display RM formatting
- [x] Update PDF export to display RM currency
- [x] Test all currency displays across the application
- [x] Verify backend returns RM values correctly
