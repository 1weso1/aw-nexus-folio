import { useState } from "react";
import { Mail, Linkedin, Instagram, Send, MapPin, Calendar, MessageSquare, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Add honeypot protection (simple)
      const honeypot = (document.querySelector('input[name="honeypot"]') as HTMLInputElement)?.value;
      if (honeypot) {
        // Bot detected, silently fail
        setIsSubmitting(false);
        return;
      }

      const { error } = await supabase
        .from('contact_messages')
        .insert([formData]);

      if (error) throw error;

      toast({
        title: "Thanks—message received.",
        description: "I'll get back to you soon!",
      });

      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
              <h2 className="section-heading text-xl mb-6">Get in Touch</h2>
              <div className="space-y-4">
                <a 
                  href="mailto:contact@ahmedwesam.com"
                  className="flex items-center p-4 glass rounded-xl hover-lift group"
                >
                  <Mail className="h-5 w-5 text-neon-primary mr-3" />
                  <div>
                    <div className="font-medium text-text-primary group-hover:text-neon-primary transition-colors">
                      Email
                    </div>
                    <div className="text-sm text-text-secondary">contact@ahmedwesam.com</div>
                  </div>
                </a>

                <a 
                  href="https://www.linkedin.com/in/ahmed-wesam-3b57bb1b1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-4 glass rounded-xl hover-lift group"
                >
                  <Linkedin className="h-5 w-5 text-neon-primary mr-3" />
                  <div>
                    <div className="font-medium text-text-primary group-hover:text-neon-primary transition-colors">
                      LinkedIn
                    </div>
                    <div className="text-sm text-text-secondary">Professional network</div>
                  </div>
                </a>
                
                <Button asChild variant="hero" size="lg" className="w-full">
                  <a href="/book">
                    <Calendar className="h-4 w-4" />
                    Book a Call
                  </a>
                </Button>
              </div>
            </div>

            {/* Availability */}
            <div className="glass rounded-2xl p-6">
              <h2 className="section-heading text-xl mb-6">Availability</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 text-neon-primary mr-3" />
                  <span className="text-text-primary">Cairo, Egypt (GMT+2)</span>
                </div>
                <div className="flex items-center">
                  <MessageSquare className="h-4 w-4 text-neon-primary mr-3" />
                  <span className="text-text-primary">Response time: Within 24 hours</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-neon-primary mr-3" />
                  <span className="text-text-primary">Available for calls & meetings</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="glass rounded-2xl p-8">
              <h2 className="section-heading text-xl mb-6">Send a Message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Honeypot field */}
                <input
                  type="text"
                  name="honeypot"
                  style={{ display: 'none' }}
                  tabIndex={-1}
                  autoComplete="off"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      <User className="h-4 w-4 inline mr-1" />
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 glass rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:border-neon-primary/50"
                      placeholder="Your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      <Mail className="h-4 w-4 inline mr-1" />
                      Email
                    </label>
                    <input
                      type="email"
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
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    <MessageSquare className="h-4 w-4 inline mr-1" />
                    Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 glass rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:border-neon-primary/50"
                    placeholder="What's this about?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    required
                    className="w-full px-4 py-3 glass rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:border-neon-primary/50 resize-none"
                    placeholder="Tell me about your project, question, or how we might collaborate..."
                  />
                </div>

                <Button 
                  type="submit" 
                  variant="hero" 
                  size="lg" 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  <Send className="h-4 w-4" />
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* What to Expect */}
        <section className="py-16">
          <div className="glass rounded-3xl p-8 md:p-12 text-center">
            <h2 className="section-heading mb-8">What to Expect</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <div className="w-12 h-12 bg-neon-primary/20 rounded-full flex items-center justify-center mx-auto">
                  <MessageSquare className="h-6 w-6 text-neon-primary" />
                </div>
                <h3 className="font-sora font-semibold text-text-primary">Quick Response</h3>
                <p className="body-large text-sm">I typically respond within 24 hours, often much sooner during Cairo business hours.</p>
              </div>
              <div className="space-y-3">
                <div className="w-12 h-12 bg-neon-primary/20 rounded-full flex items-center justify-center mx-auto">
                  <User className="h-6 w-6 text-neon-primary" />
                </div>
                <h3 className="font-sora font-semibold text-text-primary">Personal Touch</h3>
                <p className="body-large text-sm">Every message gets a personal response. I read and reply to everything myself.</p>
              </div>
              <div className="space-y-3">
                <div className="w-12 h-12 bg-neon-primary/20 rounded-full flex items-center justify-center mx-auto">
                  <Calendar className="h-6 w-6 text-neon-primary" />
                </div>
                <h3 className="font-sora font-semibold text-text-primary">Follow Through</h3>
                <p className="body-large text-sm">If your message needs a longer conversation, I'll suggest a call or video chat.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}