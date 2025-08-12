'use client'

import Terminal from '../Terminal'
import { useState } from 'react'

interface ContactInfo {
  platform: string
  value: string
  link?: string
  icon: string
}

const contactInfo: ContactInfo[] = [
  {
    platform: 'Email',
    value: 'your.email@example.com',
    link: 'mailto:your.email@example.com',
    icon: '📧'
  },
  {
    platform: 'GitHub',
    value: 'github.com/yourusername',
    link: 'https://github.com/yourusername',
    icon: '🐙'
  },
  {
    platform: 'LinkedIn',
    value: 'linkedin.com/in/yourprofile',
    link: 'https://linkedin.com/in/yourprofile',
    icon: '💼'
  },
  {
    platform: 'Twitter',
    value: '@yourusername',
    link: 'https://twitter.com/yourusername',
    icon: '🐦'
  }
]

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitStatus('success')
      setFormData({ name: '', email: '', message: '' })
      
      setTimeout(() => {
        setSubmitStatus('idle')
      }, 3000)
    }, 1500)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <Terminal title="contact" className="w-full">
      <div className="space-y-6">
        <div className="terminal-prompt">contact</div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-blue-400 font-bold mb-4">Connect With Me</h3>
            <div className="space-y-3">
              {contactInfo.map((contact) => (
                <div key={contact.platform} className="flex items-center gap-3">
                  <span className="text-2xl">{contact.icon}</span>
                  <div className="flex-1">
                    <div className="text-neutral-500 text-xs">{contact.platform}</div>
                    {contact.link ? (
                      <a 
                        href={contact.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="terminal-link text-sm"
                      >
                        {contact.value}
                      </a>
                    ) : (
                      <span className="text-neutral-300 text-sm">{contact.value}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-lg border border-blue-500/20 bg-blue-500/10">
              <div className="text-blue-400 text-xs mb-2 font-mono">STATUS:</div>
              <p className="text-neutral-300 text-sm">
                Feel free to reach out for collaborations, opportunities, or just to say hello!
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-blue-400 font-bold mb-4">Send Message</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-neutral-400 text-xs block mb-1 font-mono">
                  NAME:
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 text-neutral-200 text-sm focus:outline-none focus:border-blue-400 transition-colors rounded"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="text-neutral-400 text-xs block mb-1 font-mono">
                  EMAIL:
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 text-neutral-200 text-sm focus:outline-none focus:border-blue-400 transition-colors rounded"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="text-neutral-400 text-xs block mb-1 font-mono">
                  MESSAGE:
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 text-neutral-200 text-sm focus:outline-none focus:border-blue-400 transition-colors resize-none rounded"
                  placeholder="Your message here..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="terminal-button w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
                {isSubmitting && <span className="terminal-cursor ml-2" />}
              </button>

              {submitStatus === 'success' && (
                <div className="text-green-400 text-sm text-center">
                  ✓ Message sent successfully!
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="text-red-400 text-sm text-center">
                  ✗ Failed to send message. Please try again.
                </div>
              )}
            </form>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-neutral-700">
          <span className="text-neutral-500 text-xs font-mono">
            Response time: ~24 hours | Preferred: Email
          </span>
        </div>
      </div>
    </Terminal>
  )
}