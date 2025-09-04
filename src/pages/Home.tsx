import { ArrowRight, Download, Award, Users, Briefcase, Coffee } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/ProjectCard";

const highlights = [
  { name: "BUE", icon: Briefcase },
  { name: "Rotaract", icon: Users },
  { name: "Arab League", icon: Award },
  { name: "Cairo Runners", icon: Users },
];

import heroImage from "/src/assets/student-cafe-concept.jpg";
import couplesAppImage from "/src/assets/couples-app-mockup.jpg";
import crmDashboardImage from "/src/assets/crm-automation-dashboard.jpg";
import moveTeamImage from "/lovable-uploads/f9f1defa-84d4-4e38-910e-933f050d0cad.png";

const featuredProjects = [
  {
    title: "Student Ambassadors' Café",
    description: "From concept to board approval: a student-run café launching Summer 2026. Led the complete business plan and stakeholder alignment process.",
    status: "planned" as const,
    role: "Project Lead & Business Strategist",
    date: "2025-2026",
    tags: ["Leadership", "Business Development", "Stakeholder Management"],
    link: "/projects/stam-cafe",
    image: heroImage
  },
  {
    title: "Strings 'Attached' (Couples App)",
    description: "A playful app to strengthen relationships with smart nudges and interactive challenges. Currently in development using FlutterFlow.",
    status: "progress" as const,
    role: "Product Designer & Developer",
    date: "2024-Present",
    tags: ["Mobile App", "UX Design", "FlutterFlow"],
    link: "/projects/strings-attached",
    image: couplesAppImage
  },
  {
    title: "CRM Automation Templates",
    description: "Reusable n8n workflows designed to streamline CRM processes for small businesses and recruitment teams.",
    status: "planned" as const,
    role: "CRM Specialist & Automation Developer",
    date: "Coming Soon",
    tags: ["CRM", "Automation", "n8n", "HubSpot"],
    link: "/projects/crm-automation",
    image: crmDashboardImage
  },
  {
    title: "Move Sports Club",
    description: "Founded a campus sports club from zero and scaled it to a full program with regular activities and community partnerships.",
    status: "live" as const,
    role: "Founder & President",
    date: "2023-Present", 
    tags: ["Leadership", "Community Building", "Sports Management"],
    link: "/projects/move",
    image: moveTeamImage
  }
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20">
        <div className="absolute inset-0 gradient-hero opacity-90" />
        <div className="relative z-10 max-w-6xl mx-auto text-center">
          {/* Hero Logo */}
          <div className="mb-8 animate-fade-in">
            <img 
              src="/lovable-uploads/d565c3d6-458e-41eb-8e16-a1ddcfbdc719.png" 
              alt="Ahmed Wesam Logo" 
              className="h-24 w-24 mx-auto neon-glow animate-glow-pulse"
            />
          </div>

          {/* Hero Text */}
          <div className="space-y-6 animate-fade-in">
            <h1 className="hero-text animate-gradient-x">
              Building smarter connections through CRM, automation, and community projects
            </h1>
            <p className="text-xl md:text-2xl body-large max-w-3xl mx-auto">
              CRM & Recruitment specialist blending data-driven outreach with digital innovation
            </p>
          </div>

          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10 animate-fade-in">
            <Button asChild variant="hero" size="xl">
              <Link to="/projects">
                Explore My Work
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="glass" size="xl">
              <Link to="/book">
                Book a Call
              </Link>
            </Button>
          </div>

          {/* Highlights Strip */}
          <div className="mt-16 animate-fade-in">
            <p className="text-text-secondary mb-6">Trusted by organizations</p>
            <div className="flex flex-wrap justify-center gap-8">
              {highlights.map((item) => (
                <div key={item.name} className="flex items-center space-x-2 text-text-secondary hover:text-neon-primary transition-colors">
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="section-heading">Featured Projects</h2>
            <p className="body-large max-w-2xl mx-auto">
              A selection of recent initiatives spanning leadership, technology, and community impact
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.title} {...project} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Button asChild variant="neon" size="lg">
              <Link to="/projects">
                View All Projects
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Quick Bio */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="glass rounded-3xl p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              <div className="md:col-span-2 space-y-6">
                <h2 className="section-heading">About Ahmed</h2>
                <p className="body-large">
                  I optimize HubSpot CRM, lead student engagement, and build tools that make outreach more human and efficient. Previously founded a university sports club and served as Rotaract VP.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button asChild variant="neon">
                    <Link to="/about">
                      More About Me
                    </Link>
                  </Button>
                  <Button asChild variant="glass">
                    <Link to="/cv">
                      <Download className="h-4 w-4" />
                      Download CV
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="flex justify-center">
                <div className="w-48 h-48 rounded-2xl bg-gradient-surface border border-neon-primary/20 flex items-center justify-center p-8">
                  <img 
                    src="/lovable-uploads/d565c3d6-458e-41eb-8e16-a1ddcfbdc719.png" 
                    alt="Ahmed Wesam Logo" 
                    className="w-full h-full object-contain neon-glow"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}