'use client'

import Terminal from '../Terminal'
import TypeWriter from '../TypeWriter'

export default function AboutSection() {
  return (
    <Terminal title="about">
      <div className="space-y-6">
        <div className="terminal-prompt">about</div>
        <TypeWriter 
          text="Hello! I'm a passionate developer who loves building innovative solutions."
          className="block text-neutral-200 text-lg"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="p-4 rounded-lg bg-neutral-800/50 border border-neutral-700">
            <h3 className="text-blue-400 font-semibold mb-2">Skills</h3>
            <p className="text-neutral-400 text-sm">Full-stack development with modern frameworks</p>
          </div>
          <div className="p-4 rounded-lg bg-neutral-800/50 border border-neutral-700">
            <h3 className="text-purple-400 font-semibold mb-2">Focus</h3>
            <p className="text-neutral-400 text-sm">Creating scalable, user-friendly applications</p>
          </div>
          <div className="p-4 rounded-lg bg-neutral-800/50 border border-neutral-700">
            <h3 className="text-pink-400 font-semibold mb-2">Passion</h3>
            <p className="text-neutral-400 text-sm">Open source contribution and innovation</p>
          </div>
          <div className="p-4 rounded-lg bg-neutral-800/50 border border-neutral-700">
            <h3 className="text-yellow-400 font-semibold mb-2">Learning</h3>
            <p className="text-neutral-400 text-sm">Always exploring emerging technologies</p>
          </div>
        </div>
        <div className="mt-6 pt-4 border-t border-neutral-700">
          <span className="text-neutral-500 text-xs font-mono">
            Last updated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>
    </Terminal>
  )
}