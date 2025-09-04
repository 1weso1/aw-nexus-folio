import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Zap } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Workflows', href: '/workflows' },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };


  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-hero-bg/80 glass border-b border-brand-primary/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-brand-primary to-brand-accent flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="gradient-text">Automation Hub</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-sm font-medium transition-colors hover:text-brand-primary ${
                  isActive(item.href)
                    ? 'text-brand-primary'
                    : 'text-text-secondary'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Button asChild className="bg-gradient-to-r from-brand-primary to-brand-accent">
              <Link to="/workflows">
                Browse Library
              </Link>
            </Button>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 bg-hero-bg border-brand-primary/20">
                <div className="flex flex-col gap-6 pt-6">
                  {/* Logo */}
                  <Link 
                    to="/" 
                    className="flex items-center gap-2 font-bold text-xl"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-brand-primary to-brand-accent flex items-center justify-center">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <span className="gradient-text">Automation Hub</span>
                  </Link>

                  {/* Navigation */}
                  <div className="flex flex-col gap-3">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`text-base font-medium transition-colors hover:text-brand-primary px-3 py-2 rounded-lg ${
                          isActive(item.href)
                            ? 'text-brand-primary bg-brand-primary/10'
                            : 'text-text-secondary'
                        }`}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className="pt-6 border-t border-brand-primary/20">
                    <Button 
                      asChild 
                      className="w-full bg-gradient-to-r from-brand-primary to-brand-accent"
                      onClick={() => setIsOpen(false)}
                    >
                      <Link to="/workflows">
                        Browse Library
                      </Link>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export { Navbar };