import { Mail, Linkedin, Instagram } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-neon-primary/10 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo & Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <img 
                src="/lovable-uploads/d565c3d6-458e-41eb-8e16-a1ddcfbdc719.png" 
                alt="Ahmed Wesam Logo" 
                className="h-8 w-8 neon-glow"
              />
              <span className="font-sora font-bold text-xl neon-text">Ahmed Wesam</span>
            </div>
            <p className="body-large max-w-sm">
              Building smarter connections through CRM, automation, and community projects.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-sora font-semibold text-text-primary">Quick Links</h3>
            <nav className="flex flex-col space-y-2">
              {[
                { name: "About", href: "/about" },
                { name: "Projects", href: "/projects" },
                { name: "Apps", href: "/apps" },
                { name: "Blog", href: "/blog" },
                { name: "Contact", href: "/contact" },
              ].map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-text-secondary hover:text-neon-primary transition-colors duration-300"
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact & Social */}
          <div className="space-y-4">
            <h3 className="font-sora font-semibold text-text-primary">Connect</h3>
            <div className="flex flex-col space-y-3">
              <a
                href="mailto:contact@ahmedwesam.com"
                className="flex items-center text-text-secondary hover:text-neon-primary transition-colors duration-300"
              >
                <Mail className="h-4 w-4 mr-2" />
                contact@ahmedwesam.com
              </a>
              <a
                href="https://www.linkedin.com/in/ahmed-wesam-3b57bb1b1?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-text-secondary hover:text-neon-primary transition-colors duration-300"
              >
                <Linkedin className="h-4 w-4 mr-2" />
                LinkedIn
              </a>
              <a
                href="https://www.instagram.com/movebue?igsh=d2ppOWFnNHM1cmdi"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-text-secondary hover:text-neon-primary transition-colors duration-300"
              >
                <Instagram className="h-4 w-4 mr-2" />
                Move Instagram
              </a>
              <a
                href="https://www.instagram.com/buerotaract?igsh=dTJ0emh5eXRsNzM5"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-text-secondary hover:text-neon-primary transition-colors duration-300"
              >
                <Instagram className="h-4 w-4 mr-2" />
                Rotaract Instagram
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-neon-primary/10 mt-8 pt-8 text-center">
          <p className="text-text-secondary">
            © {currentYear} Ahmed Wesam. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}