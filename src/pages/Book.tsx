import { Calendar, Clock, Video, MessageSquare, CheckCircle, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const meetingTypes = [
  {
    title: "Quick Chat",
    duration: "15 minutes",
    description: "Brief discussion about a project, collaboration, or quick question. Perfect for initial conversations.",
    features: ["Video or phone call", "Project overview", "Quick Q&A", "Next steps planning"],
    price: "Free",
    bookingUrl: "#", // Replace with actual booking link
    icon: MessageSquare,
    popular: false
  },
  {
    title: "Project Discussion",
    duration: "30 minutes", 
    description: "In-depth conversation about CRM automation, student engagement strategies, or collaboration opportunities.",
    features: ["Detailed project review", "Strategy discussion", "Resource planning", "Implementation roadmap"],
    price: "Free",
    bookingUrl: "#", // Replace with actual booking link
    icon: Video,
    popular: true
  },
  {
    title: "Consultation",
    duration: "60 minutes",
    description: "Comprehensive consultation for CRM optimization, automation setup, or student program development.",
    features: ["Full assessment", "Custom recommendations", "Tool evaluation", "Step-by-step plan", "Follow-up resources"],
    price: "Contact for pricing",
    bookingUrl: "#", // Replace with actual booking link
    icon: CheckCircle,
    popular: false
  }
];

const availability = [
  { day: "Monday - Thursday", time: "9:00 AM - 6:00 PM" },
  { day: "Friday", time: "9:00 AM - 2:00 PM" },
  { day: "Saturday - Sunday", time: "By appointment" }
];

export default function Book() {
  return (
    <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button asChild variant="ghost" className="mb-6">
            <Link to="/contact">
              <ArrowLeft className="h-4 w-4" />
              Back to Contact
            </Link>
          </Button>
          
          <div className="text-center mb-12">
            <h1 className="hero-text mb-6">Book a Call</h1>
            <p className="text-xl body-large max-w-3xl mx-auto">
              Let's discuss your CRM needs, automation ideas, or collaboration opportunities. 
              Choose the format that works best for your goals.
            </p>
          </div>
        </div>

        {/* Meeting Types */}
        <section className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {meetingTypes.map((meeting) => (
              <div key={meeting.title} className={`project-card relative ${meeting.popular ? 'border-neon-primary/50' : ''}`}>
                {meeting.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-neon-primary px-3 py-1 rounded-full text-sm font-medium text-hero-bg">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-neon-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <meeting.icon className="h-8 w-8 text-neon-primary" />
                    </div>
                    <h3 className="text-2xl font-bold font-sora text-text-primary mb-2">{meeting.title}</h3>
                    <div className="flex items-center justify-center text-text-secondary mb-3">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{meeting.duration}</span>
                    </div>
                    <p className="body-large text-sm">{meeting.description}</p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-sora font-semibold text-text-primary">What's included:</h4>
                    <ul className="space-y-2">
                      {meeting.features.map((feature, index) => (
                        <li key={index} className="flex items-start text-sm text-text-secondary">
                          <CheckCircle className="h-4 w-4 text-neon-primary mr-2 flex-shrink-0 mt-0.5" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="text-center space-y-4">
                    <div className="text-2xl font-bold text-neon-primary">{meeting.price}</div>
                    <Button 
                      className={`w-full ${meeting.popular ? 'bg-gradient-to-r from-neon-primary to-neon-accent' : 'variant-hero'}`}
                      onClick={() => {
                        // For now, redirect to contact page
                        // In a real implementation, this would open a booking widget
                        window.location.href = '/contact';
                      }}
                    >
                      <Calendar className="h-4 w-4" />
                      Book Now
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Availability */}
        <section className="py-16">
          <div className="glass rounded-3xl p-8 md:p-12">
            <h2 className="section-heading text-center mb-8">Availability</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <h3 className="text-xl font-sora font-semibold text-text-primary mb-4">Timezone & Hours</h3>
                {availability.map((slot, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-surface-card/50 rounded-lg">
                    <span className="font-medium text-text-primary">{slot.day}</span>
                    <span className="text-text-secondary">{slot.time}</span>
                  </div>
                ))}
                <div className="text-sm text-text-secondary mt-4">
                  <strong>Timezone:</strong> Cairo, Egypt (GMT+2)
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-sora font-semibold text-text-primary">Before We Meet</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-neon-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-neon-primary text-sm font-bold">1</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-text-primary">Prepare Your Questions</h4>
                      <p className="text-sm text-text-secondary">Think about your main goals and challenges</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-neon-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-neon-primary text-sm font-bold">2</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-text-primary">Share Context</h4>
                      <p className="text-sm text-text-secondary">Brief overview of your project or organization</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-neon-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-neon-primary text-sm font-bold">3</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-text-primary">Test Your Setup</h4>
                      <p className="text-sm text-text-secondary">Ensure your camera and microphone work</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Alternative Contact */}
        <section className="py-16 text-center">
          <div className="glass rounded-2xl p-8">
            <h3 className="section-heading mb-4">Prefer Email?</h3>
            <p className="body-large mb-6">
              Not ready for a call? Send me a message first and we can schedule something that works for both of us.
            </p>
            <Button asChild variant="hero">
              <Link to="/contact">
                <MessageSquare className="h-4 w-4" />
                Send Message Instead
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}