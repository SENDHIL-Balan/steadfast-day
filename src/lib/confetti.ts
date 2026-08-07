import confetti from "canvas-confetti";

export function celebrate() {
  const base = { spread: 70, ticks: 220, gravity: 0.9, scalar: 1.05, zIndex: 100 };
  confetti({ ...base, particleCount: 70, origin: { x: 0.2, y: 0.7 }, angle: 60 });
  confetti({ ...base, particleCount: 70, origin: { x: 0.8, y: 0.7 }, angle: 120 });
  setTimeout(() => {
    confetti({ ...base, particleCount: 100, spread: 120, origin: { x: 0.5, y: 0.6 } });
  }, 220);
}
