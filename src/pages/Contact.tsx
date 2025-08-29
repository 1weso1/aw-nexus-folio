import { useState } from "react";
import { Mail, Linkedin, Github, Send, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Message sent!",
        description: "Thanks for reaching out. I'll get back to you within 24 hours.",
      });
      setFormData({ name: "", email: "", subject: "", message: "" });
      setIsSubmitting(false);
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <section className="py-20 text-center">
          <h1 className="hero-text mb-6">Let's Connect</h1>
          <p className="text-xl body-large max-w-3xl mx-auto">
            Whether you're interested in CRM automation, need help with a community project, or just want to chat about building better systems for people, I'd love to hear from you.
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-8">
            {/* Direct Contact */}
            <div className="glass rounded-2xl p-6">
              <h2 className="text-xl font-sora font-semibold text-text-primary mb-6">Get In Touch</h2>
              <div className="space-y-4">
                <a
                  href="mailto:contact@ahmedwesam.com"
                  className="flex items-center space-x-3 text-text-secondary hover:text-neon-primary transition-colors group"
                >
                  <div className="p-2 bg-neon-primary/20 rounded-lg group-hover:bg-neon-primary/30 transition-colors">
                    <Mail className="h-5 w-5 text-neon-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm">contact@ahmedwesam.com</p>
                  </div>
                </a>

                <a
                  href="https://linkedin.com/in/ahmedwesam"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 text-text-secondary hover:text-neon-primary transition-colors group"
                >
                  <div className="p-2 bg-neon-primary/20 rounded-lg group-hover:bg-neon-primary/30 transition-colors">
                    <Linkedin className="h-5 w-5 text-neon-primary" />
                  </div>
                  <div>
                    <p className="font-medium">LinkedIn</p>
                    <p className="text-sm">Professional networking</p>
                  </div>
                </a>

                <a
                  href="https://github.com/ahmedwesam"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 text-text-secondary hover:text-neon-primary transition-colors group"
                >
                  <div className="p-2 bg-neon-primary/20 rounded-lg group-hover:bg-neon-primary/30 transition-colors">
                    <Github className="h-5 w-5 text-neon-primary" />
                  </div>
                  <div>
                    <p className="font-medium">GitHub</p>
                    <p className="text-sm">Code & projects</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Location & Availability */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-sora font-semibold text-text-primary mb-4">Location & Availability</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-text-secondary">
                  <MapPin className="h-4 w-4 text-neon-primary" />
                  <span>Cairo, Egypt (GMT+2)</span>
                </div>
                <div className="flex items-center space-x-3 text-text-secondary">
                  <Calendar className="h-4 w-4 text-neon-primary" />
                  <span>Usually respond within 24 hours</span>
                </div>
              </div>
            </div>

            {/* Quick Book Call */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-sora font-semibold text-text-primary mb-4">Schedule a Call</h3>
              <p className="body-large mb-4">
                Prefer to chat directly? Let's schedule a 30-minute call to discuss your project or idea.
              </p>
              <Button variant="neon" className="w-full">
                <Calendar className="h-4 w-4" />
                Book a Call
              </Button>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="glass rounded-2xl p-8">
              <h2 className="text-2xl font-sora font-semibold text-text-primary mb-6">Send a Message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-2">
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 glass rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:border-neon-primary/50"
                      placeholder="Ahmed Wesam"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 glass rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:border-neon-primary/50"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-text-primary mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 glass rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:border-neon-primary/50"
                    placeholder="CRM automation project / Freelance collaboration / etc."
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-text-primary mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 glass rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:border-neon-primary/50 resize-vertical"
                    placeholder="Tell me about your project, challenge, or just say hi..."
                  />
                </div>

                <Button 
                  type="submit" 
                  variant="hero" 
                  size="lg" 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    "Sending..."
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Response Time & Preferences */}
        <section className="py-16">
          <div className="glass rounded-3xl p-8 md:p-12">
            <h2 className="section-heading text-center mb-8">What to Expect</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-neon-primary/20 rounded-lg flex items-center justify-center mx-auto">
                  <Mail className="h-6 w-6 text-neon-primary" />
                </div>
                <h3 className="font-sora font-semibold text-text-primary">Quick Response</h3>
                <p className="body-large text-sm">I typically respond to messages within 24 hours, often much sooner.</p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-neon-primary/20 rounded-lg flex items-center justify-center mx-auto">
                  <Calendar className="h-6 w-6 text-neon-primary" />
                </div>
                <h3 className="font-sora font-semibold text-text-primary">Flexible Scheduling</h3>
                <p className="body-large text-sm">Happy to work around your timezone for calls and collaborative work.</p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-neon-primary/20 rounded-lg flex items-center justify-center mx-auto">
                  <Send className="h-6 w-6 text-neon-primary" />
                </div>
                <h3 className="font-sora font-semibold text-text-primary">Thoughtful Replies</h3>
                <p className="body-large text-sm">I take time to understand your needs and provide helpful, actionable responses.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}