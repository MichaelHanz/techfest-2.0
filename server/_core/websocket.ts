import { Server as SocketIOServer } from "socket.io";
import type { Server as HTTPServer } from "http";

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

class WebSocketManager {
  private io: SocketIOServer | null = null;
  private activeConnections = new Map<string, Set<string>>();

  /**
   * Initialize WebSocket server with Socket.IO
   */
  initialize(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: true,
        methods: ["GET", "POST"],
        credentials: true,
      },
      transports: ["websocket", "polling"],
      path: "/socket.io/",
    });

    this.io.on("connection", (socket) => {
      console.log(`[WebSocket] Client connected: ${socket.id}`);

      // Handle joining a trip planning session
      socket.on("join_planning_session", (sessionId: string) => {
        socket.join(`planning:${sessionId}`);
        if (!this.activeConnections.has(`planning:${sessionId}`)) {
          this.activeConnections.set(`planning:${sessionId}`, new Set());
        }
        this.activeConnections.get(`planning:${sessionId}`)?.add(socket.id);
        console.log(`[WebSocket] Client ${socket.id} joined session ${sessionId}`);
      });

      // Handle leaving a session
      socket.on("leave_planning_session", (sessionId: string) => {
        socket.leave(`planning:${sessionId}`);
        this.activeConnections.get(`planning:${sessionId}`)?.delete(socket.id);
        console.log(`[WebSocket] Client ${socket.id} left session ${sessionId}`);
      });

      // Handle disconnection
      socket.on("disconnect", () => {
        console.log(`[WebSocket] Client disconnected: ${socket.id}`);
        // Clean up any active connections
        this.activeConnections.forEach((clients) => {
          clients.delete(socket.id);
        });
      });
    });

    console.log("[WebSocket] Server initialized");
  }

  /**
   * Broadcast agent progress event to all clients in a planning session
   */
  broadcastAgentProgress(sessionId: string, event: AgentProgressEvent) {
    if (!this.io) {
      console.warn("[WebSocket] Socket.IO not initialized");
      return;
    }

    this.io.to(`planning:${sessionId}`).emit("agent_progress", event);
    console.log(`[WebSocket] Broadcasted ${event.type} for agent ${event.agent} to session ${sessionId}`);
  }

  /**
   * Broadcast agent metrics to all clients in a planning session
   */
  broadcastAgentMetrics(sessionId: string, metrics: AgentMetrics[]) {
    if (!this.io) {
      console.warn("[WebSocket] Socket.IO not initialized");
      return;
    }

    this.io.to(`planning:${sessionId}`).emit("agent_metrics", metrics);
    console.log(`[WebSocket] Broadcasted metrics to session ${sessionId}`);
  }

  /**
   * Broadcast planning completion with final results
   */
  broadcastPlanningComplete(sessionId: string, results: Record<string, unknown>) {
    if (!this.io) {
      console.warn("[WebSocket] Socket.IO not initialized");
      return;
    }

    this.io.to(`planning:${sessionId}`).emit("planning_complete", results);
    console.log(`[WebSocket] Broadcasted planning_complete to session ${sessionId}`);
  }

  /**
   * Broadcast error event
   */
  broadcastError(sessionId: string, error: string) {
    if (!this.io) {
      console.warn("[WebSocket] Socket.IO not initialized");
      return;
    }

    this.io.to(`planning:${sessionId}`).emit("planning_error", { error, timestamp: Date.now() });
    console.log(`[WebSocket] Broadcasted error to session ${sessionId}: ${error}`);
  }

  /**
   * Get active connection count for a session
   */
  getActiveConnectionCount(sessionId: string): number {
    return this.activeConnections.get(`planning:${sessionId}`)?.size ?? 0;
  }
}

// Export singleton instance
export const wsManager = new WebSocketManager();
