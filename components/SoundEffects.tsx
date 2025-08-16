'use client'

import { useEffect, useRef } from 'react'

export function useSoundEffect() {
  const audioContextRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  const playPowerButtonSound = () => {
    if (!audioContextRef.current) return

    const ctx = audioContextRef.current
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.frequency.value = 800
    oscillator.type = 'sine'
    
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.1)
  }

  const playCRTHum = () => {
    if (!audioContextRef.current) return

    const ctx = audioContextRef.current
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    const filter = ctx.createBiquadFilter()

    oscillator.connect(filter)
    filter.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.frequency.value = 15734 // CRT horizontal scan frequency
    oscillator.type = 'sawtooth'
    
    filter.type = 'lowpass'
    filter.frequency.value = 200
    
    gainNode.gain.setValueAtTime(0, ctx.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.02, ctx.currentTime + 0.5)

    oscillator.start(ctx.currentTime)
    
    return () => {
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2)
      setTimeout(() => oscillator.stop(), 200)
    }
  }

  const playCRTClick = () => {
    if (!audioContextRef.current) return

    const ctx = audioContextRef.current
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.frequency.value = 2500
    oscillator.type = 'square'
    
    gainNode.gain.setValueAtTime(0.4, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.02)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.02)
  }

  const playKeyPress = () => {
    if (!audioContextRef.current) return

    const ctx = audioContextRef.current
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.frequency.value = 1200 + Math.random() * 200
    oscillator.type = 'square'
    
    gainNode.gain.setValueAtTime(0.05, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.01)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.01)
  }

  return {
    playPowerButtonSound,
    playCRTHum,
    playCRTClick,
    playKeyPress
  }
}