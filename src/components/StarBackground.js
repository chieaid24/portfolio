"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import StarComponent from "./StarComponent";
import { useMoney } from "@/lib/money-context";

function RotatingStars({ highlightHex }) {
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
        color={highlightHex || "#ff5e5e"}
        opacity={0.55}
      />
    </group>
  );
}

// exported
export default function StarBackground() {
  const { highlightHex } = useMoney();

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 h-full">
      <Canvas camera={{ position: [0, 0, 300], fov: 60 }} dpr={[1, 2]}>
        <color attach="background" args={["#02030a"]} />
        <ambientLight intensity={0.5} />
        <RotatingStars key={highlightHex} highlightHex={highlightHex} />
      </Canvas>
    </div>
  );
}
