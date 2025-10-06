'use client';

import { useState, useEffect } from "react"
import dynamic from 'next/dynamic';

const ModelViewer = dynamic(() => import('./ModelViewer'), {
  ssr: false,
});

export default function ModelSection({ modelPath = '/printed_tools/keyassembly03.glb' }) {

  return (
    <section className="flex flex-col items-center">
      <ModelViewer modelPath={modelPath} />
    </section>
  );
}