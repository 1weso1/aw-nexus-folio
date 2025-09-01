import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Download, 
  Heart, 
  Clock, 
  User, 
  Settings, 
  LogOut,
  Zap,
  TrendingUp,
  Calendar,
  Star
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    downloads: 0,
    favorites: 0,
    collections: 0,
    lastActivity: null as Date | null,
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // TODO: Fetch user stats from Supabase
    // For now, using mock data
    setStats({
      downloads: 12,
      favorites: 8,
      collections: 2,
      lastActivity: new Date(),
    });
  }, [user, navigate]);

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    navigate('/');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen pt-20 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              Welcome back, {user.email?.split('@')[0]}!
            </h1>
            <p className="text-text-secondary">
              Manage your automation workflows and track your progress
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" className="glass border-brand-primary/20">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
            <Button 
              variant="ghost" 
              onClick={handleSignOut}
              className="text-text-secondary hover:text-text-primary"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glass border-brand-primary/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary mb-1">Downloads</p>
                  <p className="text-2xl font-bold text-brand-primary">{stats.downloads}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Download className="w-5 h-5 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-brand-primary/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary mb-1">Favorites</p>
                  <p className="text-2xl font-bold text-brand-primary">{stats.favorites}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-red-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-brand-primary/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary mb-1">Collections</p>
                  <p className="text-2xl font-bold text-brand-primary">{stats.collections}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Star className="w-5 h-5 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-brand-primary/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary mb-1">Last Active</p>
                  <p className="text-sm font-medium text-text-primary">
                    {stats.lastActivity ? 'Today' : 'Never'}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="recent" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-md">
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="downloads">Downloads</TabsTrigger>
            <TabsTrigger value="collections">Collections</TabsTrigger>
          </TabsList>

          <TabsContent value="recent" className="space-y-6">
            <Card className="glass border-brand-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>
                  Your latest workflow interactions and downloads
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Zap className="w-12 h-12 text-text-secondary mx-auto mb-4" />
                  <p className="text-text-secondary mb-4">
                    Start exploring workflows to see your activity here
                  </p>
                  <Button asChild>
                    <Link to="/workflows">
                      Browse Workflows
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="favorites" className="space-y-6">
            <Card className="glass border-brand-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  Favorite Workflows
                </CardTitle>
                <CardDescription>
                  Workflows you've marked as favorites for quick access
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Heart className="w-12 h-12 text-text-secondary mx-auto mb-4" />
                  <p className="text-text-secondary mb-4">
                    No favorites yet. Heart workflows you love to see them here
                  </p>
                  <Button asChild>
                    <Link to="/workflows">
                      Discover Workflows
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="downloads" className="space-y-6">
            <Card className="glass border-brand-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Download History
                </CardTitle>
                <CardDescription>
                  All workflows you've downloaded and their details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Download className="w-12 h-12 text-text-secondary mx-auto mb-4" />
                  <p className="text-text-secondary mb-4">
                    Your download history will appear here
                  </p>
                  <Button asChild>
                    <Link to="/workflows">
                      Start Downloading
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="collections" className="space-y-6">
            <Card className="glass border-brand-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  My Collections
                </CardTitle>
                <CardDescription>
                  Organize your workflows into custom collections
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Star className="w-12 h-12 text-text-secondary mx-auto mb-4" />
                  <p className="text-text-secondary mb-4">
                    Create collections to organize your workflows
                  </p>
                  <Button asChild>
                    <Link to="/collections">
                      Create Collection
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <Card className="glass border-brand-primary/10 mt-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Jump into the most common tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button asChild variant="outline" className="glass border-brand-primary/20 h-auto p-4">
                <Link to="/workflows" className="flex flex-col items-center gap-2">
                  <Zap className="w-6 h-6" />
                  <span>Browse Workflows</span>
                  <span className="text-xs text-text-secondary">Discover new automations</span>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="glass border-brand-primary/20 h-auto p-4">
                <Link to="/collections" className="flex flex-col items-center gap-2">
                  <Star className="w-6 h-6" />
                  <span>My Collections</span>
                  <span className="text-xs text-text-secondary">Organize workflows</span>
                </Link>
              </Button>
              
              <Button variant="outline" className="glass border-brand-primary/20 h-auto p-4" disabled>
                <div className="flex flex-col items-center gap-2">
                  <TrendingUp className="w-6 h-6" />
                  <span>Analytics</span>
                  <span className="text-xs text-text-secondary">Coming Soon</span>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;