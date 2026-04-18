// components/landing/MountainScan3D.tsx
"use client";

import { useEffect, useRef } from "react";

interface MountainScan3DProps {
  /** Couleur principale (orange Yeti par défaut) */
  color?: string;
  /** Classe CSS additionnelle */
  className?: string;
}

/**
 * Scan topographique 3D animé façon "vieux film SF / HUD tactique".
 *
 * Ce que ça dessine :
 *  - Plusieurs crêtes de montagnes en wireframe (parallax de profondeur)
 *  - Une grille de perspective style Tron en bas
 *  - Un petit marcheur en pointillés qui progresse le long de la crête principale
 *  - Un rayon de scan horizontal qui balaie la scène
 *  - Contour intérieur de type HUD (coins angulaires)
 */
export function MountainScan3D({
  color = "#F9591F",
  className = "",
}: MountainScan3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;

    // Données des crêtes (seed déterministe sinusoïdal)
    const buildRidge = (
      seed: number,
      amplitude: number,
      baseY: number,
      freq: number
    ) => {
      const points: { x: number; y: number }[] = [];
      const samples = 120;
      for (let i = 0; i <= samples; i++) {
        const t = i / samples;
        const x = t;
        const y =
          Math.sin(t * Math.PI * freq + seed) * amplitude * 0.5 +
          Math.sin(t * Math.PI * freq * 2.3 + seed * 1.7) * amplitude * 0.25 +
          Math.sin(t * Math.PI * freq * 4.1 + seed * 2.3) * amplitude * 0.12 +
          baseY;
        points.push({ x, y });
      }
      return points;
    };

    const hexToRgb = (hex: string): [number, number, number] => {
      const h = hex.replace("#", "");
      const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
      const num = parseInt(full, 16);
      return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
    };

    const [cr, cg, cb] = hexToRgb(color);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    let frame = 0;

    const drawRidge = (
      points: { x: number; y: number }[],
      yOffset: number,
      opacity: number,
      strokeWidth: number,
      drawDots: boolean,
      dotSpacing: number = 3
    ) => {
      // Ligne de crête pleine
      ctx.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, ${opacity})`;
      ctx.lineWidth = strokeWidth;
      ctx.beginPath();
      points.forEach((p, i) => {
        const x = p.x * width;
        const y = p.y + yOffset;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Remplissage dégradé sous la crête
      ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${opacity * 0.08})`;
      ctx.beginPath();
      points.forEach((p, i) => {
        const x = p.x * width;
        const y = p.y + yOffset;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fill();

      // Points le long de la crête (style scan)
      if (drawDots) {
        ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${opacity * 1.2})`;
        points.forEach((p, i) => {
          if (i % dotSpacing !== 0) return;
          const x = p.x * width;
          const y = p.y + yOffset;
          ctx.beginPath();
          ctx.arc(x, y, 1.2, 0, Math.PI * 2);
          ctx.fill();
        });
      }
    };

    const drawHiker = (
      x: number,
      y: number,
      size: number,
      opacity: number
    ) => {
      // Petit bonhomme en pointillés (style SSR 70s)
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;

      // Tête (cercle)
      ctx.beginPath();
      ctx.arc(x, y - size * 2.5, size * 0.6, 0, Math.PI * 2);
      ctx.fill();

      // Corps en pointillés
      const bodyDots = [
        { dx: 0, dy: -size * 1.4 },
        { dx: 0, dy: -size * 0.7 },
        { dx: 0, dy: 0 },
      ];
      bodyDots.forEach((d) => {
        ctx.beginPath();
        ctx.arc(x + d.dx, y + d.dy, size * 0.35, 0, Math.PI * 2);
        ctx.fill();
      });

      // Jambes qui bougent (cycle de marche)
      const legPhase = Math.sin(frame * 0.25) * size * 0.6;
      ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
      ctx.lineWidth = 1.3;
      ctx.setLineDash([1.5, 1.5]);

      // Jambe avant
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + legPhase, y + size * 1.3);
      ctx.stroke();

      // Jambe arrière
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - legPhase, y + size * 1.3);
      ctx.stroke();

      // Bras (sac à dos de côté)
      ctx.beginPath();
      ctx.moveTo(x, y - size * 1.2);
      ctx.lineTo(x + legPhase * 0.5, y - size * 0.5);
      ctx.stroke();

      ctx.setLineDash([]);

      // Sac à dos (petit rectangle orange derrière la tête)
      ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${opacity})`;
      ctx.fillRect(x - size * 1.1, y - size * 2.2, size * 0.8, size * 1.5);

      // Aura autour du marcheur
      const aura = ctx.createRadialGradient(x, y - size, 0, x, y - size, size * 5);
      aura.addColorStop(0, `rgba(${cr}, ${cg}, ${cb}, ${opacity * 0.25})`);
      aura.addColorStop(1, `rgba(${cr}, ${cg}, ${cb}, 0)`);
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(x, y - size, size * 5, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawGrid = () => {
      // Grille de perspective style Tron en bas
      const gridTop = height * 0.82;
      ctx.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, 0.15)`;
      ctx.lineWidth = 0.7;

      // Lignes horizontales (avec perspective)
      const rows = 8;
      for (let i = 0; i <= rows; i++) {
        const t = i / rows;
        const y = gridTop + t * (height - gridTop);
        const perspective = 1 - t * 0.5; // elles se rapprochent visuellement
        const alpha = 0.05 + (1 - t) * 0.15;
        ctx.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(width * (0.5 - 0.5 * perspective), y);
        ctx.lineTo(width * (0.5 + 0.5 * perspective), y);
        ctx.stroke();
      }

      // Lignes verticales (convergeant vers le centre/haut)
      const cols = 10;
      const vanishX = width * 0.5;
      for (let i = 0; i <= cols; i++) {
        const t = i / cols;
        const startX = t * width;
        const alpha = 0.08 + Math.abs(t - 0.5) * 0.12;
        ctx.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(startX, height);
        ctx.lineTo(vanishX, gridTop);
        ctx.stroke();
      }
    };

    const drawCorners = () => {
      // Coins HUD (style visée tactique)
      const corner = 20;
      const margin = 12;
      ctx.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, 0.6)`;
      ctx.lineWidth = 1.2;

      // Haut gauche
      ctx.beginPath();
      ctx.moveTo(margin, margin + corner);
      ctx.lineTo(margin, margin);
      ctx.lineTo(margin + corner, margin);
      ctx.stroke();
      // Haut droit
      ctx.beginPath();
      ctx.moveTo(width - margin - corner, margin);
      ctx.lineTo(width - margin, margin);
      ctx.lineTo(width - margin, margin + corner);
      ctx.stroke();
      // Bas gauche
      ctx.beginPath();
      ctx.moveTo(margin, height - margin - corner);
      ctx.lineTo(margin, height - margin);
      ctx.lineTo(margin + corner, height - margin);
      ctx.stroke();
      // Bas droit
      ctx.beginPath();
      ctx.moveTo(width - margin - corner, height - margin);
      ctx.lineTo(width - margin, height - margin);
      ctx.lineTo(width - margin, height - margin - corner);
      ctx.stroke();
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Fond dégradé sombre (nuit orangée)
      const bg = ctx.createRadialGradient(
        width * 0.5,
        height * 0.4,
        0,
        width * 0.5,
        height * 0.4,
        width * 0.9
      );
      bg.addColorStop(0, "rgba(30, 12, 5, 1)");
      bg.addColorStop(1, "rgba(5, 5, 5, 1)");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      // Grille de perspective au sol
      drawGrid();

      // Phase d'animation (légère dérive horizontale)
      const drift = frame * 0.3;

      // Plusieurs crêtes en parallax (arrière -> avant)
      const backRidge = buildRidge(drift * 0.002 + 0.8, height * 0.15, height * 0.38, 1.8);
      const midRidge = buildRidge(drift * 0.003 + 1.5, height * 0.2, height * 0.52, 2.2);
      const frontRidge = buildRidge(drift * 0.004 + 2.2, height * 0.22, height * 0.68, 2.5);

      drawRidge(backRidge, 0, 0.25, 1, true, 5);
      drawRidge(midRidge, 0, 0.45, 1.2, true, 4);
      drawRidge(frontRidge, 0, 0.9, 1.6, true, 3);

      // Marcheur progressant le long de la crête principale (midRidge)
      const hikerProgress = (frame * 0.0015) % 1;
      const hikerIndex = Math.floor(hikerProgress * midRidge.length);
      const hikerPoint = midRidge[hikerIndex];
      if (hikerPoint) {
        drawHiker(hikerPoint.x * width, hikerPoint.y, 3, 0.95);
      }

      // Scan line horizontale orange (effet "analyse")
      const scanY = ((frame * 0.6) % (height + 100)) - 50;
      const scanGrad = ctx.createLinearGradient(0, scanY - 60, 0, scanY + 60);
      scanGrad.addColorStop(0, `rgba(${cr}, ${cg}, ${cb}, 0)`);
      scanGrad.addColorStop(0.5, `rgba(${cr}, ${cg}, ${cb}, 0.18)`);
      scanGrad.addColorStop(1, `rgba(${cr}, ${cg}, ${cb}, 0)`);
      ctx.fillStyle = scanGrad;
      ctx.fillRect(0, scanY - 60, width, 120);

      // Ligne fine du scan
      ctx.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, 0.5)`;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(0, scanY);
      ctx.lineTo(width, scanY);
      ctx.stroke();

      // Coins HUD
      drawCorners();

      // Noise / bruit film 70s (léger)
      if (frame % 2 === 0) {
        for (let i = 0; i < 40; i++) {
          const nx = Math.random() * width;
          const ny = Math.random() * height;
          const alpha = Math.random() * 0.06;
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.fillRect(nx, ny, 1, 1);
        }
      }

      frame++;
      animationRef.current = requestAnimationFrame(render);
    };

    resize();
    window.addEventListener("resize", resize);
    animationRef.current = requestAnimationFrame(render);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [color]);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full ${className}`}
      aria-hidden="true"
    />
  );
}
