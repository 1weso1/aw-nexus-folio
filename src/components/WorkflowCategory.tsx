import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Users, Database, Mail, Cloud, TrendingUp, MessageSquare, Brain, Settings, BarChart, Cpu, Shield, Video, DollarSign, Briefcase } from "lucide-react";
import { useNavigate } from 'react-router-dom';

interface WorkflowCategoryProps {
  category: {
    name: string;
    description: string;
    workflowCount: number;
    icon: React.ReactNode;
    features: string[];
    complexity: "Beginner" | "Intermediate" | "Advanced";
    integrations: string[];
    useCases: string[];
  };
  onExplore?: () => void;
}

const complexityColors = {
  "Beginner": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "Intermediate": "bg-amber-500/10 text-amber-400 border-amber-500/20", 
  "Advanced": "bg-red-500/10 text-red-400 border-red-500/20"
};

export function WorkflowCategory({ category, onExplore }: WorkflowCategoryProps) {
  const navigate = useNavigate();

  const handleExplore = () => {
    if (onExplore) {
      onExplore();
    } else {
      // Map display names to data category names
      const categoryMapping: { [key: string]: string } = {
        "CRM & Sales Automation": "CRM & Sales",
        "AI-Powered Workflows": "AI-Powered", 
        "Communication & Messaging": "Social Media",
        "Marketing Automation": "Marketing",
        "Data Processing & Analytics": "Business Operations",
        "Cloud Storage & File Management": "Business Operations",
        "Project Management": "Business Operations",
        "Social Media Management": "Social Media"
      };
      
      const mappedCategory = categoryMapping[category.name] || category.name;
      const categoryPath = mappedCategory.toLowerCase().replace(' & ', '-').replace(' ', '-');
      navigate(`/workflows/${categoryPath}`);
    }
  };
  return (
    <Card className="glass border-neon-primary/20 hover:border-neon-primary/40 transition-all duration-300 group">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-lg bg-neon-primary/10 text-neon-primary group-hover:bg-neon-primary/20 transition-colors">
              {category.icon}
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-text-primary group-hover:text-neon-primary transition-colors">
                {category.name}
              </CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {category.workflowCount} workflows
                </Badge>
                <Badge variant="outline" className={`text-xs ${complexityColors[category.complexity]}`}>
                  {category.complexity}
                </Badge>
              </div>
            </div>
          </div>
        </div>
        <CardDescription className="text-text-secondary">
          {category.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Key Features */}
        <div>
          <h4 className="font-medium text-text-primary mb-2 text-sm">Key Features</h4>
          <div className="flex flex-wrap gap-1">
            {category.features.slice(0, 4).map((feature, index) => (
              <Badge key={index} variant="secondary" className="text-xs px-2 py-1">
                {feature}
              </Badge>
            ))}
            {category.features.length > 4 && (
              <Badge variant="secondary" className="text-xs px-2 py-1">
                +{category.features.length - 4} more
              </Badge>
            )}
          </div>
        </div>

        {/* Popular Integrations */}
        <div>
          <h4 className="font-medium text-text-primary mb-2 text-sm">Popular Integrations</h4>
          <div className="flex flex-wrap gap-1">
            {category.integrations.slice(0, 3).map((integration, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {integration}
              </Badge>
            ))}
            {category.integrations.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{category.integrations.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        {/* Use Cases */}
        <div>
          <h4 className="font-medium text-text-primary mb-2 text-sm">Common Use Cases</h4>
          <ul className="text-sm text-text-secondary space-y-1">
            {category.useCases.slice(0, 3).map((useCase, index) => (
              <li key={index} className="flex items-start space-x-2">
                <div className="w-1 h-1 bg-neon-primary rounded-full mt-2 flex-shrink-0" />
                <span>{useCase}</span>
              </li>
            ))}
          </ul>
        </div>

        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-between hover:bg-neon-primary/10 hover:text-neon-primary"
          onClick={handleExplore}
        >
          Explore Workflows
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

// Workflow categories data
export const workflowCategories = [
  {
    name: "CRM & Sales Automation",
    description: "Comprehensive lead management, customer onboarding, and sales pipeline automation workflows",
    workflowCount: 340,
    icon: <TrendingUp className="h-5 w-5" />,
    complexity: "Intermediate" as const,
    features: ["Lead Scoring", "Pipeline Management", "Customer Onboarding", "Deal Tracking", "Sales Analytics"],
    integrations: ["HubSpot", "Salesforce", "Pipedrive", "Airtable", "Google Sheets"],
    useCases: [
      "Automated lead qualification and scoring",
      "Customer onboarding sequence automation", 
      "Deal progression and follow-up workflows"
    ]
  },
  {
    name: "AI-Powered Workflows",
    description: "Intelligent automation using OpenAI, Claude, and other AI services for content generation and analysis",
    workflowCount: 520,
    icon: <Brain className="h-5 w-5" />,
    complexity: "Advanced" as const,
    features: ["Content Generation", "Sentiment Analysis", "Data Processing", "Smart Categorization", "Predictive Analytics"],
    integrations: ["OpenAI", "Anthropic", "Hugging Face", "Google AI", "Azure AI"],
    useCases: [
      "Automated content creation and optimization",
      "Intelligent customer support responses",
      "Predictive lead scoring and analysis"
    ]
  },
  {
    name: "Communication & Messaging",
    description: "Multi-channel communication automation for teams, customers, and community engagement",
    workflowCount: 450,
    icon: <MessageSquare className="h-5 w-5" />,
    complexity: "Beginner" as const,
    features: ["Multi-Channel Messaging", "Automated Responses", "Team Notifications", "Customer Support", "Broadcast Systems"],
    integrations: ["Telegram", "Discord", "Slack", "WhatsApp", "Teams"],
    useCases: [
      "Automated customer support workflows",
      "Team collaboration and notification systems",
      "Multi-platform content distribution"
    ]
  },
  {
    name: "Marketing Automation",
    description: "Email campaigns, social media scheduling, and comprehensive marketing workflow automation",
    workflowCount: 380,
    icon: <Mail className="h-5 w-5" />,
    complexity: "Intermediate" as const,
    features: ["Email Campaigns", "Social Scheduling", "Lead Nurturing", "Analytics Tracking", "A/B Testing"],
    integrations: ["Mailjet", "Gmail", "LinkedIn", "Facebook", "Twitter"],
    useCases: [
      "Automated email marketing campaigns",
      "Social media content scheduling and engagement",
      "Lead nurturing and conversion workflows"
    ]
  },
  {
    name: "Data Processing & Analytics",
    description: "Advanced data manipulation, analysis, and reporting workflows for business intelligence",
    workflowCount: 290,
    icon: <BarChart className="h-5 w-5" />,
    complexity: "Advanced" as const,
    features: ["Data ETL", "Report Generation", "Analytics Dashboards", "Data Validation", "Performance Monitoring"],
    integrations: ["PostgreSQL", "MySQL", "MongoDB", "Google Analytics", "Tableau"],
    useCases: [
      "Automated business reporting and analytics",
      "Data pipeline and ETL processes",
      "Performance monitoring and alerting"
    ]
  },
  {
    name: "Cloud Storage & File Management",
    description: "Automated file organization, backup systems, and cloud storage management workflows",
    workflowCount: 180,
    icon: <Cloud className="h-5 w-5" />,
    complexity: "Beginner" as const,
    features: ["File Organization", "Automated Backups", "Cloud Sync", "Document Processing", "Storage Optimization"],
    integrations: ["Google Drive", "Dropbox", "OneDrive", "Box", "AWS S3"],
    useCases: [
      "Automated file organization and backup",
      "Document processing and classification",
      "Cloud storage optimization and management"
    ]
  },
  {
    name: "Project Management",
    description: "Task automation, project tracking, and team collaboration workflows for enhanced productivity",
    workflowCount: 200,
    icon: <Briefcase className="h-5 w-5" />,
    complexity: "Intermediate" as const,
    features: ["Task Automation", "Project Tracking", "Team Collaboration", "Timeline Management", "Resource Allocation"],
    integrations: ["Jira", "GitHub", "GitLab", "Trello", "Asana"],
    useCases: [
      "Automated project milestone tracking",
      "Development workflow automation",
      "Team productivity and collaboration enhancement"
    ]
  },
  {
    name: "Social Media Management",
    description: "Comprehensive social media automation for content creation, scheduling, and engagement tracking",
    workflowCount: 160,
    icon: <Users className="h-5 w-5" />,
    complexity: "Beginner" as const,
    features: ["Content Scheduling", "Engagement Tracking", "Hashtag Optimization", "Cross-Platform Posting", "Analytics Reporting"],
    integrations: ["Instagram", "Twitter", "LinkedIn", "Facebook", "TikTok"],
    useCases: [
      "Automated social media content distribution",
      "Engagement monitoring and response automation",
      "Social media analytics and reporting"
    ]
  }
];