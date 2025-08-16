'use client'

import { useEffect, useState } from 'react'
import styles from './CRTScreen.module.css'

interface CRTScreenProps {
  children: React.ReactNode
  isPoweredOn: boolean
}

export default function CRTScreen({ children, isPoweredOn }: CRTScreenProps) {
  const [isOn, setIsOn] = useState(false)

  useEffect(() => {
    if (isPoweredOn) {
      setTimeout(() => setIsOn(true), 500)
    } else {
      setIsOn(false)
    }
  }, [isPoweredOn])

  return (
    <div className={`${styles.crtContainer} ${isOn ? styles.on : ''}`}>
      <div className={styles.crtScreen}>
        <div className={styles.crtContent}>
          {children}
        </div>
        <div className={styles.crtScanlines}></div>
        <div className={styles.crtFlicker}></div>
      </div>
    </div>
  )
}