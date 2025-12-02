"use client";

import { useMemo } from "react";
import * as THREE from "three";

export function lightenHexColor(hex, amount = 0.2) {
  const safeAmt = Math.min(Math.max(amount, 0), 1);
  try {
    const base = new THREE.Color(hex);
    const white = new THREE.Color(0xffffff);
    const mixed = base.clone().lerp(white, safeAmt);
    return `#${mixed.getHexString()}`;
  } catch {
    return hex;
  }
}

function createStarTexture() {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d");

  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  );

  gradient.addColorStop(0, "white");
  gradient.addColorStop(0.3, "white");
  gradient.addColorStop(1, "transparent");

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ctx.fill();

  return new THREE.CanvasTexture(canvas);
}

export default function CustomStarComponent({
  radius = 100,
  depth = 50,
  count = 500,
  factor = 1,
  saturation = 0,
  fade = false,
  speed = 0,
  color = "#ffffff",
  opacity = 0.4,
}) {
  const texture = useMemo(() => createStarTexture(), []);

  const { positions, colors, sizes } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    const targetColor = new THREE.Color(color);

    for (let i = 0; i < count; i++) {
      // Spherical shell distribution (like <Stars/>)
      const r = radius + Math.random() * depth;

      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Random shade between white + targetColor
      const t = Math.random();
      const mixed = new THREE.Color().lerpColors(
        new THREE.Color(lightenHexColor(targetColor)),
        targetColor,
        t,
      );

      colors[i * 3] = mixed.r;
      colors[i * 3 + 1] = mixed.g;
      colors[i * 3 + 2] = mixed.b;

      // Random size (like <Stars/>)
      sizes[i] = (Math.random() * 0.5 + 0.5) * factor;
    }

    return { positions, colors, sizes };
  }, [radius, depth, count, factor, color]);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          itemSize={3}
          count={positions.length / 3}
        />
        <bufferAttribute
          attach="attributes-color"
          array={colors}
          itemSize={3}
          count={colors.length / 3}
        />
      </bufferGeometry>

      <pointsMaterial
        size={factor}
        map={texture}
        alphaMap={texture}
        transparent
        opacity={opacity}
        depthWrite={false}
        vertexColors
        sizeAttenuation={fade}
      />
    </points>
  );
}
