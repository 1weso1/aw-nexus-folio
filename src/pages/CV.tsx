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
CRM & Recruitment Officer
ahmed.wesamfahmy@gmail.com
LinkedIn: https://www.linkedin.com/in/ahmed-wesam-3b57bb1b1
+201001878594
Cairo, Egypt`;
    navigator.clipboard.writeText(contactText).then(() => {
      toast({
        title: "Contact details copied!",
        description: "Contact information copied to clipboard."
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
          description: "CV saved as PNG image."
        });
      }
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Please try again or use the print option.",
        variant: "destructive"
      });
    } finally {
      setIsCapturing(false);
    }
  };
  const handlePrint = () => {
    window.print();
    toast({
      title: "Opening print dialog...",
      description: "Use your browser's print dialog to save as PDF."
    });
  };
  return <>
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
              <Button onClick={downloadPNG} variant="neon" size="sm" disabled={isCapturing}>
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
              <p className="text-lg text-neon-primary font-medium mb-4">CRM & Recruitment Officer</p>
              
              <div className="flex flex-wrap justify-center gap-4 text-sm text-text-secondary">
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  <span>ahmed.wesamfahmy@gmail.com</span>
                </div>
                <div className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  <span>+201001878594</span>
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
                A Political Science graduate with expertise in student recruitment, CRM, and higher education marketing. 
                Currently working as a CRM & Recruitment Officer at The British University in Egypt, optimizing HubSpot CRM, 
                leading student engagement initiatives, and managing large-scale recruitment events. Passionate about event 
                management, public relations, and data-driven recruitment strategies, with a proven track record of leadership 
                in student organisations and management.
              </p>
            </div>

            {/* Education */}
            <div className="cv-section">
              <h2 className="section-heading text-lg mb-3">Education</h2>
              <div className="cv-item">
                <h3 className="font-semibold text-text-primary">Political Science BSc.</h3>
                <div className="cv-meta text-text-secondary text-sm">
                  The British University in Egypt • 2020-2024
                </div>
                <p className="body-large text-sm mt-1">
                  Activities & Societies: Founder & President of Move Sports Club, Student Ambassador in the Student 
                  Recruitment and Partnership Office, Vice President of Rotaract Club of The British University in Egypt.
                </p>
              </div>
            </div>

            {/* Experience */}
            <div className="cv-section">
              <h2 className="section-heading text-lg mb-3">Professional Experience</h2>
              
              <div className="cv-item mb-4">
                <h3 className="font-semibold text-text-primary">CRM & Recruitment Officer</h3>
                <div className="cv-meta text-text-secondary text-sm">
                  The British University in Egypt • 06/2024-Present
                </div>
                <ul className="body-large text-sm mt-1 space-y-1 list-disc list-inside">
                  <li>Manage HubSpot CRM, integrating APIs for WhatsApp, Facebook Messenger, and web chats to streamline student engagement</li>
                  <li>Organize and oversee school visits, fairs, and open days, managing logistics and targeted marketing campaigns</li>
                  <li>Student Ambassador Program (STAM): Oversee recruitment, training, and performance tracking for ambassadors</li>
                  <li>Utilize CRM analytics to refine outreach strategies via emails, SMS, WhatsApp, and social media ads</li>
                  <li>Developing automated performance tracking for STAM using HubSpot-Educatly integration</li>
                </ul>
              </div>

              <div className="cv-item mb-4">
                <h3 className="font-semibold text-text-primary">Student Ambassador and Intern</h3>
                <div className="cv-meta text-text-secondary text-sm">
                  Student Recruitment and Partnerships Office, The British University in Egypt • 07/2022-06/2024
                </div>
                <ul className="body-large text-sm mt-1 space-y-1 list-disc list-inside">
                  <li>Co-lead the Student Ambassadors' expansion plan, including marketing, interviews and supervision of recruits' trial periods</li>
                  <li>Maintain accurate records and databases of applicant information and admissions statistics using a CRM system</li>
                  <li>Contribute to the development and on-ground planning of event concepts, themes, and agendas</li>
                  <li>Conduct post-event evaluations and collect feedback to identify areas for improvement</li>
                  <li>Recruit high school students through outreach efforts and campus tours</li>
                  <li>Coordinate with fellow Student Ambassadors and execute recruitment events, such as university fairs, campus visits and open days</li>
                </ul>
              </div>

              <div className="cv-item mb-4">
                <h3 className="font-semibold text-text-primary">Intern</h3>
                <div className="cv-meta text-text-secondary text-sm">
                  The Arab Parliament, The League of Arab States • 08/2023-10/2023
                </div>
                <ul className="body-large text-sm mt-1 space-y-1 list-disc list-inside">
                  <li>Support parliament members by conducting research on socio-political issues in the Arab world</li>
                  <li>Receive comprehensive and specialised training sessions on parliamentary processes and international relations</li>
                </ul>
              </div>

              <div className="cv-item mb-4">
                <h3 className="font-semibold text-text-primary">Automation Architect</h3>
                <div className="cv-meta text-text-secondary text-sm">Freelance • 2023-Present</div>
                <ul className="body-large text-sm mt-1 space-y-1 list-disc list-inside">
                  <li>Built comprehensive library of 2,053 n8n automation workflows across 15 business categories</li>
                  <li>Integrated 365+ services for CRM, lead generation, and business process automation</li>
                  <li>Developed AI-powered workflows for content generation and predictive analytics</li>
                </ul>
              </div>
            </div>

            {/* Student Activities */}
            <div className="cv-section">
              <h2 className="section-heading text-lg mb-3">Student Activities</h2>
              
              <div className="cv-item mb-3">
                <h3 className="font-semibold text-text-primary">Member, Public Relations Committee</h3>
                <div className="cv-meta text-text-secondary text-sm">
                  Egyptian Youth Parliament, Ministry of Youth and Sports, Egypt • 2022-2025
                </div>
                <ul className="body-large text-sm mt-1 space-y-1 list-disc list-inside">
                  <li>Contact sponsors to secure funding for youth parliament events and initiatives</li>
                  <li>Coordinate with and organise events for the Ministry of Youth and Sports and the minister</li>
                  <li>Develop and maintain positive relationships with sponsors</li>
                  <li>Coordinate with other members to plan and execute youth parliament events, such as advocacy campaigns</li>
                </ul>
              </div>

              <div className="cv-item mb-3">
                <h3 className="font-semibold text-text-primary">Co-Founder of Move Sports Club</h3>
                <div className="cv-meta text-text-secondary text-sm">
                  The British University in Egypt • 2021-2024
                </div>
                <ul className="body-large text-sm mt-1 space-y-1 list-disc list-inside">
                  <li>Create, plan, and organise events in collaboration with other university clubs</li>
                  <li>Coordinate with the university's administration on official matters</li>
                  <li>Manage the club's budget, including fundraising and sponsorships</li>
                  <li>Write the operation plan for the club's academic year and create a training schedule for the club's sports</li>
                  <li>Lead weekly meetings with the heads of committees to ensure coordination within the club</li>
                  <li>Design and contact textile companies for club attire</li>
                </ul>
              </div>
            </div>

            {/* Volunteering */}
            <div className="cv-section">
              <h2 className="section-heading text-lg mb-3">Volunteering</h2>
              
              <div className="cv-item mb-3">
                <h3 className="font-semibold text-text-primary">Vice-President</h3>
                <div className="cv-meta text-text-secondary text-sm">
                  Rotaract Club of The British University in Egypt, D2451 • 2023-2024
                </div>
                <ul className="body-large text-sm mt-1 space-y-1 list-disc list-inside">
                  <li>Managed club operations, including budgeting, event planning, and membership drives</li>
                  <li>Fostered partnerships with local businesses and organizations, expanding the club's outreach</li>
                  <li>Organized and led international service projects and professional development workshops</li>
                  <li>Promoted global citizenship and enhanced leadership skills among club members</li>
                </ul>
              </div>

              <div className="cv-item mb-3">
                <h3 className="font-semibold text-text-primary">Cairo Runners</h3>
                <div className="cv-meta text-text-secondary text-sm">2022-2023</div>
                <p className="body-large text-sm mt-1">
                  Facilitated training run-organisation opportunities for Move Sports Club's members with Cairo Runners including:
                  Madinet Nasr 10K Fun Run, CFC 5K World Heart Run, Run for the Climate at The British University in Egypt.
                </p>
              </div>
            </div>

            {/* Skills */}
            <div className="cv-section">
              <h2 className="section-heading text-lg mb-3">Skills</h2>
              <p className="body-large text-sm">
                Student Recruitment & CRM (HubSpot, Educatly), Higher Education Marketing & Event Planning, 
                Public Relations & Strategic Communications, Project Management & Leadership Development, 
                Python, AI Process Automation & Digital Innovation
              </p>
            </div>

            {/* Awards and Publications */}
            <div className="cv-section">
              <h2 className="section-heading text-lg mb-3">Awards and Publications</h2>
              <div className="cv-item">
                <h3 className="font-semibold text-text-primary">GRACE Research Competition on Anti-Corruption</h3>
                <p className="body-large text-sm mt-1">
                  Received 1st place award at the British University in Egypt for research titled: 
                  "The Role of Cybersecurity in Combating Corruption in the Field of Biomedical Data"
                </p>
              </div>
            </div>

            {/* Languages */}
            <div className="cv-section">
              <h2 className="section-heading text-lg mb-3">Languages</h2>
              <div className="flex gap-6 text-sm">
                <div><strong>Arabic:</strong> Native</div>
                <div><strong>English:</strong> Bilingual</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>;
}