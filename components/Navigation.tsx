'use client'

import { useState } from 'react'

interface NavItem {
  label: string
  command: string
  section: string
}

const navItems: NavItem[] = [
  { label: 'About', command: 'about', section: 'about' },
  { label: 'Resume', command: 'resume', section: 'cv' },
  { label: 'Projects', command: 'projects', section: 'projects' },
  { label: 'Interests', command: 'interests', section: 'hobbies' },
  { label: 'Contact', command: 'contact', section: 'contact' },
]

interface NavigationProps {
  onNavigate: (section: string) => void
}

export default function Navigation({ onNavigate }: NavigationProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState<string>('about')

  const handleNavigate = (section: string) => {
    setActiveSection(section)
    onNavigate(section)
  }

  return (
    <nav className="h-full">
      <div className="space-y-1 p-2">
        {navItems.map((item) => (
          <button
            key={item.section}
            onClick={() => handleNavigate(item.section)}
            onMouseEnter={() => setHoveredItem(item.section)}
            onMouseLeave={() => setHoveredItem(null)}
            className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 group ${
              activeSection === item.section
                ? 'bg-blue-500/20 text-blue-400 border-l-2 border-blue-400'
                : 'hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <span className={`text-xs font-mono ${
              activeSection === item.section ? 'text-blue-400' : 'text-neutral-500'
            }`}>
              ▸
            </span>
            <div className="flex-1">
              <div className={`text-xs font-mono mb-0.5 ${
                activeSection === item.section ? 'text-blue-400/80' : 'text-neutral-500'
              }`}>
                {item.command}
              </div>
              <div className="text-sm font-medium">
                {item.label}
              </div>
            </div>
            {hoveredItem === item.section && activeSection !== item.section && (
              <span className="terminal-cursor" />
            )}
          </button>
        ))}
      </div>
    </nav>
  )
}