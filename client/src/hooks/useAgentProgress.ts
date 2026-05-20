import { useEffect, useState, useCallback } from "react";
import { io, type Socket } from "socket.io-client";

export interface AgentProgressEvent {
  type: "agent_start" | "agent_progress" | "agent_complete" | "agent_error";
  agent: "Orchestrator" | "Travel & Culture" | "Logistics";
  message: string;
  timestamp: number;
  data?: Record<string, unknown>;
}

export interface AgentMetrics {
  agent: string;
  executionTime: number;
  tokensUsed: number;
  apiCalls: number;
}

export function useAgentProgress(sessionId: string | null) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [events, setEvents] = useState<AgentProgressEvent[]>([]);
  const [metrics, setMetrics] = useState<AgentMetrics[]>([]);
  const [currentAgent, setCurrentAgent] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!sessionId) return;

    const socketUrl = process.env.VITE_FRONTEND_URL || window.location.origin;
    const newSocket = io(socketUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ["websocket", "polling"],
    });

    newSocket.on("connect", () => {
      console.log("[WebSocket] Connected");
      setIsConnected(true);
      // Join the planning session
      newSocket.emit("join_planning_session", sessionId);
    });

    newSocket.on("disconnect", () => {
      console.log("[WebSocket] Disconnected");
      setIsConnected(false);
    });

    newSocket.on("agent_progress", (event: AgentProgressEvent) => {
      console.log("[WebSocket] Received agent progress:", event);
      setEvents((prev) => [...prev, event]);

      // Update current agent based on event type
      if (event.type === "agent_start" || event.type === "agent_progress") {
        setCurrentAgent(event.agent);
      } else if (event.type === "agent_complete") {
        // Keep the agent visible for a moment after completion
        setTimeout(() => {
          setCurrentAgent((prev) => (prev === event.agent ? null : prev));
        }, 500);
      }
    });

    newSocket.on("agent_metrics", (metricsData: AgentMetrics[]) => {
      console.log("[WebSocket] Received metrics:", metricsData);
      setMetrics(metricsData);
    });

    newSocket.on("planning_complete", (results: Record<string, unknown>) => {
      console.log("[WebSocket] Planning complete:", results);
      setCurrentAgent(null);
      // Dispatch custom event for TripPlanningPage to listen to
      const event = new CustomEvent(`planning-complete-${sessionId}`, { detail: results });
      window.dispatchEvent(event);
    });

    newSocket.on("planning_error", (error: { error: string; timestamp: number }) => {
      console.error("[WebSocket] Planning error:", error);
      setCurrentAgent(null);
      // Dispatch error event
      const event = new CustomEvent(`planning-error-${sessionId}`, { detail: error });
      window.dispatchEvent(event);
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.emit("leave_planning_session", sessionId);
        newSocket.close();
      }
    };
  }, [sessionId]);

  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  const clearMetrics = useCallback(() => {
    setMetrics([]);
  }, []);

  return {
    socket,
    events,
    metrics,
    currentAgent,
    isConnected,
    clearEvents,
    clearMetrics,
  };
}
