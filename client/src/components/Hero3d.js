import React, { useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Text, Float } from '@react-three/drei';

function InteractiveOrbitControls() {
  const controlsRef = useRef();
  const { camera, gl } = useThree();

  useFrame(({ mouse }) => {
    if (controlsRef.current) {
      const x = controlsRef.current.target.x + mouse.x * 0.1;
      const y = controlsRef.current.target.y + mouse.y * 0.1;
      controlsRef.current.target.set(x, y, 0);
      controlsRef.current.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableZoom={false}
      enablePan={false}
      autoRotate
      autoRotateSpeed={1.2}
      args={[camera, gl.domElement]}
    />
  );
}

export default function Hero3D() {
  return (
    <Canvas camera={{ position: [0, 0, 6], fov: 60 }}>
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={2} />
      <InteractiveOrbitControls />
      {/* other stuff */}
    </Canvas>
  );
}
