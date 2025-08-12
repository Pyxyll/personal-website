'use client'

import Terminal from '../Terminal'
import { useState } from 'react'

interface Experience {
  title: string
  company: string
  period: string
  description: string[]
}

interface Education {
  degree: string
  institution: string
  period: string
}

const experiences: Experience[] = [
  {
    title: 'Senior Software Engineer',
    company: 'Tech Corp',
    period: '2021 - Present',
    description: [
      'Led development of microservices architecture',
      'Implemented CI/CD pipelines reducing deployment time by 60%',
      'Mentored junior developers and conducted code reviews'
    ]
  },
  {
    title: 'Full Stack Developer',
    company: 'StartUp Inc',
    period: '2019 - 2021',
    description: [
      'Built RESTful APIs using Node.js and Express',
      'Developed React applications with Redux state management',
      'Optimized database queries improving performance by 40%'
    ]
  }
]

const education: Education[] = [
  {
    degree: 'Bachelor of Computer Science',
    institution: 'University of Technology',
    period: '2015 - 2019'
  }
]

const skills = {
  languages: ['JavaScript', 'TypeScript', 'Python', 'Go', 'Rust'],
  frontend: ['React', 'Next.js', 'Vue', 'Tailwind CSS'],
  backend: ['Node.js', 'Express', 'Django', 'PostgreSQL', 'MongoDB'],
  tools: ['Git', 'Docker', 'Kubernetes', 'AWS', 'CI/CD']
}

export default function CVSection() {
  const [activeTab, setActiveTab] = useState<'experience' | 'education' | 'skills'>('experience')

  return (
    <Terminal title="resume" className="w-full">
      <div className="space-y-4">
        <div className="terminal-prompt">resume</div>
        
        <div className="flex gap-1 p-1 bg-neutral-800 rounded-lg">
          {(['experience', 'education', 'skills'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm rounded-md transition-all flex-1 font-medium ${
                activeTab === tab 
                  ? 'bg-blue-500 text-white' 
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'experience' && (
          <div className="space-y-6">
            {experiences.map((exp, index) => (
              <div key={index} className="border-l-2 border-blue-500/30 pl-4 hover:border-blue-400 transition-colors">
                <h3 className="text-blue-400 font-bold">{exp.title}</h3>
                <div className="text-neutral-500 text-sm mb-2">
                  <span>{exp.company}</span>
                  <span className="mx-2 text-neutral-600">•</span>
                  <span>{exp.period}</span>
                </div>
                <ul className="space-y-1">
                  {exp.description.map((desc, i) => (
                    <li key={i} className="text-neutral-400 text-sm">
                      <span className="text-blue-400/60 mr-2">▸</span>
                      {desc}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'education' && (
          <div className="space-y-4">
            {education.map((edu, index) => (
              <div key={index} className="border-l-2 border-purple-500/30 pl-4 hover:border-purple-400 transition-colors">
                <h3 className="text-purple-400 font-bold">{edu.degree}</h3>
                <div className="text-neutral-500 text-sm">
                  <span>{edu.institution}</span>
                  <span className="mx-2 text-neutral-600">•</span>
                  <span>{edu.period}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="space-y-4">
            {Object.entries(skills).map(([category, items]) => (
              <div key={category}>
                <h4 className="text-blue-400 font-bold mb-2 capitalize">{category}:</h4>
                <div className="flex flex-wrap gap-2">
                  {items.map((skill) => (
                    <span 
                      key={skill}
                      className="px-3 py-1.5 text-xs rounded-full bg-neutral-800 text-neutral-300 hover:bg-blue-500/20 hover:text-blue-400 transition-all cursor-default"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-neutral-700">
          <button className="terminal-button text-sm">
            <span className="mr-2">↓</span> Download Resume
          </button>
        </div>
      </div>
    </Terminal>
  )
}