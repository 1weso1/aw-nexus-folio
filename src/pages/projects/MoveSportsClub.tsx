import { ArrowLeft, Calendar, MapPin, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import ProjectGallery from "@/components/ProjectGallery";
import RelatedProjects from "@/components/RelatedProjects";

import moveTeamImage from "/lovable-uploads/f9f1defa-84d4-4e38-910e-933f050d0cad.png";

const galleryItems = [
  { type: 'image' as const, src: moveTeamImage, alt: 'Move Sports Club team photo', caption: 'MOVE Sports Club founding team' },
  { type: 'instagram' as const, src: 'https://www.instagram.com/p/placeholder1/', alt: 'BUE Club Football Tournament highlights' },
  { type: 'instagram' as const, src: 'https://www.instagram.com/p/placeholder2/', alt: 'Cairo Runners partnership event' },
  { type: 'instagram' as const, src: 'https://www.instagram.com/reel/placeholder3/', alt: 'MOVE Sports Arena competition' },
  { type: 'instagram' as const, src: 'https://www.instagram.com/p/placeholder4/', alt: 'Anti-smoking awareness campaign' },
  { type: 'instagram' as const, src: 'https://www.instagram.com/p/placeholder5/', alt: 'Faculties Football Tournament' }
];

export default function MoveSportsClub() {
  return (
    <>
      <SEO 
        title="Move Sports Club - Ahmed Wesam"
        description="Founded the first university sports club at BUE to unify student athletes and deliver structured competitions. Built organization, governance, partnerships, and event operations."
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
            
            <h1 className="hero-text mb-4">Move Sports Club</h1>
            <p className="text-xl body-large mb-6">Founder & President</p>
            
            <div className="flex flex-wrap gap-2">
              {["Leadership", "Sports Management", "Event Operations", "Partnerships", "Community Building"].map((tag) => (
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
              src={moveTeamImage} 
              alt="Move Sports Club team"
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
                Founded the first university sports club at The British University in Egypt (BUE) to unify student athletes, deliver structured competitions, and create hands-on learning in sports operations. Built the club from zero: organization, governance, partnerships, and a steady cadence of events.
              </p>
            </section>

            {/* Problem & Context */}
            <section>
              <h2 className="section-heading mb-6">Problem & Context</h2>
              <p className="body-large">
                BUE's sports activities were fragmented. Students had passion but few structured pathways to compete, learn event ops, or connect with professional organizers.
              </p>
            </section>

            {/* Approach & Process */}
            <section>
              <h2 className="section-heading mb-6">Approach & Process</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-neon-primary mt-3 flex-shrink-0"></div>
                  <p className="body-large">Launched MOVE as an official multi-discipline club with clear governance and operations.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-neon-primary mt-3 flex-shrink-0"></div>
                  <div>
                    <p className="body-large mb-2">Organized flagship competitions, including:</p>
                    <ul className="ml-4 space-y-1 body-large text-text-secondary">
                      <li>• BUE Club Football Tournament (multi-day, officiated, bracketed)</li>
                      <li>• Faculties Football & Padel Tournaments to drive inter-faculty rivalry and engagement</li>
                      <li>• MOVE Sports Arena (strength/weight-lifting challenges with safety and judging)</li>
                    </ul>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-neon-primary mt-3 flex-shrink-0"></div>
                  <p className="body-large">Partnered with Cairo Runners to place members in internship/training for large-scale run operations (course design, marshal flow, hydration, first aid, comms).</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-neon-primary mt-3 flex-shrink-0"></div>
                  <p className="body-large">Ran community campaigns such as an Anti-Smoking awareness activation and several fitness initiatives.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-neon-primary mt-3 flex-shrink-0"></div>
                  <p className="body-large">Built repeatable checklists/SOPs: permissions, refs/judges, equipment, medics, communications, and results management.</p>
                </div>
              </div>
            </section>

            {/* Outcome & Impact */}
            <section>
              <h2 className="section-heading mb-6">Outcome & Impact</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-neon-accent mt-3 flex-shrink-0"></div>
                  <p className="body-large">A sustained, student-run club with high event turnout and continuous recruitment.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-neon-accent mt-3 flex-shrink-0"></div>
                  <p className="body-large">Students gained real event-management skills and professional exposure.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-neon-accent mt-3 flex-shrink-0"></div>
                  <p className="body-large">Strong external partnerships and a recognizable brand on campus.</p>
                </div>
              </div>
            </section>

            {/* What I Did */}
            <section>
              <h2 className="section-heading mb-6">What I Did</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-neon-primary mt-3 flex-shrink-0"></div>
                  <p className="body-large">Founded MOVE and authored the operating model, budget approach, and safety protocols.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-neon-primary mt-3 flex-shrink-0"></div>
                  <p className="body-large">Led partnerships (e.g., Cairo Runners) and university coordination.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-neon-primary mt-3 flex-shrink-0"></div>
                  <p className="body-large">Directed event design, staffing, risk planning, and post-event reviews.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-neon-primary mt-3 flex-shrink-0"></div>
                  <p className="body-large">Mentored team leads (logistics, media, refereeing, first aid).</p>
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
                    <h4 className="font-semibold text-text-primary mb-2">Organization</h4>
                    <p className="body-large">BUE</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-text-primary mb-2">Partners</h4>
                    <p className="body-large">Cairo Runners, Faculty Councils</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-text-primary mb-2">Audience</h4>
                    <p className="body-large">Students & wider campus community</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Tools & Stack */}
            <section>
              <h2 className="section-heading mb-6">Tools & Stack</h2>
              <div className="flex flex-wrap gap-2">
                {["Event Playbooks", "Scheduling Boards", "Budget Sheets", "Vendor Management", "Safety & First-Aid SOPs"].map((tool) => (
                  <span 
                    key={tool}
                    className="px-3 py-1 bg-surface-card border border-border rounded-full text-sm text-text-secondary"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </section>

            {/* Gallery */}
            <ProjectGallery items={galleryItems} />

            {/* Related Projects */}
            <RelatedProjects currentProjectSlug="move-sports-club" />

          </div>
        </div>
      </div>
    </>
  );
}