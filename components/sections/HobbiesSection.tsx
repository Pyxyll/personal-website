'use client'

import Terminal from '../Terminal'
import { useState } from 'react'

interface Hobby {
  name: string
  icon: string
  description: string
  level: number
}

const hobbies: Hobby[] = [
  {
    name: 'Gaming',
    icon: '🎮',
    description: 'PC gaming, strategy games, and indie titles',
    level: 85
  },
  {
    name: 'Photography',
    icon: '📷',
    description: 'Landscape and street photography',
    level: 70
  },
  {
    name: 'Music',
    icon: '🎵',
    description: 'Playing guitar and music production',
    level: 60
  },
  {
    name: 'Reading',
    icon: '📚',
    description: 'Sci-fi, technology, and philosophy books',
    level: 90
  },
  {
    name: 'Hiking',
    icon: '🥾',
    description: 'Exploring trails and nature',
    level: 75
  },
  {
    name: 'Cooking',
    icon: '👨‍🍳',
    description: 'Experimenting with international cuisines',
    level: 65
  }
]

export default function HobbiesSection() {
  const [selectedHobby, setSelectedHobby] = useState<Hobby | null>(null)

  const getProgressBar = (level: number) => {
    const filled = Math.floor(level / 5)
    const empty = 20 - filled
    return `[${'█'.repeat(filled)}${'-'.repeat(empty)}] ${level}%`
  }

  return (
    <Terminal title="interests" className="w-full">
      <div className="space-y-4">
        <div className="terminal-prompt">interests</div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {hobbies.map((hobby) => (
            <button
              key={hobby.name}
              onClick={() => setSelectedHobby(hobby)}
              className={`text-left p-4 rounded-lg border transition-all ${
                selectedHobby?.name === hobby.name
                  ? 'border-blue-400 bg-blue-500/10'
                  : 'border-neutral-700 hover:border-neutral-600 hover:bg-neutral-800/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{hobby.icon}</span>
                <div className="flex-1">
                  <h3 className="text-neutral-200 font-bold mb-1">{hobby.name}</h3>
                  <p className="text-neutral-400 text-xs mb-2">{hobby.description}</p>
                  <div className="text-blue-400 text-xs font-mono">
                    {getProgressBar(hobby.level)}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {selectedHobby && (
          <div className="mt-4 p-4 rounded-lg border border-blue-400/30 bg-blue-500/10">
            <div className="text-blue-400 text-sm mb-2 font-mono">
              <span className="terminal-prompt">{selectedHobby.name.toLowerCase()}</span>
            </div>
            <p className="text-neutral-300 text-sm">
              {selectedHobby.description}. This is one of my favorite activities 
              with a proficiency level of {selectedHobby.level}%.
            </p>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-neutral-700">
          <span className="text-neutral-500 text-xs font-mono">
            Total interests: {hobbies.length} | Updated: {new Date().toLocaleDateString()}
          </span>
        </div>
      </div>
    </Terminal>
  )
}