import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Github, Twitter, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-brand-primary/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-brand-primary to-brand-accent flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="gradient-text">Automation Hub</span>
            </Link>
            <p className="text-text-secondary mb-4 max-w-md">
              The ultimate platform for discovering, previewing, and downloading n8n automation workflows. 
              Built by the community, for the community.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/1weso1/n8n-workflows"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-secondary hover:text-brand-primary transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="mailto:automation@ahmedwesam.com"
                className="text-text-secondary hover:text-brand-primary transition-colors"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-semibold text-text-primary mb-4">Platform</h4>
            <div className="space-y-2">
              <Link to="/workflows" className="block text-sm text-text-secondary hover:text-brand-primary transition-colors">
                Browse Workflows
              </Link>
              <Link to="/auth" className="block text-sm text-text-secondary hover:text-brand-primary transition-colors">
                Sign Up
              </Link>
              <Link to="/dashboard" className="block text-sm text-text-secondary hover:text-brand-primary transition-colors">
                Dashboard
              </Link>
              <Link to="/collections" className="block text-sm text-text-secondary hover:text-brand-primary transition-colors">
                Collections
              </Link>
            </div>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-text-primary mb-4">Resources</h4>
            <div className="space-y-2">
              <a
                href="https://n8n.io"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-text-secondary hover:text-brand-primary transition-colors"
              >
                n8n Platform
              </a>
              <a
                href="https://docs.n8n.io"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-text-secondary hover:text-brand-primary transition-colors"
              >
                n8n Documentation
              </a>
              <a
                href="https://community.n8n.io"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-text-secondary hover:text-brand-primary transition-colors"
              >
                n8n Community
              </a>
              <a
                href="https://ahmedwesam.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-text-secondary hover:text-brand-primary transition-colors"
              >
                Ahmed Wesam
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-brand-primary/10 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-text-secondary">
            © 2024 Automation Hub. Built with ❤️ for the n8n community.
          </p>
          <div className="flex items-center gap-6 mt-4 sm:mt-0">
            <span className="text-xs text-text-secondary">
              Powered by Supabase & React
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export { Footer };