import { Download, Award, Users, Briefcase, BookOpen, Code, Database, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

const skills = [
  { name: "CRM Management", icon: Database, level: "Expert" },
  { name: "HubSpot", icon: Database, level: "Advanced" },
  { name: "Recruitment", icon: Users, level: "Advanced" },
  { name: "Event Management", icon: Users, level: "Expert" },
  { name: "Python", icon: Code, level: "Intermediate" },
  { name: "n8n Automation", icon: Code, level: "Advanced" },
  { name: "Leadership", icon: Briefcase, level: "Expert" },
  { name: "Stakeholder Management", icon: Users, level: "Advanced" },
];

const achievements = [
  {
    title: "GRACE Research Competition Winner",
    description: "Anti-Corruption Research in partnership with Arab League",
    year: "2024",
    icon: Award
  },
  {
    title: "Student Ambassadors' Café Approval",
    description: "Successfully pitched and got board approval for student-run café",
    year: "2025",
    icon: Briefcase
  },
  {
    title: "Move Sports Club Founder",
    description: "Built university sports club from zero to active community program",
    year: "2023",
    icon: Users  
  },
  {
    title: "Rotaract Vice President",
    description: "Led community service initiatives and member engagement",
    year: "2023-2024",
    icon: Users
  }
];

const timeline = [
  {
    period: "2024-Present",
    role: "CRM & Recruitment Specialist",
    company: "The British University in Egypt",
    description: "Optimizing HubSpot CRM systems and leading student engagement initiatives. Implementing automation workflows to improve recruitment efficiency."
  },
  {
    period: "2023-2024", 
    role: "Vice President",
    company: "Rotaract Club",
    description: "Led community service projects and managed member engagement. Organized events and coordinated with international Rotaract districts."
  },
  {
    period: "2023-Present",
    role: "Founder & President", 
    company: "Move Sports Club",
    description: "Founded university sports club from concept. Built partnerships with Cairo Runners and established regular programming."
  },
  {
    period: "2022-2024",
    role: "Political Science Student",
    company: "The British University in Egypt", 
    description: "Realized passion lies in people+tech intersection. Pivoted toward CRM and automation while maintaining strong leadership involvement."
  }
];

export default function About() {
  return (
    <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <section className="py-20 text-center">
          <div className="space-y-6">
            <h1 className="hero-text">About Ahmed</h1>
            <p className="text-xl body-large max-w-3xl mx-auto">
              A journey from Political Science to people+tech, driven by curiosity and a passion for building meaningful connections.
            </p>
          </div>
        </section>

        {/* Who I Am Now */}
        <section className="py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="section-heading">Who I Am Today</h2>
              <div className="space-y-4 body-large">
                <p>
                  I'm a CRM & Recruitment specialist at The British University in Egypt, where I optimize HubSpot systems and lead student engagement initiatives. My approach combines data-driven insights with a deeply human-centered perspective.
                </p>
                <p>
                  I thrive at the intersection of people and technology – building systems that make outreach more efficient while keeping authentic connections at the heart of everything I do.
                </p>
                <p>
                  Beyond my day job, I'm passionate about community building, having founded Move Sports Club and served as Rotaract VP, always looking for ways to bring people together around shared goals.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Button variant="hero" size="lg">
                  <Download className="h-4 w-4" />
                  Download CV
                </Button>
                <Button variant="neon" size="lg">
                  <Mail className="h-4 w-4" />
                  Get In Touch
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="glass rounded-3xl p-8 text-center">
                <div className="w-32 h-32 mx-auto mb-6 rounded-2xl bg-gradient-surface border border-neon-primary/20 flex items-center justify-center">
                  <span className="text-4xl font-sora font-bold neon-text">AW</span>
                </div>
                <h3 className="text-xl font-sora font-semibold text-text-primary mb-2">Ahmed Wesam</h3>
                <p className="body-large">CRM & Recruitment Specialist</p>
                <p className="text-neon-primary font-medium">The British University in Egypt</p>
              </div>
            </div>
          </div>
        </section>

        {/* The Pivot Story */}
        <section className="py-16">
          <div className="glass rounded-3xl p-8 md:p-12">
            <h2 className="section-heading text-center mb-8">The Pivot Story</h2>
            <div className="max-w-4xl mx-auto space-y-6 body-large">
              <p>
                I started in Political Science, fascinated by systems and how they shape human behavior. But through my involvement in student activities – founding Move Sports Club, serving as Rotaract VP – I discovered something important about myself.
              </p>
              <p>
                I realized I thrive most when I can combine systematic thinking with direct people impact. The theoretical frameworks of political science were interesting, but I wanted to build things that immediately improved how people connect and collaborate.
              </p>
              <p>
                This realization led me to CRM and automation – fields where I could apply systematic thinking to make human connections more meaningful and efficient. Every HubSpot workflow I build, every recruitment process I optimize, serves the goal of bringing the right people together at the right time.
              </p>
              <p>
                My leadership experience taught me that the best systems are ones that empower people rather than replace them. That's the philosophy I bring to every project.
              </p>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-16">
          <h2 className="section-heading text-center mb-12">Professional Journey</h2>
          <div className="space-y-8">
            {timeline.map((item, index) => (
              <div key={index} className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/4">
                  <span className="px-3 py-1 bg-neon-primary/20 text-neon-primary text-sm font-medium rounded-full">
                    {item.period}
                  </span>
                </div>
                <div className="md:w-3/4 project-card">
                  <h3 className="text-xl font-sora font-semibold text-text-primary mb-1">
                    {item.role}
                  </h3>
                  <p className="text-neon-primary font-medium mb-3">{item.company}</p>
                  <p className="body-large">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Skills & Expertise */}
        <section className="py-16">
          <h2 className="section-heading text-center mb-12">Skills & Expertise</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {skills.map((skill) => (
              <div key={skill.name} className="glass rounded-xl p-6 text-center hover-lift">
                <skill.icon className="h-8 w-8 text-neon-primary mx-auto mb-3" />
                <h3 className="font-sora font-semibold text-text-primary mb-2">{skill.name}</h3>
                <span className="text-sm text-text-secondary">{skill.level}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Achievements */}
        <section id="achievements" className="py-16">
          <h2 className="section-heading text-center mb-12">Key Achievements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {achievements.map((achievement, index) => (
              <div key={index} className="project-card">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-neon-primary/20 rounded-lg">
                    <achievement.icon className="h-6 w-6 text-neon-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-sora font-semibold text-text-primary">{achievement.title}</h3>
                      <span className="text-neon-primary text-sm font-medium">{achievement.year}</span>
                    </div>
                    <p className="body-large">{achievement.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Fun Facts */}
        <section className="py-16">
          <div className="glass rounded-3xl p-8 md:p-12 text-center">
            <h2 className="section-heading mb-8">A Few Fun Facts</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-2">
                <div className="text-3xl font-bold neon-text">50+</div>
                <p className="body-large">Events organized through Rotaract & Move Sports Club</p>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold neon-text">3</div>
                <p className="body-large">Different automation platforms mastered (HubSpot, n8n, Zapier)</p>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold neon-text">1</div>
                <p className="body-large">Café concept that made it all the way to board approval</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}