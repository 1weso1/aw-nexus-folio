import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import { z } from "zod";

const leadSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  role: z.string().min(1, "Please select your role"),
  interests: z.array(z.string()).min(1, "Please select at least one interest"),
  company_name: z.string().optional(),
  company_size: z.string().optional(),
  automation_challenge: z.string().optional(),
});

type LeadFormData = z.infer<typeof leadSchema>;

interface LeadCaptureDialogProps {
  open: boolean;
  onClose: () => void;
  workflowId?: string;
  workflowName?: string;
  onSuccess?: () => void;
}

const roleOptions = [
  "Business Owner / CEO",
  "Operations Manager",
  "Marketing Manager",
  "Developer / Technical",
  "Freelancer / Consultant",
  "Student / Learning",
  "Other",
];

const interestOptions = [
  { id: "automate", label: "Automate repetitive business tasks" },
  { id: "learn", label: "Learn automation skills" },
  { id: "workflows", label: "Improve team workflows" },
  { id: "solutions", label: "Find solutions for my company" },
  { id: "explore", label: "Explore n8n capabilities" },
  { id: "other", label: "Other" },
];

const companySizeOptions = [
  "Just me (1)",
  "Small team (2-10)",
  "Growing business (11-50)",
  "Medium company (51-200)",
  "Large enterprise (200+)",
  "Not applicable",
];

export function LeadCaptureDialog({ open, onClose, workflowId, workflowName, onSuccess }: LeadCaptureDialogProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<LeadFormData>>({
    interests: [],
  });

  const handleInterestToggle = (interestId: string) => {
    const currentInterests = formData.interests || [];
    const newInterests = currentInterests.includes(interestId)
      ? currentInterests.filter((id) => id !== interestId)
      : [...currentInterests, interestId];
    setFormData({ ...formData, interests: newInterests });
  };

  const handleNext = () => {
    // Validate step 1 required fields
    if (!formData.full_name || !formData.email || !formData.role || !formData.interests?.length) {
      toast({
        title: "Required fields missing",
        description: "Please fill in all required fields before continuing.",
        variant: "destructive",
      });
      return;
    }
    setStep(2);
  };

  const handleSubmit = async () => {
    try {
      // Validate form
      const validatedData = leadSchema.parse(formData);
      setIsSubmitting(true);

      // Get IP address
      const ipResponse = await fetch("https://api.ipify.org?format=json");
      const { ip } = await ipResponse.json();

      // Insert lead into database
      const { data: lead, error: leadError } = await supabase
        .from("leads")
        .insert({
          email: validatedData.email,
          full_name: validatedData.full_name,
          company_name: validatedData.company_name || null,
          role: validatedData.role,
          interests: validatedData.interests,
          company_size: validatedData.company_size || null,
          automation_challenge: validatedData.automation_challenge || null,
          ip_address: ip,
          email_verified: false,
          download_count: 1, // First download already happened
        })
        .select()
        .single();

      if (leadError) {
        console.error("Error creating lead:", leadError);
        throw leadError;
      }

      // Store email in localStorage for future downloads
      localStorage.setItem("lead_email", validatedData.email);

      // Send verification email
      const { error: emailError } = await supabase.functions.invoke("send-lead-verification", {
        body: {
          email: validatedData.email,
          full_name: validatedData.full_name,
          workflow_id: workflowId,
          workflow_name: workflowName,
        },
      });

      if (emailError) {
        console.error("Error sending verification email:", emailError);
        throw emailError;
      }

      toast({
        title: "Success! Check your email",
        description: "We've sent you a verification link. Verify your email to unlock 9 more free downloads!",
      });

      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error("Error submitting lead:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit form. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] glass border-neon-primary/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-text-primary">
            {step === 1 ? "Get 9 More Free Downloads" : "Optional Details"}
          </DialogTitle>
          <DialogDescription className="text-text-secondary">
            {step === 1
              ? "Tell us a bit about yourself to unlock more workflows"
              : "Help us understand how we can serve you better (optional)"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Progress Indicator */}
          <div className="flex gap-2">
            <div className={`h-1 flex-1 rounded-full transition-colors ${step >= 1 ? "bg-neon-primary" : "bg-surface-secondary"}`} />
            <div className={`h-1 flex-1 rounded-full transition-colors ${step >= 2 ? "bg-neon-primary" : "bg-surface-secondary"}`} />
          </div>

          {step === 1 ? (
            <div className="space-y-4">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-text-primary">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="full_name"
                  value={formData.full_name || ""}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="John Doe"
                  className="bg-surface-secondary border-surface-tertiary text-text-primary"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-text-primary">
                  Work Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@company.com"
                  className="bg-surface-secondary border-surface-tertiary text-text-primary"
                />
              </div>

              {/* Role */}
              <div className="space-y-2">
                <Label htmlFor="role" className="text-text-primary">
                  Your Role <span className="text-destructive">*</span>
                </Label>
                <Select value={formData.role || ""} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger className="bg-surface-secondary border-surface-tertiary text-text-primary">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent className="bg-surface-primary border-surface-tertiary">
                    {roleOptions.map((role) => (
                      <SelectItem key={role} value={role} className="text-text-primary">
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Interests */}
              <div className="space-y-3">
                <Label className="text-text-primary">
                  What brings you here? <span className="text-destructive">*</span>
                </Label>
                <div className="space-y-2">
                  {interestOptions.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={option.id}
                        checked={formData.interests?.includes(option.id)}
                        onCheckedChange={() => handleInterestToggle(option.id)}
                        className="border-surface-tertiary"
                      />
                      <label htmlFor={option.id} className="text-sm text-text-secondary cursor-pointer">
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={handleNext} className="w-full" variant="neon">
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Company Name */}
              <div className="space-y-2">
                <Label htmlFor="company_name" className="text-text-primary">
                  Company Name (Optional)
                </Label>
                <Input
                  id="company_name"
                  value={formData.company_name || ""}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  placeholder="Acme Inc. or 'Not applicable'"
                  className="bg-surface-secondary border-surface-tertiary text-text-primary"
                />
              </div>

              {/* Company Size */}
              <div className="space-y-2">
                <Label htmlFor="company_size" className="text-text-primary">
                  Company Size (Optional)
                </Label>
                <Select
                  value={formData.company_size || ""}
                  onValueChange={(value) => setFormData({ ...formData, company_size: value })}
                >
                  <SelectTrigger className="bg-surface-secondary border-surface-tertiary text-text-primary">
                    <SelectValue placeholder="Select company size" />
                  </SelectTrigger>
                  <SelectContent className="bg-surface-primary border-surface-tertiary">
                    {companySizeOptions.map((size) => (
                      <SelectItem key={size} value={size} className="text-text-primary">
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Automation Challenge */}
              <div className="space-y-2">
                <Label htmlFor="automation_challenge" className="text-text-primary">
                  What's your biggest automation challenge? (Optional)
                </Label>
                <Textarea
                  id="automation_challenge"
                  value={formData.automation_challenge || ""}
                  onChange={(e) => setFormData({ ...formData, automation_challenge: e.target.value })}
                  placeholder="Tell us about the workflows or tasks you'd like to automate..."
                  className="bg-surface-secondary border-surface-tertiary text-text-primary min-h-[100px]"
                />
              </div>

              <div className="flex gap-3">
                <Button onClick={() => setStep(1)} variant="ghost" className="flex-1">
                  Back
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1" variant="neon">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Complete
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
