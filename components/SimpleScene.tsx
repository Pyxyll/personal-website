'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Box } from '@react-three/drei'

export default function SimpleScene() {
  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#222' }}>
      <Canvas>
        <OrbitControls />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Box position={[0, 0, 0]} args={[2, 2, 2]}>
          <meshStandardMaterial color="orange" />
        </Box>
      </Canvas>
    </div>
  )
}