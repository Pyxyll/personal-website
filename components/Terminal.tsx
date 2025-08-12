'use client'

import { useState, ReactNode } from 'react'

interface TerminalProps {
  title?: string
  children: ReactNode
  className?: string
}

export default function Terminal({ title = 'terminal', children, className = '' }: TerminalProps) {
  const [isMaximized, setIsMaximized] = useState(false)

  return (
    <div className={`terminal-window relative z-10 ${isMaximized ? 'fixed inset-4 z-50' : ''} ${className}`}>
      <div className="terminal-header">
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            <button 
              className="w-3 h-3 rounded-full bg-neutral-600 hover:bg-red-500 transition-colors"
              aria-label="Close"
            />
            <button 
              className="w-3 h-3 rounded-full bg-neutral-600 hover:bg-yellow-500 transition-colors"
              aria-label="Minimize"
            />
            <button 
              className="w-3 h-3 rounded-full bg-neutral-600 hover:bg-green-500 transition-colors"
              onClick={() => setIsMaximized(!isMaximized)}
              aria-label="Maximize"
            />
          </div>
          <span className="text-sm font-medium text-neutral-400">{title}</span>
        </div>
        <span className="text-xs text-neutral-500">{new Date().toLocaleTimeString()}</span>
      </div>
      <div className="p-4 md:p-6 font-mono text-sm overflow-auto max-h-[calc(100vh-200px)]">
        {children}
      </div>
    </div>
  )
}