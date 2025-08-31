import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, 
  ExternalLink, 
  MessageSquare, 
  Megaphone, 
  TrendingUp, 
  Brain, 
  Database,
  BarChart3,
  Download,
  Users
} from "lucide-react";
import { WORKFLOW_CATEGORIES, WorkflowCategory } from "@/config/workflowCategories";
import { countWorkflowsByTags } from "@/lib/workflows";

const categoryIcons = {
  MessageSquare,
  Megaphone,
  TrendingUp,
  Brain,
  Database
};

interface CategoryCardProps {
  category: WorkflowCategory;
  count: number;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, count }) => {
  const IconComponent = categoryIcons[category.icon as keyof typeof categoryIcons];
  
  return (
    <Card className="glass border-neon-primary/10 hover-lift hover-glow">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {IconComponent && <IconComponent className="h-6 w-6 text-neon-primary" />}
            <div>
              <CardTitle className="text-lg">{category.label}</CardTitle>
              <Badge variant="outline" className="text-xs mt-1">
                {count} workflows
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <CardDescription className="mb-4 text-text-secondary">
          {category.description}
        </CardDescription>
        <div className="flex flex-wrap gap-2 mb-4">
          {category.tagFilters.slice(0, 4).map(tag => (
            <Badge key={tag} variant="outline" className="text-xs border-neon-primary/20 text-neon-primary">
              {tag}
            </Badge>
          ))}
          {category.tagFilters.length > 4 && (
            <Badge variant="outline" className="text-xs">
              +{category.tagFilters.length - 4} more
            </Badge>
          )}
        </div>
        <Button asChild variant="neon" className="w-full">
          <Link to={`/workflows?cat=${category.id}`}>
            Explore Workflows →
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default function CRMAutomation() {
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategoryCounts = async () => {
      try {
        const counts: Record<string, number> = {};
        
        for (const category of WORKFLOW_CATEGORIES) {
          counts[category.id] = await countWorkflowsByTags(category.tagFilters);
        }
        
        setCategoryCounts(counts);
      } catch (error) {
        console.error('Failed to load category counts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCategoryCounts();
  }, []);

  const totalWorkflows = Object.values(categoryCounts).reduce((sum, count) => sum + count, 0);

  return (
    <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <div className="mb-8">
          <Button asChild variant="ghost">
            <Link to="/projects">
              <ArrowLeft className="h-4 w-4" />
              Back to Projects
            </Link>
          </Button>
        </div>

        {/* Header */}
        <section className="py-12 text-center">
          <h1 className="hero-text mb-6">CRM Automation Library</h1>
          <p className="text-xl body-large max-w-4xl mx-auto mb-8">
            A comprehensive collection of production-ready n8n workflows designed to automate 
            business processes across CRM, marketing, communication, AI, and data operations.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Badge className="bg-neon-primary/20 text-neon-primary border-neon-primary/30 px-4 py-2">
              <BarChart3 className="h-4 w-4 mr-2" />
              {loading ? "Loading..." : `${totalWorkflows.toLocaleString()}+ Workflows`}
            </Badge>
            <Badge className="bg-neon-primary/20 text-neon-primary border-neon-primary/30 px-4 py-2">
              <Users className="h-4 w-4 mr-2" />
              5 Categories
            </Badge>
            <Badge className="bg-neon-primary/20 text-neon-primary border-neon-primary/30 px-4 py-2">
              <Download className="h-4 w-4 mr-2" />
              Production Ready
            </Badge>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild variant="neon" size="lg">
              <Link to="/workflows">
                Browse All Workflows
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a 
                href="https://github.com/zie619/n8n-workflows" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                GitHub Repository
              </a>
            </Button>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="py-12">
          <h2 className="section-heading text-center mb-12">Workflow Categories</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {WORKFLOW_CATEGORIES.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                count={categoryCounts[category.id] ?? 0}
              />
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12">
          <div className="glass rounded-3xl p-8 md:p-12">
            <h2 className="section-heading text-center mb-8">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-neon-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Download className="h-6 w-6 text-neon-primary" />
                </div>
                <h3 className="font-semibold mb-2">Ready to Import</h3>
                <p className="text-text-secondary text-sm">
                  All workflows are tested and ready to import directly into your n8n instance.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-neon-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-6 w-6 text-neon-primary" />
                </div>
                <h3 className="font-semibold mb-2">Enterprise Grade</h3>
                <p className="text-text-secondary text-sm">
                  Professional workflows designed for business automation and CRM integration.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-neon-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-neon-primary" />
                </div>
                <h3 className="font-semibold mb-2">Community Driven</h3>
                <p className="text-text-secondary text-sm">
                  Constantly updated with new workflows from the n8n community.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Technology Stack */}
        <section className="py-12">
          <h2 className="section-heading text-center mb-8">Technology Stack</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              "n8n", "HubSpot", "Supabase", "GitHub API", "React Flow", 
              "OpenAI", "Telegram", "Slack", "Google Sheets", "Airtable"
            ].map((tech) => (
              <Badge key={tech} variant="outline" className="px-4 py-2">
                {tech}
              </Badge>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 text-center">
          <div className="glass rounded-3xl p-8 md:p-12">
            <h2 className="section-heading mb-6">Start Automating Today</h2>
            <p className="text-xl body-large max-w-2xl mx-auto mb-8">
              Ready to streamline your business processes? Browse our workflow library 
              and download the automations that fit your needs.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild variant="neon" size="lg">
                <Link to="/workflows">
                  Explore Workflows
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/contact">
                  Get Custom Automation
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}