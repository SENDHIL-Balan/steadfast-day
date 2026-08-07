import { motion } from "motion/react";

import { AnimatedCounter } from "@/components/animated-counter";

interface Props {
  completed: number;
  total: number;
  percent: number;
  size?: number;
}

export function ProgressRing({ completed, total, percent, size = 232 }: Props) {
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <div
        className="absolute inset-4 rounded-full blur-2xl"
        style={{ background: "var(--gradient-accent)", opacity: 0.18 }}
      />
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--primary)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - (percent / 100) * circumference }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-[0.65rem] font-medium uppercase tracking-[0.22em] text-muted-foreground">
          Completed
        </span>
        <span className="tabular mt-1 text-3xl font-semibold tracking-tight">
          {completed}
          <span className="text-muted-foreground"> / {total}</span>
        </span>
        <AnimatedCounter
          value={percent}
          suffix="%"
          className="tabular mt-0.5 text-sm font-medium text-primary"
        />
      </div>
    </div>
  );
}
