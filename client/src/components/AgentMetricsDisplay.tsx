import { motion } from "framer-motion";
import { Zap, MapPin, TrendingUp, Clock, Zap as TokenIcon, Network } from "lucide-react";

interface AgentMetric {
  agentName: "Orchestrator" | "Travel & Culture Agent" | "Logistics Agent";
  executionTime: number;
  tokensUsed: number;
  apiCallsCount: number;
  status: "idle" | "active" | "completed" | "error";
}

interface AgentMetricsDisplayProps {
  metrics: AgentMetric[];
}

const AgentMetricsDisplay = ({ metrics }: AgentMetricsDisplayProps) => {
  const getAgentIcon = (agentName: string) => {
    switch (agentName) {
      case "Orchestrator":
        return <Zap size={16} />;
      case "Travel & Culture Agent":
        return <MapPin size={16} />;
      case "Logistics Agent":
        return <TrendingUp size={16} />;
      default:
        return <Network size={16} />;
    }
  };

  const getAgentColor = (agentName: string) => {
    switch (agentName) {
      case "Orchestrator":
        return { bg: "bg-purple-900/30", border: "border-purple-500/50", text: "text-purple-400", icon: "text-purple-400" };
      case "Travel & Culture Agent":
        return { bg: "bg-green-900/30", border: "border-green-500/50", text: "text-green-400", icon: "text-green-400" };
      case "Logistics Agent":
        return { bg: "bg-blue-900/30", border: "border-blue-500/50", text: "text-blue-400", icon: "text-blue-400" };
      default:
        return { bg: "bg-gray-900/30", border: "border-gray-500/50", text: "text-gray-400", icon: "text-gray-400" };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-yellow-400";
      case "completed":
        return "text-green-400";
      case "error":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <div className="mt-6 space-y-3">
      <h3 className="text-xs font-mono text-gray-400 uppercase tracking-wider">AGENT PERFORMANCE METRICS</h3>

      <div className="grid grid-cols-1 gap-2">
        {metrics.map((metric, index) => {
          const colors = getAgentColor(metric.agentName);
          const statusColor = getStatusColor(metric.status);

          return (
            <motion.div
              key={metric.agentName}
              className={`${colors.bg} ${colors.border} border rounded p-3 backdrop-blur-sm`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-start justify-between gap-3">
                {/* Agent info */}
                <div className="flex items-start gap-2 flex-1 min-w-0">
                  <div className={`${colors.icon} mt-0.5 flex-shrink-0`}>{getAgentIcon(metric.agentName)}</div>
                  <div className="min-w-0 flex-1">
                    <p className={`${colors.text} text-xs font-mono font-semibold truncate`}>{metric.agentName}</p>
                    <p className={`${statusColor} text-xs font-mono capitalize mt-0.5`}>● {metric.status}</p>
                  </div>
                </div>

                {/* Metrics grid */}
                <div className="grid grid-cols-3 gap-2 text-right flex-shrink-0">
                  {/* Execution time */}
                  <motion.div
                    className="flex flex-col items-end"
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <div className="flex items-center gap-1 text-gray-400">
                      <Clock size={12} />
                    </div>
                    <p className="text-xs font-mono text-gray-300 mt-0.5">{formatTime(metric.executionTime)}</p>
                  </motion.div>

                  {/* Tokens used */}
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1 text-gray-400">
                      <TokenIcon size={12} />
                    </div>
                    <p className="text-xs font-mono text-gray-300 mt-0.5">{metric.tokensUsed.toLocaleString()}</p>
                  </div>

                  {/* API calls */}
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1 text-gray-400">
                      <Network size={12} />
                    </div>
                    <p className="text-xs font-mono text-gray-300 mt-0.5">{metric.apiCallsCount}</p>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              {metric.status === "active" && (
                <motion.div
                  className="mt-2 h-1 bg-gray-800 rounded-full overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.div
                    className={`h-full ${colors.bg}`}
                    animate={{ width: ["0%", "100%"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="text-xs text-gray-500 font-mono mt-3 pt-2 border-t border-gray-800">
        <p>⏱ = Execution Time | 🔌 = Tokens Used | 🌐 = API Calls</p>
      </div>
    </div>
  );
};

export default AgentMetricsDisplay;
