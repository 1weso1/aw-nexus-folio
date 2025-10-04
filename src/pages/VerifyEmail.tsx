import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token");
      const workflowId = searchParams.get("workflow");

      if (!token) {
        setStatus("error");
        setMessage("Invalid verification link. Please request a new one.");
        return;
      }

      try {
        // Find lead with this token
        const { data: lead, error: findError } = await supabase
          .from("leads")
          .select("*")
          .eq("verification_token", token)
          .maybeSingle();

        if (findError || !lead) {
          setStatus("error");
          setMessage("Verification link is invalid or has expired.");
          return;
        }

        // Check if token is expired (7 days)
        const sentAt = new Date(lead.verification_sent_at);
        const expiryDate = new Date(sentAt);
        expiryDate.setDate(expiryDate.getDate() + 7);

        if (new Date() > expiryDate) {
          setStatus("error");
          setMessage("Verification link has expired. Please request a new one.");
          return;
        }

        // Mark email as verified
        const { error: updateError } = await supabase
          .from("leads")
          .update({
            email_verified: true,
            verification_token: null, // Clear token after use
          })
          .eq("id", lead.id);

        if (updateError) throw updateError;

        // Store email in localStorage
        localStorage.setItem("lead_email", lead.email);

        setStatus("success");
        setMessage("Email verified successfully! You can now download workflows.");

        toast({
          title: "Email verified!",
          description: "You can now download up to 10 workflows.",
        });

        // If there's a pending workflow, redirect to workflows page
        setTimeout(() => {
          if (workflowId) {
            navigate(`/workflows?download=${workflowId}`);
          } else {
            navigate("/workflows");
          }
        }, 2000);
      } catch (error: any) {
        console.error("Error verifying email:", error);
        setStatus("error");
        setMessage("Something went wrong. Please try again.");
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-md w-full glass rounded-2xl p-8 border border-neon-primary/20 text-center">
          {status === "loading" && (
            <>
              <Loader2 className="w-16 h-16 mx-auto mb-4 text-neon-primary animate-spin" />
              <h1 className="text-2xl font-bold text-text-primary mb-2">
                Verifying Your Email
              </h1>
              <p className="text-text-secondary">
                Please wait while we verify your email address...
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <h1 className="text-2xl font-bold text-text-primary mb-2">
                Email Verified!
              </h1>
              <p className="text-text-secondary mb-6">
                {message}
              </p>
              <p className="text-sm text-text-secondary">
                Redirecting you to workflows...
              </p>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
                <XCircle className="w-10 h-10 text-destructive" />
              </div>
              <h1 className="text-2xl font-bold text-text-primary mb-2">
                Verification Failed
              </h1>
              <p className="text-text-secondary mb-6">
                {message}
              </p>
              <Button
                onClick={() => navigate("/workflows")}
                variant="neon"
                className="w-full"
              >
                Go to Workflows
              </Button>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
