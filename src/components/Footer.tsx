import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Github, Mail } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-card/30 border-t border-primary/20 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground font-sora">
                Automation Hub
              </span>
            </div>
            <p className="text-muted-foreground mb-4 max-w-md">
              Professional n8n workflow automation platform. Browse, download, and manage 
              automation workflows with user accounts and collections.
            </p>
            <div className="flex items-center gap-4">
              <a 
                href="mailto:contact@ahmedwesam.com" 
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Contact Email"
              >
                <Mail className="w-5 h-5" />
              </a>
              <a 
                href="https://github.com/ahmedwesam" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-foreground font-semibold mb-4">Platform</h3>
            <div className="space-y-2">
              <Link 
                to="/workflows" 
                className="block text-muted-foreground hover:text-primary transition-colors"
              >
                Browse Workflows
              </Link>
              <Link 
                to="/collections" 
                className="block text-muted-foreground hover:text-primary transition-colors"
              >
                Collections
              </Link>
              <Link 
                to="/auth" 
                className="block text-muted-foreground hover:text-primary transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-foreground font-semibold mb-4">Resources</h3>
            <div className="space-y-2">
              <a 
                href="https://n8n.io" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block text-muted-foreground hover:text-primary transition-colors"
              >
                n8n.io
              </a>
              <a 
                href="https://docs.n8n.io" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block text-muted-foreground hover:text-primary transition-colors"
              >
                Documentation
              </a>
              <a 
                href="https://community.n8n.io" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block text-muted-foreground hover:text-primary transition-colors"
              >
                Community
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-primary/20 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-muted-foreground text-sm">
              © 2024 Automation Hub. Built by{' '}
              <a 
                href="https://ahmedwesam.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Ahmed Wesam
              </a>
            </p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span>Powered by n8n workflows</span>
              <span>•</span>
              <span>Open Source Community</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};