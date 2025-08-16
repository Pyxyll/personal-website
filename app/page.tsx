'use client'

import dynamic from 'next/dynamic'

const ComputerScene = dynamic(() => import('@/components/ComputerScene'), { 
  ssr: false,
  loading: () => <div className="w-full h-screen bg-black flex items-center justify-center text-green-500">Loading 3D Scene...</div>
})

export default function Home() {
  return <ComputerScene />
}