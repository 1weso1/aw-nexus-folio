import { ArrowLeft, Calendar, User, Tag, ExternalLink, Github, Download } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/ProjectCard";

// Sample project data - in a real app this would come from a CMS or API
const projectData = {
  "stam-cafe": {
    title: "Student Ambassadors' Café",
    role: "Project Lead & Business Strategist",
    status: "planned" as const,
    date: "2025-2026",
    tags: ["Leadership", "Business Development", "Stakeholder Management", "Financial Planning"],
    summary: "Proposed and built a comprehensive business plan for a student-run café at The British University in Egypt to empower Student Ambassadors, generate revenue for their program, and promote sustainability. Led the complete feasibility study and pitched to the board; the project is approved and scheduled to operate Summer 2026.",
    problem: "Student Ambassadors (STAMs) needed experiential leadership opportunities, budget autonomy, and a visible community touchpoint near the Admissions department. The program lacked hands-on business experience and sustainable revenue streams.",
    approach: [
      "Conducted comprehensive market research on campus footfall patterns and competitor analysis",
      "Developed detailed unit economics model including COGS, staffing, and operational costs",
      "Created menu strategy focused on high-margin items with sustainability considerations",
      "Designed comprehensive training program for STAM employees covering customer service, operations, and leadership",
      "Built partnerships with local suppliers and sustainability initiatives (reusable bottles program)",
      "Developed operational workflows and standard operating procedures",
      "Created financial projections and ROI analysis for board presentation"
    ],
    outcome: "Board approval achieved with Summer 2026 launch timeline. Expected KPIs include 50-80 daily transactions, 35% profit margin, and 40+ hours of hands-on STAM training monthly. Project will serve as a replicable model for student entrepreneurship programs.",
    role_details: "Led the complete project lifecycle from ideation to board approval. Responsible for financial modeling, stakeholder alignment, presentation design, and cross-functional coordination between Admissions, Student Affairs, and Facilities teams.",
    timeline: [
      { period: "Q4 2024", milestone: "Initial concept development and stakeholder interviews" },
      { period: "Q1 2025", milestone: "Market research and financial modeling" },
      { period: "Q2 2025", milestone: "Business plan completion and board presentation" },
      { period: "Q3 2025", milestone: "Board approval and implementation planning" },
      { period: "Q4 2025", milestone: "Space preparation and staff training" },
      { period: "Summer 2026", milestone: "Official café launch and operations" }
    ],
    tools: ["Google Sheets", "Canva", "HubSpot", "Market Research Tools", "Financial Modeling"],
    gallery: ["/src/assets/student-cafe-concept.jpg"],
    links: []
  }
};

const relatedProjects = [
  {
    title: "Move Sports Club",
    description: "Founded university sports club from zero and scaled it to a full program with regular activities and community partnerships.",
    status: "live" as const,
    role: "Founder & President",
    date: "2023-Present",
    tags: ["Leadership", "Community Building", "Sports Management"],
    link: "/projects/move",
    image: "/src/assets/sports-club-community.jpg"
  },
  {
    title: "Rotaract Vice Presidency",
    description: "Led member engagement initiatives and community service projects as VP. Managed international partnerships and organized 20+ events.",
    status: "live" as const,
    role: "Vice President",
    date: "2023-2024",
    tags: ["Leadership", "Community Service", "Event Management"],
    link: "/projects/rotaract",
    image: "/src/assets/sports-club-community.jpg"
  }
];

export default function ProjectDetail() {
  const { slug } = useParams();
  const project = slug ? projectData[slug as keyof typeof projectData] : null;

  if (!project) {
    return (
      <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-text-primary mb-4">Project Not Found</h1>
          <p className="body-large mb-8">The project you're looking for doesn't exist.</p>
          <Button asChild variant="neon">
            <Link to="/projects">
              <ArrowLeft className="h-4 w-4" />
              Back to Projects
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <div className="mb-8">
          <Button asChild variant="ghost">
            <Link to="/projects">
              <ArrowLeft className="h-4 w-4" />
              Back to Projects
            </Link>
          </Button>
        </div>

        {/* Header */}
        <header className="mb-12">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className={`status-${project.status.replace('progress', 'planned')}`}>
              {project.status === 'planned' ? 'Coming Soon' : project.status === 'progress' ? 'In Progress' : 'Live'}
            </span>
            <div className="flex items-center text-text-secondary text-sm">
              <Calendar className="h-4 w-4 mr-1" />
              {project.date}
            </div>
          </div>

          <h1 className="hero-text text-4xl md:text-5xl mb-4">{project.title}</h1>
          
          <div className="flex items-center text-text-secondary mb-6">
            <User className="h-4 w-4 mr-2" />
            <span className="font-medium">{project.role}</span>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {project.tags.map((tag) => (
              <span 
                key={tag}
                className="px-3 py-1 bg-neon-primary/10 text-neon-primary text-sm rounded-md border border-neon-primary/20"
              >
                {tag}
              </span>
            ))}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-12">
            {/* Summary */}
            <section>
              <h2 className="section-heading">Project Summary</h2>
              <p className="body-large">{project.summary}</p>
            </section>

            {/* Problem */}
            <section>
              <h2 className="section-heading">Problem & Context</h2>
              <p className="body-large">{project.problem}</p>
            </section>

            {/* Approach */}
            <section>
              <h2 className="section-heading">Approach & Process</h2>
              <ul className="space-y-3">
                {project.approach.map((item, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-neon-primary rounded-full mt-2 flex-shrink-0" />
                    <span className="body-large">{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Outcome */}
            <section>
              <h2 className="section-heading">Outcome & Impact</h2>
              <p className="body-large">{project.outcome}</p>
            </section>

            {/* My Role */}
            <section>
              <h2 className="section-heading">What I Did</h2>
              <p className="body-large">{project.role_details}</p>
            </section>

            {/* Timeline */}
            <section>
              <h2 className="section-heading">Timeline</h2>
              <div className="space-y-4">
                {project.timeline.map((item, index) => (
                  <div key={index} className="flex flex-col md:flex-row gap-4">
                    <div className="md:w-1/4">
                      <span className="px-3 py-1 bg-neon-primary/20 text-neon-primary text-sm font-medium rounded-full">
                        {item.period}
                      </span>
                    </div>
                    <div className="md:w-3/4">
                      <p className="body-large">{item.milestone}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Gallery */}
            {project.gallery.length > 0 && (
              <section>
                <h2 className="section-heading">Gallery</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {project.gallery.map((image, index) => (
                    <div key={index} className="rounded-xl overflow-hidden">
                      <img 
                        src={image} 
                        alt={`${project.title} - Image ${index + 1}`}
                        className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Quick Facts */}
              <div className="glass rounded-xl p-6">
                <h3 className="font-sora font-semibold text-text-primary mb-4">Quick Facts</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-text-secondary">Status:</span>
                    <span className="ml-2 text-text-primary font-medium">
                      {project.status === 'planned' ? 'Coming Soon' : project.status === 'progress' ? 'In Progress' : 'Live'}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-secondary">Timeline:</span>
                    <span className="ml-2 text-text-primary font-medium">{project.date}</span>
                  </div>
                  <div>
                    <span className="text-text-secondary">My Role:</span>
                    <span className="ml-2 text-text-primary font-medium">{project.role}</span>
                  </div>
                </div>
              </div>

              {/* Tools Used */}
              <div className="glass rounded-xl p-6">
                <h3 className="font-sora font-semibold text-text-primary mb-4">Tools & Stack</h3>
                <div className="flex flex-wrap gap-2">
                  {project.tools.map((tool) => (
                    <span 
                      key={tool}
                      className="px-2 py-1 bg-neon-primary/10 text-neon-primary text-xs rounded border border-neon-primary/20"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>

              {/* Links */}
              {project.links.length > 0 && (
                <div className="glass rounded-xl p-6">
                  <h3 className="font-sora font-semibold text-text-primary mb-4">Links</h3>
                  <div className="space-y-2">
                    {project.links.map((link, index) => (
                      <Button key={index} asChild variant="ghost" size="sm" className="w-full justify-start">
                        <a href={link.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                          {link.label}
                        </a>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact */}
              <div className="glass rounded-xl p-6">
                <h3 className="font-sora font-semibold text-text-primary mb-4">Interested?</h3>
                <p className="text-text-secondary text-sm mb-4">
                  Want to discuss this project or collaborate on something similar?
                </p>
                <Button asChild variant="neon" size="sm" className="w-full">
                  <Link to="/contact">Get In Touch</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Related Projects */}
        <section className="py-16 mt-16 border-t border-neon-primary/10">
          <h2 className="section-heading text-center mb-12">Related Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {relatedProjects.map((project) => (
              <ProjectCard key={project.title} {...project} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}