import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Copy, ExternalLink, Loader2, Plus, Eye, Pause, Play, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { nanoid } from "nanoid";

export default function PaymentLinks() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [paymentLinks, setPaymentLinks] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    client_name: "",
    client_email: "",
    amount: "",
    currency: "EGP",
    payment_type: "one_time" as "one_time" | "monthly",
    description: "",
    max_uses: "",
    expires_at: "",
  });

  useEffect(() => {
    loadPaymentLinks();
    loadTransactions();
    loadSubscriptions();
  }, []);

  const loadPaymentLinks = async () => {
    const { data } = await supabase
      .from("payment_links")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setPaymentLinks(data);
  };

  const loadTransactions = async () => {
    const { data } = await supabase
      .from("payment_transactions")
      .select("*, payment_links(*)")
      .order("created_at", { ascending: false })
      .limit(50);

    if (data) setTransactions(data);
  };

  const loadSubscriptions = async () => {
    const { data } = await supabase
      .from("recurring_subscriptions")
      .select("*, payment_links(*)")
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (data) setSubscriptions(data);
  };

  const generateSlug = (name: string) => {
    const sanitized = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .substring(0, 20);
    return `${sanitized}-${nanoid(8)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error("Not authenticated");

      const slug = generateSlug(formData.client_name);

      const { error } = await supabase.from("payment_links").insert({
        link_slug: slug,
        client_name: formData.client_name,
        client_email: formData.client_email,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        payment_type: formData.payment_type,
        description: formData.description,
        max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
        expires_at: formData.expires_at || null,
        admin_user_id: session.session.user.id,
      });

      if (error) throw error;

      const paymentUrl = `${window.location.origin}/pay/${slug}`;
      
      // Copy to clipboard
      await navigator.clipboard.writeText(paymentUrl);

      toast({
        title: "Payment Link Created!",
        description: "Link copied to clipboard",
      });

      // Reset form
      setFormData({
        client_name: "",
        client_email: "",
        amount: "",
        currency: "EGP",
        payment_type: "one_time",
        description: "",
        max_uses: "",
        expires_at: "",
      });

      loadPaymentLinks();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyLink = (slug: string) => {
    const url = `${window.location.origin}/pay/${slug}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Copied!",
      description: "Payment link copied to clipboard",
    });
  };

  const toggleSubscriptionStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "paused" : "active";
    
    const { error } = await supabase
      .from("recurring_subscriptions")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update subscription",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Subscription ${newStatus === "active" ? "resumed" : "paused"}`,
      });
      loadSubscriptions();
    }
  };

  const cancelSubscription = async (id: string) => {
    const { error } = await supabase
      .from("recurring_subscriptions")
      .update({
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
        cancellation_reason: "Cancelled by admin",
      })
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to cancel subscription",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Cancelled",
        description: "Subscription has been cancelled",
      });
      loadSubscriptions();
    }
  };

  return (
    <div className="min-h-screen bg-hero-bg p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Payment Links</h1>
            <p className="text-text-secondary">Generate and manage custom payment links</p>
          </div>
        </div>

        {/* Generator Form */}
        <Card className="glass border-neon-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Generate Custom Payment Link
            </CardTitle>
            <CardDescription>Create a payment link for your client</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Client Name *</Label>
                  <Input
                    value={formData.client_name}
                    onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Client Email *</Label>
                  <Input
                    type="email"
                    value={formData.client_email}
                    onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Amount *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Currency *</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => setFormData({ ...formData, currency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EGP">EGP (Egyptian Pound)</SelectItem>
                      <SelectItem value="USD">USD (US Dollar)</SelectItem>
                      <SelectItem value="EUR">EUR (Euro)</SelectItem>
                      <SelectItem value="SAR">SAR (Saudi Riyal)</SelectItem>
                      <SelectItem value="AED">AED (UAE Dirham)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Payment Type *</Label>
                <RadioGroup
                  value={formData.payment_type}
                  onValueChange={(value: any) => setFormData({ ...formData, payment_type: value })}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="one_time" id="one_time" />
                    <Label htmlFor="one_time" className="cursor-pointer">One-time Payment</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="monthly" id="monthly" />
                    <Label htmlFor="monthly" className="cursor-pointer">Monthly Subscription</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>Description *</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Max Uses (optional)</Label>
                  <Input
                    type="number"
                    value={formData.max_uses}
                    onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                    placeholder="Leave blank for unlimited"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Expires At (optional)</Label>
                  <Input
                    type="datetime-local"
                    value={formData.expires_at}
                    onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                  />
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                Generate Link
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="links" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="links">Active Links</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          </TabsList>

          <TabsContent value="links" className="space-y-4">
            {paymentLinks.map((link) => (
              <Card key={link.id} className="glass border-neon-primary/20">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg text-text-primary">{link.client_name}</h3>
                      <p className="text-sm text-text-secondary">{link.client_email}</p>
                      <div className="flex gap-2 flex-wrap">
                        <Badge variant="outline">{link.amount} {link.currency}</Badge>
                        <Badge variant={link.payment_type === "monthly" ? "default" : "secondary"}>
                          {link.payment_type === "monthly" ? "Monthly" : "One-time"}
                        </Badge>
                        <Badge variant={link.status === "active" ? "default" : "secondary"}>
                          {link.status}
                        </Badge>
                        <Badge variant="outline">{link.current_uses}/{link.max_uses || "∞"} uses</Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => copyLink(link.link_slug)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(`/pay/${link.link_slug}`, "_blank")}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            {transactions.map((tx) => (
              <Card key={tx.id} className="glass border-neon-primary/20">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="font-semibold text-text-primary">{tx.customer_name}</p>
                      <p className="text-sm text-text-secondary">{tx.customer_email}</p>
                      <p className="text-sm text-text-secondary">
                        {new Date(tx.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="font-bold text-lg text-neon-primary">
                        {tx.amount} {tx.currency}
                      </p>
                      <Badge variant={tx.status === "success" ? "default" : tx.status === "failed" ? "destructive" : "secondary"}>
                        {tx.status}
                      </Badge>
                      <p className="text-xs text-text-secondary">{tx.payment_method}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="subscriptions" className="space-y-4">
            {subscriptions.map((sub) => (
              <Card key={sub.id} className="glass border-neon-primary/20">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <p className="font-semibold text-text-primary">{sub.customer_name}</p>
                      <p className="text-sm text-text-secondary">{sub.customer_email}</p>
                      <p className="text-xs text-text-secondary">
                        Next payment: {sub.next_payment_date}
                      </p>
                      <p className="text-xs text-text-secondary">
                        Total paid: {sub.total_payments_made} months
                      </p>
                    </div>
                    <div className="text-right space-y-2">
                      <p className="font-bold text-lg text-neon-primary">
                        {sub.payment_links.amount} {sub.payment_links.currency}
                      </p>
                      <Badge>{sub.status}</Badge>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleSubscriptionStatus(sub.id, sub.status)}
                        >
                          {sub.status === "active" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => cancelSubscription(sub.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
