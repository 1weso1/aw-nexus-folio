import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Zap } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen pt-20 pb-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-brand-primary to-brand-accent flex items-center justify-center mx-auto mb-8">
          <Zap className="w-10 h-10 text-white" />
        </div>
        
        <h1 className="text-6xl font-bold text-text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-text-primary mb-4">
          Workflow Not Found
        </h2>
        <p className="text-text-secondary mb-8 max-w-md mx-auto">
          The automation workflow you're looking for seems to have automated itself out of existence. 
          Let's get you back on track.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild className="bg-gradient-to-r from-brand-primary to-brand-accent">
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="glass border-brand-primary/20">
            <Link to="/workflows">
              <Zap className="mr-2 h-4 w-4" />
              Browse Workflows
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;