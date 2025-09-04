import { ArrowLeft, Calendar, User, Tag, ExternalLink, Github, Download, Zap, BarChart, Users } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/ProjectCard";

// Sample project data - in a real app this would come from a CMS or API
const projectData = {
  "crm-automation": {
    title: "CRM Automation Library (2,046 Workflows)",
    role: "Automation Architect & CRM Specialist",
    status: "live" as const,
    date: "2024-Present",
    tags: ["n8n", "CRM", "AI Automation", "HubSpot", "Enterprise", "365+ Integrations"],
    summary: "Built and curated a comprehensive library of 2,046 production-ready n8n automation workflows across 15 business categories. This enterprise-grade automation suite covers everything from CRM management and lead nurturing to AI-powered content generation and social media automation, serving as a complete business automation toolkit.",
    problem: "Small businesses and CRM teams struggle with repetitive manual processes, inconsistent lead management, and fragmented marketing workflows. Existing automation solutions are often expensive, complex to implement, or lack the flexibility needed for diverse business requirements.",
    approach: ["Analyzed common business process pain points across 15 industry categories", "Designed modular workflow architecture for maximum reusability and customization", "Created intelligent categorization system mapping 365+ service integrations to business use cases", "Built comprehensive CRM templates for HubSpot, Salesforce, and major platforms", "Developed AI-powered workflows for content generation, lead scoring, and predictive analytics", "Implemented advanced trigger systems (webhooks, scheduled, manual, complex multi-trigger)", "Created detailed documentation and implementation guides for each workflow category", "Established quality assurance processes ensuring all workflows are production-ready"],
    outcome: "Delivered a comprehensive automation library with 2,046 workflows, 365 unique integrations, and 29,445 total automation nodes. The library covers 15 business categories with proven templates that reduce manual work by 70% and improve lead conversion rates by 45%. Now serves as the foundation for business automation consulting and CRM optimization services.",
    role_details: "Led the complete development and curation of this automation library. Responsible for workflow architecture, integration testing, categorization systems, performance optimization, and creating comprehensive documentation. Collaborated with CRM teams to ensure real-world applicability and business impact measurement.",
    timeline: [{
      period: "Q1 2024",
      milestone: "Initial workflow collection and analysis framework development"
    }, {
      period: "Q2 2024",
      milestone: "Core CRM and lead generation workflow templates completed"
    }, {
      period: "Q3 2024",
      milestone: "AI-powered workflows and advanced integrations implementation"
    }, {
      period: "Q4 2024",
      milestone: "Enterprise-grade templates and documentation system launch"
    }, {
      period: "Q1 2025",
      milestone: "Full library deployment with 2,046 workflows across 15 categories"
    }],
    tools: ["n8n", "HubSpot API", "Salesforce API", "OpenAI", "Google Workspace", "Slack", "Telegram", "Python", "SQLite", "FastAPI"],
    gallery: ["/src/assets/workflow-1.png", "/src/assets/workflow-2.png", "/src/assets/workflow-3.png", "/src/assets/workflow-4.png"],
    links: [{
      label: "Live Workflow Browser",
      url: "#"
    }, {
      label: "Documentation",
      url: "#"
    }, {
      label: "Integration Guide",
      url: "#"
    }]
  },
  "stam-cafe": {
    title: "Student Ambassadors' Café",
    role: "Project Lead & Business Strategist",
    status: "planned" as const,
    date: "2025-2026",
    tags: ["Leadership", "Business Development", "Stakeholder Management", "Financial Planning"],
    summary: "Proposed and built a comprehensive business plan for a student-run café at The British University in Egypt to empower Student Ambassadors, generate revenue for their program, and promote sustainability. Led the complete feasibility study and pitched to the board; the project is approved and scheduled to operate Summer 2026.",
    problem: "Student Ambassadors (STAMs) needed experiential leadership opportunities, budget autonomy, and a visible community touchpoint near the Admissions department. The program lacked hands-on business experience and sustainable revenue streams.",
    approach: ["Conducted comprehensive market research on campus footfall patterns and competitor analysis", "Developed detailed unit economics model including COGS, staffing, and operational costs", "Created menu strategy focused on high-margin items with sustainability considerations", "Designed comprehensive training program for STAM employees covering customer service, operations, and leadership", "Built partnerships with local suppliers and sustainability initiatives (reusable bottles program)", "Developed operational workflows and standard operating procedures", "Created financial projections and ROI analysis for board presentation"],
    outcome: "Board approval achieved with Summer 2026 launch timeline. Expected KPIs include 50-80 daily transactions, 35% profit margin, and 40+ hours of hands-on STAM training monthly. Project will serve as a replicable model for student entrepreneurship programs.",
    role_details: "Led the complete project lifecycle from ideation to board approval. Responsible for financial modeling, stakeholder alignment, presentation design, and cross-functional coordination between Admissions, Student Affairs, and Facilities teams.",
    timeline: [{
      period: "Q4 2024",
      milestone: "Initial concept development and stakeholder interviews"
    }, {
      period: "Q1 2025",
      milestone: "Market research and financial modeling"
    }, {
      period: "Q2 2025",
      milestone: "Business plan completion and board presentation"
    }, {
      period: "Q3 2025",
      milestone: "Board approval and implementation planning"
    }, {
      period: "Q4 2025",
      milestone: "Space preparation and staff training"
    }, {
      period: "Summer 2026",
      milestone: "Official café launch and operations"
    }],
    tools: ["Google Sheets", "Canva", "HubSpot", "Market Research Tools", "Financial Modeling"],
    gallery: ["/src/assets/student-cafe-concept.jpg"],
    links: []
  },
  "move-sports-club": {
    title: "Move Sports Club",
    role: "Founder & President",
    status: "live" as const,
    date: "2023-Present",
    tags: ["Leadership", "Sports Management", "Event Operations", "Partnerships", "Community Building"],
    summary: "Founded the first university sports club at The British University in Egypt (BUE) to unify student athletes, deliver structured competitions, and create hands-on learning in sports operations. Built the club from zero: organization, governance, partnerships, and a steady cadence of events.",
    problem: "BUE's sports activities were fragmented. Students had passion but few structured pathways to compete, learn event ops, or connect with professional organizers.",
    approach: ["Launched MOVE as an official multi-discipline club with clear governance and operations", "Organized flagship competitions including BUE Club Football Tournament (multi-day, officiated, bracketed)", "Partnered with Cairo Runners to place members in internship/training for large-scale run operations", "Ran community campaigns such as Anti-Smoking awareness activation and fitness initiatives", "Built repeatable checklists/SOPs: permissions, refs/judges, equipment, medics, communications, and results management"],
    outcome: "A sustained, student-run club with high event turnout and continuous recruitment. Students gained real event-management skills and professional exposure. Strong external partnerships and a recognizable brand on campus.",
    role_details: "Founded MOVE and authored the operating model, budget approach, and safety protocols. Led partnerships (e.g., Cairo Runners) and university coordination. Directed event design, staffing, risk planning, and post-event reviews. Mentored team leads (logistics, media, refereeing, first aid).",
    timeline: [{
      period: "Q1 2023",
      milestone: "Initial concept development and university approval process"
    }, {
      period: "Q2 2023",
      milestone: "Club registration and core team formation"
    }, {
      period: "Q3 2023",
      milestone: "First flagship events and Cairo Runners partnership"
    }, {
      period: "Q4 2023",
      milestone: "Established regular programming and expanded membership"
    }, {
      period: "2024",
      milestone: "Full event calendar with multiple tournaments and community initiatives"
    }],
    tools: ["Event Playbooks", "Scheduling Boards", "Budget Sheets", "Vendor Management", "Safety & First-Aid SOPs"],
    gallery: ["/lovable-uploads/f9f1defa-84d4-4e38-910e-933f050d0cad.png"],
    links: []
  },
  "rotaract-vice-presidency": {
    title: "Rotaract Vice Presidency",
    role: "Vice President – Rotaract Club, BUE",
    status: "live" as const,
    date: "2023-2024",
    tags: ["Leadership", "Community Service", "Partnerships", "Event Management", "Youth Development"],
    summary: "As Vice President, led programs that combined community service, youth development, and institutional partnerships—expanding the club's impact and member experience.",
    problem: "Students lacked a consistent pipeline for structured civic action and skills development with credible partners.",
    approach: ["Run for Health & Wellbeing with UNDP, ministries, and Cairo Runners—health/climate advocacy and community activation", "Museums for Peace at Prince Mohamed Ali Palace with UNESCO/ICOM partners—cultural diplomacy and peace education", "Hearing Day with Rotary Egy Deaf—awareness, sign-language demos, assistive tools", "Garage Sale—student entrepreneurship + sustainability fundraising", "Iftar Sa'em—Ramadan meal distribution for vulnerable groups", "Career Workshops—LinkedIn/CV sessions for members and students", "Pinning Ceremony—membership growth and recognition"],
    outcome: "Stronger District 2451 presence for BUE's Rotaract; deeper partner network. Tangible community outcomes and higher member retention/participation. Members gained event ops, partnership management, and advocacy skills.",
    role_details: "Drove partner outreach, logistics, compliance, and stakeholder comms. Led volunteer recruitment, role assignment, and on-site coordination. Managed budgeting, supplies, safety, and impact tracking.",
    timeline: [{
      period: "Q1 2023",
      milestone: "VP role appointment and strategic planning"
    }, {
      period: "Q2 2023",
      milestone: "Partnership development with UNDP and UNESCO collaborators"
    }, {
      period: "Q3 2023",
      milestone: "Major community service initiatives launched"
    }, {
      period: "Q4 2023",
      milestone: "Career development programs and member recognition events"
    }, {
      period: "Q1 2024",
      milestone: "Expanded district presence and leadership transition"
    }],
    tools: ["Event Checklists", "Partner MOUs", "Volunteer Rosters", "Budget & Impact Sheets"],
    gallery: ["/lovable-uploads/3d3cfa69-a6dc-4a58-8aaf-ec6ba9295513.png"],
    links: []
  },
  "student-ambassadors-program": {
    title: "Student Ambassador Program Management",
    role: "Program Manager – Student Ambassadors (STAMs), BUE",
    status: "live" as const,
    date: "2023-Present",
    tags: ["Leadership", "Training", "Recruitment", "Event Ops", "CRM"],
    summary: "Professionalized BUE's Student Ambassador Program: structured recruitment, continuous training, digital tracking, and deployment across major admissions/recruitment events.",
    problem: "The program had motivated students but lacked standardized training, performance tracking, and integrated scheduling to meet admissions goals.",
    approach: ["Built a repeatable recruitment → onboarding → placement funnel", "Designed training in public speaking, campus tours, customer service, time management, first aid, and event execution", "Deployed STAMs across Open Days, Focus Days, Under the Stars, fairs, and summer activities", "Introduced CRM (HubSpot/Educatly) for assignments, availability, and performance notes", "Created feedback loops, peer mentoring, and progression paths to senior roles"],
    outcome: "Reliable staffing for admissions/recruitment events with higher visitor satisfaction. Clear performance visibility and faster coordination between teams. Ambassadors developed real workplace skills and leadership habits.",
    role_details: "Owned program design, training calendar, and event deployment plans. Integrated digital tools for scheduling/performance tracking. Coordinated with Admissions/Marketing to meet event KPIs. Coached leads and ran post-event reviews.",
    timeline: [{
      period: "Q1 2023",
      milestone: "Program assessment and digital integration planning"
    }, {
      period: "Q2 2023",
      milestone: "New recruitment and training framework launch"
    }, {
      period: "Q3 2023",
      milestone: "CRM implementation and performance tracking systems"
    }, {
      period: "Q4 2023",
      milestone: "Major events deployment and feedback optimization"
    }, {
      period: "2024",
      milestone: "Full program maturity with senior lead progression paths"
    }],
    tools: ["HubSpot", "Educatly", "Training Guides", "Roster & Shift Boards", "Feedback Forms"],
    gallery: ["/src/assets/student-cafe-concept.jpg"],
    links: []
  }
};
const relatedProjects = [{
  title: "Move Sports Club",
  description: "Founded the first university sports club at BUE to unify student athletes and deliver structured competitions. Built organization, governance, and partnerships from zero.",
  status: "live" as const,
  role: "Founder & President",
  date: "2023-Present",
  tags: ["Leadership", "Sports Management", "Event Operations"],
  link: "/projects/move-sports-club",
  image: "/lovable-uploads/f9f1defa-84d4-4e38-910e-933f050d0cad.png"
}, {
  title: "Rotaract Vice Presidency",
  description: "Led programs combining community service, youth development, and institutional partnerships—expanding the club's impact and member experience.",
  status: "live" as const,
  role: "Vice President – Rotaract Club, BUE",
  date: "2023-2024",
  tags: ["Leadership", "Community Service", "Partnerships"],
  link: "/projects/rotaract-vice-presidency",
  image: "/lovable-uploads/3d3cfa69-a6dc-4a58-8aaf-ec6ba9295513.png"
}, {
  title: "Student Ambassador Program Management",
  description: "Professionalized BUE's Student Ambassador Program with structured recruitment, continuous training, and digital tracking for major admissions events.",
  status: "live" as const,
  role: "Program Manager – Student Ambassadors (STAMs), BUE",
  date: "2023-Present",
  tags: ["Leadership", "Training", "CRM"],
  link: "/projects/student-ambassadors-program",
  image: "/src/assets/student-cafe-concept.jpg"
}];
export default function ProjectDetail() {
  const {
    slug
  } = useParams();
  const project = slug ? projectData[slug as keyof typeof projectData] : null;
  if (!project) {
    return <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
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
      </div>;
  }
  return <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8">
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
            <span className={`status-${project.status === 'planned' ? 'planned' : project.status === 'live' ? 'live' : 'progress'}`}>
              {project.status === 'planned' ? 'Coming Soon' : project.status === 'live' ? 'Live' : 'In Progress'}
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
            {project.tags.map(tag => <span key={tag} className="px-3 py-1 bg-neon-primary/10 text-neon-primary text-sm rounded-md border border-neon-primary/20">
                {tag}
              </span>)}
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
                {project.approach.map((item, index) => <li key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-neon-primary rounded-full mt-2 flex-shrink-0" />
                    <span className="body-large">{item}</span>
                  </li>)}
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
                {project.timeline.map((item, index) => <div key={index} className="flex flex-col md:flex-row gap-4">
                    <div className="md:w-1/4">
                      <span className="px-3 py-1 bg-neon-primary/20 text-neon-primary text-sm font-medium rounded-full">
                        {item.period}
                      </span>
                    </div>
                    <div className="md:w-3/4">
                      <p className="body-large">{item.milestone}</p>
                    </div>
                  </div>)}
              </div>
            </section>

            {/* CRM Automation Stats - Only for CRM Automation project */}
            {slug === 'crm-automation' && <section>
                <h2 className="section-heading">Automation Library Overview</h2>
                <p className="body-large mb-8 text-text-secondary">
                  A comprehensive collection of production-ready workflows covering 15 business categories with 365+ integrations.
                </p>
                
                {/* Stats Overview */}
                <div className="glass rounded-2xl p-8">
                  <h3 className="text-xl font-semibold text-text-primary mb-6 text-center">Library Statistics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                    <div className="space-y-2">
                      <div className="flex items-center justify-center">
                        <Zap className="h-5 w-5 text-neon-primary mr-2" />
                        <span className="text-2xl md:text-3xl font-bold neon-text">2,046</span>
                      </div>
                      <p className="text-sm text-text-secondary">Total Workflows</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-center">
                        <Users className="h-5 w-5 text-neon-primary mr-2" />
                        <span className="text-2xl md:text-3xl font-bold neon-text">365</span>
                      </div>
                      <p className="text-sm text-text-secondary">Integrations</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-center">
                        <BarChart className="h-5 w-5 text-neon-primary mr-2" />
                        <span className="text-2xl md:text-3xl font-bold neon-text">29,445</span>
                      </div>
                      <p className="text-sm text-text-secondary">Automation Nodes</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-center">
                        <Tag className="h-5 w-5 text-neon-primary mr-2" />
                        <span className="text-2xl md:text-3xl font-bold neon-text">15</span>
                      </div>
                      <p className="text-sm text-text-secondary">Categories</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 text-center">
                  <Button asChild variant="default">
                    <Link to="/workflows">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Browse Workflow Library
                    </Link>
                  </Button>
                </div>
              </section>}

            {/* Gallery */}
            {project.gallery.length >= 3}
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
                      {project.status === 'planned' ? 'Coming Soon' : project.status === 'live' ? 'Live' : 'In Progress'}
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
                  {project.tools.map(tool => <span key={tool} className="px-2 py-1 bg-neon-primary/10 text-neon-primary text-xs rounded border border-neon-primary/20">
                      {tool}
                    </span>)}
                </div>
              </div>

              {/* Links */}
              {project.links.length > 0 && <div className="glass rounded-xl p-6">
                  <h3 className="font-sora font-semibold text-text-primary mb-4">Links</h3>
                  <div className="space-y-2">
                    {project.links.map((link, index) => <Button key={index} asChild variant="ghost" size="sm" className="w-full justify-start">
                        <a href={link.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                          {link.label}
                        </a>
                      </Button>)}
                  </div>
                </div>}

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
            {relatedProjects.map(project => <ProjectCard key={project.title} {...project} />)}
          </div>
        </section>
      </div>
    </div>;
}