'use client';

import { AsciiSection, AsciiBox, AsciiDivider } from "@/components/ascii";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const techIUse = [
  "JavaScript", "TypeScript", "PHP", "React", "Next.js", "Laravel",
  "WordPress", "Node.js", "Tailwind CSS", "Docker", "Linux"
];

const thingsILove = [
  "Video Games",
  "Anime",
  "Building PCs",
  "Custom Keyboards",
  "Cats",
  "Lego",
  "Pokémon Cards",
  "3D Printing",
  "Little Adventures"
];

export default function AboutPage() {
  return (
    <div className="space-y-8">
      <section className="border border-border p-6 bg-card">
        <h1 className="text-xl text-foreground mb-4">About Me</h1>
        <AsciiDivider className="my-4" />
        <div className="space-y-4 text-muted-foreground">
          <p>
            Hey! I&apos;m <span className="text-foreground">Dylan</span> - part builder,
            part tinkerer, full-time curious.
          </p>
          <p>
            I&apos;ve been building things on the internet for over 10 years now. What started
            as messing around with websites turned into a proper career, and I recently
            went back to college as a mature student to get a degree in Multimedia Applications
            Development (graduated 2025 with a 1.1 GPA - pretty chuffed about that).
          </p>
          <p>
            When I&apos;m not at a keyboard, I&apos;m probably building one. Or a PC. Or 3D printing
            something that absolutely didn&apos;t need to exist. I have zero self-control when it
            comes to hobbies - my desk is proof of that.
          </p>
          <p>
            I&apos;ve always had an <span className="text-foreground">&quot;I&apos;ll build it myself&quot;</span> attitude.
            Something exists but doesn&apos;t work the way I want? Cool, I&apos;ll just make my own version.
          </p>
        </div>
      </section>

      <AsciiSection title="The Fun Stuff">
        <div className="border border-border p-4 bg-card space-y-4 text-muted-foreground">
          <p>
            I&apos;m a big <span className="text-foreground">video game</span> nerd and love
            chatting about games - what I&apos;m playing, what&apos;s coming out, hot takes, all of it.
            Same goes for <span className="text-foreground">anime</span>. Always happy to swap
            recommendations or argue about which season was actually the best.
          </p>
          <p>
            <span className="text-foreground">Cats</span> are the best. I&apos;m a massive animal
            lover in general, but cats just hit different. If you have cat pictures, I want to see them.
          </p>
          <p>
            I love little <span className="text-foreground">adventures</span> - exploring new places,
            finding weird shops, stumbling onto something unexpected. Life&apos;s more fun when you
            say yes to random detours.
          </p>
          <p>
            Oh, and <span className="text-foreground">Lego</span> and <span className="text-foreground">Pokémon cards</span>?
            Don&apos;t get me started. My wallet wishes I had different hobbies.
          </p>
        </div>
      </AsciiSection>

      <AsciiSection title="Things I Love">
        <div className="flex flex-wrap gap-2">
          {thingsILove.map((thing) => (
            <span
              key={thing}
              className="px-3 py-1 border border-border text-muted-foreground text-sm"
            >
              {thing}
            </span>
          ))}
        </div>
      </AsciiSection>

      <AsciiSection title="The Work Stuff">
        <div className="border border-border p-4 bg-card space-y-4 text-muted-foreground">
          <p>
            I currently work as a Software Developer at <span className="text-foreground">The B!G Idea</span>,
            building and maintaining their WordPress-based platform. Before that, I spent years doing
            freelance web development and sysadmin work, had a stint at Apple doing tech support,
            and worked at a local IT company.
          </p>
          <p>
            I genuinely love <span className="text-foreground">programming</span> and <span className="text-foreground">building things</span>.
            There&apos;s something satisfying about taking an idea and turning it into something real -
            whether that&apos;s a website, an app, or a weird side project that only I will ever use.
          </p>
          <p>
            For the full professional rundown, check out my <Link href="/cv" className="text-[var(--gradient-mid)] hover-underline">CV</Link>.
          </p>
        </div>
      </AsciiSection>

      <AsciiSection title="Tech I Use">
        <div className="flex flex-wrap gap-2">
          {techIUse.map((tech) => (
            <Badge key={tech} variant="outline" className="border-border text-muted-foreground">
              {tech}
            </Badge>
          ))}
        </div>
      </AsciiSection>

      <section className="border border-border p-4 bg-card">
        <h3 className="text-foreground mb-4">Say Hello</h3>
        <div className="text-muted-foreground space-y-2 text-sm">
          <p>
            <span className="text-foreground">Email:</span>{" "}
            <a href="mailto:dylan@dylancollins.me">dylan@dylancollins.me</a>
          </p>
          <p>
            <span className="text-foreground">GitHub:</span>{" "}
            <a href="https://github.com/Pyxyll" target="_blank" rel="noopener noreferrer">
              github.com/Pyxyll
            </a>
          </p>
          <p>
            <span className="text-foreground">LinkedIn:</span>{" "}
            <a href="https://www.linkedin.com/in/dylan-c-collins/" target="_blank" rel="noopener noreferrer">
              linkedin.com/in/dylan-c-collins
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}
