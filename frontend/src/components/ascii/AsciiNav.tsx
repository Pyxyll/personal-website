'use client';

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

  return (
    <header className="border-b border-border py-4 mb-8 bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <nav className="max-w-4xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="no-underline hover:no-underline group">
            <AsciiLogoSmall className="text-xl group-hover:text-[var(--gradient-mid)] transition-colors duration-300" />
          </Link>

          <ul className="flex flex-wrap items-center gap-1 sm:gap-2">
            {navItems.map((item, index) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href} className="flex items-center">
                  {index > 0 && <span className="text-border mx-1 hidden sm:inline">|</span>}
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
        </div>
      </nav>
    </header>
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
              href="https://linkedin.com/in/dylancollins"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--gradient-mid)] transition-colors duration-300 hover-underline"
            >
              [linkedin]
            </a>
            <a
              href="mailto:hello@dylancollins.dev"
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
