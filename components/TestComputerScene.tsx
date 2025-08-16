'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Box, Sphere } from '@react-three/drei'
import { useState } from 'react'

export default function TestComputerScene({ onBootComplete }: { onBootComplete: () => void }) {
  const [isPoweredOn, setIsPoweredOn] = useState(false)

  const handlePowerButton = () => {
    console.log('Power button clicked!')
    setIsPoweredOn(true)
    setTimeout(() => {
      onBootComplete()
    }, 2000)
  }

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#111' }}>
      <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
        <OrbitControls />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        
        {/* Desktop Computer - Simple Box */}
        <Box 
          position={[2, 0, 0]} 
          args={[1, 2, 1]}
          onClick={handlePowerButton}
        >
          <meshStandardMaterial color={isPoweredOn ? "#00ff00" : "#666"} />
        </Box>
        
        {/* Monitor - Simple Box */}
        <Box position={[0, 1, 0]} args={[2, 1.5, 0.2]}>
          <meshStandardMaterial color="#333" />
        </Box>
        
        {/* Desk - Simple Plane */}
        <Box position={[0, -1, 0]} args={[5, 0.1, 3]}>
          <meshStandardMaterial color="#8B4513" />
        </Box>
        
        {/* Power Button indicator */}
        <Sphere position={[2.5, 0, 0]} args={[0.1]}>
          <meshStandardMaterial 
            color={isPoweredOn ? "#00ff00" : "#ff0000"} 
            emissive={isPoweredOn ? "#00ff00" : "#ff0000"}
            emissiveIntensity={isPoweredOn ? 1 : 0.2}
          />
        </Sphere>
      </Canvas>
      
      <div style={{ 
        position: 'absolute', 
        bottom: 20, 
        left: '50%', 
        transform: 'translateX(-50%)',
        color: 'white',
        fontSize: '14px',
        textAlign: 'center'
      }}>
        <div>Click the green/red sphere or the computer box to power on</div>
        <div style={{ marginTop: '10px' }}>
          Status: {isPoweredOn ? 'POWERED ON' : 'OFF'}
        </div>
      </div>
    </div>
  )
}