import { motion } from "framer-motion";

interface AnimatedProgressIndicatorProps {
  progress: number; // 0-100
  label?: string;
  size?: "sm" | "md" | "lg";
  color?: "purple" | "green" | "blue" | "amber";
}

const sizeClasses = {
  sm: "w-12 h-12",
  md: "w-16 h-16",
  lg: "w-20 h-20",
};

const colorClasses = {
  purple: {
    gradient: "from-purple-400 to-pink-400",
    glow: "rgba(168, 85, 247, 0.5)",
    text: "text-purple-400",
  },
  green: {
    gradient: "from-green-400 to-emerald-400",
    glow: "rgba(34, 197, 94, 0.5)",
    text: "text-green-400",
  },
  blue: {
    gradient: "from-blue-400 to-cyan-400",
    glow: "rgba(59, 130, 246, 0.5)",
    text: "text-blue-400",
  },
  amber: {
    gradient: "from-amber-400 to-orange-400",
    glow: "rgba(217, 119, 6, 0.5)",
    text: "text-amber-400",
  },
};

export default function AnimatedProgressIndicator({
  progress,
  label,
  size = "md",
  color = "purple",
}: AnimatedProgressIndicatorProps) {
  const colorConfig = colorClasses[color];
  const circumference = 2 * Math.PI * 45; // radius 45

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        {/* Background circle */}
        <svg className={`${sizeClasses[size]} drop-shadow-lg`} viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="45" fill="none" stroke="rgba(100, 100, 100, 0.1)" strokeWidth="2" />

          {/* Animated progress circle */}
          <motion.circle
            cx="60"
            cy="60"
            r="45"
            fill="none"
            stroke="url(#progressGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - (progress / 100) * circumference }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ transform: "rotate(-90deg)", transformOrigin: "60px 60px" }}
          />

          {/* Gradient definition */}
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colorConfig.glow} />
              <stop offset="100%" stopColor={colorConfig.glow} />
            </linearGradient>
          </defs>
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className={`text-center font-bold ${colorConfig.text}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="text-xl">{Math.round(progress)}%</div>
          </motion.div>
        </div>
      </div>

      {label && (
        <motion.p
          className="text-xs font-medium text-slate-400 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {label}
        </motion.p>
      )}
    </div>
  );
}
