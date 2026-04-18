// components/landing/ParticleNetwork.tsx
"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  pulse: number;
}

interface ParticleNetworkProps {
  /** Couleur principale des particules (hex ou rgb) */
  color?: string;
  /** Couleur secondaire pour les liens (hex ou rgb) */
  linkColor?: string;
  /** Nombre de particules (auto-scale si undefined) */
  count?: number;
  /** Distance max pour qu'un lien apparaisse */
  linkDistance?: number;
  /** Classe CSS additionnelle */
  className?: string;
}

/**
 * Réseau de particules animé en canvas 2D, style "neural network / antigravity".
 * - Particules qui dérivent avec inertie
 * - Lignes dynamiques entre particules proches (opacity selon distance)
 * - Effet pulse/glow sur quelques particules aléatoires
 * - Interactive : attire subtilement vers le curseur
 */
export function ParticleNetwork({
  color = "#F9591F",
  linkColor = "#F9591F",
  count,
  linkDistance = 120,
  className = "",
}: ParticleNetworkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let particles: Particle[] = [];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Auto-scale particle count sur la taille
      const autoCount = Math.floor((width * height) / 9000);
      const total = count ?? Math.max(28, Math.min(70, autoCount));

      particles = Array.from({ length: total }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 1.6 + 0.6,
        pulse: Math.random() * Math.PI * 2,
      }));
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouseRef.current.x = -9999;
      mouseRef.current.y = -9999;
    };

    const hexToRgb = (hex: string): [number, number, number] => {
      const h = hex.replace("#", "");
      const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
      const num = parseInt(full, 16);
      return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
    };

    const [pr, pg, pb] = hexToRgb(color);
    const [lr, lg, lb] = hexToRgb(linkColor);

    let frame = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Update + draw particules
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Attraction vers la souris (douce)
        const dx = mouseRef.current.x - p.x;
        const dy = mouseRef.current.y - p.y;
        const distMouse = Math.sqrt(dx * dx + dy * dy);
        if (distMouse < 180) {
          const force = (180 - distMouse) / 180;
          p.vx += (dx / distMouse) * force * 0.015;
          p.vy += (dy / distMouse) * force * 0.015;
        }

        // Mouvement
        p.x += p.vx;
        p.y += p.vy;

        // Friction très légère
        p.vx *= 0.992;
        p.vy *= 0.992;

        // Rebonds sur bords
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
        p.x = Math.max(0, Math.min(width, p.x));
        p.y = Math.max(0, Math.min(height, p.y));

        // Pulse
        p.pulse += 0.02;
        const pulseAlpha = 0.55 + Math.sin(p.pulse) * 0.35;

        // Glow particule
        const glowRadius = p.radius * 3.5;
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowRadius);
        gradient.addColorStop(0, `rgba(${pr}, ${pg}, ${pb}, ${pulseAlpha * 0.9})`);
        gradient.addColorStop(0.4, `rgba(${pr}, ${pg}, ${pb}, ${pulseAlpha * 0.3})`);
        gradient.addColorStop(1, `rgba(${pr}, ${pg}, ${pb}, 0)`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // Cœur de la particule
        ctx.fillStyle = `rgba(255, 255, 255, ${pulseAlpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw liens (lignes entre particules proches)
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < linkDistance) {
            const alpha = (1 - dist / linkDistance) * 0.55;
            ctx.strokeStyle = `rgba(${lr}, ${lg}, ${lb}, ${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Effet "scan line" horizontal subtil qui traverse
      const scanY = ((frame * 0.4) % (height + 200)) - 100;
      const scanGradient = ctx.createLinearGradient(0, scanY - 50, 0, scanY + 50);
      scanGradient.addColorStop(0, `rgba(${pr}, ${pg}, ${pb}, 0)`);
      scanGradient.addColorStop(0.5, `rgba(${pr}, ${pg}, ${pb}, 0.08)`);
      scanGradient.addColorStop(1, `rgba(${pr}, ${pg}, ${pb}, 0)`);
      ctx.fillStyle = scanGradient;
      ctx.fillRect(0, scanY - 50, width, 100);

      frame++;
      animationRef.current = requestAnimationFrame(render);
    };

    resize();
    window.addEventListener("resize", resize);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    animationRef.current = requestAnimationFrame(render);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [color, linkColor, count, linkDistance]);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full ${className}`}
      aria-hidden="true"
    />
  );
}
