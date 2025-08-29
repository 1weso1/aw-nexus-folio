import { ExternalLink, ArrowUpRight, Smartphone, Code, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

import couplesAppImage from "/src/assets/couples-app-mockup.jpg";
import crmDashboardImage from "/src/assets/crm-workflow-dashboard.jpg";

const apps = [
  {
    name: "Strings 'Attached'",
    description: "A playful app to strengthen relationships with smart nudges and interactive challenges. Features couple goals, conversation starters, and relationship milestones.",
    status: "preview" as const,
    tech: ["FlutterFlow", "Supabase", "Mobile"],
    demoUrl: "couples.ahmedwesam.com",
    caseStudyUrl: "/projects/strings-attached",
    image: couplesAppImage,
    features: ["Relationship Goals", "Daily Nudges", "Couple Challenges", "Progress Tracking"]
  },
  {
    name: "CRM Automation Library",
    description: "Comprehensive automation library with 2,053+ n8n workflows across 15 business categories. Interactive browser for CRM, AI, and marketing automation templates with live previews and implementation guides.",
    status: "live" as const,
    tech: ["n8n", "React", "AI Integration", "365+ APIs"],
    demoUrl: "automation.ahmedwesam.com",
    caseStudyUrl: "/projects/crm-automation",
    image: crmDashboardImage,
    features: ["2,053 Workflows", "15 Categories", "365+ Integrations", "AI-Powered Templates"]
  }
];

const statusStyles = {
  live: "status-live",
  preview: "status-progress",
  "in-progress": "status-planned"
};

const statusLabels = {
  live: "Live",
  preview: "Preview", 
  "in-progress": "In Development"
};

export default function Apps() {
  return (
    <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <section className="py-20 text-center">
          <h1 className="hero-text mb-6">Live Apps & Demos</h1>
          <p className="text-xl body-large max-w-3xl mx-auto mb-8">
            Interactive demonstrations of projects in development. Each app runs on its own subdomain for easy access and testing.
          </p>
          
          {/* Info Banner */}
          <div className="glass rounded-xl p-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-2 text-neon-primary mb-2">
              <Globe className="h-5 w-5" />
              <span className="font-semibold">Subdomain Structure</span>
            </div>
            <p className="body-large">
              Live apps are hosted on subdomains like <code className="bg-neon-primary/20 px-2 py-1 rounded text-neon-primary">app.ahmedwesam.com</code>
            </p>
          </div>
        </section>

        {/* Apps Grid */}
        <section className="py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {apps.map((app) => (
              <div key={app.name} className="project-card group">
                {/* App Image */}
                <div className="relative h-64 mb-6 rounded-xl overflow-hidden">
                  <img 
                    src={app.image} 
                    alt={app.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-card/80 to-transparent" />
                  <div className="absolute top-4 right-4">
                    <span className={statusStyles[app.status]}>
                      {statusLabels[app.status]}
                    </span>
                  </div>
                </div>

                {/* App Info */}
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <h3 className="text-2xl font-bold font-sora text-text-primary group-hover:text-neon-primary transition-colors">
                      {app.name}
                    </h3>
                    <Smartphone className="h-6 w-6 text-neon-primary" />
                  </div>

                  <p className="body-large">{app.description}</p>

                  {/* Tech Stack */}
                  <div className="flex flex-wrap gap-2">
                    {app.tech.map((tech) => (
                      <span 
                        key={tech}
                        className="px-3 py-1 bg-neon-primary/10 text-neon-primary text-sm rounded-md border border-neon-primary/20"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Features */}
                  <div className="space-y-2">
                    <h4 className="font-sora font-semibold text-text-primary">Key Features:</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {app.features.map((feature) => (
                        <div key={feature} className="flex items-center text-text-secondary text-sm">
                          <div className="w-1.5 h-1.5 bg-neon-primary rounded-full mr-2" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    {app.status === "live" || app.status === "preview" ? (
                      <Button variant="hero" size="lg" className="flex-1">
                        <ExternalLink className="h-4 w-4" />
                        {app.status === "live" ? "Open Live App" : "Open Preview"}
                      </Button>
                    ) : (
                      <div className="flex-1 text-center py-3 px-6 bg-text-secondary/20 text-text-secondary rounded-lg">
                        <Code className="h-4 w-4 inline mr-2" />
                        Preview Coming Soon
                      </div>
                    )}
                    
                    <Button asChild variant="glass" size="lg">
                      <Link to={app.caseStudyUrl}>
                        Case Study
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>

                  {/* Demo URL */}
                  <div className="pt-2 text-center">
                    <p className="text-text-secondary text-sm">
                      Demo URL: <code className="bg-neon-primary/20 px-2 py-1 rounded text-neon-primary">{app.demoUrl}</code>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Coming Soon */}
        <section className="py-16">
          <div className="glass rounded-3xl p-8 md:p-12 text-center">
            <h2 className="section-heading mb-6">More Apps Coming Soon</h2>
            <p className="body-large mb-8 max-w-2xl mx-auto">
              I'm constantly building new tools and demos. Each project gets its own subdomain for easy access and testing. Follow along as new apps go live!
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="space-y-3 p-6 bg-surface-card/50 rounded-xl border border-neon-primary/10">
                <div className="w-12 h-12 bg-neon-primary/20 rounded-lg flex items-center justify-center mx-auto">
                  <Code className="h-6 w-6 text-neon-primary" />
                </div>
                <h3 className="font-sora font-semibold text-text-primary">HubSpot Tools</h3>
                <p className="text-text-secondary text-sm">Custom property calculators and workflow builders</p>
              </div>
              
              <div className="space-y-3 p-6 bg-surface-card/50 rounded-xl border border-neon-primary/10">
                <div className="w-12 h-12 bg-neon-primary/20 rounded-lg flex items-center justify-center mx-auto">
                  <Smartphone className="h-6 w-6 text-neon-primary" />
                </div>
                <h3 className="font-sora font-semibold text-text-primary">Mobile Utilities</h3>
                <p className="text-text-secondary text-sm">Event management and community building apps</p>
              </div>
              
              <div className="space-y-3 p-6 bg-surface-card/50 rounded-xl border border-neon-primary/10">
                <div className="w-12 h-12 bg-neon-primary/20 rounded-lg flex items-center justify-center mx-auto">
                  <Globe className="h-6 w-6 text-neon-primary" />
                </div>
                <h3 className="font-sora font-semibold text-text-primary">Web Dashboards</h3>
                <p className="text-text-secondary text-sm">Analytics and automation monitoring interfaces</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}