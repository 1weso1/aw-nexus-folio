import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Mail, Loader2, CheckCircle2 } from "lucide-react";

interface VerificationReminderDialogProps {
  open: boolean;
  onClose: () => void;
  email: string;
  workflowId?: string;
  workflowName?: string;
}

export function VerificationReminderDialog({ 
  open, 
  onClose, 
  email,
  workflowId,
  workflowName 
}: VerificationReminderDialogProps) {
  const [isResending, setIsResending] = useState(false);

  const handleResendEmail = async () => {
    try {
      setIsResending(true);

      // Get lead info
      const { data: lead, error: leadError } = await supabase
        .from("leads")
        .select("full_name")
        .eq("email", email)
        .single();

      if (leadError) throw leadError;

      // Resend verification email
      const { data, error: invokeError } = await supabase.functions.invoke("send-lead-verification", {
        body: {
          email,
          full_name: lead.full_name,
          workflow_id: workflowId,
          workflow_name: workflowName,
        },
      });

      if (invokeError) {
        console.error("Invoke error:", invokeError);
        throw invokeError;
      }

      if (data && !data.success) {
        console.error("Function returned error:", data.error);
        throw new Error(data.error || "Failed to send verification email");
      }

      toast({
        title: "Email sent!",
        description: "Check your inbox for the verification link.",
      });
    } catch (error: any) {
      console.error("Error resending verification email:", error);
      toast({
        title: "Error",
        description: "Failed to resend email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleChangeEmail = () => {
    localStorage.removeItem("lead_email");
    localStorage.removeItem("has_downloaded");
    toast({
      title: "Email cleared",
      description: "Click download again to enter a new email address.",
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] glass border-neon-primary/20">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-neon-primary/10 flex items-center justify-center">
              <Mail className="w-8 h-8 text-neon-primary" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold text-center text-text-primary">
            Please Verify Your Email
          </DialogTitle>
          <DialogDescription className="text-center text-text-secondary">
            We sent a verification link to <strong className="text-text-primary">{email}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-surface-secondary/50 rounded-lg p-4 border border-neon-primary/10">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-neon-primary flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-text-primary">What to do next:</p>
                <ol className="text-sm text-text-secondary space-y-1 list-decimal list-inside">
                  <li>Check your inbox (and spam folder)</li>
                  <li>Click the verification link</li>
                  <li>You'll be able to download this workflow</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              onClick={handleResendEmail}
              disabled={isResending}
              variant="neon"
              className="w-full"
            >
              {isResending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Resend Verification Email
                </>
              )}
            </Button>

            <Button
              onClick={handleChangeEmail}
              variant="ghost"
              className="w-full"
            >
              Change Email Address
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
