'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import TypeWriter from '@/components/TypeWriter'
import CRTScreen from '@/components/CRTScreen'

const ComputerScene = dynamic(() => import('@/components/ComputerScene'), { 
  ssr: false,
  loading: () => <div className="w-full h-screen bg-black flex items-center justify-center text-green-500">Loading 3D Scene...</div>
})

export default function Home() {
  const handleBootComplete = () => {
    // Boot sequence now happens on the CRT monitor
  }

  return <ComputerScene onBootComplete={handleBootComplete} />
}