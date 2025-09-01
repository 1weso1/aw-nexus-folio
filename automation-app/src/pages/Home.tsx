import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Download, Users, Star, ArrowRight, Play, Code, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Home = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: Zap,
      title: 'Ready-to-Use Workflows',
      description: 'Browse 2000+ production-ready n8n automation workflows from the community',
    },
    {
      icon: Download,
      title: 'Instant Download',
      description: 'Download workflow JSON files instantly - sign in to unlock full access',
    },
    {
      icon: Play,
      title: 'Interactive Preview',
      description: 'Visualize workflows with our interactive React Flow preview before downloading',
    },
    {
      icon: Code,
      title: 'Developer Friendly',
      description: 'All workflows are JSON-based and ready for import into your n8n instance',
    },
    {
      icon: Shield,
      title: 'Community Driven',
      description: 'Curated from the 1weso1/n8n-workflows repository with regular updates',
    },
    {
      icon: Users,
      title: 'Collections & Favorites',
      description: 'Save your favorite workflows and organize them into custom collections',
    },
  ];

  const stats = [
    { label: 'Workflows', value: '2000+' },
    { label: 'Categories', value: '25+' },
    { label: 'Services', value: '100+' },
    { label: 'Updates', value: 'Daily' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <Badge variant="outline" className="mb-4 glass border-brand-primary/30">
              <Zap className="w-3 h-3 mr-1" />
              2000+ Automation Workflows
            </Badge>
            <h1 className="hero-text text-5xl md:text-7xl mb-6">
              n8n Workflow
              <span className="gradient-text"> Automation Hub</span>
            </h1>
            <p className="body-large mb-8 max-w-3xl mx-auto">
              Discover, preview, and download production-ready n8n automation workflows. 
              From simple integrations to complex business processes - find the perfect automation for your needs.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button asChild size="lg" className="bg-gradient-to-r from-brand-primary to-brand-accent hover:shadow-glow">
              <Link to="/workflows">
                <Zap className="mr-2 h-5 w-5" />
                Explore Workflows
              </Link>
            </Button>
            {!user && (
              <Button asChild variant="outline" size="lg" className="glass border-brand-primary/20">
                <Link to="/auth">
                  <Download className="mr-2 h-5 w-5" />
                  Sign Up for Downloads
                </Link>
              </Button>
            )}
            {user && (
              <Button asChild variant="outline" size="lg" className="glass border-brand-primary/20">
                <Link to="/dashboard">
                  <Users className="mr-2 h-5 w-5" />
                  My Dashboard
                </Link>
              </Button>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {stats.map((stat, index) => (
              <Card key={index} className="glass border-brand-primary/10">
                <CardContent className="pt-6 text-center">
                  <div className="text-2xl font-bold text-brand-primary mb-1">{stat.value}</div>
                  <div className="text-sm text-text-secondary">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Everything You Need for Automation
            </h2>
            <p className="body-large max-w-2xl mx-auto">
              Built by automation enthusiasts, for automation enthusiasts. 
              Our platform makes finding and implementing n8n workflows effortless.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="glass border-brand-primary/10 hover:border-brand-primary/20 transition-colors">
                <CardHeader>
                  <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-5 h-5 text-brand-primary" />
                  </div>
                  <CardTitle className="text-text-primary">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-text-secondary">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="glass border-brand-primary/20 p-8">
            <CardHeader>
              <CardTitle className="text-2xl md:text-3xl text-text-primary mb-4">
                Ready to Automate Your Workflows?
              </CardTitle>
              <CardDescription className="body-large mb-8">
                Join thousands of developers and business professionals who trust our platform for their automation needs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild size="lg" className="bg-gradient-to-r from-brand-primary to-brand-accent hover:shadow-glow">
                <Link to="/workflows">
                  Get Started Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Home;