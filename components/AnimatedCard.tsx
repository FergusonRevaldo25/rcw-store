"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

export default function AnimatedCard({
  children,
  index = 0,
  className = "",
}: {
  children: ReactNode;
  index?: number; // position in the grid, used for the stagger
  className?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.5,
        ease: "easeOut",
        delay: Math.min(index, 8) * 0.06,
      }}
      whileHover={reduce ? undefined : { y: -6 }}
      whileTap={reduce ? undefined : { scale: 0.98 }}
    >
      {children}
    </motion.div>
  );
}
