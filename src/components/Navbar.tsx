import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Zap, User, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const Navbar = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Workflows', href: '/workflows' },
    { name: 'Collections', href: '/collections' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b border-primary/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground font-sora">
              Automation Hub
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive(item.href) 
                    ? 'text-primary' 
                    : 'text-muted-foreground'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/dashboard" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Dashboard
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Button asChild className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                <Link to="/auth">Sign In</Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="sm">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="glass border-primary/20">
              <div className="flex flex-col gap-6 mt-6">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`text-lg font-medium transition-colors hover:text-primary ${
                      isActive(item.href) 
                        ? 'text-primary' 
                        : 'text-muted-foreground'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
                
                <div className="border-t border-primary/20 pt-6">
                  {user ? (
                    <div className="flex flex-col gap-4">
                      <Button variant="outline" className="glass border-primary/20" asChild>
                        <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                          <User className="w-4 h-4 mr-2" />
                          Dashboard
                        </Link>
                      </Button>
                      <Button variant="ghost" onClick={handleSignOut}>
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  ) : (
                    <Button asChild className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90">
                      <Link to="/auth" onClick={() => setIsOpen(false)}>
                        Sign In
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};