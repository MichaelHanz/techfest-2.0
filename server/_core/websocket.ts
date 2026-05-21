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
  private eventQueue = new Map<string, AgentProgressEvent[]>();

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
        
        // Replay queued events to the newly joined client
        const queuedEvents = this.eventQueue.get(`planning:${sessionId}`);
        if (queuedEvents && queuedEvents.length > 0) {
          console.log(`[WebSocket] Replaying ${queuedEvents.length} queued events to client ${socket.id}`);
          queuedEvents.forEach((event) => {
            socket.emit("agent_progress", event);
          });
        }
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

    // Queue event for clients that join later
    const key = `planning:${sessionId}`;
    if (!this.eventQueue.has(key)) {
      this.eventQueue.set(key, []);
    }
    this.eventQueue.get(key)?.push(event);
    
    // Keep only last 100 events per session to avoid memory bloat
    const queue = this.eventQueue.get(key);
    if (queue && queue.length > 100) {
      queue.shift();
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
    
    // Clean up event queue after a delay (keep for 30 seconds in case client reconnects)
    setTimeout(() => {
      this.eventQueue.delete(`planning:${sessionId}`);
    }, 30000);
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
