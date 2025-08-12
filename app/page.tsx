'use client'

import { useState, useEffect } from 'react'
import TypeWriter from '@/components/TypeWriter'

export default function Home() {
  const [showContent, setShowContent] = useState(false)
  const [bootSequence, setBootSequence] = useState(true)
  const [bootMessages, setBootMessages] = useState<string[]>([])
  const [currentBootIndex, setCurrentBootIndex] = useState(0)
  const [showStatusCommand, setShowStatusCommand] = useState(false)
  const [showStatusOutput, setShowStatusOutput] = useState(false)
  const [showContactCommand, setShowContactCommand] = useState(false)
  const [showContactOutput, setShowContactOutput] = useState(false)

  const bootSequenceMessages = [
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
  ]

  useEffect(() => {
    if (bootSequence && currentBootIndex < bootSequenceMessages.length) {
      const delay = currentBootIndex === 0 ? 300 : Math.random() * 100 + 50
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
          // Start the command sequence
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

  return (
    <div className="min-h-screen font-mono" style={{ backgroundColor: 'var(--ctp-base)' }}>
      <div className="h-screen m-4 p-6 border-2 border-solid" style={{ 
        color: 'var(--ctp-text)',
        borderColor: 'var(--ctp-surface0)'
      }}>
      {bootSequence ? (
        <div className="space-y-1 text-sm h-full overflow-y-auto">
          <div className="mb-2" style={{ color: 'var(--ctp-sapphire)' }}>
            Dylan Collins v5.0.1 (Linux kernel 6.5.0-portfolio)
          </div>
          <div className="mb-4" style={{ color: 'var(--ctp-subtext1)' }}>
            Copyright (c) 2025 Dylan Collins. All rights reserved.
          </div>
          
          {bootMessages.map((message, index) => (
            <div 
              key={index} 
              className="font-mono"
              style={{ 
                color: message.includes('[  OK  ]') ? 'var(--ctp-green)' : 
                       message.includes('Loading') ? 'var(--ctp-yellow)' :
                       message.includes('ready') ? 'var(--ctp-mauve)' :
                       'var(--ctp-subtext0)' 
              }}
            >
              {message}
            </div>
          ))}
          
          {currentBootIndex < bootSequenceMessages.length && (
            <div className="flex items-center mt-2">
              <span style={{ color: 'var(--ctp-yellow)' }}>●</span>
              <span className="ml-2 text-sm" style={{ color: 'var(--ctp-subtext1)' }}>
                Initializing...
              </span>
            </div>
          )}
        </div>
      ) : !showContent ? (
        <div className="flex items-center space-x-2">
          <span style={{ color: 'var(--ctp-green)' }}>user@portfolio</span>
          <span style={{ color: 'var(--ctp-text)' }}>:</span>
          <span style={{ color: 'var(--ctp-blue)' }}>~</span>
          <span style={{ color: 'var(--ctp-text)' }}>$ </span>
          <span className="terminal-cursor"></span>
        </div>
      ) : (
        <div className={`transition-opacity duration-1000 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
          <div className="mb-2 text-sm" style={{ color: 'var(--ctp-sapphire)' }}>
            Portfolio OS 2.0.1 LTS (GNU/Linux 6.5.0-portfolio x86_64)
          </div>
          <div className="mb-6 text-xs" style={{ color: 'var(--ctp-subtext1)' }}>
            Last login: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()} from 127.0.0.1
          </div>

          {showStatusCommand && (
            <div className="mb-2">
              <span style={{ color: 'var(--ctp-green)' }}>user@portfolio</span>
              <span style={{ color: 'var(--ctp-text)' }}>:</span>
              <span style={{ color: 'var(--ctp-blue)' }}>~</span>
              <span style={{ color: 'var(--ctp-text)' }}>$ </span>
              <TypeWriter 
                text="status" 
                style={{ color: 'var(--ctp-text)' }}
                delay={100}
              />
            </div>
          )}
          
          {showStatusOutput && (
            <div className="mb-6 text-sm" style={{ color: 'var(--ctp-mauve)' }}>
              Something cool is on the way
            </div>
          )}

          {showContactCommand && (
            <div className="mb-2">
              <span style={{ color: 'var(--ctp-green)' }}>user@portfolio</span>
              <span style={{ color: 'var(--ctp-text)' }}>:</span>
              <span style={{ color: 'var(--ctp-blue)' }}>~</span>
              <span style={{ color: 'var(--ctp-text)' }}>$ </span>
              <TypeWriter 
                text="./contact" 
                style={{ color: 'var(--ctp-text)' }}
                delay={100}
              />
            </div>
          )}
          
          {showContactOutput && (
            <div className="mb-6 text-sm">
              <a 
                href="mailto:dylan@dylancollins.me"
                style={{ color: 'var(--ctp-sapphire)' }}
                className="hover:underline"
              >
                dylan@dylancollins.me
              </a>
            </div>
          )}

          {showContactOutput && (
            <div className="flex">
              <span style={{ color: 'var(--ctp-green)' }}>user@portfolio</span>
              <span style={{ color: 'var(--ctp-text)' }}>:</span>
              <span style={{ color: 'var(--ctp-blue)' }}>~</span>
              <span style={{ color: 'var(--ctp-text)' }}>$ </span>
              <span className="terminal-cursor"></span>
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
}
