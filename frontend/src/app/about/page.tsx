'use client';

import { AsciiSection, AsciiBox, AsciiDivider } from "@/components/ascii";
import { Badge } from "@/components/ui/badge";

const skills = {
  languages: ["TypeScript", "JavaScript", "Python", "Rust", "Go", "PHP", "SQL"],
  frontend: ["React", "Next.js", "Vue.js", "Tailwind CSS", "HTML/CSS"],
  backend: ["Node.js", "Laravel", "Express", "FastAPI", "PostgreSQL", "Redis"],
  tools: ["Git", "Docker", "Linux", "AWS", "Vercel", "Nginx"],
  interests: ["System Design", "DevOps", "Open Source", "CLI Tools"]
};

const timeline = [
  {
    year: "2024",
    title: "Current Focus",
    description: "Building full-stack applications and contributing to open source. Exploring Rust and systems programming."
  },
  {
    year: "2023",
    title: "Full-Stack Development",
    description: "Worked on various web applications using React, Next.js, and Laravel. Started learning cloud architecture."
  },
  {
    year: "2022",
    title: "Web Development Journey",
    description: "Deepened expertise in JavaScript/TypeScript. Built several personal projects and started blogging."
  },
  {
    year: "2021",
    title: "Started Programming",
    description: "Discovered programming and fell in love with building things. Started with Python and web basics."
  }
];

export default function AboutPage() {
  return (
    <div className="space-y-8">
      <section className="border border-border p-6 bg-card">
        <h1 className="text-xl text-foreground mb-4">About Me</h1>
        <AsciiDivider className="my-4" />
        <div className="space-y-4 text-muted-foreground">
          <p>
            Hey there! I&apos;m <span className="text-foreground">Dylan Collins</span>, a software developer
            who loves building things that live on the internet.
          </p>
          <p>
            I believe in writing clean, maintainable code and creating user experiences that
            feel natural and intuitive. When I&apos;m not coding, you&apos;ll find me exploring
            new technologies, contributing to open source, or tinkering with side projects.
          </p>
          <p>
            This website serves as my digital garden - a place where I share my work, thoughts,
            and learnings. It&apos;s intentionally designed with a minimalist ASCII aesthetic,
            reminding us that simplicity often trumps complexity.
          </p>
        </div>
      </section>

      <AsciiSection title="Skills & Technologies">
        <div className="grid gap-4 md:grid-cols-2">
          <AsciiBox title="Languages">
            <div className="flex flex-wrap gap-2">
              {skills.languages.map((skill) => (
                <Badge key={skill} variant="outline" className="border-border text-muted-foreground">
                  {skill}
                </Badge>
              ))}
            </div>
          </AsciiBox>

          <AsciiBox title="Frontend">
            <div className="flex flex-wrap gap-2">
              {skills.frontend.map((skill) => (
                <Badge key={skill} variant="outline" className="border-border text-muted-foreground">
                  {skill}
                </Badge>
              ))}
            </div>
          </AsciiBox>

          <AsciiBox title="Backend">
            <div className="flex flex-wrap gap-2">
              {skills.backend.map((skill) => (
                <Badge key={skill} variant="outline" className="border-border text-muted-foreground">
                  {skill}
                </Badge>
              ))}
            </div>
          </AsciiBox>

          <AsciiBox title="Tools & DevOps">
            <div className="flex flex-wrap gap-2">
              {skills.tools.map((skill) => (
                <Badge key={skill} variant="outline" className="border-border text-muted-foreground">
                  {skill}
                </Badge>
              ))}
            </div>
          </AsciiBox>
        </div>
      </AsciiSection>

      <AsciiSection title="Timeline">
        <div className="space-y-4">
          {timeline.map((item, index) => (
            <div key={item.year} className="flex gap-4">
              <div className="flex flex-col items-center">
                <span className="text-foreground font-bold">{item.year}</span>
                {index < timeline.length - 1 && (
                  <div className="w-px h-full bg-border mt-2"></div>
                )}
              </div>
              <div className="pb-4">
                <h4 className="text-foreground font-medium">{item.title}</h4>
                <p className="text-muted-foreground text-sm mt-1">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </AsciiSection>

      <AsciiSection title="Interests">
        <div className="flex flex-wrap gap-2">
          {skills.interests.map((interest) => (
            <span
              key={interest}
              className="px-3 py-1 border border-border text-muted-foreground text-sm"
            >
              {interest}
            </span>
          ))}
        </div>
      </AsciiSection>

      <section className="border border-border p-4 bg-card">
        <h3 className="text-foreground mb-4">Contact</h3>
        <div className="text-muted-foreground space-y-2 text-sm">
          <p>
            <span className="text-foreground">Email:</span>{" "}
            <a href="mailto:hello@dylancollins.me">hello@dylancollins.me</a>
          </p>
          <p>
            <span className="text-foreground">GitHub:</span>{" "}
            <a href="https://github.com/dylancollins" target="_blank" rel="noopener noreferrer">
              github.com/dylancollins
            </a>
          </p>
          <p>
            <span className="text-foreground">LinkedIn:</span>{" "}
            <a href="https://linkedin.com/in/dylancollins" target="_blank" rel="noopener noreferrer">
              linkedin.com/in/dylancollins
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}
