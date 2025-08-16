'use client'

import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Box, Cylinder, Plane, Html } from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { Suspense, useRef, useState, useEffect, useMemo, useCallback } from 'react'
import * as THREE from 'three'
import { useSoundEffect } from './SoundEffects'

function CameraController({ 
  targetPosition, 
  targetLookAt, 
  animate, 
  onAnimationComplete, 
  controlsDisabled 
}: {
  targetPosition: THREE.Vector3 | null
  targetLookAt: THREE.Vector3 | null
  animate: boolean
  onAnimationComplete?: () => void
  controlsDisabled: boolean
}) {
  const { camera, gl } = useThree()
  const controlsRef = useRef<OrbitControlsImpl | null>(null)
  const animationRef = useRef<number | null>(null)
  const isAnimatingRef = useRef(false)

  useEffect(() => {
    if (animate && targetPosition && targetLookAt && controlsRef.current && !isAnimatingRef.current) {
      isAnimatingRef.current = true
      const controls = controlsRef.current
      const startPosition = camera.position.clone()
      const startTarget = controls.target.clone()
      
      let animationProgress = 0
      const animationDuration = 2000 // 2 seconds
      const startTime = performance.now()

      const animateCamera = (currentTime: number) => {
        const elapsed = currentTime - startTime
        animationProgress = Math.min(elapsed / animationDuration, 1)
        
        // Smooth easing function
        const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
        const smoothProgress = easeInOutCubic(animationProgress)
        
        // Interpolate camera position
        camera.position.lerpVectors(startPosition, targetPosition, smoothProgress)
        
        // Interpolate target position
        controls.target.lerpVectors(startTarget, targetLookAt, smoothProgress)
        controls.update()
        
        if (animationProgress < 1) {
          animationRef.current = requestAnimationFrame(animateCamera)
        } else {
          isAnimatingRef.current = false
          onAnimationComplete?.()
        }
      }
      
      animationRef.current = requestAnimationFrame(animateCamera)
      
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current)
          isAnimatingRef.current = false
        }
      }
    }
  }, [animate, targetPosition, targetLookAt, camera, gl, onAnimationComplete])

  return (
    <OrbitControls 
      ref={controlsRef}
      enablePan={false} 
      enableZoom={!controlsDisabled} 
      enableRotate={!controlsDisabled}
      minDistance={2}
      maxDistance={15}
      minPolarAngle={Math.PI / 4}
      maxPolarAngle={Math.PI / 2}
      target={[0, 0, 0]}
      enableDamping={true}
      dampingFactor={0.05}
    />
  )
}

function CRTMonitor({ 
  isPoweredOn, 
  showTerminal,
  bootSequence, 
  bootMessages, 
  currentBootIndex, 
  showContent, 
  showStatusCommand, 
  showStatusOutput, 
  showContactCommand, 
  showContactOutput,
  onMonitorClick 
}: { 
  isPoweredOn: boolean,
  showTerminal: boolean,
  bootSequence: boolean,
  bootMessages: string[],
  currentBootIndex: number,
  showContent: boolean,
  showStatusCommand: boolean,
  showStatusOutput: boolean,
  showContactCommand: boolean,
  showContactOutput: boolean,
  onMonitorClick?: () => void
}) {
  return (
    <group position={[0, 1.5, 0]}>
      {/* Monitor case */}
      <Box 
        args={[2.5, 2, 2]} 
        castShadow
        onClick={isPoweredOn && onMonitorClick ? onMonitorClick : undefined}
        onPointerOver={isPoweredOn && onMonitorClick ? (e) => { e.stopPropagation(); document.body.style.cursor = 'pointer' } : undefined}
        onPointerOut={isPoweredOn && onMonitorClick ? (e) => { e.stopPropagation(); document.body.style.cursor = 'auto' } : undefined}
      >
        <meshStandardMaterial color="#888888" roughness={0.8} metalness={0.2} />
      </Box>
      
      {/* Monitor screen - visible when off OR when powered on but no terminal yet */}
      {(!isPoweredOn || (isPoweredOn && !showTerminal)) && (
        <Box args={[2, 1.5, 0.1]} position={[0, 0, 1.01]}>
          <meshStandardMaterial 
            color={isPoweredOn ? "#001100" : "#000000"}
            emissive={isPoweredOn ? "#00ff00" : "#000000"}
            emissiveIntensity={isPoweredOn ? 0.1 : 0}
            roughness={0.3}
          />
        </Box>
      )}

      {/* Screen content */}
      {showTerminal && (
        <Html
          transform
          position={[0, 0, 1.01]}
          occlude="blending"
          style={{
            width: '85px',
            height: '65px',
            backgroundColor: 'black',
            color: '#00ff00',
            fontFamily: 'monospace',
            fontSize: '2.5px',
            padding: '2px',
            overflow: 'hidden',
            border: '0.3px solid #00ff00',
            boxShadow: '0 0 2px #00ff00',
            transform: 'scale(1)',
            transformOrigin: 'center',
            imageRendering: 'pixelated',
            fontSmooth: 'never',
            WebkitFontSmoothing: 'none',
            textRendering: 'optimizeSpeed',
            backfaceVisibility: 'hidden'
          }}
        >
          {bootSequence ? (
            <div style={{ lineHeight: '1' }}>
              <div style={{ color: '#74c7ec', marginBottom: '1px', fontSize: '2.5px' }}>
                Dylan Collins v5.0.1 (Linux kernel 6.5.0-portfolio)
              </div>
              <div style={{ color: '#bac2de', marginBottom: '2px', fontSize: '2px' }}>
                Copyright (c) 2025 Dylan Collins. All rights reserved.
              </div>
              
              {bootMessages.map((message, index) => (
                <div 
                  key={index} 
                  style={{ 
                    color: message.includes('[  OK  ]') ? '#a6e3a1' : 
                           message.includes('Loading') ? '#f9e2af' :
                           message.includes('ready') ? '#cba6f7' :
                           '#a6adc8',
                    fontSize: '2px',
                    marginBottom: '0.1px'
                  }}
                >
                  {message}
                </div>
              ))}
              
              {currentBootIndex < bootMessages.length && (
                <div style={{ display: 'flex', alignItems: 'center', marginTop: '2px' }}>
                  <span style={{ color: '#f9e2af', fontSize: '2px' }}>●</span>
                  <span style={{ marginLeft: '1px', fontSize: '2px', color: '#bac2de' }}>
                    Initializing...
                  </span>
                </div>
              )}
            </div>
          ) : !showContent ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5px', fontSize: '2px' }}>
              <span style={{ color: '#a6e3a1' }}>user@portfolio</span>
              <span style={{ color: '#cdd6f4' }}>:</span>
              <span style={{ color: '#89b4fa' }}>~</span>
              <span style={{ color: '#cdd6f4' }}>$ </span>
              <span style={{ display: 'inline-block', width: '0.3px', height: '2.5px', backgroundColor: '#cba6f7' }}></span>
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: '1px', fontSize: '2.5px', color: '#74c7ec' }}>
                Portfolio OS 2.0.1 LTS (GNU/Linux 6.5.0-portfolio x86_64)
              </div>
              <div style={{ marginBottom: '2px', fontSize: '2px', color: '#bac2de' }}>
                Last login: {new Date().toLocaleDateString()} from 127.0.0.1
              </div>

              {showStatusCommand && (
                <div style={{ marginBottom: '1px', fontSize: '2px' }}>
                  <span style={{ color: '#a6e3a1' }}>user@portfolio</span>
                  <span style={{ color: '#cdd6f4' }}>:</span>
                  <span style={{ color: '#89b4fa' }}>~</span>
                  <span style={{ color: '#cdd6f4' }}>$ status</span>
                </div>
              )}
              
              {showStatusOutput && (
                <div style={{ marginBottom: '2px', fontSize: '2px', color: '#cba6f7' }}>
                  Something cool is on the way
                </div>
              )}

              {showContactCommand && (
                <div style={{ marginBottom: '1px', fontSize: '2px' }}>
                  <span style={{ color: '#a6e3a1' }}>user@portfolio</span>
                  <span style={{ color: '#cdd6f4' }}>:</span>
                  <span style={{ color: '#89b4fa' }}>~</span>
                  <span style={{ color: '#cdd6f4' }}>$ ./contact</span>
                </div>
              )}
              
              {showContactOutput && (
                <div style={{ marginBottom: '2px', fontSize: '2px' }}>
                  <a 
                    href="mailto:dylan@dylancollins.me"
                    style={{ color: '#74c7ec', textDecoration: 'none' }}
                  >
                    dylan@dylancollins.me
                  </a>
                </div>
              )}

              {showContactOutput && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5px', fontSize: '2px' }}>
                  <span style={{ color: '#a6e3a1' }}>user@portfolio</span>
                  <span style={{ color: '#cdd6f4' }}>:</span>
                  <span style={{ color: '#89b4fa' }}>~</span>
                  <span style={{ color: '#cdd6f4' }}>$ </span>
                  <span style={{ display: 'inline-block', width: '0.3px', height: '2.5px', backgroundColor: '#cba6f7' }}></span>
                </div>
              )}
            </div>
          )}
        </Html>
      )}

      {/* Monitor stand */}
      <Cylinder args={[0.4, 0.5, 0.4]} position={[0, -1.2, 0]} castShadow>
        <meshStandardMaterial color="#2a2a2a" roughness={0.8} metalness={0.2} />
      </Cylinder>
      
      {/* Monitor base */}
      <Cylinder args={[0.8, 0.8, 0.1]} position={[0, -1.4, 0]} castShadow>
        <meshStandardMaterial color="#2a2a2a" roughness={0.8} metalness={0.2} />
      </Cylinder>
    </group>
  )
}

function DesktopComputer({ onPowerButtonClick, isPoweredOn }: { onPowerButtonClick: () => void, isPoweredOn: boolean }) {
  return (
    <group position={[2.5, 0.5, 0]}>
      {/* Computer case */}
      <Box args={[1, 2, 2]} castShadow>
        <meshStandardMaterial color="#999999" roughness={0.9} metalness={0.1} />
      </Box>
      
      {/* Power button */}
      <group 
        position={[0.51, 0.5, 0.5]}
        onClick={onPowerButtonClick}
        onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer' }}
        onPointerOut={(e) => { e.stopPropagation(); document.body.style.cursor = 'auto' }}
      >
        <Cylinder args={[0.08, 0.08, 0.05]} rotation={[0, 0, Math.PI / 2]}>
          <meshStandardMaterial 
            color={isPoweredOn ? "#00ff00" : "#666666"}
            emissive={isPoweredOn ? "#00ff00" : "#000000"}
            emissiveIntensity={isPoweredOn ? 0.5 : 0}
            roughness={0.3}
          />
        </Cylinder>
      </group>

      {/* Power LED */}
      <Cylinder args={[0.02, 0.02, 0.05]} position={[0.51, 0.3, 0.5]} rotation={[0, 0, Math.PI / 2]}>
        <meshStandardMaterial 
          color={isPoweredOn ? "#00ff00" : "#111111"}
          emissive={isPoweredOn ? "#00ff00" : "#000000"}
          emissiveIntensity={isPoweredOn ? 2 : 0}
        />
      </Cylinder>

      {/* Ventilation grilles */}
      {[...Array(5)].map((_, i) => (
        <Box key={i} args={[0.02, 0.8, 0.15]} position={[0.51, 0, -0.5 + i * 0.25]}>
          <meshStandardMaterial color="#1a1a1a" />
        </Box>
      ))}
    </group>
  )
}

function Keyboard() {
  return (
    <group position={[0, 0.05, 2]} rotation={[0, 0, 0]}>
      {/* Keyboard base */}
      <Box args={[3, 0.1, 1]} castShadow receiveShadow>
        <meshStandardMaterial color="#666666" roughness={0.7} metalness={0.1} />
      </Box>
      
      {/* Keys grid - simplified */}
      {[...Array(5)].map((_, row) => 
        [...Array(14)].map((_, col) => (
          <Box 
            key={`${row}-${col}`} 
            args={[0.15, 0.05, 0.12]}
            position={[-1.3 + col * 0.2, 0.08, -0.3 + row * 0.15]}
            castShadow
          >
            <meshStandardMaterial color="#1a1a1a" roughness={0.6} />
          </Box>
        ))
      )}
    </group>
  )
}

function Mouse() {
  return (
    <group position={[-2, 0.05, 2]}>
      <Box args={[0.3, 0.1, 0.5]} castShadow>
        <meshStandardMaterial color="#666666" roughness={0.7} metalness={0.1} />
      </Box>
      {/* Mouse cable */}
      <Cylinder args={[0.02, 0.02, 0.6]} position={[0, 0, -0.3]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#1a1a1a" />
      </Cylinder>
    </group>
  )
}

function Desk() {
  return (
    <group>
      {/* Desktop surface */}
      <Box args={[8, 0.1, 4]} position={[0, 0, 0]} receiveShadow>
        <meshStandardMaterial color="#8B4513" roughness={0.8} metalness={0} />
      </Box>
      
      {/* Desk legs */}
      {[[-3, -2, -1.5], [3, -2, -1.5], [-3, -2, 1.5], [3, -2, 1.5]].map((pos, i) => (
        <Box key={i} args={[0.1, 4, 0.1]} position={pos as [number, number, number]} castShadow>
          <meshStandardMaterial color="#4a2c17" roughness={0.9} />
        </Box>
      ))}
    </group>
  )
}

function Room() {
  return (
    <group>
      {/* Floor */}
      <Plane args={[20, 20]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -4, 0]} receiveShadow>
        <meshStandardMaterial color="#4a4a48" roughness={0.9} />
      </Plane>
      
      {/* Back wall */}
      <Plane args={[20, 12]} position={[0, 2, -5]} receiveShadow>
        <meshStandardMaterial color="#5a5a58" roughness={0.9} />
      </Plane>
      
      {/* Side walls */}
      <Plane args={[20, 12]} position={[-10, 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <meshStandardMaterial color="#5a5a58" roughness={0.9} />
      </Plane>
      <Plane args={[20, 12]} position={[10, 2, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <meshStandardMaterial color="#5a5a58" roughness={0.9} />
      </Plane>
    </group>
  )
}

export default function ComputerScene() {
  const [isPoweredOn, setIsPoweredOn] = useState(false)
  const [bootSequence, setBootSequence] = useState(false)
  const [bootMessages, setBootMessages] = useState<string[]>([])
  const [currentBootIndex, setCurrentBootIndex] = useState(0)
  const [showContent, setShowContent] = useState(false)
  const [showStatusCommand, setShowStatusCommand] = useState(false)
  const [showStatusOutput, setShowStatusOutput] = useState(false)
  const [showContactCommand, setShowContactCommand] = useState(false)
  const [showContactOutput, setShowContactOutput] = useState(false)
  
  // Camera animation state
  const [animateCamera, setAnimateCamera] = useState(false)
  const [cameraTarget, setCameraTarget] = useState<THREE.Vector3 | null>(null)
  const [cameraLookAt, setCameraLookAt] = useState<THREE.Vector3 | null>(null)
  const [showTerminal, setShowTerminal] = useState(false)
  const [isTerminalFocused, setIsTerminalFocused] = useState(false)
  const [isZoomingOut, setIsZoomingOut] = useState(false)
  
  const { playPowerButtonSound, playCRTHum, playCRTClick } = useSoundEffect()
  const crtHumStopRef = useRef<(() => void) | null>(null)

  const bootSequenceMessages = useMemo(() => [
    "Loading kernel modules...",
    "[  OK  ] Started Load Kernel Modules",
    "[  OK  ] Started Remount Root and Kernel File Systems",
    "[  OK  ] Started Load/Save Random Seed",
    "[  OK  ] Started Create System Users",
    "[  OK  ] Started Create Static Device Nodes in /dev",
    "[  OK  ] Reached target Local File Systems (Pre)",
    "[  OK  ] Mounting /tmp...",
    "[  OK  ] Mounting /var/tmp...",
    "[  OK  ] Started File System Check on Root Device",
    "[  OK  ] Started udev Kernel Device Manager",
    "[  OK  ] Started Network Time Synchronization",
    "[  OK  ] Started Update UTMP about System Boot/Shutdown",
    "[  OK  ] Reached target System Time Set",
    "[  OK  ] Started Create Volatile Files and Directories",
    "[  OK  ] Started Network Manager",
    "[  OK  ] Started OpenSSH server daemon",
    "[  OK  ] Started Authorization Manager",
    "[  OK  ] Reached target Network",
    "[  OK  ] Reached target Network is Online",
    "[  OK  ] Started Docker Application Container Engine",
    "[  OK  ] Started Portfolio Application Service",
    "[  OK  ] Reached target Multi-User System",
    "Portfolio System v2.0.1 ready."
  ], [])

  const handlePowerButton = () => {
    playPowerButtonSound()
    
    if (!isPoweredOn) {
      // Power ON - First animate camera, then start boot sequence
      setIsPoweredOn(true)
      
      // Set camera target position (close to monitor, looking at screen)
      setCameraTarget(new THREE.Vector3(0, 1.5, 3))
      setCameraLookAt(new THREE.Vector3(0, 1.5, 0))
      setAnimateCamera(true)
      
      // Boot sequence will start when camera animation completes
    } else {
      // Power OFF - Animate camera back to overview
      setIsPoweredOn(false)
      setShowTerminal(false)
      setIsTerminalFocused(false)
      setIsZoomingOut(false)
      setBootSequence(false)
      setBootMessages([])
      setCurrentBootIndex(0)
      setShowContent(false)
      setShowStatusCommand(false)
      setShowStatusOutput(false)
      setShowContactCommand(false)
      setShowContactOutput(false)
      
      // Animate camera back to default position
      setCameraTarget(new THREE.Vector3(0, 3, 8))
      setCameraLookAt(new THREE.Vector3(0, 0, 0))
      setAnimateCamera(true)
      
      // Stop CRT hum
      if (crtHumStopRef.current) {
        crtHumStopRef.current()
        crtHumStopRef.current = null
      }
    }
  }

  const handleCameraAnimationComplete = () => {
    setAnimateCamera(false)
    
    if (isZoomingOut) {
      // Finished zooming out - unlock controls
      setIsTerminalFocused(false)
      setIsZoomingOut(false)
    } else if (isPoweredOn && !bootSequence && !showTerminal) {
      // Finished zooming in for first time - start terminal and lock controls
      setShowTerminal(true)
      setIsTerminalFocused(true)
      setTimeout(() => {
        playCRTClick()
        const stopHum = playCRTHum()
        if (stopHum) {
          crtHumStopRef.current = stopHum
        }
        setBootSequence(true)
      }, 500) // Small delay after camera stops
    } else if (isPoweredOn && showTerminal && !isTerminalFocused) {
      // Finished zooming back in after ESC - lock controls again
      setIsTerminalFocused(true)
    }
  }

  const handleEscapeToOverview = useCallback(() => {
    if (isTerminalFocused) {
      setIsZoomingOut(true)
      setCameraTarget(new THREE.Vector3(0, 3, 8))
      setCameraLookAt(new THREE.Vector3(0, 0, 0))
      setAnimateCamera(true)
    }
  }, [isTerminalFocused])

  const handleMonitorClick = () => {
    if (isPoweredOn && !isTerminalFocused && !animateCamera) {
      // Zoom back into terminal view
      setCameraTarget(new THREE.Vector3(0, 1.5, 3))
      setCameraLookAt(new THREE.Vector3(0, 1.5, 0))
      setAnimateCamera(true)
    }
  }

  // Boot sequence logic - optimized timing to reduce jitter
  useEffect(() => {
    if (bootSequence && currentBootIndex < bootSequenceMessages.length) {
      const delay = currentBootIndex === 0 ? 500 : 150 // More consistent timing
      const timer = setTimeout(() => {
        setBootMessages(prev => [...prev, bootSequenceMessages[currentBootIndex]])
        setCurrentBootIndex(prev => prev + 1)
      }, delay)
      return () => clearTimeout(timer)
    } else if (currentBootIndex >= bootSequenceMessages.length) {
      const finalTimer = setTimeout(() => {
        setBootSequence(false)
        setTimeout(() => {
          setShowContent(true)
          setTimeout(() => {
            setShowStatusCommand(true)
          }, 300)
        }, 100)
      }, 400)
      return () => clearTimeout(finalTimer)
    }
  }, [bootSequence, currentBootIndex, bootSequenceMessages])

  // Handle sequential command display
  useEffect(() => {
    if (showStatusCommand && !showStatusOutput) {
      const timer = setTimeout(() => {
        setShowStatusOutput(true)
        setTimeout(() => {
          setShowContactCommand(true)
        }, 1500)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [showStatusCommand, showStatusOutput])

  useEffect(() => {
    if (showContactCommand && !showContactOutput) {
      const timer = setTimeout(() => {
        setShowContactOutput(true)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [showContactCommand, showContactOutput])

  // ESC key handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleEscapeToOverview()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleEscapeToOverview])

  useEffect(() => {
    return () => {
      if (crtHumStopRef.current) {
        crtHumStopRef.current()
      }
    }
  }, [])

  return (
    <div className="w-full h-screen" style={{ backgroundColor: '#0a0a0a' }}>
      <Canvas 
        shadows 
        camera={{ position: [0, 3, 8], fov: 50 }}
        gl={{ antialias: true }}
      >
        <CameraController 
          targetPosition={cameraTarget}
          targetLookAt={cameraLookAt}
          animate={animateCamera}
          onAnimationComplete={handleCameraAnimationComplete}
          controlsDisabled={isTerminalFocused}
        />
        
        {/* Lighting */}
        <ambientLight intensity={isPoweredOn ? 0.7 : 0.6} color="#fff5e6" />
        
        {/* Main ceiling light - warm white */}
        <pointLight 
          position={[0, 5, 2]} 
          intensity={isPoweredOn ? 1.8 : 1.3} 
          color="#fff5e6"
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        
        {/* Desk lamp effect - warm yellow */}
        <pointLight 
          position={[-1, 3, 1]} 
          intensity={1.0} 
          color="#ffe4b5"
          distance={8}
        />
        
        {/* Room accent lighting */}
        <pointLight 
          position={[-4, 2, 3]} 
          intensity={0.6} 
          color="#ffeaa7"
        />
        <pointLight 
          position={[4, 2, 3]} 
          intensity={0.6} 
          color="#ffeaa7"
        />
        
        {/* Additional overhead light */}
        <pointLight 
          position={[0, 6, 0]} 
          intensity={0.8} 
          color="#fff8dc"
        />
        
        {/* Subtle back lighting */}
        <pointLight 
          position={[0, 1, -4]} 
          intensity={0.4} 
          color="#e6f3ff"
        />
        
        {/* Screen glow when powered on */}
        {isPoweredOn && (
          <pointLight 
            position={[0, 1.5, 2]} 
            intensity={0.3} 
            color="#00ff00"
            distance={5}
          />
        )}
        
        <Suspense fallback={null}>
          <Room />
          <Desk />
          <CRTMonitor 
            isPoweredOn={isPoweredOn}
            showTerminal={showTerminal}
            bootSequence={bootSequence}
            bootMessages={bootMessages}
            currentBootIndex={currentBootIndex}
            showContent={showContent}
            showStatusCommand={showStatusCommand}
            showStatusOutput={showStatusOutput}
            showContactCommand={showContactCommand}
            showContactOutput={showContactOutput}
            onMonitorClick={handleMonitorClick}
          />
          <DesktopComputer 
            onPowerButtonClick={handlePowerButton} 
            isPoweredOn={isPoweredOn}
          />
          <Keyboard />
          <Mouse />
        </Suspense>
      </Canvas>
      
      {!isPoweredOn && (
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-white text-sm opacity-75 animate-pulse">
          Click the power button on the computer to start
        </div>
      )}
      
      {isPoweredOn && !isTerminalFocused && (
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-white text-xs opacity-50">
          Click the power button again to shut down
        </div>
      )}
      
      {isTerminalFocused && (
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-white text-xs opacity-75">
          Press ESC to zoom out • Click power button to shut down
        </div>
      )}
    </div>
  )
}