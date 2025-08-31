import { useState } from "react";
import { ArrowLeft, Calendar, Clock, User, Mail, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export default function Book() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    window_text: "",
    notes: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('booking_requests')
        .insert([formData]);

      if (error) throw error;

      toast({
        title: "Booking Request Submitted!",
        description: "Thanks—I'll reply with a time.",
      });

      setFormData({ name: "", email: "", window_text: "", notes: "" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to submit request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-8">
          <Button asChild variant="ghost">
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        {/* Header */}
        <section className="text-center mb-12">
          <h1 className="hero-text text-4xl md:text-5xl mb-6">Book a Call</h1>
          <p className="text-xl body-large max-w-3xl mx-auto">
            Let's connect and discuss your CRM automation needs, community projects, or collaboration opportunities.
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Information */}
          <div className="space-y-6">
            <div className="glass rounded-2xl p-6">
              <h2 className="text-xl font-sora font-semibold text-text-primary mb-4">What to Expect</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-neon-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-text-primary">Duration</h3>
                    <p className="body-large text-sm">30-60 minutes depending on your needs</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-neon-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-text-primary">Timeline</h3>
                    <p className="body-large text-sm">I'll reply within 24 hours with available slots</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <MessageSquare className="h-5 w-5 text-neon-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-text-primary">Format</h3>
                    <p className="body-large text-sm">Video call, phone, or in-person (Cairo area)</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-6">
              <h2 className="text-xl font-sora font-semibold text-text-primary mb-4">Great for discussing</h2>
              <ul className="space-y-2 body-large text-sm">
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-neon-primary rounded-full"></div>
                  <span>CRM automation strategy</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-neon-primary rounded-full"></div>
                  <span>HubSpot workflow optimization</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-neon-primary rounded-full"></div>
                  <span>Community building projects</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-neon-primary rounded-full"></div>
                  <span>Leadership & collaboration opportunities</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Booking Form */}
          <div className="glass rounded-2xl p-8">
            <h2 className="text-xl font-sora font-semibold text-text-primary mb-6">Request a Slot</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
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

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Preferred Time Window
                </label>
                <input
                  type="text"
                  name="window_text"
                  value={formData.window_text}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 glass rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:border-neon-primary/50"
                  placeholder="e.g., Weekdays 2-5 PM, Weekend mornings"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  <MessageSquare className="h-4 w-4 inline mr-1" />
                  What would you like to discuss? (optional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 glass rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:border-neon-primary/50 resize-none"
                  placeholder="Brief overview of your project or questions..."
                />
              </div>

              <Button
                type="submit"
                variant="hero"
                size="lg"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Send Request"}
              </Button>
            </form>

            <p className="text-text-secondary text-sm text-center mt-4">
              I'll review your request and get back to you within 24 hours with available times.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}