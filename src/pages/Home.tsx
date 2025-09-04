import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Download, Users, Shield, Star, ArrowRight, Database, Workflow, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Home = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: <Database className="w-8 h-8" />,
      title: "Extensive Workflow Library",
      description: "Browse hundreds of pre-built n8n workflows across different categories and use cases."
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure Downloads",
      description: "All workflows require authentication to ensure quality and track usage for creators."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "User Collections",
      description: "Organize your favorite workflows into custom collections and share them with others."
    },
    {
      icon: <Search className="w-8 h-8" />,
      title: "Advanced Search",
      description: "Find exactly what you need with powerful filtering by category, complexity, and tags."
    }
  ];

  const stats = [
    { label: "Active Workflows", value: "500+" },
    { label: "Categories", value: "25+" },
    { label: "Users", value: "1,000+" },
    { label: "Downloads", value: "10,000+" }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5"></div>
        <div className="relative container mx-auto text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center mx-auto mb-8 animate-pulse-glow">
            <Zap className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 gradient-text">
            Automation Hub
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Professional n8n workflow automation platform. Browse, download, and manage 
            automation workflows with user accounts and collections.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button asChild size="lg" className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-lg px-8 py-3">
              <Link to="/workflows">
                <Workflow className="mr-2 h-5 w-5" />
                Browse Workflows
              </Link>
            </Button>
            
            {!user ? (
              <Button asChild variant="outline" size="lg" className="glass border-primary/20 text-lg px-8 py-3">
                <Link to="/auth">
                  <Users className="mr-2 h-5 w-5" />
                  Create Account
                </Link>
              </Button>
            ) : (
              <Button asChild variant="outline" size="lg" className="glass border-primary/20 text-lg px-8 py-3">
                <Link to="/dashboard">
                  <Star className="mr-2 h-5 w-5" />
                  My Dashboard
                </Link>
              </Button>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {stats.map((stat, index) => (
              <Card key={index} className="glass border-primary/20 p-6 hover-lift">
                <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Everything You Need for Automation
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover, organize, and deploy powerful n8n workflows with our comprehensive platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="glass border-primary/20 p-6 hover-lift text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-4 text-primary">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary/10 via-background to-accent/10">
        <div className="container mx-auto text-center">
          <Card className="glass border-primary/20 p-12 max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Ready to Automate Your Workflows?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of users who are already streamlining their processes with our curated n8n workflows
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                <Link to="/workflows">
                  <Download className="mr-2 h-5 w-5" />
                  Start Browsing
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              
              {!user && (
                <Button asChild variant="outline" size="lg" className="glass border-primary/20">
                  <Link to="/auth">
                    Sign Up for Free
                  </Link>
                </Button>
              )}
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Home;