import { ArrowLeft, Calendar, MapPin, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";

import rotaractImage from "/lovable-uploads/3d3cfa69-a6dc-4a58-8aaf-ec6ba9295513.png";

export default function RotaractVicePresidency() {
  return (
    <>
      <SEO 
        title="Rotaract Vice Presidency - Ahmed Wesam"
        description="As Vice President, led programs that combined community service, youth development, and institutional partnerships—expanding the club's impact and member experience."
      />
      
      <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Back Button */}
          <div className="mb-8">
            <Button asChild variant="ghost" size="sm">
              <Link to="/projects">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Projects
              </Link>
            </Button>
          </div>

          {/* Header */}
          <header className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Badge className="status-live">Live</Badge>
              <div className="flex items-center text-text-secondary text-sm gap-4">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  2023-2024
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  BUE
                </div>
              </div>
            </div>
            
            <h1 className="hero-text mb-4">Rotaract Vice Presidency</h1>
            <p className="text-xl body-large mb-6">Vice President – Rotaract Club, BUE</p>
            
            <div className="flex flex-wrap gap-2">
              {["Leadership", "Community Service", "Partnerships", "Event Management", "Youth Development"].map((tag) => (
                <span 
                  key={tag}
                  className="px-3 py-1 bg-neon-primary/10 text-neon-primary text-sm rounded-full border border-neon-primary/20"
                >
                  {tag}
                </span>
              ))}
            </div>
          </header>

          {/* Hero Image */}
          <div className="relative h-64 md:h-96 mb-12 rounded-2xl overflow-hidden">
            <img 
              src={rotaractImage} 
              alt="Rotaract activities"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-card/80 to-transparent" />
          </div>

          {/* Content Sections */}
          <div className="space-y-12">
            
            {/* Summary */}
            <section>
              <h2 className="section-heading mb-6">Project Summary</h2>
              <p className="body-large">
                As Vice President, led programs that combined community service, youth development, and institutional partnerships—expanding the club's impact and member experience.
              </p>
            </section>

            {/* Problem & Context */}
            <section>
              <h2 className="section-heading mb-6">Problem & Context</h2>
              <p className="body-large">
                Students lacked a consistent pipeline for structured civic action and skills development with credible partners.
              </p>
            </section>

            {/* Approach & Process */}
            <section>
              <h2 className="section-heading mb-6">Approach & Process</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-neon-primary mt-3 flex-shrink-0"></div>
                  <p className="body-large">Run for Health & Wellbeing with UNDP, ministries, and Cairo Runners—health/climate advocacy and community activation.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-neon-primary mt-3 flex-shrink-0"></div>
                  <p className="body-large">Museums for Peace at Prince Mohamed Ali Palace with UNESCO/ICOM partners—cultural diplomacy and peace education.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-neon-primary mt-3 flex-shrink-0"></div>
                  <p className="body-large">Hearing Day with Rotary Egy Deaf—awareness, sign-language demos, assistive tools.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-neon-primary mt-3 flex-shrink-0"></div>
                  <p className="body-large">Garage Sale—student entrepreneurship + sustainability fundraising.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-neon-primary mt-3 flex-shrink-0"></div>
                  <p className="body-large">Iftar Sa'em—Ramadan meal distribution for vulnerable groups.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-neon-primary mt-3 flex-shrink-0"></div>
                  <p className="body-large">Career Workshops—LinkedIn/CV sessions for members and students.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-neon-primary mt-3 flex-shrink-0"></div>
                  <p className="body-large">Pinning Ceremony—membership growth and recognition.</p>
                </div>
              </div>
            </section>

            {/* Outcome & Impact */}
            <section>
              <h2 className="section-heading mb-6">Outcome & Impact</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-neon-accent mt-3 flex-shrink-0"></div>
                  <p className="body-large">Stronger District 2451 presence for BUE's Rotaract; deeper partner network.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-neon-accent mt-3 flex-shrink-0"></div>
                  <p className="body-large">Tangible community outcomes and higher member retention/participation.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-neon-accent mt-3 flex-shrink-0"></div>
                  <p className="body-large">Members gained event ops, partnership management, and advocacy skills.</p>
                </div>
              </div>
            </section>

            {/* What I Did */}
            <section>
              <h2 className="section-heading mb-6">What I Did</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-neon-primary mt-3 flex-shrink-0"></div>
                  <p className="body-large">Drove partner outreach, logistics, compliance, and stakeholder comms.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-neon-primary mt-3 flex-shrink-0"></div>
                  <p className="body-large">Led volunteer recruitment, role assignment, and on-site coordination.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-neon-primary mt-3 flex-shrink-0"></div>
                  <p className="body-large">Managed budgeting, supplies, safety, and impact tracking.</p>
                </div>
              </div>
            </section>

            {/* Quick Facts */}
            <section>
              <h2 className="section-heading mb-6">Quick Facts</h2>
              <div className="glass rounded-2xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-text-primary mb-2">Status</h4>
                    <p className="body-large">Live / Ongoing</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-text-primary mb-2">Partners</h4>
                    <p className="body-large">UNDP, Rotary Egy Deaf, Cairo Runners, UNESCO/ICOM collaborators</p>
                  </div>
                  <div className="col-span-2">
                    <h4 className="font-semibold text-text-primary mb-2">Focus Areas</h4>
                    <p className="body-large">Health, Inclusion, Culture, Youth Skills</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Tools & Stack */}
            <section>
              <h2 className="section-heading mb-6">Tools & Stack</h2>
              <div className="flex flex-wrap gap-2">
                {["Event Checklists", "Partner MOUs", "Volunteer Rosters", "Budget & Impact Sheets"].map((tool) => (
                  <span 
                    key={tool}
                    className="px-3 py-1 bg-surface-card border border-border rounded-full text-sm text-text-secondary"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </section>

          </div>
        </div>
      </div>
    </>
  );
}