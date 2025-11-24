"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import CustomStarComponent from "./CustomStarComponent";

// ===== Internal component: rotating starfield around its center pivot =====
function RotatingStars() {
  const groupRef = useRef(null);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    const rotationSpeedX = 0.005;
    const rotationSpeedY = -0.02;
    const rotationSpeedZ = -0.001;
    groupRef.current.rotation.x += rotationSpeedX * delta;
    groupRef.current.rotation.y += rotationSpeedY * delta;
    groupRef.current.rotation.z += rotationSpeedZ * delta;
  });

  return (
    <group ref={groupRef}>
      <CustomStarComponent
        radius={200} // how far stars spread from the center
        depth={500} // starfield thickness
        count={700} // 500 stars
        factor={20} // star size factor
        saturation={0} // white stars
        fade={true} // fade out at the edges
        speed={0} // no internal motion; we rotate manually
        color="#ff8080"
      />
    </group>
  );
}

// ===== Exported background component =====
export default function StarBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <Canvas camera={{ position: [0, 0, 550], fov: 30 }} dpr={[1, 2]}>
        {/* Space-like background color */}
        <color attach="background" args={["#02030a"]} />

        {/* Subtle lighting */}
        <ambientLight intensity={0.5} />

        <RotatingStars />
      </Canvas>
    </div>
  );
}
