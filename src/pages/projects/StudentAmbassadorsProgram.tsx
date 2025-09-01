import { ArrowLeft, Calendar, MapPin, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";

import heroImage from "/src/assets/student-cafe-concept.jpg";

export default function StudentAmbassadorsProgram() {
  return (
    <>
      <SEO 
        title="Student Ambassador Program Management - Ahmed Wesam"
        description="Professionalized BUE's Student Ambassador Program: structured recruitment, continuous training, digital tracking, and deployment across major admissions/recruitment events."
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
                  2023-Present
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  BUE
                </div>
              </div>
            </div>
            
            <h1 className="hero-text mb-4">Student Ambassador Program Management</h1>
            <p className="text-xl body-large mb-6">Program Manager – Student Ambassadors (STAMs), BUE</p>
            
            <div className="flex flex-wrap gap-2">
              {["Leadership", "Training", "Recruitment", "Event Ops", "CRM"].map((tag) => (
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
              src={heroImage} 
              alt="Student Ambassador Program"
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
                Professionalized BUE's Student Ambassador Program: structured recruitment, continuous training, digital tracking, and deployment across major admissions/recruitment events.
              </p>
            </section>

            {/* Problem & Context */}
            <section>
              <h2 className="section-heading mb-6">Problem & Context</h2>
              <p className="body-large">
                The program had motivated students but lacked standardized training, performance tracking, and integrated scheduling to meet admissions goals.
              </p>
            </section>

            {/* Approach & Process */}
            <section>
              <h2 className="section-heading mb-6">Approach & Process</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-neon-primary mt-3 flex-shrink-0"></div>
                  <p className="body-large">Built a repeatable recruitment → onboarding → placement funnel.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-neon-primary mt-3 flex-shrink-0"></div>
                  <p className="body-large">Designed training in public speaking, campus tours, customer service, time management, first aid, and event execution.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-neon-primary mt-3 flex-shrink-0"></div>
                  <p className="body-large">Deployed STAMs across Open Days, Focus Days, Under the Stars, fairs, and summer activities.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-neon-primary mt-3 flex-shrink-0"></div>
                  <p className="body-large">Introduced CRM (HubSpot/Educatly) for assignments, availability, and performance notes.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-neon-primary mt-3 flex-shrink-0"></div>
                  <p className="body-large">Created feedback loops, peer mentoring, and progression paths to senior roles.</p>
                </div>
              </div>
            </section>

            {/* Outcome & Impact */}
            <section>
              <h2 className="section-heading mb-6">Outcome & Impact</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-neon-accent mt-3 flex-shrink-0"></div>
                  <p className="body-large">Reliable staffing for admissions/recruitment events with higher visitor satisfaction.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-neon-accent mt-3 flex-shrink-0"></div>
                  <p className="body-large">Clear performance visibility and faster coordination between teams.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-neon-accent mt-3 flex-shrink-0"></div>
                  <p className="body-large">Ambassadors developed real workplace skills and leadership habits.</p>
                </div>
              </div>
            </section>

            {/* What I Did */}
            <section>
              <h2 className="section-heading mb-6">What I Did</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-neon-primary mt-3 flex-shrink-0"></div>
                  <p className="body-large">Owned program design, training calendar, and event deployment plans.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-neon-primary mt-3 flex-shrink-0"></div>
                  <p className="body-large">Integrated digital tools for scheduling/performance tracking.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-neon-primary mt-3 flex-shrink-0"></div>
                  <p className="body-large">Coordinated with Admissions/Marketing to meet event KPIs.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-neon-primary mt-3 flex-shrink-0"></div>
                  <p className="body-large">Coached leads and ran post-event reviews.</p>
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
                    <h4 className="font-semibold text-text-primary mb-2">Teams Served</h4>
                    <p className="body-large">Admissions & Marketing</p>
                  </div>
                  <div className="col-span-2">
                    <h4 className="font-semibold text-text-primary mb-2">Headcount</h4>
                    <p className="body-large">Cohorts of student ambassadors with senior leads</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Tools & Stack */}
            <section>
              <h2 className="section-heading mb-6">Tools & Stack</h2>
              <div className="flex flex-wrap gap-2">
                {["HubSpot", "Educatly", "Training Guides", "Roster & Shift Boards", "Feedback Forms"].map((tool) => (
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