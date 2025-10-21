import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

export default function PaymentSuccess() {
  const { slug } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Confetti or celebration animation could go here
  }, []);

  return (
    <div className="min-h-screen bg-hero-bg flex items-center justify-center p-4">
      <Card className="max-w-md w-full glass border-neon-primary/20">
        <CardHeader className="text-center">
          <div className="mx-auto w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mb-4 animate-pulse">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
          <CardTitle className="text-2xl text-green-400">Payment Successful!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <p className="text-text-primary">Thank you for your payment!</p>
            <p className="text-sm text-text-secondary">
              A confirmation email has been sent to your email address with the transaction details.
            </p>
          </div>

          <div className="bg-surface-secondary/30 rounded-lg p-4 space-y-2">
            <p className="text-xs text-text-secondary text-center">
              Transaction completed successfully
            </p>
            <p className="text-xs text-text-secondary text-center">
              {new Date().toLocaleString()}
            </p>
          </div>

          <div className="flex gap-3">
            <Button onClick={() => navigate("/")} variant="outline" className="flex-1">
              Return Home
            </Button>
            <Button onClick={() => window.print()} variant="secondary" className="flex-1">
              Print Receipt
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
