import { useState } from "react";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/ProjectCard";

import couplesAppImage from "/src/assets/couples-app-mockup.jpg";
import crmDashboardImage from "/src/assets/crm-workflow-dashboard.jpg";
import moveTeamImage from "/lovable-uploads/f9f1defa-84d4-4e38-910e-933f050d0cad.png";
import heroImage from "/src/assets/student-cafe-concept.jpg";
import rotaractImage from "/lovable-uploads/3d3cfa69-a6dc-4a58-8aaf-ec6ba9295513.png";

const projects = [
  // Tech Projects
  {
    title: "Strings 'Attached' (Couples App)",
    description: "A playful mobile app designed to strengthen relationships through smart nudges, interactive challenges, and meaningful conversations. Built with FlutterFlow and Supabase for seamless cross-platform experience.",
    status: "progress" as const,
    role: "Product Designer & Developer",
    date: "2024-Present",
    tags: ["Mobile App", "UX Design", "FlutterFlow", "Supabase", "Relationships"],
    link: "/projects/strings-attached",
    category: "tech",
    image: couplesAppImage
  },
  {
    title: "CRM Automation Library (2,000+ Workflows)",
    description: "Comprehensive n8n automation library featuring 2,053 production-ready workflows across 15 business categories. Includes CRM integrations, AI-powered lead scoring, social media automation, and enterprise-grade templates for HubSpot, Salesforce, and more.",
    status: "live" as const,
    role: "Automation Architect & CRM Specialist", 
    date: "2024-Present",
    tags: ["n8n", "CRM", "AI Automation", "HubSpot", "Enterprise", "365+ Integrations"],
    link: "/projects/crm-automation",
    category: "tech",
    image: crmDashboardImage
  },

  // Leadership Projects
  {
    title: "Student Ambassadors' Café",
    description: "Comprehensive business proposal for a student-run café at BUE. Led complete feasibility study, financial modeling, and stakeholder alignment process that resulted in board approval for Summer 2026 launch.",
    status: "planned" as const,
    role: "Project Lead & Business Strategist",
    date: "2025-2026",
    tags: ["Leadership", "Business Development", "Stakeholder Management", "Financial Planning"],
    link: "/projects/stam-cafe",
    category: "leadership",
    image: heroImage
  },
  {
    title: "Move Sports Club",
    description: "Founded the first university sports club at The British University in Egypt (BUE) to unify student athletes, deliver structured competitions, and create hands-on learning in sports operations. Built the club from zero: organization, governance, partnerships, and a steady cadence of events.",
    status: "live" as const,
    role: "Founder & President",
    date: "2023-Present",
    tags: ["Leadership", "Sports Management", "Event Operations", "Partnerships", "Community Building"],
    link: "/projects/move-sports-club",
    category: "leadership", 
    image: moveTeamImage
  },
  {
    title: "Rotaract Vice Presidency",
    description: "As Vice President, led programs that combined community service, youth development, and institutional partnerships—expanding the club's impact and member experience.",
    status: "live" as const,
    role: "Vice President – Rotaract Club, BUE",
    date: "2023-2024", 
    tags: ["Leadership", "Community Service", "Partnerships", "Event Management", "Youth Development"],
    link: "/projects/rotaract-vice-presidency",
    category: "leadership",
    image: rotaractImage
  },
  {
    title: "Student Ambassador Program Management",
    description: "Professionalized BUE's Student Ambassador Program: structured recruitment, continuous training, digital tracking, and deployment across major admissions/recruitment events.",
    status: "live" as const,
    role: "Program Manager – Student Ambassadors (STAMs), BUE",
    date: "2023-Present",
    tags: ["Leadership", "Training", "Recruitment", "Event Ops", "CRM"],
    link: "/projects/student-ambassadors-program",
    category: "leadership",
    image: "/lovable-uploads/19db5647-a818-44f1-a6fb-cc27bf6f9a1b.png"
  },
  {
    title: "GRACE Research Competition",
    description: "Led winning research project on anti-corruption initiatives in partnership with Arab League. Conducted comprehensive policy analysis and presented findings to international panel.",
    status: "live" as const,
    role: "Lead Researcher",
    date: "2024",
    tags: ["Research", "Policy Analysis", "Anti-Corruption", "Arab League", "Leadership"],
    link: "/projects/grace-research",
    category: "leadership",
    image: heroImage
  }
];

const filters = [
  { label: "All", value: "all" },
  { label: "Tech", value: "tech" },
  { label: "Leadership", value: "leadership" },
];

export default function Projects() {
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredProjects = projects.filter(project => 
    activeFilter === "all" || project.category === activeFilter
  );

  return (
    <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <section className="py-20 text-center">
          <h1 className="hero-text mb-6">Projects & Initiatives</h1>
          <p className="text-xl body-large max-w-3xl mx-auto">
            A collection of technical builds and leadership initiatives that showcase the intersection of systems thinking and human impact.
          </p>
        </section>

        {/* Filter Chips */}
        <section className="py-8">
          <div className="flex flex-wrap justify-center gap-4">
            {filters.map((filter) => (
              <Button
                key={filter.value}
                variant={activeFilter === filter.value ? "neon" : "glass"}
                size="sm"
                onClick={() => setActiveFilter(filter.value)}
                className="min-w-20"
              >
                <Filter className="h-4 w-4 mr-2" />
                {filter.label}
              </Button>
            ))}
          </div>
        </section>

        {/* Projects Grid */}
        <section className="py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.title}
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

        {/* Stats Section */}
        <section className="py-20">
          <div className="glass rounded-3xl p-8 md:p-12">
            <h2 className="section-heading text-center mb-8">Project Impact</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              <div className="space-y-2">
                <div className="text-4xl font-bold neon-text">{projects.length}</div>
                <p className="body-large">Total Projects</p>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold neon-text">
                  {projects.filter(p => p.status === "live").length}
                </div>
                <p className="body-large">Live Projects</p>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold neon-text">
                  {projects.filter(p => p.category === "tech").length}
                </div>
                <p className="body-large">Tech Builds</p>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold neon-text">
                  {projects.filter(p => p.category === "leadership").length}
                </div>
                <p className="body-large">Leadership Initiatives</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}