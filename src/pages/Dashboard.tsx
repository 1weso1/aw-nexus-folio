import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Heart, FolderOpen, User, Settings, LogOut, Calendar, Workflow } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
}

interface WorkflowDownload {
  id: string;
  downloaded_at: string;
  workflow: {
    id: string;
    name: string;
    category: string;
    node_count: number;
    complexity: string;
  };
}

interface WorkflowFavorite {
  id: string;
  created_at: string;
  workflow: {
    id: string;
    name: string;
    category: string;
    node_count: number;
    complexity: string;
  };
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [downloads, setDownloads] = useState<WorkflowDownload[]>([]);
  const [favorites, setFavorites] = useState<WorkflowFavorite[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    fetchUserData();
  }, [user, navigate]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching profile:', profileError);
      } else if (profileData) {
        setProfile(profileData);
      }

      // Fetch downloads with workflow info
      const { data: downloadsData, error: downloadsError } = await supabase
        .from('workflow_downloads')
        .select(`
          id,
          downloaded_at,
          workflows!inner (
            id,
            name,
            category,
            node_count,
            complexity
          )
        `)
        .eq('user_id', user.id)
        .order('downloaded_at', { ascending: false })
        .limit(10);

      if (downloadsError) {
        console.error('Error fetching downloads:', downloadsError);
      } else if (downloadsData) {
        setDownloads(downloadsData.map(d => ({
          id: d.id,
          downloaded_at: d.downloaded_at,
          workflow: d.workflows
        })));
      }

      // Fetch favorites with workflow info
      const { data: favoritesData, error: favoritesError } = await supabase
        .from('workflow_favorites')
        .select(`
          id,
          created_at,
          workflows!inner (
            id,
            name,
            category,
            node_count,
            complexity
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (favoritesError) {
        console.error('Error fetching favorites:', favoritesError);
      } else if (favoritesData) {
        setFavorites(favoritesData.map(f => ({
          id: f.id,
          created_at: f.created_at,
          workflow: f.workflows
        })));
      }

    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity?.toLowerCase()) {
      case 'easy': return "bg-green-500/20 text-green-400 border-green-500/30";
      case 'medium': return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case 'hard': return "bg-red-500/20 text-red-400 border-red-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  if (!user) {
    return null; // Will redirect
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-8"></div>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="h-32 bg-muted rounded"></div>
              <div className="h-32 bg-muted rounded"></div>
              <div className="h-32 bg-muted rounded"></div>
            </div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {profile?.full_name || user.email}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="outline" className="glass border-primary/20">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
            <Button 
              variant="ghost" 
              onClick={handleSignOut}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="glass border-primary/20 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Download className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{downloads.length}</div>
                <div className="text-sm text-muted-foreground">Total Downloads</div>
              </div>
            </div>
          </Card>

          <Card className="glass border-primary/20 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                <Heart className="w-6 h-6 text-accent" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{favorites.length}</div>
                <div className="text-sm text-muted-foreground">Favorite Workflows</div>
              </div>
            </div>
          </Card>

          <Card className="glass border-primary/20 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-secondary/40 flex items-center justify-center">
                <User className="w-6 h-6 text-foreground" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">Member</div>
                <div className="text-sm text-muted-foreground">Since {new Date(user.created_at).toLocaleDateString()}</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Content Tabs */}
        <Card className="glass border-primary/20 p-6">
          <Tabs defaultValue="downloads" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="downloads">Recent Downloads</TabsTrigger>
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
              <TabsTrigger value="collections">Collections</TabsTrigger>
            </TabsList>

            <TabsContent value="downloads" className="space-y-4">
              {downloads.length > 0 ? (
                downloads.map((download) => (
                  <Card key={download.id} className="glass border-primary/10 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Link 
                            to={`/workflows/${download.workflow.id}`}
                            className="text-lg font-semibold text-foreground hover:text-primary transition-colors"
                          >
                            {download.workflow.name}
                          </Link>
                          <Badge variant="outline" className="border-primary/30">
                            {download.workflow.category}
                          </Badge>
                          <Badge className={getComplexityColor(download.workflow.complexity)}>
                            {download.workflow.complexity}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Workflow className="w-4 h-4" />
                            {download.workflow.node_count} nodes
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Downloaded {new Date(download.downloaded_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="glass border-primary/20" asChild>
                        <Link to={`/workflows/${download.workflow.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12">
                  <Download className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No downloads yet</h3>
                  <p className="text-muted-foreground mb-4">Start exploring and downloading workflows to see them here.</p>
                  <Button asChild className="bg-gradient-to-r from-primary to-accent">
                    <Link to="/workflows">Browse Workflows</Link>
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="favorites" className="space-y-4">
              {favorites.length > 0 ? (
                favorites.map((favorite) => (
                  <Card key={favorite.id} className="glass border-primary/10 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Link 
                            to={`/workflows/${favorite.workflow.id}`}
                            className="text-lg font-semibold text-foreground hover:text-primary transition-colors"
                          >
                            {favorite.workflow.name}
                          </Link>
                          <Badge variant="outline" className="border-primary/30">
                            {favorite.workflow.category}
                          </Badge>
                          <Badge className={getComplexityColor(favorite.workflow.complexity)}>
                            {favorite.workflow.complexity}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Workflow className="w-4 h-4" />
                            {favorite.workflow.node_count} nodes
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            Added {new Date(favorite.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="glass border-primary/20" asChild>
                        <Link to={`/workflows/${favorite.workflow.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12">
                  <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No favorites yet</h3>
                  <p className="text-muted-foreground mb-4">Mark workflows as favorites to see them here.</p>
                  <Button asChild className="bg-gradient-to-r from-primary to-accent">
                    <Link to="/workflows">Browse Workflows</Link>
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="collections" className="space-y-4">
              <div className="text-center py-12">
                <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Collections Coming Soon</h3>
                <p className="text-muted-foreground mb-4">Organize your workflows into custom collections.</p>
                <Button variant="outline" className="glass border-primary/20" disabled>
                  Create Collection
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;