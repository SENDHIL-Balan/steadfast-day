import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { useEffect } from "react";

interface Props {
  value: number;
  duration?: number;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export function AnimatedCounter({ value, duration = 1, suffix = "", decimals = 0, className }: Props) {
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (latest) => `${latest.toFixed(decimals)}${suffix}`);

  useEffect(() => {
    const controls = animate(motionValue, value, { duration, ease: [0.16, 1, 0.3, 1] });
    return () => controls.stop();
  }, [motionValue, value, duration]);

  return <motion.span className={className}>{rounded}</motion.span>;
}
