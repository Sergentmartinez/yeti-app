// components/landing/Network3DMesh.tsx
"use client";

import { useEffect, useRef } from "react";

interface Node3D {
  x: number;
  y: number;
  z: number;
  size: number;
  pulse: number;
  pulseSpeed: number;
}

interface Network3DMeshProps {
  /** Couleur principale (orange Yeti par défaut) */
  color?: string;
  /** Nombre de nodes dans le réseau 3D */
  count?: number;
  /** Distance max pour qu'un lien soit tiré entre 2 nodes */
  linkDistance?: number;
  /** Afficher les surfaces triangulaires entre 3 nodes proches */
  showTriangles?: boolean;
  /** Classe CSS additionnelle */
  className?: string;
}

/**
 * Réseau 3D abstrait de nodes glow + lignes + surfaces triangulaires.
 * Inspiré directement des vidéos Shutterstock "digital network glowing nodes"
 * et "geometry surfaces lines points".
 *
 * Technique :
 *  - Points répartis aléatoirement dans un cube 3D [-1, 1]³
 *  - Rotation continue autour des axes Y + X pour l'effet caméra 3D
 *  - Projection perspective manuelle (pas de Three.js)
 *  - Lignes entre nodes proches dans l'espace 3D
 *  - Surfaces triangulaires entre triplets rapprochés
 *  - Glow multi-passe avec blur additif
 */
export function Network3DMesh({
  color = "#F9591F",
  count = 700,
  linkDistance = 0.18,
  showTriangles = false,
  className = "",
}: Network3DMeshProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;

    const hexToRgb = (hex: string): [number, number, number] => {
      const h = hex.replace("#", "");
      const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
      const num = parseInt(full, 16);
      return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
    };
    const [cr, cg, cb] = hexToRgb(color);

    // Nodes 3D distribués dans un volume sphérique avec densité radiale
    // (plus dense au centre, plus diffus vers l'extérieur) → vrai "nuage"
    const nodes: Node3D[] = [];
    while (nodes.length < count) {
      const x = (Math.random() - 0.5) * 2;
      const y = (Math.random() - 0.5) * 2;
      const z = (Math.random() - 0.5) * 2;
      const r = Math.sqrt(x * x + y * y + z * z);
      if (r > 1) continue; // intérieur de la sphère unité
      nodes.push({
        x,
        y,
        z,
        size: Math.random() * 0.45 + 0.35,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.006 + Math.random() * 0.02,
      });
    }

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

    /** Projection 3D → 2D avec perspective. Retourne aussi un facteur de profondeur. */
    const project = (x: number, y: number, z: number, angleY: number, angleX: number) => {
      // Rotation Y
      let x1 = x * Math.cos(angleY) + z * Math.sin(angleY);
      let z1 = -x * Math.sin(angleY) + z * Math.cos(angleY);
      let y1 = y;

      // Rotation X
      const y2 = y1 * Math.cos(angleX) - z1 * Math.sin(angleX);
      const z2 = y1 * Math.sin(angleX) + z1 * Math.cos(angleX);

      // Projection perspective (point de fuite à distance 3)
      const cameraZ = 3;
      const perspective = cameraZ / (cameraZ + z2);

      const scale = Math.min(width, height) * 0.42;
      const px = width / 2 + x1 * scale * perspective;
      const py = height / 2 + y2 * scale * perspective;

      // Facteur profondeur : 1 au plus proche, 0 au plus loin
      const depth = Math.max(0, Math.min(1, (1 - z2 / 2) * 0.5 + 0.3));

      return { x: px, y: py, depth, perspective };
    };

    const render = () => {
      // Fond opaque (on repart d'un frame propre pour des points nets)
      ctx.fillStyle = "#050505";
      ctx.fillRect(0, 0, width, height);

      // Dégradé radial ambiant chaud (halo central)
      const ambient = ctx.createRadialGradient(
        width / 2,
        height / 2,
        0,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.7
      );
      ambient.addColorStop(0, `rgba(${cr}, ${cg}, ${cb}, 0.08)`);
      ambient.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = ambient;
      ctx.fillRect(0, 0, width, height);

      // Rotation 3D de la caméra (plus nette pour bien voir la profondeur)
      const angleY = frame * 0.005;
      const angleX = Math.sin(frame * 0.0025) * 0.35;

      // Projeter tous les nodes
      const projected = nodes.map((n) => {
        const p = project(n.x, n.y, n.z, angleY, angleX);
        return { ...n, ...p };
      });

      // Trier par z (du plus loin au plus proche) pour bon ordre de rendu
      projected.sort((a, b) => a.depth - b.depth);

      // Étape 1 : Surfaces triangulaires (fills très subtils) entre 3 nodes proches
      if (showTriangles) {
        for (let i = 0; i < projected.length; i++) {
          const a = projected[i];
          for (let j = i + 1; j < projected.length; j++) {
            const b = projected[j];
            const d1 = Math.hypot(a.x - b.x, a.y - b.y);
            if (d1 > linkDistance * 280) continue;

            for (let k = j + 1; k < projected.length; k++) {
              const c = projected[k];
              const d2 = Math.hypot(b.x - c.x, b.y - c.y);
              const d3 = Math.hypot(a.x - c.x, a.y - c.y);
              if (d2 > linkDistance * 280 || d3 > linkDistance * 280) continue;

              const avgDepth = (a.depth + b.depth + c.depth) / 3;
              const alpha = 0.035 * avgDepth;
              ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${alpha})`;
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.lineTo(c.x, c.y);
              ctx.closePath();
              ctx.fill();
            }
          }
        }
      }

      // Étape 2 : Quelques liaisons éphémères (budget strict pour ne pas noyer le nuage)
      let lineBudget = 80;
      const threshold = linkDistance * 280;
      for (let i = 0; i < projected.length && lineBudget > 0; i++) {
        const a = projected[i];
        for (let j = i + 1; j < projected.length && lineBudget > 0; j++) {
          const b = projected[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d > threshold) continue;

          const alpha = (1 - d / threshold) * 0.2 * ((a.depth + b.depth) / 2);
          ctx.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, ${alpha})`;
          ctx.lineWidth = 0.35;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
          lineBudget--;
        }
      }

      // Étape 3 : Points du nuage (nombreux, lumineux, avec glow)
      // On passe en mode "lighter" pour que les halos s'additionnent
      // (= effet "étoiles" bien brillant, typique des vidéos de nuage de points).
      ctx.globalCompositeOperation = "lighter";

      for (const n of projected) {
        n.pulse += n.pulseSpeed;
        const pulseFactor = 0.8 + Math.sin(n.pulse) * 0.2;

        const baseRadius = n.size * 2.2 * n.perspective * pulseFactor;

        // Halo diffus large (fait "respirer" le nuage)
        const glowBig = ctx.createRadialGradient(
          n.x,
          n.y,
          0,
          n.x,
          n.y,
          baseRadius * 7
        );
        glowBig.addColorStop(
          0,
          `rgba(${cr}, ${cg}, ${cb}, ${0.55 * n.depth})`
        );
        glowBig.addColorStop(
          0.3,
          `rgba(${cr}, ${cg}, ${cb}, ${0.18 * n.depth})`
        );
        glowBig.addColorStop(1, `rgba(${cr}, ${cg}, ${cb}, 0)`);
        ctx.fillStyle = glowBig;
        ctx.beginPath();
        ctx.arc(n.x, n.y, baseRadius * 7, 0, Math.PI * 2);
        ctx.fill();

        // Halo moyen plus dense
        const glowMid = ctx.createRadialGradient(
          n.x,
          n.y,
          0,
          n.x,
          n.y,
          baseRadius * 2.5
        );
        glowMid.addColorStop(0, `rgba(${cr}, ${cg}, ${cb}, ${0.8 * n.depth})`);
        glowMid.addColorStop(1, `rgba(${cr}, ${cg}, ${cb}, 0)`);
        ctx.fillStyle = glowMid;
        ctx.beginPath();
        ctx.arc(n.x, n.y, baseRadius * 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Point solide au centre (plus gros pour les proches)
        ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${Math.min(1, 1.1 * n.depth)})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, baseRadius, 0, Math.PI * 2);
        ctx.fill();

        // Cœur blanc-chaud brillant sur les points les plus proches
        if (n.depth > 0.45) {
          ctx.fillStyle = `rgba(255, 240, 220, ${(n.depth - 0.3) * pulseFactor * 1.5})`;
          ctx.beginPath();
          ctx.arc(n.x, n.y, baseRadius * 0.55, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // On remet le mode normal pour le reste
      ctx.globalCompositeOperation = "source-over";

      // Étape 4 : Particules de poussière qui flottent (fine couche d'ambiance)
      for (let i = 0; i < 15; i++) {
        const dx = (Math.sin(frame * 0.003 + i * 1.7) * 0.5 + 0.5) * width;
        const dy = (Math.cos(frame * 0.0025 + i * 2.3) * 0.5 + 0.5) * height;
        const ds = 0.4 + Math.sin(frame * 0.02 + i) * 0.3;
        ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${0.18 + ds * 0.15})`;
        ctx.beginPath();
        ctx.arc(dx, dy, 0.6, 0, Math.PI * 2);
        ctx.fill();
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
  }, [color, count, linkDistance, showTriangles]);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full ${className}`}
      aria-hidden="true"
    />
  );
}
