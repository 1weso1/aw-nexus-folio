import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Star, 
  Folder, 
  Search,
  MoreHorizontal,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Collections = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  if (!user) {
    navigate('/auth');
    return null;
  }

  // Mock collections data - TODO: Replace with Supabase data
  const collections = [
    {
      id: '1',
      name: 'Email Automation',
      description: 'Workflows for email marketing and notifications',
      workflowCount: 5,
      isPublic: false,
      createdAt: new Date('2024-01-15'),
    },
    {
      id: '2', 
      name: 'Data Processing',
      description: 'ETL and data transformation workflows',
      workflowCount: 3,
      isPublic: true,
      createdAt: new Date('2024-01-10'),
    },
  ];

  return (
    <div className="min-h-screen pt-20 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Button variant="ghost" asChild className="mb-4">
              <Link to="/dashboard" className="text-text-secondary hover:text-text-primary">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
            
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              My Collections
            </h1>
            <p className="text-text-secondary">
              Organize your favorite workflows into custom collections
            </p>
          </div>
          
          <Button className="bg-gradient-to-r from-brand-primary to-brand-accent">
            <Plus className="mr-2 h-4 w-4" />
            New Collection
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-4 h-4" />
            <Input
              type="text"
              placeholder="Search collections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 glass border-brand-primary/20"
            />
          </div>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection) => (
            <Card key={collection.id} className="glass border-brand-primary/10 hover:border-brand-primary/20 transition-colors group">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center">
                      <Folder className="w-5 h-5 text-brand-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-text-primary group-hover:text-brand-primary transition-colors">
                        {collection.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={collection.isPublic ? "default" : "secondary"} className="text-xs">
                          {collection.isPublic ? "Public" : "Private"}
                        </Badge>
                        <span className="text-xs text-text-secondary">
                          {collection.workflowCount} workflows
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent>
                <CardDescription className="mb-4">
                  {collection.description}
                </CardDescription>
                
                <div className="flex items-center justify-between text-sm text-text-secondary">
                  <span>
                    Created {collection.createdAt.toLocaleDateString()}
                  </span>
                  <Button variant="outline" size="sm" className="glass border-brand-primary/20">
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Create New Collection Card */}
          <Card className="glass border-brand-primary/10 border-dashed hover:border-brand-primary/30 transition-colors group cursor-pointer">
            <CardContent className="flex flex-col items-center justify-center h-full py-12">
              <div className="w-12 h-12 rounded-lg bg-brand-primary/10 flex items-center justify-center mb-4 group-hover:bg-brand-primary/20 transition-colors">
                <Plus className="w-6 h-6 text-brand-primary" />
              </div>
              <h3 className="font-semibold text-text-primary mb-2">Create Collection</h3>
              <p className="text-sm text-text-secondary text-center">
                Organize workflows by topic, project, or any way you like
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Empty State */}
        {collections.length === 0 && (
          <Card className="glass border-brand-primary/10">
            <CardContent className="text-center py-12">
              <Star className="w-16 h-16 text-text-secondary mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-text-primary mb-2">
                No Collections Yet
              </h3>
              <p className="text-text-secondary mb-6 max-w-md mx-auto">
                Create your first collection to organize workflows by topic, project, or any way that makes sense for you.
              </p>
              <Button className="bg-gradient-to-r from-brand-primary to-brand-accent">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Collection
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Collections;