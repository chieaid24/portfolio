"use client";

import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useTheme } from "next-themes";
import StarComponent from "./StarComponent";
import { useMoney } from "@/lib/money-context";

function RotatingStars({ highlightHex, isLight }) {
  const groupRef = useRef(null);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    const rotationSpeedX = 0.01;
    const rotationSpeedY = -0.015;
    const rotationSpeedZ = -0.0;
    groupRef.current.rotation.x += rotationSpeedX * delta;
    groupRef.current.rotation.y += rotationSpeedY * delta;
    groupRef.current.rotation.z += rotationSpeedZ * delta;
  });

  return (
    <group ref={groupRef}>
      <StarComponent
        radius={100}
        depth={300}
        count={800}
        factor={5}
        saturation={0}
        fade={true}
        speed={0}
        color={isLight ? "#ffffff" : highlightHex || "#ff5e5e"}
        opacity={isLight ? 0.95 : 0.55}
        isLight={isLight}
      />
    </group>
  );
}

// exported
export default function StarBackground() {
  const { highlightHex } = useMoney();
  const { resolvedTheme } = useTheme();
  // Resolved theme is unknown during SSR; render the dark sky until mounted so
  // the server and first client paint match (no hydration mismatch), then switch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isLight = mounted && resolvedTheme === "light";

  // Light mode: leave the scene transparent so the blue "day sky" gradient on the
  // container shows through behind the stars. Dark mode: paint the near-black sky.
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 h-full"
      style={{
        background: isLight
          ? "linear-gradient(180deg, #c4e4fb 0%, #a3cef7 55%, #95c4ee 100%)"
          : "#02030a",
      }}
    >
      <Canvas camera={{ position: [0, 0, 300], fov: 60 }} dpr={[1, 2]}>
        {!isLight && <color attach="background" args={["#02030a"]} />}
        <ambientLight intensity={0.5} />
        <RotatingStars
          key={`${resolvedTheme}-${highlightHex}`}
          highlightHex={highlightHex}
          isLight={isLight}
        />
      </Canvas>
    </div>
  );
}
