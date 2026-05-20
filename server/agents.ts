import { invokeLLM } from "./_core/llm";
import { wsManager, type AgentProgressEvent } from "./_core/websocket";

/**
 * Type definitions for agent responses
 */
export interface ItineraryDay {
  day: number;
  title: string;
  activities: string[];
  meals: string[];
  notes: string;
}

export interface HotelRecommendation {
  name: string;
  type: string;
  pricePerNight: string;
  highlights: string[];
  location: string;
}

export interface TravelAgentResponse {
  itinerary: ItineraryDay[];
  hotels: HotelRecommendation[];
  localFood: string[];
  attractions: string[];
}

export interface BudgetAllocation {
  accommodation: number;
  food: number;
  transport: number;
  activities: number;
  contingency: number;
}

export interface LogisticsAgentResponse {
  weatherOverview: string;
  budgetAllocation: BudgetAllocation;
  recommendations: string[];
}

/**
 * Orchestrator Agent
 *
 * The main coordinator that receives the trip parameters and delegates work
 * to specialized sub-agents. It maintains context and ensures coherent planning.
 */
export async function orchestratorAgent(
  destination: string,
  duration: number,
  budget: number,
  sessionId?: string,
  onStatusUpdate?: (status: string) => void
): Promise<{
  travelPlan: TravelAgentResponse;
  logistics: LogisticsAgentResponse;
}> {
  const broadcastEvent = (agent: string, message: string, type: AgentProgressEvent["type"] = "agent_progress") => {
    onStatusUpdate?.(message);
    if (sessionId) {
      wsManager.broadcastAgentProgress(sessionId, {
        type,
        agent: agent as any,
        message,
        timestamp: Date.now(),
      });
    }
  };

  broadcastEvent("Orchestrator", "Orchestrator: Analyzing trip requirements", "agent_start");

  try {
    // Step 1: Get travel and culture recommendations
    broadcastEvent("Orchestrator", "Orchestrator: Delegating to Travel & Culture Agent");
    const travelPlan = await travelCultureAgent(destination, duration, budget, sessionId);

    // Step 2: Get logistics and budget breakdown
    broadcastEvent("Orchestrator", "Orchestrator: Delegating to Logistics Agent");
    const logistics = await logisticsAgent(destination, duration, budget, travelPlan, sessionId);

    broadcastEvent("Orchestrator", "Orchestrator: Trip plan complete", "agent_complete");

    return {
      travelPlan,
      logistics,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    broadcastEvent("Orchestrator", `Orchestrator: Error - ${errorMessage}`, "agent_error");
    throw error;
  }
}

/**
 * Travel & Culture Agent
 *
 * Generates a detailed day-by-day itinerary, hotel recommendations,
 * local food suggestions, and attractions for the destination.
 */
export async function travelCultureAgent(
  destination: string,
  duration: number,
  budget: number,
  sessionId?: string
): Promise<TravelAgentResponse> {
  const broadcastEvent = (message: string, type: AgentProgressEvent["type"] = "agent_progress") => {
    if (sessionId) {
      wsManager.broadcastAgentProgress(sessionId, {
        type,
        agent: "Travel & Culture",
        message,
        timestamp: Date.now(),
      });
    }
  };

  broadcastEvent("Travel & Culture: Starting itinerary generation", "agent_start");
  broadcastEvent("Travel & Culture: Analyzing destination characteristics and local culture");

  const systemPrompt = `You are an expert travel planner and cultural guide. Your role is to create detailed, 
authenticate travel itineraries that balance popular attractions with local experiences. You provide practical 
recommendations for accommodations, dining, and activities that match the traveler's budget and interests.`;

  const userPrompt = `Plan a ${duration}-day trip to ${destination} with a budget of RM ${budget}.

**IMPORTANT: All prices and budget amounts MUST be in Malaysian Ringgit (RM). Do not use any other currency.**

Provide a comprehensive travel plan including:
1. A day-by-day itinerary with specific activities, meal recommendations, and local insights
2. 3-4 hotel recommendations with price ranges in RM and highlights
3. 5-7 must-try local foods and dishes
4. 8-10 top attractions and experiences

Format your response as a valid JSON object with the following structure:
{
  "itinerary": [
    {
      "day": 1,
      "title": "Day title",
      "activities": ["activity 1", "activity 2"],
      "meals": ["breakfast", "lunch", "dinner"],
      "notes": "Additional notes"
    }
  ],
  "hotels": [
    {
      "name": "Hotel name",
      "type": "Budget/Mid-range/Luxury",
      "pricePerNight": "Price range in RM (e.g., RM 150-200)",
      "highlights": ["feature 1", "feature 2"],
      "location": "Location in city"
    }
  ],
  "localFood": ["food 1", "food 2"],
  "attractions": ["attraction 1", "attraction 2"]
}`;

  broadcastEvent("Travel & Culture: Querying LLM for itinerary generation");
  broadcastEvent("Travel & Culture: Generating day-by-day activities and meal plans");

  const response = await invokeLLM({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "travel_plan",
        strict: true,
        schema: {
          type: "object",
          properties: {
            itinerary: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  day: { type: "number" },
                  title: { type: "string" },
                  activities: { type: "array", items: { type: "string" } },
                  meals: { type: "array", items: { type: "string" } },
                  notes: { type: "string" },
                },
                required: ["day", "title", "activities", "meals", "notes"],
                additionalProperties: false,
              },
            },
            hotels: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  type: { type: "string" },
                  pricePerNight: { type: "string" },
                  highlights: { type: "array", items: { type: "string" } },
                  location: { type: "string" },
                },
                required: ["name", "type", "pricePerNight", "highlights", "location"],
                additionalProperties: false,
              },
            },
            localFood: { type: "array", items: { type: "string" } },
            attractions: { type: "array", items: { type: "string" } },
          },
          required: ["itinerary", "hotels", "localFood", "attractions"],
          additionalProperties: false,
        },
      },
    },
  });

  // Parse the JSON response from the LLM
  const content = response.choices[0]?.message.content;
  if (!content || typeof content !== "string") {
    throw new Error("No response from Travel & Culture Agent");
  }

  const parsed = JSON.parse(content);
  broadcastEvent("Travel & Culture: Processing hotel recommendations");
  broadcastEvent("Travel & Culture: Curating local food and attraction suggestions");
  broadcastEvent("Travel & Culture: Itinerary generation complete", "agent_complete");

  return {
    itinerary: parsed.itinerary,
    hotels: parsed.hotels,
    localFood: parsed.localFood,
    attractions: parsed.attractions,
  };
}

/**
 * Logistics Agent
 *
 * Provides weather overview and calculates budget allocation across
 * accommodation, food, transport, and activities.
 */
export async function logisticsAgent(
  destination: string,
  duration: number,
  budget: number,
  travelPlan: TravelAgentResponse,
  sessionId?: string
): Promise<LogisticsAgentResponse> {
  const broadcastEvent = (message: string, type: AgentProgressEvent["type"] = "agent_progress") => {
    if (sessionId) {
      wsManager.broadcastAgentProgress(sessionId, {
        type,
        agent: "Logistics",
        message,
        timestamp: Date.now(),
      });
    }
  };

  broadcastEvent("Logistics: Starting budget and weather analysis", "agent_start");
  broadcastEvent("Logistics: Analyzing weather patterns and seasonal conditions");

  const systemPrompt = `You are a logistics and budget planning expert. Your role is to provide practical 
weather insights and create realistic budget allocations that align with the travel plan and destination costs.`;

  const hotelInfo = travelPlan.hotels
    .map((h) => `${h.name} (${h.type}): ${h.pricePerNight} per night`)
    .join(", ");

  const userPrompt = `For a ${duration}-day trip to ${destination} with a total budget of RM ${budget}:

**CRITICAL: All budget calculations and allocations MUST be in Malaysian Ringgit (RM). Do not use USD or any other currency.**

Available hotels: ${hotelInfo}

Provide:
1. A brief weather overview for the destination (what to expect, what to pack)
2. A realistic budget breakdown allocating the total budget across:
   - Accommodation (based on hotel prices in RM)
   - Food and dining (in RM)
   - Local transport and activities (in RM)
   - Contingency/miscellaneous (in RM)

Format your response as a valid JSON object with the following structure:
{
  "weatherOverview": "Description of weather conditions",
  "budgetAllocation": {
    "accommodation": number,
    "food": number,
    "transport": number,
    "activities": number,
    "contingency": number
  },
  "recommendations": ["recommendation 1", "recommendation 2"]
}

**All numbers in budgetAllocation MUST be in RM and should sum to approximately RM ${budget}.**`;

  broadcastEvent("Logistics: Calculating budget allocation and weather forecast");
  broadcastEvent("Logistics: Analyzing accommodation costs and hotel pricing");
  broadcastEvent("Logistics: Computing food and dining expenses");
  broadcastEvent("Logistics: Estimating transport and activity costs");
  broadcastEvent("Logistics: Querying LLM for final budget breakdown");

  const response = await invokeLLM({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "logistics_plan",
        strict: true,
        schema: {
          type: "object",
          properties: {
            weatherOverview: { type: "string" },
            budgetAllocation: {
              type: "object",
              properties: {
                accommodation: { type: "number" },
                food: { type: "number" },
                transport: { type: "number" },
                activities: { type: "number" },
                contingency: { type: "number" },
              },
              required: ["accommodation", "food", "transport", "activities", "contingency"],
              additionalProperties: false,
            },
            recommendations: { type: "array", items: { type: "string" } },
          },
          required: ["weatherOverview", "budgetAllocation", "recommendations"],
          additionalProperties: false,
        },
      },
    },
  });

  // Parse the JSON response from the LLM
  const content = response.choices[0]?.message.content;
  if (!content || typeof content !== "string") {
    throw new Error("No response from Logistics Agent");
  }

  const parsed = JSON.parse(content);
  broadcastEvent("Logistics: Validating budget allocation totals");
  broadcastEvent("Logistics: Generating travel recommendations");
  broadcastEvent("Logistics: Budget and weather analysis complete", "agent_complete");

  return {
    weatherOverview: parsed.weatherOverview,
    budgetAllocation: parsed.budgetAllocation,
    recommendations: parsed.recommendations,
  };
}
