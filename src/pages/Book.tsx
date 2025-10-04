import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, Video, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InlineWidget } from "react-calendly";

const Book = () => {
  const navigate = useNavigate();

  // Your Calendly URL - replace this with your actual Calendly scheduling link
  const calendlyUrl = "https://calendly.com/ahmedwesam";

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

        {/* Calendly Widget Section */}
        <div className="mb-12 animate-fade-in">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-high mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Book Your Call
            </h2>
            <p className="text-lg text-mid">Select a time that works for you</p>
          </div>

          <div className="glass p-2 rounded-lg max-w-4xl mx-auto border border-primary/10">
            <InlineWidget
              url={calendlyUrl}
              styles={{
                height: '700px',
                minWidth: '320px',
              }}
              pageSettings={{
                backgroundColor: '0E1116',
                primaryColor: '00E5D4',
                textColor: 'E6F2F2',
                hideEventTypeDetails: false,
                hideLandingPageDetails: false,
              }}
            />
          </div>

          <div className="text-center mt-8">
            <p className="text-sm text-mid">
              Can't find a suitable time? Email me at{" "}
              <a href="mailto:contact@ahmedwesam.com" className="text-primary hover:underline">
                contact@ahmedwesam.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Book;
