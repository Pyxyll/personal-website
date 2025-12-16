'use client';

import { AsciiSection, AsciiBox, AsciiDivider } from "@/components/ascii";
import { Badge } from "@/components/ui/badge";

const experience = [
  {
    title: "Software Developer",
    company: "The B!G Idea",
    period: "July 2024 - Present",
    location: "Ireland",
    description: [
      "Developing and maintaining the platform built on WordPress",
      "Built custom tooling and functionality beyond WordPress core capabilities",
      "Creating custom themes and plugins to extend functionality",
      "Collaborating with team members on project delivery"
    ],
    technologies: ["WordPress", "PHP", "JavaScript", "CSS", "MySQL"]
  },
  {
    title: "College At Home Advisor",
    company: "Apple Inc.",
    period: "July 2023 - October 2023",
    location: "Remote",
    description: [
      "Provided remote technical support for iOS devices",
      "Engaged in regular training sessions achieving 90+% scores",
      "Developed strong problem-solving and communication skills"
    ],
    technologies: ["Technical Support", "iOS", "Customer Service"]
  },
  {
    title: "Freelance Web Development & SysAdmin",
    company: "Self-employed",
    period: "Sept 2014 - July 2023",
    location: "Remote",
    description: [
      "Built and deployed websites for various clients",
      "Managed servers, networks, and system configurations",
      "Ensured optimal performance and security for client projects",
      "Handled client communication and project management"
    ],
    technologies: ["Node.js", "PHP", "Docker", "AWS", "Linux", "BASH"]
  },
  {
    title: "Web Services Admin / IT Support",
    company: "Panoptic IT Solutions",
    period: "June 2018 - Sept 2020",
    location: "Ireland",
    description: [
      "Liaised with clients about web development requirements",
      "Created in-depth design documents for projects",
      "Implemented projects with design and development team",
      "Provided troubleshooting and technical support"
    ],
    technologies: ["Web Development", "Documentation", "IT Support", "Client Relations"]
  }
];

const education = [
  {
    degree: "BSc in Multimedia Applications Development",
    school: "SETU Waterford",
    period: "2022 - 2025",
    details: "Graduated with 1.1 GPA. Key modules included JavaScript (100%), Front-end Web Development (98%), UX Design (96%), Web Application Development (90%), and System Administration (80%)."
  }
];

const skills = {
  languages: ["JavaScript", "TypeScript", "PHP", "SQL", "BASH", "HTML", "CSS"],
  frontend: ["React", "Next.js", "Svelte", "Astro", "Tailwind CSS", "Bootstrap"],
  backend: ["Node.js", "Express.js", "Laravel", "WordPress", "GraphQL"],
  tools: ["Docker", "AWS EC2", "Git", "Linux", "MySQL", "PostgreSQL"]
};

export default function CVPage() {
  return (
    <div className="space-y-8">
      <section className="border border-border p-6 bg-card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl text-foreground font-bold">Dylan Collins</h1>
            <p className="text-muted-foreground">Software Developer</p>
          </div>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>dylan@dylancollins.me</p>
            <p>github.com/Pyxyll</p>
            <p>linkedin.com/in/dylan-c-collins</p>
          </div>
        </div>
        <AsciiDivider className="my-4" />
        <p className="text-muted-foreground">
          Software developer with 10+ years of experience building websites and managing systems.
          A self-starter with a keen attention to detail and a love for tackling interesting challenges.
          Recently graduated with a BSc in Multimedia Applications Development, combining years of
          hands-on industry experience with formal education. Strong communicator with a friendly,
          down-to-earth approach.
        </p>
        <div className="mt-4">
          <a
            href="/cv/dylan-collins-resume.pdf"
            className="inline-block border border-foreground px-4 py-2 text-foreground text-sm hover:bg-foreground hover:text-background transition-colors no-underline"
          >
            [Download PDF]
          </a>
        </div>
      </section>

      <AsciiSection title="Experience">
        <div className="space-y-6">
          {experience.map((job, index) => (
            <div key={index} className="border border-border p-4 bg-card">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-3">
                <div>
                  <h3 className="text-foreground font-bold">{job.title}</h3>
                  <p className="text-muted-foreground">{job.company}</p>
                </div>
                <div className="text-sm text-muted-foreground text-right">
                  <p>{job.period}</p>
                  <p>{job.location}</p>
                </div>
              </div>
              <ul className="text-muted-foreground text-sm space-y-1 mb-3">
                {job.description.map((item, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-[var(--gradient-mid)]">-</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-1">
                {job.technologies.map((tech) => (
                  <Badge key={tech} variant="outline" className="text-xs border-border text-muted-foreground">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </AsciiSection>

      <AsciiSection title="Education">
        {education.map((edu, index) => (
          <div key={index} className="border border-border p-4 bg-card">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-2">
              <div>
                <h3 className="text-foreground font-bold">{edu.degree}</h3>
                <p className="text-muted-foreground">{edu.school}</p>
              </div>
              <p className="text-muted-foreground text-sm">{edu.period}</p>
            </div>
            <p className="text-muted-foreground text-sm">{edu.details}</p>
          </div>
        ))}
      </AsciiSection>

      <AsciiSection title="Technical Skills">
        <div className="grid gap-4 md:grid-cols-2">
          <AsciiBox title="Languages">
            <div className="flex flex-wrap gap-1">
              {skills.languages.map((skill) => (
                <Badge key={skill} variant="outline" className="text-xs border-border text-muted-foreground">
                  {skill}
                </Badge>
              ))}
            </div>
          </AsciiBox>

          <AsciiBox title="Frontend">
            <div className="flex flex-wrap gap-1">
              {skills.frontend.map((skill) => (
                <Badge key={skill} variant="outline" className="text-xs border-border text-muted-foreground">
                  {skill}
                </Badge>
              ))}
            </div>
          </AsciiBox>

          <AsciiBox title="Backend">
            <div className="flex flex-wrap gap-1">
              {skills.backend.map((skill) => (
                <Badge key={skill} variant="outline" className="text-xs border-border text-muted-foreground">
                  {skill}
                </Badge>
              ))}
            </div>
          </AsciiBox>

          <AsciiBox title="Tools & Infrastructure">
            <div className="flex flex-wrap gap-1">
              {skills.tools.map((skill) => (
                <Badge key={skill} variant="outline" className="text-xs border-border text-muted-foreground">
                  {skill}
                </Badge>
              ))}
            </div>
          </AsciiBox>
        </div>
      </AsciiSection>

      <section className="border border-border p-4 bg-card text-center">
        <p className="text-muted-foreground text-sm">
          References available upon request
        </p>
      </section>
    </div>
  );
}
