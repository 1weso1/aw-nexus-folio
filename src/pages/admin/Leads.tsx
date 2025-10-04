import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Mail, Download, Shield, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { SEO } from '@/components/SEO';

interface Lead {
  id: string;
  email: string;
  full_name: string;
  company_name: string | null;
  role: string;
  access_tier: 'free' | 'gold' | 'platinum';
  download_count: number;
  download_limit: number;
  can_access_expert: boolean;
  can_access_enterprise: boolean;
  email_verified: boolean;
  created_at: string;
}

const Leads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchLeads();
    }
  }, [isAdmin]);

  useEffect(() => {
    let filtered = leads.filter(lead => {
      const matchesSearch = lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           lead.full_name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesTier = tierFilter === 'all' || lead.access_tier === tierFilter;
      
      const matchesVerification = verificationFilter === 'all' || 
                                 (verificationFilter === 'verified' && lead.email_verified) ||
                                 (verificationFilter === 'unverified' && !lead.email_verified);
      
      return matchesSearch && matchesTier && matchesVerification;
    });
    
    setFilteredLeads(filtered);
  }, [searchTerm, tierFilter, verificationFilter, leads]);

  const checkAdminStatus = async () => {
    try {
      const { data, error } = await supabase.rpc('is_site_admin');
      if (error) throw error;
      setIsAdmin(data);
      
      if (!data) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to view this page.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  const fetchLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads((data || []) as Lead[]);
      setFilteredLeads((data || []) as Lead[]);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast({
        title: "Error",
        description: "Failed to load leads",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateLeadTier = async (leadId: string, newTier: 'free' | 'gold' | 'platinum') => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ access_tier: newTier })
        .eq('id', leadId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Lead upgraded to ${newTier} tier`,
      });

      fetchLeads();
    } catch (error) {
      console.error('Error updating tier:', error);
      toast({
        title: "Error",
        description: "Failed to update tier",
        variant: "destructive",
      });
    }
  };

  const updateDownloadLimit = async (leadId: string, newLimit: number) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ download_limit: newLimit })
        .eq('id', leadId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Download limit updated to ${newLimit}`,
      });

      fetchLeads();
    } catch (error) {
      console.error('Error updating limit:', error);
      toast({
        title: "Error",
        description: "Failed to update limit",
        variant: "destructive",
      });
    }
  };

  const resetDownloadCount = async (leadId: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ download_count: 0 })
        .eq('id', leadId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Download count reset to 0",
      });

      fetchLeads();
    } catch (error) {
      console.error('Error resetting downloads:', error);
      toast({
        title: "Error",
        description: "Failed to reset downloads",
        variant: "destructive",
      });
    }
  };

  const getTierIcon = (tier: string) => {
    if (tier === 'free') return '🌱';
    if (tier === 'gold') return '👑';
    return '💎';
  };

  const getTierColor = (tier: string) => {
    if (tier === 'free') return 'bg-green-500/10 text-green-500 border-green-500/20';
    if (tier === 'gold') return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
  };

  const stats = {
    total: leads.length,
    free: leads.filter(l => l.access_tier === 'free').length,
    gold: leads.filter(l => l.access_tier === 'gold').length,
    platinum: leads.filter(l => l.access_tier === 'platinum').length,
    verified: leads.filter(l => l.email_verified).length,
    totalDownloads: leads.reduce((sum, l) => sum + l.download_count, 0),
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="glass max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Access Denied</CardTitle>
            <CardDescription className="text-center">
              You don't have permission to view this page.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading leads...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="Admin: Manage Leads"
        description="Admin dashboard for managing workflow download leads"
      />
      
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-text-primary mb-2">Lead Management</h1>
          <p className="text-text-secondary">Manage workflow download leads and access tiers</p>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card className="glass">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-neon-primary">{stats.total}</div>
              <p className="text-sm text-text-secondary">Total Leads</p>
            </CardContent>
          </Card>
          
          <Card className="glass">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-500">🌱 {stats.free}</div>
              <p className="text-sm text-text-secondary">Free Tier</p>
            </CardContent>
          </Card>
          
          <Card className="glass">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-yellow-500">👑 {stats.gold}</div>
              <p className="text-sm text-text-secondary">Gold Tier</p>
            </CardContent>
          </Card>
          
          <Card className="glass">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-purple-500">💎 {stats.platinum}</div>
              <p className="text-sm text-text-secondary">Platinum Tier</p>
            </CardContent>
          </Card>
          
          <Card className="glass">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-neon-primary">{stats.verified}</div>
              <p className="text-sm text-text-secondary">Verified</p>
            </CardContent>
          </Card>
          
          <Card className="glass">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-neon-primary">{stats.totalDownloads}</div>
              <p className="text-sm text-text-secondary">Total Downloads</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="glass mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-text-secondary" />
                <Input
                  placeholder="Search by email or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={tierFilter} onValueChange={setTierFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter by tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  <SelectItem value="free">🌱 Free</SelectItem>
                  <SelectItem value="gold">👑 Gold</SelectItem>
                  <SelectItem value="platinum">💎 Platinum</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={verificationFilter} onValueChange={setVerificationFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Verification status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="unverified">Unverified</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Leads Table */}
        <div className="space-y-4">
          {filteredLeads.map((lead) => (
            <Card key={lead.id} className="glass">
              <CardContent className="pt-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-semibold text-text-primary">{lead.full_name}</h3>
                      <Badge className={getTierColor(lead.access_tier)}>
                        {getTierIcon(lead.access_tier)} {lead.access_tier.toUpperCase()}
                      </Badge>
                      {lead.email_verified ? (
                        <Badge variant="outline" className="bg-green-500/10 text-green-500">
                          <Mail className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-500/10 text-red-500">
                          <Mail className="w-3 h-3 mr-1" />
                          Unverified
                        </Badge>
                      )}
                    </div>
                    
                    <div className="text-sm text-text-secondary space-y-1">
                      <p>{lead.email}</p>
                      <p>{lead.role} {lead.company_name && `at ${lead.company_name}`}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1">
                          <Download className="w-4 h-4" />
                          {lead.download_count} / {lead.download_limit}
                        </span>
                        {lead.can_access_expert && (
                          <Badge variant="outline" className="text-xs">Expert Access</Badge>
                        )}
                        {lead.can_access_enterprise && (
                          <Badge variant="outline" className="text-xs">Enterprise Access</Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 lg:w-[300px]">
                    <div className="flex gap-2">
                      <Select
                        value={lead.access_tier}
                        onValueChange={(value) => updateLeadTier(lead.id, value as any)}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="free">🌱 Free (10)</SelectItem>
                          <SelectItem value="gold">👑 Gold (100)</SelectItem>
                          <SelectItem value="platinum">💎 Platinum (∞)</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => resetDownloadCount(lead.id)}
                        title="Reset download count"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Custom limit"
                        className="flex-1"
                        onBlur={(e) => {
                          const value = parseInt(e.target.value);
                          if (value && value > 0) {
                            updateDownloadLimit(lead.id, value);
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredLeads.length === 0 && (
            <Card className="glass">
              <CardContent className="pt-6 text-center text-text-secondary">
                No leads found matching your filters.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
};

export default Leads;
