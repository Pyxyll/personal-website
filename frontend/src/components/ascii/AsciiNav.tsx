'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AsciiLogoSmall } from './AsciiLogo';

const navItems = [
  { href: '/', label: 'home' },
  { href: '/about', label: 'about' },
  { href: '/cv', label: 'cv' },
  { href: '/projects', label: 'projects' },
  { href: '/blog', label: 'blog' },
  { href: '/now', label: 'now' },
];

export function AsciiNav() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  return (
    <>
      <header className="border-b border-border py-4 mb-8 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <nav className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="no-underline hover:no-underline group">
              <AsciiLogoSmall className="text-xl group-hover:text-[var(--gradient-mid)] transition-colors duration-300" />
            </Link>

            {/* Desktop Navigation */}
            <ul className="hidden md:flex items-center gap-2">
              {navItems.map((item, index) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href} className="flex items-center">
                    {index > 0 && <span className="text-border mx-1">|</span>}
                    <Link
                      href={item.href}
                      className={`
                        px-2 py-1 transition-all duration-300 no-underline relative
                        ${isActive
                          ? 'text-[var(--gradient-mid)]'
                          : 'text-muted-foreground hover:text-[var(--gradient-mid)]'
                        }
                      `}
                    >
                      [{item.label}]
                      {isActive && (
                        <span className="absolute bottom-0 left-0 w-full h-[1px] bg-[var(--gradient-mid)]" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-muted-foreground hover:text-[var(--gradient-mid)] transition-colors duration-300 p-2"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
            >
              <pre className="text-sm leading-none font-mono" aria-hidden="true">
                {isMenuOpen ? '[x]' : '[=]'}
              </pre>
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`
          fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden
          transition-opacity duration-300
          ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        onClick={() => setIsMenuOpen(false)}
      />

      {/* Mobile Menu Panel */}
      <div
        className={`
          fixed top-0 right-0 h-full w-64 bg-card border-l border-border z-50 md:hidden
          transform transition-transform duration-300 ease-in-out
          ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="p-4 border-b border-border flex items-center justify-between">
          <span className="text-muted-foreground text-sm">navigation</span>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="text-muted-foreground hover:text-[var(--gradient-mid)] transition-colors duration-300"
            aria-label="Close menu"
          >
            <pre className="text-sm leading-none font-mono" aria-hidden="true">[x]</pre>
          </button>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`
                      block py-2 px-3 transition-all duration-300 no-underline
                      ${isActive
                        ? 'text-[var(--gradient-mid)] bg-[var(--gradient-mid)]/10'
                        : 'text-muted-foreground hover:text-[var(--gradient-mid)] hover:bg-[var(--gradient-mid)]/5'
                      }
                    `}
                  >
                    {isActive ? '>' : ' '} [{item.label}]
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="border-t border-border mt-4" />
        </nav>
      </div>
    </>
  );
}

export function AsciiFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border py-6 mt-12 bg-card">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/dylancollins"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--gradient-mid)] transition-colors duration-300 hover-underline"
            >
              [github]
            </a>
            <a
              href="https://www.linkedin.com/in/dylan-c-collins/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--gradient-mid)] transition-colors duration-300 hover-underline"
            >
              [linkedin]
            </a>
            <a
              href="mailto:hello@dylancollins.me"
              className="hover:text-[var(--gradient-mid)] transition-colors duration-300 hover-underline"
            >
              [email]
            </a>
          </div>
          <div className="text-muted-foreground">
            <span className="text-[var(--gradient-mid)]">&copy;</span> {currentYear} dylan collins
          </div>
        </div>
      </div>
    </footer>
  );
}
