import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { XCircle, Mail } from "lucide-react";

export default function PaymentFailed() {
  const { slug } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-hero-bg flex items-center justify-center p-4">
      <Card className="max-w-md w-full glass border-red-500/20">
        <CardHeader className="text-center">
          <div className="mx-auto w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
            <XCircle className="w-12 h-12 text-red-500" />
          </div>
          <CardTitle className="text-2xl text-red-400">Payment Failed</CardTitle>
          <CardDescription>
            We were unable to process your payment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <p className="text-sm text-text-secondary">
              Your payment could not be completed. This could be due to:
            </p>
            <ul className="text-xs text-text-secondary space-y-1 text-left max-w-xs mx-auto">
              <li>• Insufficient funds</li>
              <li>• Card declined by bank</li>
              <li>• Incorrect card details</li>
              <li>• Network connection issue</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <Button onClick={() => navigate(`/pay/${slug}`)} className="w-full">
              Try Again
            </Button>
            <Button
              onClick={() => window.location.href = "mailto:contact@ahmedwesam.com"}
              variant="outline"
              className="w-full"
            >
              <Mail className="w-4 h-4 mr-2" />
              Contact Support
            </Button>
          </div>

          <p className="text-xs text-text-secondary text-center">
            If you continue to experience issues, please contact us at contact@ahmedwesam.com
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
