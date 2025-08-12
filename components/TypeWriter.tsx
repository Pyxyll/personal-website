'use client'

import { useState, useEffect } from 'react'

interface TypeWriterProps {
  text: string
  delay?: number
  className?: string
  style?: React.CSSProperties
  onComplete?: () => void
}

export default function TypeWriter({ text, delay = 50, className = '', style, onComplete }: TypeWriterProps) {
  const [displayedText, setDisplayedText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, delay)
      return () => clearTimeout(timer)
    } else if (onComplete) {
      onComplete()
    }
  }, [currentIndex, delay, text, onComplete])

  return (
    <span className={className} style={style}>
      {displayedText}
      {currentIndex < text.length && <span className="terminal-cursor" />}
    </span>
  )
}