import React, { useEffect, useRef } from 'react';

interface ParticleBurstProps {
  trigger: number; // increment this to fire a new burst
  color: string; // hex or rgb string
  particleCount?: number;
}

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  life: number; maxLife: number;
  size: number;
}

// Fires a short-lived radial particle burst from the center of its
// container whenever `trigger` changes. Deliberately simple — no physics
// library, just velocity + fade, cleaned up after ~900ms.
export function ParticleBurst({ trigger, color, particleCount = 36 }: ParticleBurstProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>();

  useEffect(() => {
    if (trigger === 0) return; // don't fire on initial mount
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.parentElement?.getBoundingClientRect();
    const width = rect?.width ?? canvas.clientWidth;
    const height = rect?.height ?? canvas.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const cx = width / 2;
    const cy = height / 2;

    particlesRef.current = Array.from({ length: particleCount }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 3.5;
      return {
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 40 + Math.random() * 25,
        size: 1.5 + Math.random() * 2.5
      };
    });

    const start = performance.now();

    const draw = (now: number) => {
      ctx.clearRect(0, 0, width, height);
      let anyAlive = false;

      for (const p of particlesRef.current) {
        p.life++;
        if (p.life > p.maxLife) continue;
        anyAlive = true;

        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.03; // slight gravity drift
        p.vx *= 0.98;
        p.vy *= 0.98;

        const alpha = 1 - p.life / p.maxLife;
        ctx.globalAlpha = Math.max(alpha, 0);
        ctx.fillStyle = color;
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      }
      ctx.globalAlpha = 1;

      if (anyAlive && now - start < 1500) {
        rafRef.current = requestAnimationFrame(draw);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [trigger, color, particleCount]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 w-full h-full"
      style={{ zIndex: 5 }}
    />
  );
}
