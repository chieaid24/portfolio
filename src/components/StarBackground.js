"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import CustomStarComponent from "./StarComponent";

function RotatingStars() {
  const groupRef = useRef(null);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    const rotationSpeedX = 0.007;
    const rotationSpeedY = -0.01;
    const rotationSpeedZ = -0.007;
    groupRef.current.rotation.x += rotationSpeedX * delta;
    groupRef.current.rotation.y += rotationSpeedY * delta;
    groupRef.current.rotation.z += rotationSpeedZ * delta;
  });

  return (
    <group ref={groupRef}>
      <CustomStarComponent
        radius={100}
        depth={300}
        count={1500}
        factor={5}
        saturation={0}
        fade={true}
        speed={0}
        color="#ff5e5e"
        opacity={0.4}
      />
    </group>
  );
}

// exported
export default function StarBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <Canvas camera={{ position: [0, 0, 250], fov: 60 }} dpr={[1, 2]}>
        <color attach="background" args={["#02030a"]} />
        <ambientLight intensity={0.5} />
        <RotatingStars />
      </Canvas>
    </div>
  );
}
