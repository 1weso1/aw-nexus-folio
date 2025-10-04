import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Video, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Book = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    window_text: "",
    notes: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("booking_requests")
        .insert([formData]);

      if (error) throw error;

      toast.success("Request sent! I'll review and get back to you within 24 hours.");
      setFormData({
        name: "",
        email: "",
        phone: "",
        window_text: "",
        notes: "",
      });
    } catch (error) {
      console.error("Error submitting booking:", error);
      toast.error("Failed to send request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8">
      {/* Back Button */}
      <div className="max-w-6xl mx-auto mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>
      </div>

      {/* Header */}
      <div className="max-w-6xl mx-auto text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-high">
          Book a Call
        </h1>
        <p className="text-xl text-mid max-w-2xl mx-auto">
          Let's connect and discuss your CRM automation needs, community projects, or collaboration opportunities.
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
        {/* What to Expect Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-high">What to Expect</h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-high mb-1">Duration</h3>
                <p className="text-mid text-sm">
                  30-60 minutes depending on your needs
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-high mb-1">Timeline</h3>
                <p className="text-mid text-sm">
                  I'll reply within 24 hours with available slots
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Video className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-high mb-1">Format</h3>
                <p className="text-mid text-sm">
                  Video call, phone, or in-person (Cairo area)
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <h3 className="font-semibold text-high mb-3">Great for discussing</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-mid text-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                CRM automation strategy
              </li>
              <li className="flex items-center gap-2 text-mid text-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                HubSpot workflow optimization
              </li>
              <li className="flex items-center gap-2 text-mid text-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                Community building projects
              </li>
              <li className="flex items-center gap-2 text-mid text-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                Leadership & collaboration opportunities
              </li>
            </ul>
          </div>
        </div>

        {/* Request Form */}
        <div className="glass p-8 rounded-lg">
          <h2 className="text-2xl font-bold text-high mb-6">Request a Slot</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="name" className="flex items-center gap-2 text-high mb-2">
                <MessageSquare className="h-4 w-4" />
                Name
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your full name"
                required
              />
            </div>

            <div>
              <Label htmlFor="email" className="flex items-center gap-2 text-high mb-2">
                <MessageSquare className="h-4 w-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="window_text" className="flex items-center gap-2 text-high mb-2">
                <Clock className="h-4 w-4" />
                Preferred Time Window
              </Label>
              <Input
                id="window_text"
                name="window_text"
                value={formData.window_text}
                onChange={handleChange}
                placeholder="e.g., Weekdays 2-5 PM, Weekend mornings"
                required
              />
            </div>

            <div>
              <Label htmlFor="notes" className="text-high mb-2 block">
                What would you like to discuss? (optional)
              </Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Brief overview of your project or questions..."
                rows={4}
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? "Sending..." : "Send Request"}
            </Button>

            <p className="text-xs text-mid text-center">
              I'll review your request and get back to you within 24 hours with available times.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Book;
