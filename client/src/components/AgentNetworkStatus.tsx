"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Zap, MapPin, TrendingUp, Wifi, WifiOff } from "lucide-react";
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
}

const AgentNode = ({ name, icon, isActive, position, agentType }: AgentNodeProps) => {
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
        className="relative w-20 h-20 flex items-center justify-center"
        animate={{
          boxShadow: isActive
            ? [
                `0 0 10px ${colors.glow}`,
                `0 0 20px ${colors.glow}`,
                `0 0 10px ${colors.glow}`,
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

        {/* Center circle */}
        <motion.div
          className="relative w-16 h-16 rounded-full flex items-center justify-center"
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
          <div className={`${colors.text}`}>{icon}</div>
        </motion.div>
      </motion.div>

      {/* Agent name */}
      <motion.p
        className={`mt-4 text-sm font-semibold text-center ${colors.text}`}
        animate={{ opacity: isActive ? 1 : 0.6 }}
      >
        {name}
      </motion.p>

      {/* Active indicator badge */}
      {isActive && (
        <motion.div
          className="mt-2 px-2 py-1 rounded-full text-xs font-mono"
          style={{ background: colors.border, color: "#000" }}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          ACTIVE
        </motion.div>
      )}
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
      r="4"
      fill="rgba(168, 85, 247, 0.8)"
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
 */
export default function AgentNetworkStatus({ sessionId }: AgentNetworkStatusProps) {
  const { events, currentAgent, isConnected } = useAgentProgress(sessionId || null);
  const [displayedEvents, setDisplayedEvents] = useState<AgentProgressEvent[]>([]);

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

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      {/* Connection Status */}
      <div className="flex items-center justify-center gap-2 text-sm">
        {isConnected ? (
          <>
            <Wifi className="w-4 h-4 text-green-400" />
            <span className="text-green-400">Connected to Agent Network</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-400">Connecting to Agent Network...</span>
          </>
        )}
      </div>

      {/* Node Graph Section */}
      <div className="relative w-full h-64 bg-gradient-to-b from-slate-900/50 to-slate-950/50 rounded-lg border border-slate-700/50 overflow-hidden">
        {/* SVG for connections and data packets */}
        <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: "none" }}>
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
          <line
            x1="50%"
            y1="20%"
            x2="20%"
            y2="80%"
            stroke="rgba(168, 85, 247, 0.3)"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
          <line
            x1="50%"
            y1="20%"
            x2="80%"
            y2="80%"
            stroke="rgba(168, 85, 247, 0.3)"
            strokeWidth="2"
            strokeDasharray="5,5"
          />

          {/* Data packets traveling along paths */}
          <path id="path-left" d="M 50% 20% L 20% 80%" fill="none" />
          <path id="path-right" d="M 50% 20% L 80% 80%" fill="none" />

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
        />
        <AgentNode
          name="Travel & Culture"
          icon={<MapPin className="w-8 h-8" />}
          isActive={isTravelActive}
          position="left"
          agentType="Travel & Culture"
        />
        <AgentNode
          name="Logistics"
          icon={<TrendingUp className="w-8 h-8" />}
          isActive={isLogisticsActive}
          position="right"
          agentType="Logistics"
        />
      </div>

      {/* Terminal Log Section */}
      <div className="w-full bg-slate-950 rounded-lg border border-slate-700 overflow-hidden">
        <div className="bg-slate-900 px-4 py-2 border-b border-slate-700">
          <p className="text-xs font-mono text-slate-400">AGENT NETWORK LOG</p>
        </div>

        <div className="h-48 overflow-y-auto p-4 space-y-2 font-mono text-sm">
          {displayedEvents.length === 0 ? (
            <p className="text-slate-500">Initializing agent network...</p>
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

              return (
                <motion.div
                  key={`${event.timestamp}-${index}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`${getAgentColor()}`}
                >
                  <span className="text-slate-500">[{new Date(event.timestamp).toLocaleTimeString()}]</span>{" "}
                  <TypewriterText text={event.message} delay={0} />
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Status Summary */}
      <div className="text-center text-sm text-slate-400">
        <p>
          {displayedEvents.length === 0
            ? "Waiting for agent network response..."
            : `Processing: ${displayedEvents.length} events received`}
        </p>
      </div>
    </div>
  );
}
