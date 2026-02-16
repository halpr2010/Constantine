"use client";

import React, { useEffect, useRef } from "react";

type Node = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number; // radius
  a: number; // alpha
  cluster: number;
};

type Edge = { i: number; j: number; w: number }; // w=weight (0..1)
type Pulse = { edgeIdx: number; t: number; speed: number };

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const canvasEl = canvas;
    const ctx2d = ctx;

    let dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    let width = 0;
    let height = 0;

    let nodes: Node[] = [];
    let edges: Edge[] = [];
    let pulses: Pulse[] = [];
    let last = performance.now();

    // --- knobs (tune these)
    const density = 1 / 15000; // smaller => fewer nodes
    const clusterCount = 4;
    const clusterTightness = 0.18; // 0..1 smaller = tighter
    const maxEdgesPerNode = 4;
    const baseLinkDist = 160;
    const longLinkChance = 0.06; // occasional longer links
    const driftSpeed = 0.35;
    const swirlStrength = 0.75; // flow field strength
    const mouseInfluence = 0.9; // increases local connections/brightness
    const pulseSpawnRate = 0.6; // pulses per second
    const pulseBrightness = 0.75;
    const mouseRepelStrength = 0.45; // stronger repulsion for visible movement
    const mouseFlowInfluence = 1.2; // flow field bends around cursor

    function resize() {
      const parent = canvasEl.parentElement;
      if (!parent) return;

      dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      width = parent.clientWidth;
      height = parent.clientHeight;

      canvasEl.style.width = `${width}px`;
      canvasEl.style.height = `${height}px`;
      canvasEl.width = Math.floor(width * dpr);
      canvasEl.height = Math.floor(height * dpr);
      ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);

      // regenerate
      regenerate();
    }

    function regenerate() {
      nodes = [];
      edges = [];
      pulses = [];

      const n = clamp(Math.floor(width * height * density), 55, 160);

      // cluster centers
      const centers = Array.from({ length: clusterCount }, () => ({
        x: rand(width * 0.18, width * 0.92),
        y: rand(height * 0.12, height * 0.88),
      }));

      // create clustered nodes (mixture of cluster + some uniform)
      for (let i = 0; i < n; i++) {
        const c = Math.floor(rand(0, clusterCount));
        const useCluster = Math.random() < 0.82;

        const cx = useCluster ? centers[c].x : rand(0, width);
        const cy = useCluster ? centers[c].y : rand(0, height);

        // gaussian-ish scatter around center
        const spreadX = width * clusterTightness * rand(0.35, 1.05);
        const spreadY = height * clusterTightness * rand(0.35, 1.05);

        const x = clamp(cx + rand(-spreadX, spreadX), -20, width + 20);
        const y = clamp(cy + rand(-spreadY, spreadY), -20, height + 20);

        nodes.push({
          x,
          y,
          vx: rand(-driftSpeed, driftSpeed),
          vy: rand(-driftSpeed, driftSpeed),
          r: rand(1.0, 2.3),
          a: rand(0.22, 0.9),
          cluster: c,
        });
      }

      // build edges: nearest neighbors + occasional long links
      const neighborLists: number[][] = Array.from({ length: nodes.length }, () => []);

      for (let i = 0; i < nodes.length; i++) {
        // find k nearest (O(n^2) is fine for <=160)
        const dists: { j: number; d: number }[] = [];
        for (let j = 0; j < nodes.length; j++) {
          if (i === j) continue;
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          dists.push({ j, d });
        }
        dists.sort((a, b) => a.d - b.d);
        const k = Math.min(maxEdgesPerNode, dists.length);
        for (let t = 0; t < k; t++) neighborLists[i].push(dists[t].j);

        // occasional long-range link
        if (Math.random() < longLinkChance) {
          neighborLists[i].push(dists[Math.floor(rand(12, Math.min(40, dists.length)))].j);
        }
      }

      // dedupe into edges list
      const seen = new Set<string>();
      for (let i = 0; i < neighborLists.length; i++) {
        for (const j of neighborLists[i]) {
          const a = Math.min(i, j);
          const b = Math.max(i, j);
          const key = `${a}-${b}`;
          if (seen.has(key)) continue;
          seen.add(key);

          const dx = nodes[a].x - nodes[b].x;
          const dy = nodes[a].y - nodes[b].y;
          const d = Math.sqrt(dx * dx + dy * dy);

          const linkDist = baseLinkDist * (nodes[a].cluster === nodes[b].cluster ? 1.05 : 1.55);
          if (d > linkDist) continue;

          const w = clamp(1 - d / linkDist, 0, 1);
          edges.push({ i: a, j: b, w });
        }
      }

      // seed a few pulses
      for (let k = 0; k < Math.min(5, edges.length); k++) {
        pulses.push({
          edgeIdx: Math.floor(rand(0, edges.length)),
          t: rand(0, 1),
          speed: rand(0.35, 0.75),
        });
      }
    }

    // smooth vector field for “AI network drift”
    function flow(x: number, y: number, time: number) {
      const nx = x / Math.max(1, width);
      const ny = y / Math.max(1, height);

      // pseudo-curl field using sines
      const a = Math.sin((nx * 3.2 + time * 0.18) * Math.PI * 2);
      const b = Math.cos((ny * 2.6 - time * 0.14) * Math.PI * 2);
      const c = Math.sin((nx * 1.8 + ny * 1.4 + time * 0.1) * Math.PI * 2);

      let vx = (a + c * 0.6) * 0.5;
      let vy = (b - c * 0.6) * 0.5;

      // mouse creates flow field: particles curl around and push away from cursor
      if (mouseRef.current.active) {
        const mx = mouseRef.current.x;
        const my = mouseRef.current.y;
        const dx = x - mx;
        const dy = y - my;
        const dist = Math.sqrt(dx * dx + dy * dy) + 1;
        const radius = 220;
        if (dist < radius) {
          const falloff = (1 - dist / radius) ** 0.8;
          const invDist = 1 / dist;
          // tangent = (-dy, dx) for counter-clockwise curl
          const curlStr = falloff * mouseFlowInfluence * 0.6;
          vx += -dy * invDist * curlStr;
          vy += dx * invDist * curlStr;
          // radial push away
          const pushStr = falloff * 0.35;
          vx += dx * invDist * pushStr;
          vy += dy * invDist * pushStr;
        }
      }

      return { vx, vy };
    }

    function drawBackground() {
      // glow follows mouse when active, otherwise fixed position
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const mouseActive = mouseRef.current.active;

      const cx = mouseActive ? mx : width * 0.62;
      const cy = mouseActive ? my : height * 0.36;
      const radius = Math.max(width, height) * 0.95;

      const g = ctx2d.createRadialGradient(cx, cy, 0, cx, cy, radius);
      g.addColorStop(0, "rgba(255,255,255,0.08)");
      g.addColorStop(0.4, "rgba(255,255,255,0.03)");
      g.addColorStop(0.7, "rgba(255,255,255,0.01)");
      g.addColorStop(1, "rgba(255,255,255,0.00)");
      ctx2d.fillStyle = g;
      ctx2d.fillRect(0, 0, width, height);
    }

    function drawEdges(time: number) {
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const mouseActive = mouseRef.current.active;

      for (const e of edges) {
        const a = nodes[e.i];
        const b = nodes[e.j];

        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d = Math.sqrt(dx * dx + dy * dy);

        // mouse proximity brightens local web
        let mBoost = 0;
        if (mouseActive) {
          const cx = (a.x + b.x) * 0.5;
          const cy = (a.y + b.y) * 0.5;
          const md = Math.sqrt((cx - mx) ** 2 + (cy - my) ** 2);
          mBoost = clamp(1 - md / 220, 0, 1) * mouseInfluence;
        }

        // base alpha from weight + subtle time shimmer
        const shimmer = 0.04 * Math.sin(time * 1.2 + (e.i + e.j) * 0.07);
        const alpha = clamp(e.w * (0.20 + mBoost * 0.28) + shimmer, 0, 0.55);

        // thinner for longer edges
        const lw = d > baseLinkDist ? 0.8 : 1.0;

        ctx2d.strokeStyle = `rgba(255,255,255,${alpha})`;
        ctx2d.lineWidth = lw;
        ctx2d.beginPath();
        ctx2d.moveTo(a.x, a.y);
        ctx2d.lineTo(b.x, b.y);
        ctx2d.stroke();
      }
    }

    function drawNodes(time: number) {
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const mouseActive = mouseRef.current.active;

      for (const p of nodes) {
        let boost = 0;
        if (mouseActive) {
          const md = Math.sqrt((p.x - mx) ** 2 + (p.y - my) ** 2);
          boost = clamp(1 - md / 180, 0, 1) * 0.45;
        }

        const twinkle = 0.12 * Math.sin(time * 1.8 + p.x * 0.02 + p.y * 0.015);
        const alpha = clamp(p.a + boost + twinkle * 0.15, 0.12, 1);

        // outer glow
        ctx2d.beginPath();
        ctx2d.arc(p.x, p.y, p.r + 3.6, 0, Math.PI * 2);
        ctx2d.fillStyle = `rgba(255,255,255,${alpha * 0.06})`;
        ctx2d.fill();

        // core dot
        ctx2d.beginPath();
        ctx2d.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx2d.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx2d.fill();
      }
    }

    function drawPulses() {
      for (const pulse of pulses) {
        const e = edges[pulse.edgeIdx];
        if (!e) continue;

        const a = nodes[e.i];
        const b = nodes[e.j];

        const x = lerp(a.x, b.x, pulse.t);
        const y = lerp(a.y, b.y, pulse.t);

        ctx2d.beginPath();
        ctx2d.arc(x, y, 2.3, 0, Math.PI * 2);
        ctx2d.fillStyle = `rgba(255,255,255,${pulseBrightness * 0.85})`;
        ctx2d.fill();

        // tiny halo
        ctx2d.beginPath();
        ctx2d.arc(x, y, 8.5, 0, Math.PI * 2);
        ctx2d.fillStyle = `rgba(255,255,255,${pulseBrightness * 0.08})`;
        ctx2d.fill();
      }
    }

    function step(now: number) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      const time = now / 1000;

      ctx2d.clearRect(0, 0, width, height);
      drawBackground();

      // update nodes with flow field + gentle cohesion to cluster
      const centers = Array.from({ length: clusterCount }, () => ({ x: 0, y: 0, n: 0 }));
      for (const p of nodes) {
        centers[p.cluster].x += p.x;
        centers[p.cluster].y += p.y;
        centers[p.cluster].n += 1;
      }
      for (const c of centers) {
        if (c.n > 0) {
          c.x /= c.n;
          c.y /= c.n;
        }
      }

      for (const p of nodes) {
        const f = flow(p.x, p.y, time);
        p.vx += f.vx * swirlStrength * dt;
        p.vy += f.vy * swirlStrength * dt;

        // tiny pull toward cluster center (keeps “network” coherent)
        const cc = centers[p.cluster];
        const dx = cc.x - p.x;
        const dy = cc.y - p.y;
        p.vx += dx * 0.00045;
        p.vy += dy * 0.00045;

        // mouse repulsion (visible)
        if (mouseRef.current.active) {
          const mdx = p.x - mouseRef.current.x;
          const mdy = p.y - mouseRef.current.y;
          const md = Math.sqrt(mdx * mdx + mdy * mdy);
          const repelRadius = 220;
          if (md < repelRadius && md > 0.001) {
            const push = (1 - md / repelRadius) ** 1.2;
            p.vx += (mdx / md) * push * mouseRepelStrength;
            p.vy += (mdy / md) * push * mouseRepelStrength;
          }
        }

        // integrate
        p.x += p.vx;
        p.y += p.vy;

        // damping
        p.vx *= 0.992;
        p.vy *= 0.992;

        // wrap
        if (p.x < -30) p.x = width + 30;
        if (p.x > width + 30) p.x = -30;
        if (p.y < -30) p.y = height + 30;
        if (p.y > height + 30) p.y = -30;
      }

      // update pulses
      // spawn
      if (edges.length > 0) {
        const spawnProb = pulseSpawnRate * dt;
        if (Math.random() < spawnProb) {
          pulses.push({
            edgeIdx: Math.floor(rand(0, edges.length)),
            t: 0,
            speed: rand(0.35, 0.9),
          });
        }
      }
      // advance
      for (const pulse of pulses) {
        pulse.t += pulse.speed * dt;
        if (pulse.t > 1) {
          pulse.edgeIdx = edges.length > 0 ? Math.floor(rand(0, edges.length)) : 0;
          pulse.t = 0;
          pulse.speed = rand(0.35, 0.9);
        }
      }

      drawEdges(time);
      drawPulses();
      drawNodes(time);

      rafRef.current = window.requestAnimationFrame(step);
    }

    function onMouseMove(e: MouseEvent) {
      const rect = canvasEl.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
      mouseRef.current.active = true;
    }
    function onMouseLeave() {
      mouseRef.current.active = false;
    }

    const parent = canvasEl.parentElement;
    resize();
    rafRef.current = window.requestAnimationFrame(step);

    window.addEventListener("resize", resize);
    parent?.addEventListener("mousemove", onMouseMove);
    parent?.addEventListener("mouseleave", onMouseLeave);

    return () => {
      window.removeEventListener("resize", resize);
      parent?.removeEventListener("mousemove", onMouseMove);
      parent?.removeEventListener("mouseleave", onMouseLeave);
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return <canvas ref={canvasRef} className="h-full w-full" aria-hidden="true" />;
}
