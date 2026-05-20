"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, MapPin, TrendingUp, Wifi, WifiOff, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { useAgentProgress, type AgentProgressEvent } from "@/hooks/useAgentProgress";

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

interface AgentNodeProps {
  name: string;
  icon: React.ReactNode;
  isActive: boolean;
  position: "center" | "left" | "right";
  agentType: "Orchestrator" | "Travel & Culture" | "Logistics";
  progress: number;
}

const AgentNode = ({ name, icon, isActive, position, agentType, progress }: AgentNodeProps) => {
  const positionClasses = {
    center: "top-0 left-1/2 -translate-x-1/2",
    left: "bottom-0 left-0",
    right: "bottom-0 right-0",
  };

  // Get agent-specific colors
  const getAgentColor = () => {
    switch (agentType) {
      case "Orchestrator":
        return { glow: "rgba(168, 85, 247, 0.6)", border: "rgba(168, 85, 247, 1)", text: "text-purple-400" };
      case "Travel & Culture":
        return { glow: "rgba(34, 197, 94, 0.6)", border: "rgba(34, 197, 94, 1)", text: "text-green-400" };
      case "Logistics":
        return { glow: "rgba(59, 130, 246, 0.6)", border: "rgba(59, 130, 246, 1)", text: "text-blue-400" };
    }
  };

  const colors = getAgentColor();

  return (
    <motion.div
      className={`absolute ${positionClasses[position]} flex flex-col items-center`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Outer glow container */}
      <motion.div
        className="relative w-24 h-24 flex items-center justify-center"
        animate={{
          boxShadow: isActive
            ? [
                `0 0 20px ${colors.glow}`,
                `0 0 40px ${colors.glow}`,
                `0 0 20px ${colors.glow}`,
              ]
            : ["0 0 5px rgba(100, 100, 100, 0.2)", "0 0 10px rgba(100, 100, 100, 0.4)", "0 0 5px rgba(100, 100, 100, 0.2)"],
        }}
        transition={{
          duration: isActive ? 1.5 : 2,
          repeat: Infinity,
          repeatType: "loop",
        }}
      >
        {/* Spinning border ring when active */}
        {isActive && (
          <motion.div
            className="absolute inset-0 rounded-full border-2"
            style={{ borderColor: colors.border }}
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        )}

        {/* Progress ring */}
        <svg className="absolute inset-0 w-full h-full" style={{ transform: "rotate(-90deg)" }}>
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke="rgba(100, 100, 100, 0.1)"
            strokeWidth="2"
          />
          <motion.circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke={colors.border}
            strokeWidth="2"
            strokeDasharray={`${progress * 2.827} 282.7`}
            animate={{ strokeDasharray: [`0 282.7`, `${progress * 2.827} 282.7`] }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </svg>

        {/* Center circle */}
        <motion.div
          className="relative w-20 h-20 rounded-full flex items-center justify-center"
          style={{
            background: `radial-gradient(circle, ${colors.border}20, ${colors.border}05)`,
            border: `2px solid ${colors.border}`,
          }}
          animate={{
            scale: isActive ? [1, 1.1, 1] : 1,
          }}
          transition={{
            duration: isActive ? 1.5 : 2,
            repeat: Infinity,
            repeatType: "loop",
          }}
        >
          <div className={`${colors.text} text-2xl`}>{icon}</div>
        </motion.div>
      </motion.div>

      {/* Agent name */}
      <motion.p
        className={`mt-6 text-sm font-semibold text-center ${colors.text}`}
        animate={{ opacity: isActive ? 1 : 0.6 }}
      >
        {name}
      </motion.p>

      {/* Active indicator badge */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            className="mt-3 px-3 py-1 rounded-full text-xs font-mono bg-opacity-20"
            style={{ background: colors.border, color: colors.border }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            ACTIVE
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/**
 * DataPacket component - animated glowing dots that travel along SVG paths
 */
const DataPacket = ({
  pathId,
  duration,
  delay,
}: {
  pathId: string;
  duration: number;
  delay: number;
}) => {
  return (
    <motion.circle
      cx="0"
      cy="0"
      r="5"
      fill="rgba(168, 85, 247, 0.9)"
      filter="url(#glow)"
      animate={{
        offsetDistance: ["0%", "100%"],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "linear",
      }}
      style={{
        offsetPath: `url(#${pathId})`,
      } as any}
    />
  );
};

interface AgentNetworkStatusProps {
  sessionId?: string | null;
}

/**
 * AgentNetworkStatus Component
 *
 * Displays a real-time visualization of the multi-agent system processing a trip request.
 * Features:
 * - Node graph with three agent nodes (Orchestrator, Travel & Culture, Logistics)
 * - Animated data flow packets traveling between nodes
 * - Live terminal log with typewriter effect
 * - Real-time WebSocket updates from backend
 * - Progress tracking for each agent
 */
export default function AgentNetworkStatus({ sessionId }: AgentNetworkStatusProps) {
  const { events, currentAgent, isConnected } = useAgentProgress(sessionId || null);
  const [displayedEvents, setDisplayedEvents] = useState<AgentProgressEvent[]>([]);
  const [completedAgents, setCompletedAgents] = useState<Set<string>>(new Set());

  // Track completed agents
  useEffect(() => {
    events.forEach((event) => {
      if (event.type === "agent_complete") {
        setCompletedAgents((prev) => new Set(Array.from(prev).concat(event.agent)));
      }
    });
  }, [events]);

  // Update displayed events with animation delay
  useEffect(() => {
    if (events.length > displayedEvents.length) {
      const newEvent = events[events.length - 1];
      const delay = displayedEvents.length * 200; // Stagger events
      setTimeout(() => {
        setDisplayedEvents([...displayedEvents, newEvent]);
      }, delay);
    }
  }, [events, displayedEvents]);

  // Determine which agent is currently active
  const isOrchestratorActive = currentAgent === "Orchestrator";
  const isTravelActive = currentAgent === "Travel & Culture";
  const isLogisticsActive = currentAgent === "Logistics";

  // Calculate progress for each agent (0-100)
  const getAgentProgress = (agentName: string) => {
    if (completedAgents.has(agentName)) return 100;
    if (currentAgent === agentName) return 60;
    return 0;
  };

  return (
    <div className="w-full space-y-8">
      {/* Connection Status */}
      <motion.div
        className="flex items-center justify-center gap-3 text-sm"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <AnimatePresence mode="wait">
          {isConnected ? (
            <motion.div
              key="connected"
              className="flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                <Wifi className="w-5 h-5 text-green-400" />
              </motion.div>
              <span className="text-green-400 font-medium">Connected to Agent Network</span>
            </motion.div>
          ) : (
            <motion.div
              key="connecting"
              className="flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                <Clock className="w-5 h-5 text-yellow-400" />
              </motion.div>
              <span className="text-yellow-400 font-medium">Connecting to Agent Network...</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Node Graph Section */}
      <motion.div
        className="relative w-full h-80 bg-gradient-to-b from-slate-900/50 to-slate-950/50 rounded-xl border border-slate-700/50 overflow-hidden shadow-2xl"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* SVG for connections and data packets */}
        <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: "none" }}>
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Connection lines with gradient */}
          <defs>
            <linearGradient id="gradient-left" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(168, 85, 247, 0.5)" />
              <stop offset="100%" stopColor="rgba(168, 85, 247, 0.1)" />
            </linearGradient>
            <linearGradient id="gradient-right" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(168, 85, 247, 0.5)" />
              <stop offset="100%" stopColor="rgba(168, 85, 247, 0.1)" />
            </linearGradient>
          </defs>

          {/* Animated connection lines */}
          <motion.line
            x1="50%"
            y1="15%"
            x2="20%"
            y2="85%"
            stroke="url(#gradient-left)"
            strokeWidth="2"
            strokeDasharray="5,5"
            animate={{
              strokeDashoffset: [0, -10],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          <motion.line
            x1="50%"
            y1="15%"
            x2="80%"
            y2="85%"
            stroke="url(#gradient-right)"
            strokeWidth="2"
            strokeDasharray="5,5"
            animate={{
              strokeDashoffset: [0, -10],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          {/* Data packets traveling along paths */}
          <path id="path-left" d="M 50% 15% L 20% 85%" fill="none" />
          <path id="path-right" d="M 50% 15% L 80% 85%" fill="none" />

          {isOrchestratorActive && (
            <>
              <DataPacket pathId="path-left" duration={2} delay={0} />
              <DataPacket pathId="path-right" duration={2} delay={0.5} />
            </>
          )}
        </svg>

        {/* Agent Nodes */}
        <AgentNode
          name="Orchestrator"
          icon={<Zap className="w-8 h-8" />}
          isActive={isOrchestratorActive}
          position="center"
          agentType="Orchestrator"
          progress={getAgentProgress("Orchestrator")}
        />
        <AgentNode
          name="Travel & Culture"
          icon={<MapPin className="w-8 h-8" />}
          isActive={isTravelActive}
          position="left"
          agentType="Travel & Culture"
          progress={getAgentProgress("Travel & Culture")}
        />
        <AgentNode
          name="Logistics"
          icon={<TrendingUp className="w-8 h-8" />}
          isActive={isLogisticsActive}
          position="right"
          agentType="Logistics"
          progress={getAgentProgress("Logistics")}
        />
      </motion.div>

      {/* Agent Status Cards */}
      <motion.div
        className="grid grid-cols-3 gap-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {[
          { name: "Orchestrator", color: "from-purple-500/10 to-purple-600/5", borderColor: "border-purple-500/30" },
          { name: "Travel & Culture", color: "from-green-500/10 to-green-600/5", borderColor: "border-green-500/30" },
          { name: "Logistics", color: "from-blue-500/10 to-blue-600/5", borderColor: "border-blue-500/30" },
        ].map((agent) => {
          const isActive = currentAgent === agent.name;
          const isComplete = completedAgents.has(agent.name);

          return (
            <motion.div
              key={agent.name}
              className={`bg-gradient-to-br ${agent.color} border ${agent.borderColor} rounded-lg p-4 backdrop-blur-sm`}
              animate={{
                scale: isActive ? 1.05 : 1,
                boxShadow: isActive ? "0 0 20px rgba(168, 85, 247, 0.3)" : "0 0 0px rgba(0, 0, 0, 0)",
              }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm">{agent.name}</h3>
                <AnimatePresence>
                  {isComplete ? (
                    <motion.div
                      key="complete"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    </motion.div>
                  ) : isActive ? (
                    <motion.div
                      key="active"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Clock className="w-4 h-4 text-yellow-400" />
                    </motion.div>
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-slate-600" />
                  )}
                </AnimatePresence>
              </div>
              <div className="w-full bg-slate-700/50 rounded-full h-1.5 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-400 to-pink-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${getAgentProgress(agent.name)}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Terminal Log Section */}
      <motion.div
        className="w-full bg-slate-950 rounded-xl border border-slate-700 overflow-hidden shadow-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-3 border-b border-slate-700">
          <p className="text-xs font-mono text-slate-300 uppercase tracking-widest">Agent Network Log</p>
        </div>

        <div className="h-56 overflow-y-auto p-6 space-y-3 font-mono text-sm scrollbar-thin scrollbar-track-slate-900 scrollbar-thumb-slate-700">
          <AnimatePresence mode="popLayout">
            {displayedEvents.length === 0 ? (
              <motion.p
                key="initializing"
                className="text-slate-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Initializing agent network...
              </motion.p>
            ) : (
              displayedEvents.map((event, index) => {
                const getAgentColor = () => {
                  switch (event.agent) {
                    case "Orchestrator":
                      return "text-purple-400";
                    case "Travel & Culture":
                      return "text-green-400";
                    case "Logistics":
                      return "text-blue-400";
                    default:
                      return "text-slate-400";
                  }
                };

                const getEventIcon = () => {
                  switch (event.type) {
                    case "agent_start":
                      return "▶";
                    case "agent_progress":
                      // Show retry indicator for retry messages
                      return event.message.includes("Retrying") ? "↻" : "◆";
                    case "agent_complete":
                      return "✓";
                    case "agent_error":
                      return "✕";
                    default:
                      return "•";
                  }
                };

                const getEventTextColor = () => {
                  if (event.message.includes("Retrying")) {
                    return "text-yellow-400"; // Yellow for retry messages
                  }
                  return getAgentColor();
                };

                return (
                  <motion.div
                    key={`${event.timestamp}-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className={`${getEventTextColor()} flex gap-3 items-start`}
                  >
                    <span className="text-slate-500 flex-shrink-0 mt-0.5">{getEventIcon()}</span>
                    <div className="flex-1 min-w-0">
                      <span className="text-slate-500 text-xs">[{new Date(event.timestamp).toLocaleTimeString()}]</span>{" "}
                      <TypewriterText text={event.message} delay={0} />
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Status Summary */}
      <motion.div
        className="text-center text-sm text-slate-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <p>
          {displayedEvents.length === 0
            ? "Waiting for agent network response..."
            : `Processing: ${displayedEvents.length} events received • ${completedAgents.size}/3 agents complete`}
        </p>
      </motion.div>
    </div>
  );
}
