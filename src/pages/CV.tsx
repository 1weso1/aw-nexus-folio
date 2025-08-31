import { useState } from "react";
import { ArrowLeft, Download, Printer, Copy, Mail, Phone, MapPin, Linkedin, Github } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";

export default function CV() {
  const [isCapturing, setIsCapturing] = useState(false);

  const copyContactDetails = () => {
    const contactText = `Ahmed Wesam
CRM & Recruitment Specialist
contact@ahmedwesam.com
LinkedIn: https://www.linkedin.com/in/ahmed-wesam-3b57bb1b1
Cairo, Egypt`;

    navigator.clipboard.writeText(contactText).then(() => {
      toast({
        title: "Contact details copied!",
        description: "Contact information copied to clipboard.",
      });
    });
  };

  const downloadPNG = async () => {
    setIsCapturing(true);
    try {
      const element = document.getElementById('cv-content');
      if (element) {
        const canvas = await html2canvas(element, {
          scale: 2,
          backgroundColor: '#0E1116',
          logging: false
        });
        
        const link = document.createElement('a');
        link.download = 'Ahmed-Wesam-CV.png';
        link.href = canvas.toDataURL();
        link.click();

        toast({
          title: "CV Downloaded!",
          description: "CV saved as PNG image.",
        });
      }
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Please try again or use the print option.",
        variant: "destructive",
      });
    } finally {
      setIsCapturing(false);
    }
  };

  const handlePrint = () => {
    window.print();
    toast({
      title: "Opening print dialog...",
      description: "Use your browser's print dialog to save as PDF.",
    });
  };

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          
          #cv-content {
            background: white !important;
            color: black !important;
            font-size: 12px !important;
            line-height: 1.4 !important;
            margin: 0 !important;
            padding: 20px !important;
            box-shadow: none !important;
          }
          
          .cv-header { 
            border-bottom: 2px solid #00E5D4 !important; 
            padding-bottom: 15px !important; 
            margin-bottom: 20px !important; 
          }
          
          .cv-section { 
            margin-bottom: 15px !important; 
            page-break-inside: avoid !important; 
          }
          
          .cv-section h2 { 
            color: #00E5D4 !important; 
            font-size: 16px !important; 
            margin-bottom: 8px !important; 
            border-bottom: 1px solid #00E5D4 !important; 
            padding-bottom: 2px !important; 
          }
          
          .cv-item { 
            margin-bottom: 8px !important; 
          }
          
          .cv-item h3 { 
            font-size: 14px !important; 
            font-weight: bold !important; 
            margin-bottom: 2px !important; 
          }
          
          .cv-meta { 
            font-size: 10px !important; 
            color: #666 !important; 
            margin-bottom: 4px !important; 
          }
        }
      `}</style>

      <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8 no-print">
        <div className="max-w-4xl mx-auto">
          {/* Header with Actions */}
          <div className="mb-8 flex flex-col sm:flex-row gap-4 justify-between items-start no-print">
            <Button asChild variant="ghost">
              <Link to="/">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </Button>
            
            <div className="flex gap-2">
              <Button onClick={copyContactDetails} variant="glass" size="sm">
                <Copy className="h-4 w-4" />
                Copy Contact
              </Button>
              <Button 
                onClick={downloadPNG} 
                variant="neon" 
                size="sm"
                disabled={isCapturing}
              >
                <Download className="h-4 w-4" />
                {isCapturing ? "Capturing..." : "Download PNG"}
              </Button>
              <Button onClick={handlePrint} variant="hero" size="sm">
                <Printer className="h-4 w-4" />
                Print / Save PDF
              </Button>
            </div>
          </div>

          {/* CV Content */}
          <div id="cv-content" className="glass rounded-2xl p-8 space-y-8">
            {/* Header */}
            <div className="cv-header text-center pb-6 border-b border-neon-primary/20">
              <h1 className="text-3xl font-sora font-bold text-text-primary mb-2">Ahmed Wesam</h1>
              <p className="text-lg text-neon-primary font-medium mb-4">CRM & Recruitment Specialist</p>
              
              <div className="flex flex-wrap justify-center gap-4 text-sm text-text-secondary">
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  <span>contact@ahmedwesam.com</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>Cairo, Egypt</span>
                </div>
                <div className="flex items-center gap-1">
                  <Linkedin className="h-4 w-4" />
                  <span>ahmed-wesam-3b57bb1b1</span>
                </div>
              </div>
            </div>

            {/* Profile Summary */}
            <div className="cv-section">
              <h2 className="section-heading text-lg mb-3">Profile</h2>
              <p className="body-large text-sm">
                CRM & Recruitment specialist with expertise in HubSpot automation, student engagement, and community building. 
                Proven track record in optimizing recruitment processes, founding successful student organizations, and 
                leading cross-functional teams. Passionate about combining systematic thinking with human-centered approach 
                to drive meaningful impact.
              </p>
            </div>

            {/* Education */}
            <div className="cv-section">
              <h2 className="section-heading text-lg mb-3">Education</h2>
              <div className="cv-item">
                <h3 className="font-semibold text-text-primary">Bachelor of Arts in Political Science</h3>
                <div className="cv-meta text-text-secondary text-sm">
                  The British University in Egypt • 2022-2025 (Expected)
                </div>
                <p className="body-large text-sm mt-1">
                  Focus on systematic analysis and governance structures. Active in student leadership and community initiatives.
                </p>
              </div>
            </div>

            {/* Experience */}
            <div className="cv-section">
              <h2 className="section-heading text-lg mb-3">Professional Experience</h2>
              
              <div className="cv-item mb-4">
                <h3 className="font-semibold text-text-primary">CRM & Recruitment Specialist</h3>
                <div className="cv-meta text-text-secondary text-sm">
                  The British University in Egypt • 2024-Present
                </div>
                <ul className="body-large text-sm mt-1 space-y-1 list-disc list-inside">
                  <li>Optimize HubSpot CRM systems for student recruitment and engagement workflows</li>
                  <li>Design and implement automation processes to improve recruitment efficiency</li>
                  <li>Lead student engagement initiatives and stakeholder coordination</li>
                  <li>Analyze recruitment data and provide actionable insights to leadership team</li>
                </ul>
              </div>

              <div className="cv-item mb-4">
                <h3 className="font-semibold text-text-primary">Automation Architect</h3>
                <div className="cv-meta text-text-secondary text-sm">
                  Freelance • 2024-Present
                </div>
                <ul className="body-large text-sm mt-1 space-y-1 list-disc list-inside">
                  <li>Built comprehensive library of 2,053 n8n automation workflows across 15 business categories</li>
                  <li>Integrated 365+ services for CRM, lead generation, and business process automation</li>
                  <li>Developed AI-powered workflows for content generation and predictive analytics</li>
                </ul>
              </div>
            </div>

            {/* Leadership & Activities */}
            <div className="cv-section">
              <h2 className="section-heading text-lg mb-3">Leadership & Activities</h2>
              
              <div className="cv-item mb-3">
                <h3 className="font-semibold text-text-primary">Founder & President - Move Sports Club</h3>
                <div className="cv-meta text-text-secondary text-sm">2023-Present</div>
                <p className="body-large text-sm mt-1">
                  Founded university sports club from concept. Built partnerships with Cairo Runners, established regular programming, 
                  and scaled to active community participation.
                </p>
              </div>

              <div className="cv-item mb-3">
                <h3 className="font-semibold text-text-primary">Vice President - Rotaract Club</h3>
                <div className="cv-meta text-text-secondary text-sm">2023-2024</div>
                <p className="body-large text-sm mt-1">
                  Led community service projects, managed member engagement initiatives, and coordinated with 
                  international Rotaract districts. Organized 20+ community events and workshops.
                </p>
              </div>

              <div className="cv-item mb-3">
                <h3 className="font-semibold text-text-primary">Project Lead - Student Ambassadors' Café</h3>
                <div className="cv-meta text-text-secondary text-sm">2024-2025</div>
                <p className="body-large text-sm mt-1">
                  Proposed and developed comprehensive business plan for student-run café. Led feasibility study, 
                  financial modeling, and stakeholder presentations. Achieved board approval for Summer 2026 launch.
                </p>
              </div>
            </div>

            {/* Skills */}
            <div className="cv-section">
              <h2 className="section-heading text-lg mb-3">Technical Skills</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium text-text-primary mb-1">CRM & Automation</h4>
                  <ul className="body-large space-y-0.5 text-xs">
                    <li>• HubSpot (Advanced)</li>
                    <li>• n8n Automation (Advanced)</li>
                    <li>• Salesforce (Intermediate)</li>
                    <li>• Zapier (Intermediate)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-text-primary mb-1">Technical</h4>
                  <ul className="body-large space-y-0.5 text-xs">
                    <li>• Python (Intermediate)</li>
                    <li>• SQL (Basic)</li>
                    <li>• API Integration</li>
                    <li>• Data Analysis</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div className="cv-section">
              <h2 className="section-heading text-lg mb-3">Key Achievements</h2>
              <ul className="body-large text-sm space-y-1">
                <li>• <strong>GRACE Research Competition Winner (2024):</strong> Anti-Corruption Research in partnership with Arab League</li>
                <li>• <strong>Automation Library:</strong> Built 2,053-workflow library with 365 integrations serving multiple business categories</li>
                <li>• <strong>Student Café Project:</strong> Achieved board approval for innovative student entrepreneurship initiative</li>
                <li>• <strong>Community Building:</strong> Founded and scaled university sports club with ongoing community partnerships</li>
              </ul>
            </div>

            {/* Languages */}
            <div className="cv-section">
              <h2 className="section-heading text-lg mb-3">Languages</h2>
              <div className="flex gap-6 text-sm">
                <div><strong>Arabic:</strong> Native</div>
                <div><strong>English:</strong> Fluent</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}