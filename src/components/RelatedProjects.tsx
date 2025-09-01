import React from 'react';
import { ProjectCard } from './ProjectCard';

interface RelatedProject {
  title: string;
  description: string;
  status: 'live' | 'progress' | 'planned';
  role: string;
  date: string;
  tags: string[];
  link: string;
  image: string;
}

interface RelatedProjectsProps {
  currentProjectSlug: string;
  className?: string;
}

// Centralized project data that matches the main Projects page
const allProjects: RelatedProject[] = [
  {
    title: "CRM Automation Library (2,000+ Workflows)",
    description: "Comprehensive n8n automation library featuring 2,053 production-ready workflows across 15 business categories. Includes CRM integrations, AI-powered lead scoring, and enterprise templates.",
    status: "live",
    role: "Automation Architect & CRM Specialist",
    date: "2024-Present",
    tags: ["n8n", "CRM", "AI Automation", "HubSpot"],
    link: "/projects/crm-automation",
    image: "/src/assets/crm-workflow-dashboard.jpg"
  },
  {
    title: "Student Ambassadors' Café",
    description: "Comprehensive business proposal for a student-run café at BUE. Led complete feasibility study and financial modeling that resulted in board approval for Summer 2026 launch.",
    status: "planned",
    role: "Project Lead & Business Strategist",
    date: "2025-2026",
    tags: ["Leadership", "Business Development", "Financial Planning"],
    link: "/projects/stam-cafe",
    image: "/src/assets/student-cafe-concept.jpg"
  },
  {
    title: "Move Sports Club",
    description: "Founded the first university sports club at BUE to unify student athletes and deliver structured competitions. Built organization, governance, and partnerships from zero.",
    status: "live",
    role: "Founder & President",
    date: "2023-Present",
    tags: ["Leadership", "Sports Management", "Event Operations"],
    link: "/projects/move-sports-club",
    image: "/lovable-uploads/f9f1defa-84d4-4e38-910e-933f050d0cad.png"
  },
  {
    title: "Rotaract Vice Presidency",
    description: "Led programs combining community service, youth development, and institutional partnerships—expanding the club's impact and member experience.",
    status: "live",
    role: "Vice President – Rotaract Club, BUE",
    date: "2023-2024",
    tags: ["Leadership", "Community Service", "Partnerships"],
    link: "/projects/rotaract-vice-presidency",
    image: "/lovable-uploads/3d3cfa69-a6dc-4a58-8aaf-ec6ba9295513.png"
  },
  {
    title: "Student Ambassador Program Management",
    description: "Professionalized BUE's Student Ambassador Program with structured recruitment, continuous training, and digital tracking for major admissions events.",
    status: "live",
    role: "Program Manager – Student Ambassadors (STAMs), BUE",
    date: "2023-Present",
    tags: ["Leadership", "Training", "CRM"],
    link: "/projects/student-ambassadors-program",
    image: "/src/assets/student-cafe-concept.jpg"
  },
  {
    title: "Strings 'Attached' (Couples App)",
    description: "A playful mobile app designed to strengthen relationships through smart nudges, interactive challenges, and meaningful conversations built with FlutterFlow.",
    status: "progress",
    role: "Product Designer & Developer",
    date: "2024-Present",
    tags: ["Mobile App", "UX Design", "FlutterFlow"],
    link: "/projects/strings-attached",
    image: "/src/assets/couples-app-mockup.jpg"
  }
];

export default function RelatedProjects({ currentProjectSlug, className = '' }: RelatedProjectsProps) {
  // Filter out current project and get 3 random related projects
  const relatedProjects = allProjects
    .filter(project => !project.link.includes(currentProjectSlug))
    .sort(() => 0.5 - Math.random())
    .slice(0, 3);

  if (relatedProjects.length === 0) return null;

  return (
    <section className={`space-y-8 ${className}`}>
      <h2 className="section-heading">Related Projects</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {relatedProjects.map((project) => (
          <ProjectCard
            key={project.link}
            title={project.title}
            description={project.description}
            status={project.status}
            role={project.role}
            date={project.date}
            tags={project.tags}
            link={project.link}
            image={project.image}
          />
        ))}
      </div>
    </section>
  );
}