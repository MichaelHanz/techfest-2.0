/**
 * Agent Progress Service
 * Manages real-time agent progress tracking and performance metrics
 * Emits events to connected WebSocket clients about agent execution
 */

export interface AgentMetrics {
  agentName: "Orchestrator" | "Travel & Culture Agent" | "Logistics Agent";
  startTime: number;
  endTime?: number;
  tokensUsed: number;
  apiCallsCount: number;
  status: "idle" | "active" | "completed" | "error";
  currentTask?: string;
  executionTime?: number;
}

export interface AgentProgressEvent {
  type: "agent_start" | "agent_update" | "agent_complete" | "metrics_update";
  agent: "Orchestrator" | "Travel & Culture Agent" | "Logistics Agent";
  message: string;
  metrics?: AgentMetrics;
  timestamp: number;
}

class AgentProgressService {
  private metricsMap: Map<string, AgentMetrics> = new Map();
  private listeners: Set<(event: AgentProgressEvent) => void> = new Set();

  /**
   * Initialize metrics for an agent
   */
  initializeAgent(agentName: "Orchestrator" | "Travel & Culture Agent" | "Logistics Agent") {
    const metrics: AgentMetrics = {
      agentName,
      startTime: Date.now(),
      tokensUsed: 0,
      apiCallsCount: 0,
      status: "active",
    };
    this.metricsMap.set(agentName, metrics);

    this.emit({
      type: "agent_start",
      agent: agentName,
      message: `${agentName} started processing`,
      metrics,
      timestamp: Date.now(),
    });
  }

  /**
   * Update agent progress
   */
  updateProgress(
    agentName: "Orchestrator" | "Travel & Culture Agent" | "Logistics Agent",
    currentTask: string,
    tokensUsed?: number,
    apiCallsCount?: number
  ) {
    const metrics = this.metricsMap.get(agentName);
    if (!metrics) return;

    metrics.currentTask = currentTask;
    if (tokensUsed !== undefined) metrics.tokensUsed += tokensUsed;
    if (apiCallsCount !== undefined) metrics.apiCallsCount += apiCallsCount;

    this.emit({
      type: "agent_update",
      agent: agentName,
      message: currentTask,
      metrics,
      timestamp: Date.now(),
    });
  }

  /**
   * Mark agent as completed
   */
  completeAgent(agentName: "Orchestrator" | "Travel & Culture Agent" | "Logistics Agent") {
    const metrics = this.metricsMap.get(agentName);
    if (!metrics) return;

    metrics.status = "completed";
    metrics.endTime = Date.now();
    metrics.executionTime = metrics.endTime - metrics.startTime;

    this.emit({
      type: "agent_complete",
      agent: agentName,
      message: `${agentName} completed in ${metrics.executionTime}ms`,
      metrics,
      timestamp: Date.now(),
    });
  }

  /**
   * Get all agent metrics
   */
  getAllMetrics(): AgentMetrics[] {
    return Array.from(this.metricsMap.values());
  }

  /**
   * Get metrics for a specific agent
   */
  getAgentMetrics(agentName: string): AgentMetrics | undefined {
    return this.metricsMap.get(agentName);
  }

  /**
   * Reset all metrics
   */
  reset() {
    this.metricsMap.clear();
  }

  /**
   * Subscribe to progress events
   */
  subscribe(listener: (event: AgentProgressEvent) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Emit progress event to all listeners
   */
  private emit(event: AgentProgressEvent) {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        console.error("Error in progress listener:", error);
      }
    });
  }
}

export const agentProgressService = new AgentProgressService();
