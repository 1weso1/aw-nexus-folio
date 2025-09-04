import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FolderOpen, Plus, Users, Lock, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Collection {
  id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
  item_count?: number;
}

const Collections = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    fetchCollections();
  }, [user, navigate]);

  const fetchCollections = async () => {
    if (!user) return;

    try {
      // Fetch user's own collections
      const { data: userCollections, error: userError } = await supabase
        .from('workflow_collections')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (userError) {
        console.error('Error fetching user collections:', userError);
        toast.error('Failed to load your collections');
        return;
      }

      // Fetch public collections from other users
      const { data: publicCollections, error: publicError } = await supabase
        .from('workflow_collections')
        .select('*')
        .eq('is_public', true)
        .neq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(10);

      if (publicError) {
        console.error('Error fetching public collections:', publicError);
      }

      // Combine collections
      const allCollections = [
        ...(userCollections || []),
        ...(publicCollections || [])
      ];

      // For each collection, get the item count
      const collectionsWithCounts = await Promise.all(
        allCollections.map(async (collection) => {
          const { count } = await supabase
            .from('workflow_collection_items')
            .select('*', { count: 'exact', head: true })
            .eq('collection_id', collection.id);

          return {
            ...collection,
            item_count: count || 0
          };
        })
      );

      setCollections(collectionsWithCounts);
    } catch (error) {
      console.error('Error fetching collections:', error);
      toast.error('Failed to load collections');
    } finally {
      setLoading(false);
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
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-muted rounded"></div>
              ))}
            </div>
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
            <h1 className="text-3xl font-bold text-foreground mb-2">Collections</h1>
            <p className="text-muted-foreground">
              Organize and share your favorite workflow collections
            </p>
          </div>
          
          <Button 
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
            disabled
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Collection
          </Button>
        </div>

        {/* Collections Grid */}
        {collections.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((collection) => (
              <Card key={collection.id} className="glass border-primary/20 p-6 hover-lift">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <FolderOpen className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex items-center gap-2">
                    {collection.is_public ? (
                      <Badge variant="outline" className="border-green-500/30 text-green-400">
                        <Users className="w-3 h-3 mr-1" />
                        Public
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-yellow-500/30 text-yellow-400">
                        <Lock className="w-3 h-3 mr-1" />
                        Private
                      </Badge>
                    )}
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {collection.name}
                </h3>
                
                {collection.description && (
                  <p className="text-muted-foreground mb-4 line-clamp-2">
                    {collection.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <span>{collection.item_count} workflows</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(collection.updated_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 glass border-primary/20"
                    disabled
                  >
                    View Collection
                  </Button>
                  {collection.user_id === user.id && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      disabled
                    >
                      Edit
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <FolderOpen className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              No Collections Yet
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Collections allow you to organize your favorite workflows and share them with others. 
              This feature is coming soon!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
                disabled
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Collection
              </Button>
              
              <Button 
                variant="outline" 
                className="glass border-primary/20"
                onClick={() => navigate('/workflows')}
              >
                Browse Workflows
              </Button>
            </div>
          </div>
        )}

        {/* Coming Soon Notice */}
        <Card className="glass border-primary/20 p-6 mt-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Collections Feature Coming Soon
            </h3>
            <p className="text-muted-foreground">
              We're working on a powerful collections system that will allow you to:
            </p>
            <div className="grid md:grid-cols-2 gap-4 mt-4 text-sm text-muted-foreground">
              <div>• Create custom workflow collections</div>
              <div>• Share collections publicly</div>
              <div>• Collaborate with other users</div>
              <div>• Organize workflows by project</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Collections;