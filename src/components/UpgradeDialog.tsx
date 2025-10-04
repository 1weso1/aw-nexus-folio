import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle2, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

interface UpgradeDialogProps {
  open: boolean;
  onClose: () => void;
  workflowName: string;
  requiredTier: 'gold' | 'platinum';
  currentTier: 'free' | 'gold' | 'platinum';
  workflowComplexity: string;
}

export function UpgradeDialog({ 
  open, 
  onClose, 
  workflowName, 
  requiredTier, 
  currentTier,
  workflowComplexity 
}: UpgradeDialogProps) {
  const getTierIcon = (tier: string) => {
    if (tier === 'free') return '🌱';
    if (tier === 'gold') return '👑';
    return '💎';
  };

  const getTierColor = (tier: string) => {
    if (tier === 'free') return 'text-green-500';
    if (tier === 'gold') return 'text-yellow-500';
    return 'text-purple-500';
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] glass border-neon-primary/20">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-neon-primary/10 flex items-center justify-center">
              <Lock className="w-8 h-8 text-neon-primary" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold text-center text-text-primary">
            {getTierIcon(requiredTier)} {requiredTier === 'gold' ? 'Gold' : 'Platinum'} Tier Required
          </DialogTitle>
          <DialogDescription className="text-center text-text-secondary">
            "{workflowName}" is an {workflowComplexity} level workflow
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current Workflow Info */}
          <div className="bg-surface-secondary/30 rounded-lg p-4 border border-neon-primary/10">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Workflow Complexity:</span>
              <Badge variant="outline" className="ml-2">
                {workflowComplexity}
              </Badge>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-text-secondary">Requires:</span>
              <span className={`font-semibold ${getTierColor(requiredTier)}`}>
                {getTierIcon(requiredTier)} {requiredTier === 'gold' ? 'Gold' : 'Platinum'} Tier
              </span>
            </div>
          </div>

          {/* Tier Comparison */}
          <div className="space-y-3">
            <h3 className="font-semibold text-text-primary text-center mb-4">Tier Comparison</h3>
            
            {/* Free Tier */}
            <div className={`p-4 rounded-lg border ${currentTier === 'free' ? 'border-green-500/50 bg-green-500/5' : 'border-surface-secondary/50 bg-surface-secondary/20'}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🌱</span>
                <span className="font-semibold text-text-primary">Free Tier</span>
                {currentTier === 'free' && <Badge variant="outline" className="ml-auto">Current</Badge>}
              </div>
              <ul className="space-y-1 text-sm">
                <li className="flex items-start gap-2 text-text-secondary">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  10 downloads per month
                </li>
                <li className="flex items-start gap-2 text-text-secondary">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  Starter, Basic, Intermediate & Advanced workflows
                </li>
                <li className="flex items-start gap-2 text-text-secondary opacity-50">
                  <span className="w-4 h-4 flex-shrink-0 mt-0.5">✗</span>
                  Expert & Enterprise workflows
                </li>
              </ul>
            </div>

            {/* Gold Tier */}
            <div className={`p-4 rounded-lg border ${currentTier === 'gold' ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-surface-secondary/50 bg-surface-secondary/20'}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">👑</span>
                <span className="font-semibold text-text-primary">Gold Tier</span>
                {currentTier === 'gold' && <Badge variant="outline" className="ml-auto">Current</Badge>}
                {requiredTier === 'gold' && currentTier === 'free' && (
                  <Badge className="ml-auto bg-neon-primary/20 text-neon-primary border-neon-primary/30">
                    Upgrade to Access
                  </Badge>
                )}
              </div>
              <ul className="space-y-1 text-sm">
                <li className="flex items-start gap-2 text-text-secondary">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  100 downloads per month
                </li>
                <li className="flex items-start gap-2 text-text-secondary">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  All Free Tier workflows
                </li>
                <li className="flex items-start gap-2 text-text-secondary">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  Expert workflows (51-70 nodes)
                </li>
                <li className="flex items-start gap-2 text-text-secondary opacity-50">
                  <span className="w-4 h-4 flex-shrink-0 mt-0.5">✗</span>
                  Enterprise workflows
                </li>
              </ul>
            </div>

            {/* Platinum Tier */}
            <div className={`p-4 rounded-lg border ${currentTier === 'platinum' ? 'border-purple-500/50 bg-purple-500/5' : 'border-surface-secondary/50 bg-surface-secondary/20'}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">💎</span>
                <span className="font-semibold text-text-primary">Platinum Tier</span>
                {currentTier === 'platinum' && <Badge variant="outline" className="ml-auto">Current</Badge>}
                {requiredTier === 'platinum' && (
                  <Badge className="ml-auto bg-neon-primary/20 text-neon-primary border-neon-primary/30">
                    Upgrade to Access
                  </Badge>
                )}
              </div>
              <ul className="space-y-1 text-sm">
                <li className="flex items-start gap-2 text-text-secondary">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  Unlimited downloads
                </li>
                <li className="flex items-start gap-2 text-text-secondary">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  Access to ALL workflow levels
                </li>
                <li className="flex items-start gap-2 text-text-secondary">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  Enterprise workflows (71+ nodes)
                </li>
                <li className="flex items-start gap-2 text-text-secondary">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  Priority support
                </li>
              </ul>
            </div>
          </div>

          {/* CTA */}
          <div className="space-y-3">
            <Link to="/book" className="block">
              <Button variant="neon" className="w-full" size="lg">
                <Calendar className="mr-2 h-5 w-5" />
                Book a Free Consultation to Upgrade
              </Button>
            </Link>

            <Button onClick={onClose} variant="ghost" className="w-full">
              Browse Available Workflows
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
