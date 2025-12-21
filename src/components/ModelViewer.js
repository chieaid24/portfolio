"use client";

import React, { useState, useEffect, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Center, useProgress } from "@react-three/drei";
import ArrowIcon from "@/icons/ArrowIcon";

function Model({ modelPath, visible }) {
  const { scene } = useGLTF(modelPath);
  return (
    <Center>
      <group
        scale={[0.12, 0.12, 0.12]}
        position={[0, -1.1, 0]}
        className={`transition-opacity duration-700 ${visible ? "opacity-100" : "opacity-0"}`}
      >
        <primitive object={scene} />
      </group>
    </Center>
  );
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)"); // Tailwind md breakpoint
    const handler = (e) => setIsMobile(e.matches);
    setIsMobile(mql.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return isMobile;
}

function LoaderBar() {
  const { progress, active } = useProgress();
  return (
    <div
      className={`absolute bottom-0 left-0 h-1 w-full bg-gray-100 transition-opacity duration-500 ${
        active ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className="h-full bg-gray-500 transition-all duration-200"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

export default function ModelViewer({
  modelPath = "/models/keyassembly03.glb",
}) {
  const [modelHovered, setModelHovered] = useState(false);
  const isMobile = useIsMobile();
  const showDescription = isMobile || modelHovered;

  const { active } = useProgress();

  // Preload the model
  React.useEffect(() => {
    useGLTF.preload(modelPath);
  }, [modelPath]);

  return (
    <div className="relative h-full w-full">
      {/* Model viewer - full width/height */}
      <div
        className="border-outline-gray relative h-[500px] w-full overflow-hidden rounded-lg border bg-gray-200 shadow-md"
        onMouseEnter={() => setModelHovered(true)}
        onMouseLeave={() => setModelHovered(false)}
      >
        <Canvas camera={{ position: [3.5, 3.5, 3.5], fov: 35 }}>
          <Suspense fallback={null}>
            {/* Lights */}
            <directionalLight
              position={[5, 5, 2]}
              intensity={1.2}
              castShadow={false}
            />
            <directionalLight
              position={[-3, 1, 4]}
              intensity={0.6}
              castShadow={false}
            />
            <directionalLight
              position={[-5, 5, -2]}
              intensity={0.4}
              castShadow={false}
            />
            <directionalLight
              position={[0, 0, -5]}
              intensity={0.3}
              castShadow={false}
            />
            <directionalLight
              position={[0, 10, 0]}
              intensity={0.4}
              castShadow={false}
            />
            <ambientLight intensity={0.3} />

            {/* Model with fade-in */}
            <Model modelPath={modelPath} visible={!active} />
            <OrbitControls
              enablePan={false}
              enableZoom={false}
              minDistance={2}
              maxDistance={10}
            />
          </Suspense>
        </Canvas>

        {/* Loading bar */}
        <LoaderBar />
      </div>

      {/* Description */}
      <div>
        <p
          className={`text-outline-gray text-md pt-1.5 font-medium italic transition-opacity ease-in-out ${
            showDescription
              ? "opacity-100 duration-200"
              : "opacity-0 duration-200"
          }`}
        ></p>
      </div>
    </div>
  );
}
