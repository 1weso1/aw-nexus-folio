import { ArrowRight, ExternalLink, Award, Users, Briefcase, Code } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/ProjectCard";
import { SEO } from "@/components/SEO";

import couplesAppImage from "/src/assets/couples-app-mockup.jpg";
import crmDashboardImage from "/src/assets/crm-workflow-dashboard.jpg";
import moveTeamImage from "/lovable-uploads/f9f1defa-84d4-4e38-910e-933f050d0cad.png";
import heroImage from "/src/assets/student-cafe-concept.jpg";

const featuredProjects = [
  {
    title: "Student Ambassadors' Café",
    description: "Comprehensive business proposal for a student-run café at BUE. Led complete feasibility study, financial modeling, and stakeholder alignment process that resulted in board approval for Summer 2026 launch.",
    status: "planned" as const,
    role: "Project Lead & Business Strategist",
    date: "2025-2026",
    tags: ["Leadership", "Business Development", "Stakeholder Management", "Financial Planning"],
    link: "/projects/stam-cafe",
    image: heroImage
  },
  {
    title: "Strings 'Attached' (Couples App)",
    description: "A playful mobile app designed to strengthen relationships through smart nudges, interactive challenges, and meaningful conversations. Built with FlutterFlow and Supabase for seamless cross-platform experience.",
    status: "progress" as const,
    role: "Product Designer & Developer",
    date: "2024-Present",
    tags: ["Mobile App", "UX Design", "FlutterFlow", "Supabase", "Relationships"],
    link: "/projects/strings-attached",
    image: couplesAppImage
  },
  {
    title: "CRM Automation Library",
    description: "Comprehensive n8n automation library featuring 2,053 production-ready workflows across 15 business categories. Includes CRM integrations, AI-powered lead scoring, social media automation, and enterprise-grade templates.",
    status: "live" as const,
    role: "Automation Architect & CRM Specialist", 
    date: "2024-Present",
    tags: ["n8n", "CRM", "AI Automation", "HubSpot", "Enterprise"],
    link: "/automation",
    image: crmDashboardImage
  }
];

const Index = () => {
  return (
    <>
      <SEO 
        title="Ahmed Wesam - CRM & Automation Specialist"
        description="Building smarter connections through CRM, automation, and community projects. CRM & Recruitment specialist blending data-driven outreach with digital innovation."
      />
      
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative pt-20 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center space-y-8">
              {/* Logo & Name */}
              <div className="space-y-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-neon-primary to-neon-accent flex items-center justify-center shadow-2xl shadow-neon-primary/25">
                  <span className="text-2xl font-bold text-white font-sora">AW</span>
                </div>
                <h1 className="hero-text max-w-4xl mx-auto">
                  Building smarter connections through CRM, automation, and community projects
                </h1>
                <p className="text-xl body-large max-w-3xl mx-auto">
                  CRM & Recruitment specialist blending data-driven outreach with digital innovation at The British University in Egypt.
                </p>
              </div>

              {/* Primary CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild variant="hero" size="lg">
                  <Link to="/projects">
                    <Briefcase className="h-5 w-5" />
                    Explore My Work
                  </Link>
                </Button>
                <Button asChild variant="neon" size="lg">
                  <Link to="/contact">
                    Contact Me
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
              </div>

              {/* Automation Hub CTA */}
              <div className="pt-8">
                <Button asChild variant="glass" size="lg" className="border-neon-accent/30 hover:border-neon-accent/50">
                  <Link to="/automation">
                    <Code className="h-5 w-5" />
                    Browse 2,000+ Automation Workflows
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </Button>
              </div>

              {/* Highlights Strip */}
              <div className="pt-8">
                <div className="flex flex-wrap justify-center gap-4 text-text-secondary">
                  <span className="px-3 py-1 bg-surface-card/50 rounded-full text-sm border border-neon-primary/20">BUE</span>
                  <span className="px-3 py-1 bg-surface-card/50 rounded-full text-sm border border-neon-primary/20">Rotaract</span>
                  <span className="px-3 py-1 bg-surface-card/50 rounded-full text-sm border border-neon-primary/20">Arab League</span>
                  <span className="px-3 py-1 bg-surface-card/50 rounded-full text-sm border border-neon-primary/20">Cairo Runners</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Projects Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="section-heading mb-6">Featured Work</h2>
              <p className="text-xl body-large max-w-3xl mx-auto">
                A selection of recent projects showcasing the intersection of systems thinking and human impact.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {featuredProjects.map((project) => (
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

            <div className="text-center">
              <Button asChild variant="glass" size="lg">
                <Link to="/projects">
                  View All Projects
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Quick Bio Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="glass rounded-3xl p-8 md:p-12">
              <h2 className="section-heading text-center mb-8">About Me</h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                <div className="lg:col-span-2 space-y-6">
                  <p className="body-large">
                    I optimize HubSpot CRM systems, lead student engagement initiatives, and build tools that make outreach more human and efficient. 
                    I've founded a university sports club, served as Rotaract VP, and recently led a student-run café from concept to board approval.
                  </p>
                  <p className="body-large">
                    My approach combines data-driven insights with a deeply human-centered perspective, always looking for ways to bring people together around shared goals.
                  </p>
                  <Button asChild variant="hero">
                    <Link to="/about">
                      More About Me
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>

                <div className="text-center space-y-6">
                  <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-r from-neon-primary to-neon-accent p-1">
                    <img 
                      src="/lovable-uploads/2028e426-177f-4a9f-99e3-2745c2aada2b.png" 
                      alt="Ahmed Wesam"
                      className="w-full h-full rounded-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          parent.innerHTML = `
                            <div class="w-full h-full rounded-full bg-gradient-surface flex items-center justify-center">
                              <svg class="w-16 h-16 text-text-secondary" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                              </svg>
                            </div>
                          `;
                        }
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-center space-x-2">
                      <Award className="h-5 w-5 text-neon-primary" />
                      <span className="text-text-primary font-medium">Winner</span>
                    </div>
                    <p className="text-sm text-text-secondary">GRACE Research Competition on Anti-Corruption</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Index;
