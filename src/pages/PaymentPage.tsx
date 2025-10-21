import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Lock, CreditCard, Repeat } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import awLogo from "@/assets/aw-logo.png";

const customerSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name too long"),
  email: z.string().trim().email("Invalid email address").max(255, "Email too long"),
  phone: z.string().trim().regex(/^01[0-9]{9}$/, "Phone must be 11 digits starting with 01"),
});

export default function PaymentPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentLink, setPaymentLink] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadPaymentLink();
  }, [slug]);

  const loadPaymentLink = async () => {
    try {
      const { data, error } = await supabase
        .from("payment_links")
        .select("*")
        .eq("link_slug", slug)
        .single();

      if (error || !data) {
        setError("invalid");
        return;
      }

      // Check status
      if (data.status !== "active") {
        setError("inactive");
        return;
      }

      // Check expiration
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        setError("expired");
        return;
      }

      // Check max uses
      if (data.max_uses && data.current_uses >= data.max_uses) {
        setError("maxed");
        return;
      }

      setPaymentLink(data);
    } catch (err) {
      console.error("Error loading payment link:", err);
      setError("error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    // Validate form
    try {
      customerSchema.parse(formData);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        err.errors.forEach((error) => {
          if (error.path[0]) {
            errors[error.path[0] as string] = error.message;
          }
        });
        setFormErrors(errors);
        return;
      }
    }

    if (!agreed) {
      toast({
        title: "Agreement Required",
        description: "Please agree to the payment terms to continue.",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke("create-paymob-payment", {
        body: {
          slug,
          customer: formData,
        },
      });

      if (error) {
        console.error("Edge function error:", error);
        throw new Error(error.message || "Failed to create payment");
      }

      if (data?.error) {
        console.error("Payment creation error:", data.error);
        throw new Error(data.error);
      }

      if (data?.payment_url) {
        // Redirect to Paymob payment page
        window.location.href = data.payment_url;
      } else {
        throw new Error("No payment URL received");
      }
    } catch (err: any) {
      console.error("Payment error:", err);
      toast({
        title: "Payment Failed",
        description: err.message || "Unable to process payment. Please contact support at contact@ahmedwesam.com",
        variant: "destructive",
      });
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-hero-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-neon-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-hero-bg flex items-center justify-center p-4">
        <Card className="max-w-md w-full glass border-neon-primary/20">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-red-500" />
            </div>
            <CardTitle className="text-xl">
              {error === "invalid" && "Payment Link Not Found"}
              {error === "inactive" && "Payment Link Inactive"}
              {error === "expired" && "Payment Link Expired"}
              {error === "maxed" && "Payment Link Exhausted"}
              {error === "error" && "Error Loading Payment"}
            </CardTitle>
            <CardDescription>
              {error === "invalid" && "This payment link does not exist or has been removed."}
              {error === "inactive" && "This payment link is no longer active."}
              {error === "expired" && "This payment link has expired."}
              {error === "maxed" && "This payment link has reached its maximum number of uses."}
              {error === "error" && "An error occurred while loading the payment details."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")} className="w-full">
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-hero-bg py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/5 backdrop-blur-sm flex items-center justify-center p-3">
            <img src={awLogo} alt="AW Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Payment Invoice</h1>
          <p className="text-text-secondary">Secure payment powered by Paymob Egypt</p>
        </div>

        {/* Invoice Details */}
        <Card className="glass border-neon-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-neon-primary" />
              Invoice Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-surface-secondary/30 rounded-lg">
              <span className="text-text-secondary">Amount:</span>
              <span className="text-2xl font-bold text-neon-primary">
                {paymentLink.amount.toLocaleString()} {paymentLink.currency}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-text-secondary">
                <span className="font-semibold">Description:</span>
              </div>
              <p className="text-text-primary">{paymentLink.description}</p>
            </div>

            {paymentLink.payment_type === "monthly" && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex gap-3">
                <Repeat className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-blue-300">Monthly Recurring Payment</p>
                  <p className="text-xs text-text-secondary">
                    You'll be charged {paymentLink.amount} {paymentLink.currency} every month.
                    Cancel anytime by emailing contact@ahmedwesam.com
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Customer Information Form */}
        <Card className="glass border-neon-primary/20">
          <CardHeader>
            <CardTitle>Your Information</CardTitle>
            <CardDescription>Please provide your details to proceed with payment</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ahmed Wesam"
                  className={formErrors.name ? "border-red-500" : ""}
                />
                {formErrors.name && (
                  <p className="text-xs text-red-500">{formErrors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="ahmed@example.com"
                  className={formErrors.email ? "border-red-500" : ""}
                />
                {formErrors.email && (
                  <p className="text-xs text-red-500">{formErrors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="01234567890"
                  className={formErrors.phone ? "border-red-500" : ""}
                />
                {formErrors.phone && (
                  <p className="text-xs text-red-500">{formErrors.phone}</p>
                )}
                <p className="text-xs text-text-secondary">11 digits starting with 01</p>
              </div>

              <div className="flex items-start gap-2 pt-2">
                <Checkbox
                  id="terms"
                  checked={agreed}
                  onCheckedChange={(checked) => setAgreed(checked as boolean)}
                />
                <label htmlFor="terms" className="text-sm text-text-secondary cursor-pointer">
                  I agree to the payment terms and understand that this is a{" "}
                  {paymentLink.payment_type === "monthly" ? "recurring monthly" : "one-time"}{" "}
                  payment.
                </label>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={processing}
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Pay Securely with Paymob
                  </>
                )}
              </Button>

              <div className="text-center pt-2">
                <p className="text-xs text-text-secondary flex items-center justify-center gap-1">
                  <Lock className="w-3 h-3" />
                  Secure payment powered by Paymob Egypt • 256-bit SSL encryption
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
