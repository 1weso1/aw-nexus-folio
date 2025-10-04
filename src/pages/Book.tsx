import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, Video, MessageSquare, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CalendarGrid } from "@/components/CalendarGrid";
import { TimeSlotPicker } from "@/components/TimeSlotPicker";
import { format } from "date-fns";

interface GroupedSlots {
  [date: string]: string[];
}

const Book = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingAvailability, setLoadingAvailability] = useState(true);
  const [availableSlots, setAvailableSlots] = useState<GroupedSlots>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [showManualForm, setShowManualForm] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    window_text: "",
    notes: "",
  });

  // Fetch Calendly availability on mount
  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-calendly-availability');
        
        if (error) throw error;
        
        if (data?.slots) {
          setAvailableSlots(data.slots);
          console.log("Loaded availability:", Object.keys(data.slots).length, "days");
        }
      } catch (error) {
        console.error("Error fetching availability:", error);
        toast.error("Unable to load calendar availability. Please use the request form below.");
        setShowManualForm(true);
      } finally {
        setLoadingAvailability(false);
      }
    };

    fetchAvailability();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleQuickBook = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error("Please select a date and time");
      return;
    }

    if (!formData.name || !formData.email) {
      toast.error("Please provide your name and email");
      return;
    }

    setIsSubmitting(true);

    try {
      const timeString = format(new Date(selectedTime), 'MMMM d, yyyy h:mm a');
      
      const { error } = await supabase
        .from("booking_requests")
        .insert([{
          ...formData,
          window_text: timeString,
        }]);

      if (error) throw error;

      toast.success("Call booked successfully! Check your email for confirmation.");
      setFormData({
        name: "",
        email: "",
        phone: "",
        window_text: "",
        notes: "",
      });
      setSelectedDate(null);
      setSelectedTime(null);
    } catch (error) {
      console.error("Error booking call:", error);
      toast.error("Failed to book call. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("booking_requests")
        .insert([formData]);

      if (error) throw error;

      toast.success("Booking request sent! I'll get back to you soon.");
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

      <div className="max-w-6xl mx-auto">
        {/* What to Expect Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="glass p-6 rounded-lg">
            <div className="flex items-start gap-4">
              <Clock className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold mb-2 text-high">Duration</h3>
                <p className="text-mid">
                  30-minute focused conversation tailored to your needs
                </p>
              </div>
            </div>
          </div>

          <div className="glass p-6 rounded-lg">
            <div className="flex items-start gap-4">
              <Calendar className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold mb-2 text-high">Response Time</h3>
                <p className="text-mid">
                  Instant booking with real-time availability
                </p>
              </div>
            </div>
          </div>

          <div className="glass p-6 rounded-lg">
            <div className="flex items-start gap-4">
              <Video className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold mb-2 text-high">Format</h3>
                <p className="text-mid">
                  Video call via Google Meet or Zoom - your choice
                </p>
              </div>
            </div>
          </div>

          <div className="glass p-6 rounded-lg">
            <div className="flex items-start gap-4">
              <MessageSquare className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold mb-2 text-high">Topics</h3>
                <p className="text-mid">
                  CRM strategy, recruitment automation, or collaboration opportunities
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Booking Section */}
        {!showManualForm && !loadingAvailability && Object.keys(availableSlots).length > 0 && (
          <div className="mb-12 space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-high mb-2">Book Your Call</h2>
              <p className="text-mid">Select a date and time that works for you</p>
            </div>

            <CalendarGrid
              availableDates={Object.keys(availableSlots)}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />

            {selectedDate && availableSlots[selectedDate] && (
              <TimeSlotPicker
                timeSlots={availableSlots[selectedDate]}
                selectedTime={selectedTime}
                onSelectTime={setSelectedTime}
                selectedDate={selectedDate}
              />
            )}

            {selectedTime && (
              <div className="glass p-8 rounded-lg max-w-2xl mx-auto">
                <h3 className="text-xl font-semibold mb-4 text-high">Complete Your Booking</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="quick-name">Name *</Label>
                    <Input
                      id="quick-name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your full name"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="quick-email">Email *</Label>
                    <Input
                      id="quick-email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="quick-phone">Phone (Optional)</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-mid" />
                      <Input
                        id="quick-phone"
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+20 123 456 7890"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="quick-notes">What would you like to discuss? (Optional)</Label>
                    <Textarea
                      id="quick-notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="Brief overview of topics..."
                      rows={3}
                    />
                  </div>

                  <Button
                    onClick={handleQuickBook}
                    disabled={isSubmitting}
                    className="w-full"
                  >
                    {isSubmitting ? "Booking..." : `Confirm Booking for ${format(new Date(selectedTime), 'MMM d, h:mm a')}`}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {loadingAvailability && (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="text-mid mt-4">Loading available times...</p>
          </div>
        )}

        {/* Manual Request Form */}
        <div className="glass p-8 rounded-lg max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-high mb-2">
              {showManualForm || Object.keys(availableSlots).length === 0 ? "Request a Time Slot" : "Or Request a Custom Time"}
            </h2>
            <p className="text-mid text-sm">
              Can't find a suitable time? Let me know your availability
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name">Name *</Label>
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
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@example.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone (Optional)</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-mid" />
                <Input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+20 123 456 7890"
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="window_text">Preferred Time Window *</Label>
              <Input
                id="window_text"
                name="window_text"
                value={formData.window_text}
                onChange={handleChange}
                placeholder="e.g., Weekday mornings, Tuesdays 2-5 PM"
                required
              />
            </div>

            <div>
              <Label htmlFor="notes">What would you like to discuss? (Optional)</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Brief overview of topics you'd like to cover..."
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
          </form>
        </div>
      </div>
    </div>
  );
};

export default Book;
