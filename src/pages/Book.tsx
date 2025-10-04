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
  const [eventTypeUri, setEventTypeUri] = useState<string>("");
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
          setEventTypeUri(data.eventType?.uri || "");
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

    if (!eventTypeUri) {
      toast.error("Event type information is missing. Please refresh and try again.");
      return;
    }

    setIsSubmitting(true);

    try {
      const timeString = format(new Date(selectedTime), 'MMMM d, yyyy h:mm a');
      
      // First, create the Calendly scheduling link
      const { data: calendlyData, error: calendlyError } = await supabase.functions.invoke('create-calendly-booking', {
        body: {
          event_type_uri: eventTypeUri,
          start_time: selectedTime,
          invitee_name: formData.name,
          invitee_email: formData.email,
          invitee_phone: formData.phone,
          notes: formData.notes,
        }
      });

      if (calendlyError || !calendlyData?.success) {
        throw new Error(calendlyData?.error || calendlyError?.message || "Failed to create Calendly booking");
      }

      console.log("Calendly scheduling link created:", calendlyData);

      // Store in our database
      const { error: dbError } = await supabase
        .from("booking_requests")
        .insert([{
          ...formData,
          window_text: timeString,
        }]);

      if (dbError) {
        console.error("DB insert error:", dbError);
      }

      // Redirect to Calendly to complete the booking
      toast.success("Redirecting to complete your booking...");
      setTimeout(() => {
        window.open(calendlyData.booking_url, '_blank');
      }, 1000);
      
      setFormData({
        name: "",
        email: "",
        phone: "",
        window_text: "",
        notes: "",
      });
      setSelectedDate(null);
      setSelectedTime(null);
    } catch (error: any) {
      console.error("Error booking call:", error);
      toast.error(error.message || "Failed to book call. Please try again.");
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
      <div className="max-w-6xl mx-auto text-center mb-16 animate-fade-in">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 text-high">
          Book a <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Call</span>
        </h1>
        <p className="text-xl text-mid max-w-2xl mx-auto leading-relaxed">
          Let's connect and discuss your CRM automation needs, community projects, or collaboration opportunities.
        </p>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* What to Expect Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          <div className="glass p-8 rounded-lg hover:scale-105 transition-transform duration-300 border border-transparent hover:border-primary/30">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Clock className="h-7 w-7 text-primary flex-shrink-0" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-high">Duration</h3>
                <p className="text-mid leading-relaxed">
                  30-minute focused conversation tailored to your needs
                </p>
              </div>
            </div>
          </div>

          <div className="glass p-8 rounded-lg hover:scale-105 transition-transform duration-300 border border-transparent hover:border-primary/30">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Calendar className="h-7 w-7 text-primary flex-shrink-0" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-high">Response Time</h3>
                <p className="text-mid leading-relaxed">
                  Instant booking with real-time availability
                </p>
              </div>
            </div>
          </div>

          <div className="glass p-8 rounded-lg hover:scale-105 transition-transform duration-300 border border-transparent hover:border-primary/30">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Video className="h-7 w-7 text-primary flex-shrink-0" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-high">Format</h3>
                <p className="text-mid leading-relaxed">
                  Video call via Google Meet or Zoom - your choice
                </p>
              </div>
            </div>
          </div>

          <div className="glass p-8 rounded-lg hover:scale-105 transition-transform duration-300 border border-transparent hover:border-primary/30">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <MessageSquare className="h-7 w-7 text-primary flex-shrink-0" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-high">Topics</h3>
                <p className="text-mid leading-relaxed">
                  CRM strategy, recruitment automation, or collaboration opportunities
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Booking Section */}
        {!showManualForm && !loadingAvailability && Object.keys(availableSlots).length > 0 && (
          <div className="mb-12 space-y-8 animate-fade-in">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-high mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Book Your Call
              </h2>
              <p className="text-lg text-mid">Select a date and time that works for you</p>
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
              <div className="glass p-8 rounded-lg max-w-2xl mx-auto animate-fade-in border border-primary/20">
                <h3 className="text-2xl font-semibold mb-6 text-high flex items-center gap-2">
                  <MessageSquare className="h-6 w-6 text-primary" />
                  Complete Your Booking
                </h3>
                <div className="space-y-5">
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
                    className="w-full text-lg py-6 mt-2"
                    size="lg"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent mr-2"></div>
                        Booking...
                      </>
                    ) : (
                      `Confirm Booking for ${format(new Date(selectedTime), 'MMM d, h:mm a')}`
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {loadingAvailability && (
          <div className="text-center py-16">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="text-mid mt-6 text-lg">Loading available times...</p>
          </div>
        )}

        {!loadingAvailability && Object.keys(availableSlots).length === 0 && (
          <div className="glass p-12 rounded-lg max-w-2xl mx-auto text-center">
            <Calendar className="h-16 w-16 text-mid mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-high mb-2">No Available Slots</h3>
            <p className="text-mid">
              Please check back later or contact me directly at{" "}
              <a href="mailto:contact@ahmedwesam.com" className="text-primary hover:underline">
                contact@ahmedwesam.com
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Book;
