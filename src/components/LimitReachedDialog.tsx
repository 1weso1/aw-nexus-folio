import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle2, Download } from "lucide-react";
import { Link } from "react-router-dom";

interface LimitReachedDialogProps {
  open: boolean;
  onClose: () => void;
  downloadsUsed: number;
  accessTier?: 'free' | 'gold' | 'platinum';
}

export function LimitReachedDialog({ open, onClose, downloadsUsed, accessTier = 'free' }: LimitReachedDialogProps) {
  const getTierIcon = (tier: string) => {
    if (tier === 'free') return '🌱';
    if (tier === 'gold') return '👑';
    return '💎';
  };

  const getTierName = (tier: string) => {
    if (tier === 'free') return 'Free';
    if (tier === 'gold') return 'Gold';
    return 'Platinum';
  };

  const getUpgradeMessage = () => {
    if (accessTier === 'free') {
      return 'Upgrade to Gold (100 downloads + Expert workflows) or Platinum (unlimited + all workflows) to continue.';
    }
    if (accessTier === 'gold') {
      return 'Upgrade to Platinum for unlimited downloads and access to Enterprise workflows.';
    }
    return 'Contact us to discuss enterprise options.';
  };
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] glass border-neon-primary/20">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-neon-primary/10 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-neon-primary" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold text-center text-text-primary">
            {getTierIcon(accessTier)} You've Used All {downloadsUsed} {getTierName(accessTier)} Tier Downloads! 🎉
          </DialogTitle>
          <DialogDescription className="text-center text-text-secondary">
            {getUpgradeMessage()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Benefits */}
          <div className="bg-surface-secondary/50 rounded-lg p-4 border border-neon-primary/10 space-y-3">
            <p className="text-sm font-medium text-text-primary">In a free consultation, we can:</p>
            <ul className="space-y-2">
              {[
                "Discuss your specific automation needs",
                "Get custom workflow recommendations",
                "Unlock more advanced templates",
                "Explore how I can help implement solutions",
              ].map((benefit, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-text-secondary">
                  <CheckCircle2 className="w-4 h-4 text-neon-primary flex-shrink-0 mt-0.5" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          {/* Download Summary */}
          <div className="flex items-center justify-center gap-2 text-text-secondary">
            <Download className="w-4 h-4" />
            <span className="text-sm">
              You've downloaded {downloadsUsed} workflows ({getTierName(accessTier)} Tier)
            </span>
          </div>

          {/* CTA */}
          <Link to="/book" className="block">
            <Button variant="neon" className="w-full" size="lg">
              <Calendar className="mr-2 h-5 w-5" />
              Book a Free Consultation
            </Button>
          </Link>

          <Button onClick={onClose} variant="ghost" className="w-full">
            Maybe Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
