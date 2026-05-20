import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Zap, MapPin, TrendingUp } from "lucide-react";

/**
 * TypewriterText component that reveals text character-by-character
 * Creates a realistic typewriter effect for terminal log entries
 */
const TypewriterText = ({ text, delay }: { text: string; delay: number }) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let index = 0;
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        if (index < text.length) {
          setDisplayedText(text.slice(0, index + 1));
          index++;
        } else {
          clearInterval(interval);
        }
      }, 15); // 15ms per character for smooth typewriter effect

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timeout);
  }, [text, delay]);

  return <span>{displayedText}</span>;
};

interface LogEntry {
  id: string;
  agent: "Orchestrator" | "Travel Agent" | "Logistics Agent";
  message: string;
  timestamp: number;
}

const mockLogSequence = [
  { agent: "Orchestrator" as const, message: "[Orchestrator] Request received. Parsing parameters..." },
  { agent: "Orchestrator" as const, message: "[Orchestrator] Initializing shared Context Artifact." },
  { agent: "Orchestrator" as const, message: "[Orchestrator] Delegating itinerary research to Travel Agent..." },
  { agent: "Travel Agent" as const, message: "[Travel Agent] Executing tool: google_search(query=\"destination attractions\")" },
  { agent: "Travel Agent" as const, message: "[Travel Agent] Curating chronological timeline..." },
  { agent: "Orchestrator" as const, message: "[Orchestrator] Delegating financial constraints to Logistics Agent..." },
  { agent: "Logistics Agent" as const, message: "[Logistics Agent] Executing tool: calculate_budget_allocation(budget=specified)" },
  { agent: "Logistics Agent" as const, message: "[Logistics Agent] Fetching real-time weather data..." },
  { agent: "Orchestrator" as const, message: "[Orchestrator] Compiling final multi-agent consensus..." },
];

interface AgentNodeProps {
  name: string;
  icon: React.ReactNode;
  isActive: boolean;
  position: "center" | "left" | "right";
}

const AgentNode = ({ name, icon, isActive, position }: AgentNodeProps) => {
  const positionClasses = {
    center: "top-0 left-1/2 -translate-x-1/2",
    left: "bottom-0 left-0",
    right: "bottom-0 right-0",
  };

  return (
    <motion.div
      className={`absolute ${positionClasses[position]} flex flex-col items-center`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Outer glow container */}
      <motion.div
        className="relative w-20 h-20 flex items-center justify-center"
        animate={{
          boxShadow: isActive
            ? [
                "0 0 10px rgba(0, 255, 255, 0.3)",
                "0 0 20px rgba(0, 255, 255, 0.6)",
                "0 0 10px rgba(0, 255, 255, 0.3)",
              ]
            : ["0 0 5px rgba(100, 100, 100, 0.2)", "0 0 10px rgba(100, 100, 100, 0.4)", "0 0 5px rgba(100, 100, 100, 0.2)"],
        }}
        transition={{
          duration: isActive ? 1 : 2.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Node border */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-gray-600"
          animate={{
            borderColor: isActive ? "rgba(0, 255, 255, 1)" : "rgba(100, 100, 100, 0.5)",
            scale: isActive ? 1.1 : 1,
          }}
          transition={{
            duration: isActive ? 0.8 : 2,
            repeat: Infinity,
            repeatType: "mirror",
          }}
        />

        {/* Spinning border for active state */}
        {isActive && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-400 border-r-cyan-400"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        )}

        {/* Inner circle background */}
        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
          <div className="text-cyan-400">{icon}</div>
        </div>
      </motion.div>

      {/* Agent name label */}
      <motion.p
        className="mt-4 text-xs font-mono text-gray-400 text-center whitespace-nowrap"
        animate={{ opacity: isActive ? 1 : 0.6 }}
        transition={{ duration: 0.5 }}
      >
        {name}
      </motion.p>
    </motion.div>
  );
};

interface DataPacketProps {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  delay: number;
}

const DataPacket = ({ fromX, fromY, toX, toY, delay }: DataPacketProps) => {
  return (
    <motion.circle
      cx={fromX}
      cy={fromY}
      r="3"
      fill="rgba(0, 255, 255, 0.8)"
      animate={{
        cx: [fromX, toX],
        cy: [fromY, toY],
        opacity: [0.8, 0.3, 0.8],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        delay: delay,
        ease: "easeInOut",
      }}
      filter="url(#glow)"
    />
  );
};

interface ConnectionLineProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  isActive: boolean;
}

const ConnectionLine = ({ x1, y1, x2, y2, isActive }: ConnectionLineProps) => {
  return (
    <motion.line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={isActive ? "rgba(0, 255, 255, 0.6)" : "rgba(100, 100, 100, 0.3)"}
      strokeWidth="2"
      animate={{
        stroke: isActive ? "rgba(0, 255, 255, 0.8)" : "rgba(100, 100, 100, 0.3)",
        opacity: isActive ? 1 : 0.5,
      }}
      transition={{ duration: 0.5 }}
    />
  );
};

interface TerminalLogProps {
  logs: LogEntry[];
}

const TerminalLog = ({ logs }: TerminalLogProps) => {
  return (
    <div className="mt-8 bg-black border border-gray-700 rounded-lg p-4 h-48 overflow-y-auto font-mono text-xs">
      <div className="space-y-1">
        {logs.map((log, index) => (
          <motion.div
            key={log.id}
            className="text-gray-400"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            <span className="text-cyan-400">{log.agent}</span>
            <span className="text-gray-500"> $ </span>
            <span className="text-gray-300">
              <TypewriterText text={log.message} delay={index * 100} />
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function AgentNetworkStatus() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [activeAgent, setActiveAgent] = useState<"Orchestrator" | "Travel Agent" | "Logistics Agent" | null>(null);

  useEffect(() => {
    let logIndex = 0;
    const maxLogsToShow = 8;

    const logInterval = setInterval(() => {
      if (logIndex < mockLogSequence.length) {
        const logEntry = mockLogSequence[logIndex];
        setActiveAgent(logEntry.agent);

        setLogs((prev) => {
          const newLogs = [
            ...prev,
            {
              id: `${logIndex}-${Date.now()}`,
              agent: logEntry.agent,
              message: logEntry.message,
              timestamp: Date.now(),
            },
          ];
          // Keep only the last maxLogsToShow entries
          return newLogs.slice(-maxLogsToShow);
        });

        logIndex++;
      } else {
        // Loop back to the beginning
        logIndex = 0;
        setLogs([]);
      }
    }, 1200);

    return () => clearInterval(logInterval);
  }, []);

  const isOrchestratorActive = activeAgent === "Orchestrator";
  const isTravelAgentActive = activeAgent === "Travel Agent";
  const isLogisticsAgentActive = activeAgent === "Logistics Agent";

  // SVG coordinates for the network graph
  const svgWidth = 400;
  const svgHeight = 300;
  const orchestratorX = svgWidth / 2;
  const orchestratorY = 40;
  const travelAgentX = 80;
  const travelAgentY = 260;
  const logisticsAgentX = svgWidth - 80;
  const logisticsAgentY = 260;

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">AGENT NETWORK INITIALIZING</h2>
        <p className="text-sm text-gray-400">Multi-agent system orchestrating your trip plan...</p>
      </div>

      {/* Node Graph with SVG */}
      <div className="relative bg-gradient-to-b from-gray-900 to-black border border-gray-800 rounded-lg p-8 mb-6">
        <svg width={svgWidth} height={svgHeight} className="w-full" viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
          {/* Glow filter definition */}
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Connection lines */}
          <ConnectionLine
            x1={orchestratorX}
            y1={orchestratorY + 40}
            x2={travelAgentX}
            y2={travelAgentY - 40}
            isActive={isOrchestratorActive || isTravelAgentActive}
          />
          <ConnectionLine
            x1={orchestratorX}
            y1={orchestratorY + 40}
            x2={logisticsAgentX}
            y2={logisticsAgentY - 40}
            isActive={isOrchestratorActive || isLogisticsAgentActive}
          />

          {/* Data packets traveling along connections */}
          {(isOrchestratorActive || isTravelAgentActive) && (
            <>
              <DataPacket fromX={orchestratorX} fromY={orchestratorY + 40} toX={travelAgentX} toY={travelAgentY - 40} delay={0} />
              <DataPacket fromX={orchestratorX} fromY={orchestratorY + 40} toX={travelAgentX} toY={travelAgentY - 40} delay={0.5} />
            </>
          )}
          {(isOrchestratorActive || isLogisticsAgentActive) && (
            <>
              <DataPacket fromX={orchestratorX} fromY={orchestratorY + 40} toX={logisticsAgentX} toY={logisticsAgentY - 40} delay={0.3} />
              <DataPacket fromX={orchestratorX} fromY={orchestratorY + 40} toX={logisticsAgentX} toY={logisticsAgentY - 40} delay={0.8} />
            </>
          )}
        </svg>

        {/* Agent nodes positioned absolutely over SVG */}
        <div className="absolute inset-0 p-8">
          <AgentNode
            name="Orchestrator"
            icon={<Zap size={24} />}
            isActive={isOrchestratorActive}
            position="center"
          />
          <AgentNode
            name="Travel & Culture"
            icon={<MapPin size={24} />}
            isActive={isTravelAgentActive}
            position="left"
          />
          <AgentNode
            name="Logistics"
            icon={<TrendingUp size={24} />}
            isActive={isLogisticsAgentActive}
            position="right"
          />
        </div>
      </div>

      {/* Terminal Log */}
      <TerminalLog logs={logs} />

      {/* Status indicator */}
      <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-400">
        <motion.div
          className="w-2 h-2 rounded-full bg-cyan-400"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <span>Processing with multi-agent system...</span>
      </div>
    </div>
  );
}
