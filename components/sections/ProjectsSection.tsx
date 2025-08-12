'use client'

import Terminal from '../Terminal'
import { useState } from 'react'

interface Project {
  name: string
  description: string
  tech: string[]
  github?: string
  demo?: string
  status: 'completed' | 'in-progress' | 'planned'
}

const projects: Project[] = [
  {
    name: 'E-Commerce Platform',
    description: 'Full-stack e-commerce solution with payment integration',
    tech: ['Next.js', 'Node.js', 'PostgreSQL', 'Stripe'],
    github: 'https://github.com/username/ecommerce',
    demo: 'https://demo.example.com',
    status: 'completed'
  },
  {
    name: 'Task Management CLI',
    description: 'Terminal-based task manager with advanced filtering',
    tech: ['Rust', 'SQLite'],
    github: 'https://github.com/username/task-cli',
    status: 'completed'
  },
  {
    name: 'Real-time Chat App',
    description: 'WebSocket-based chat application with rooms',
    tech: ['React', 'Socket.io', 'Express', 'MongoDB'],
    github: 'https://github.com/username/chat-app',
    demo: 'https://chat.example.com',
    status: 'completed'
  },
  {
    name: 'Machine Learning Dashboard',
    description: 'Interactive dashboard for ML model monitoring',
    tech: ['Python', 'FastAPI', 'React', 'TensorFlow'],
    github: 'https://github.com/username/ml-dashboard',
    status: 'in-progress'
  },
  {
    name: 'Blockchain Voting System',
    description: 'Decentralized voting platform using smart contracts',
    tech: ['Solidity', 'Web3.js', 'React'],
    status: 'planned'
  }
]

export default function ProjectsSection() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [filter, setFilter] = useState<'all' | 'completed' | 'in-progress' | 'planned'>('all')

  const filteredProjects = projects.filter(
    project => filter === 'all' || project.status === filter
  )

  const getStatusColor = (status: Project['status']) => {
    switch(status) {
      case 'completed': return 'text-green-400'
      case 'in-progress': return 'text-yellow-400'
      case 'planned': return 'text-cyan-400'
    }
  }

  const getStatusIcon = (status: Project['status']) => {
    switch(status) {
      case 'completed': return '✓'
      case 'in-progress': return '◊'
      case 'planned': return '○'
    }
  }

  return (
    <Terminal title="projects" className="w-full">
      <div className="space-y-4">
        <div className="terminal-prompt">ls -la ./projects --filter={filter}</div>
        
        <div className="flex gap-2 mb-4">
          {(['all', 'completed', 'in-progress', 'planned'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 text-xs border transition-all ${
                filter === f
                  ? 'border-cyan-400 bg-cyan-400/10 text-cyan-400'
                  : 'border-green-500/30 text-green-400/60 hover:text-green-400 hover:border-green-400'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filteredProjects.map((project, index) => (
            <div
              key={index}
              className={`border p-3 cursor-pointer transition-all ${
                selectedProject?.name === project.name
                  ? 'border-cyan-400 bg-cyan-400/5'
                  : 'border-green-500/30 hover:border-green-400 hover:bg-green-500/5'
              }`}
              onClick={() => setSelectedProject(project)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={getStatusColor(project.status)}>
                    {getStatusIcon(project.status)}
                  </span>
                  <h3 className="text-cyan-400 font-bold">{project.name}</h3>
                </div>
                <span className={`text-xs ${getStatusColor(project.status)}`}>
                  [{project.status}]
                </span>
              </div>
              
              <p className="text-green-400/70 text-sm mb-3">{project.description}</p>
              
              <div className="flex flex-wrap gap-1 mb-3">
                {project.tech.map((tech) => (
                  <span 
                    key={tech}
                    className="px-2 py-1 text-xs rounded bg-neutral-800 text-neutral-300"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {(project.github || project.demo) && (
                <div className="flex gap-3 text-xs">
                  {project.github && (
                    <a 
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="terminal-link"
                      onClick={(e) => e.stopPropagation()}
                    >
                      [GitHub]
                    </a>
                  )}
                  {project.demo && (
                    <a 
                      href={project.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="terminal-link"
                      onClick={(e) => e.stopPropagation()}
                    >
                      [Live Demo]
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-green-500/20">
          <span className="text-cyan-400 text-xs">
            Total projects: {projects.length} | 
            Completed: {projects.filter(p => p.status === 'completed').length} | 
            In Progress: {projects.filter(p => p.status === 'in-progress').length}
          </span>
        </div>
      </div>
    </Terminal>
  )
}