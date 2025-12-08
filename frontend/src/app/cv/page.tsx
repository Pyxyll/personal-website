'use client';

import { AsciiSection, AsciiBox, AsciiDivider } from "@/components/ascii";
import { Badge } from "@/components/ui/badge";

const experience = [
  {
    title: "Senior Software Developer",
    company: "Tech Company",
    period: "2023 - Present",
    location: "Remote",
    description: [
      "Lead development of full-stack applications using React, Next.js, and Node.js",
      "Architected and implemented microservices infrastructure serving 100k+ users",
      "Mentored junior developers and conducted code reviews",
      "Reduced deployment time by 60% through CI/CD pipeline optimization"
    ],
    technologies: ["React", "Next.js", "Node.js", "PostgreSQL", "AWS"]
  },
  {
    title: "Full-Stack Developer",
    company: "Startup Inc",
    period: "2021 - 2023",
    location: "Remote",
    description: [
      "Built and maintained web applications using Vue.js and Laravel",
      "Implemented RESTful APIs and integrated third-party services",
      "Collaborated with design team to implement responsive UI/UX",
      "Improved application performance by 40% through caching strategies"
    ],
    technologies: ["Vue.js", "Laravel", "MySQL", "Redis", "Docker"]
  },
  {
    title: "Junior Developer",
    company: "Agency XYZ",
    period: "2020 - 2021",
    location: "On-site",
    description: [
      "Developed client websites using WordPress and custom PHP solutions",
      "Created responsive landing pages and marketing websites",
      "Participated in agile development process and daily standups",
      "Learned best practices for version control and code documentation"
    ],
    technologies: ["PHP", "WordPress", "JavaScript", "CSS", "Git"]
  }
];

const education = [
  {
    degree: "Bachelor of Science in Computer Science",
    school: "University of Technology",
    period: "2016 - 2020",
    details: "Specialized in Software Engineering. Graduated with honors."
  }
];

const certifications = [
  { name: "AWS Certified Solutions Architect", year: "2023" },
  { name: "Docker Certified Associate", year: "2022" },
  { name: "MongoDB Certified Developer", year: "2022" }
];

const skills = {
  expert: ["JavaScript", "TypeScript", "React", "Next.js", "Node.js"],
  proficient: ["Python", "Laravel", "PostgreSQL", "Docker", "AWS"],
  familiar: ["Rust", "Go", "Kubernetes", "GraphQL", "MongoDB"]
};

export default function CVPage() {
  return (
    <div className="space-y-8">
      <section className="border border-border p-6 bg-card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl text-foreground font-bold">Dylan Collins</h1>
            <p className="text-muted-foreground">Senior Software Developer</p>
          </div>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>hello@dylancollins.me</p>
            <p>github.com/dylancollins</p>
            <p>linkedin.com/in/dylancollins</p>
          </div>
        </div>
        <AsciiDivider className="my-4" />
        <p className="text-muted-foreground">
          Full-stack developer with 4+ years of experience building scalable web applications.
          Passionate about clean code, developer experience, and open source.
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
                    <span className="text-muted-foreground">-</span>
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

      <div className="grid gap-8 md:grid-cols-2">
        <AsciiSection title="Education">
          {education.map((edu, index) => (
            <div key={index} className="border border-border p-4 bg-card">
              <h3 className="text-foreground font-bold">{edu.degree}</h3>
              <p className="text-muted-foreground">{edu.school}</p>
              <p className="text-muted-foreground text-sm">{edu.period}</p>
              <p className="text-muted-foreground text-sm mt-2">{edu.details}</p>
            </div>
          ))}
        </AsciiSection>

        <AsciiSection title="Certifications">
          <div className="border border-border p-4 bg-card">
            <ul className="space-y-2">
              {certifications.map((cert) => (
                <li key={cert.name} className="flex justify-between items-center">
                  <span className="text-muted-foreground text-sm">{cert.name}</span>
                  <span className="text-muted-foreground text-xs">[{cert.year}]</span>
                </li>
              ))}
            </ul>
          </div>
        </AsciiSection>
      </div>

      <AsciiSection title="Technical Skills">
        <div className="grid gap-4 md:grid-cols-3">
          <AsciiBox title="Expert">
            <div className="flex flex-wrap gap-1">
              {skills.expert.map((skill) => (
                <Badge key={skill} variant="outline" className="text-xs border-border text-muted-foreground">
                  {skill}
                </Badge>
              ))}
            </div>
          </AsciiBox>

          <AsciiBox title="Proficient">
            <div className="flex flex-wrap gap-1">
              {skills.proficient.map((skill) => (
                <Badge key={skill} variant="outline" className="text-xs border-border text-muted-foreground">
                  {skill}
                </Badge>
              ))}
            </div>
          </AsciiBox>

          <AsciiBox title="Familiar">
            <div className="flex flex-wrap gap-1">
              {skills.familiar.map((skill) => (
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
