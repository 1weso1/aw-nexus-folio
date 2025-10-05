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
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] glass border-neon-primary/20">
        <DialogHeader className="pb-2">
          <div className="flex justify-center mb-2">
            <div className="w-12 h-12 rounded-full bg-neon-primary/10 flex items-center justify-center">
              <Lock className="w-6 h-6 text-neon-primary" />
            </div>
          </div>
          <DialogTitle className="text-xl font-bold text-center text-text-primary">
            {getTierIcon(requiredTier)} {requiredTier === 'gold' ? 'Gold' : 'Platinum'} Tier Required
          </DialogTitle>
          <DialogDescription className="text-center text-text-secondary text-sm">
            "{workflowName}" is an {workflowComplexity} level workflow
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 overflow-y-auto max-h-[calc(85vh-180px)]">
          {/* Current Workflow Info */}
          <div className="bg-surface-secondary/30 rounded-lg p-3 border border-neon-primary/10">
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-secondary">Workflow Complexity:</span>
              <Badge variant="outline" className="ml-2 text-xs">
                {workflowComplexity}
              </Badge>
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-xs text-text-secondary">Requires:</span>
              <span className={`text-sm font-semibold ${getTierColor(requiredTier)}`}>
                {getTierIcon(requiredTier)} {requiredTier === 'gold' ? 'Gold' : 'Platinum'} Tier
              </span>
            </div>
          </div>

          {/* Tier Comparison */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-text-primary text-center mb-2">Tier Comparison</h3>
            
            {/* Free Tier */}
            <div className={`p-3 rounded-lg border ${currentTier === 'free' ? 'border-green-500/50 bg-green-500/5' : 'border-surface-secondary/50 bg-surface-secondary/20'}`}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-base">🌱</span>
                <span className="text-sm font-semibold text-text-primary">Free Tier</span>
                {currentTier === 'free' && <Badge variant="outline" className="ml-auto text-xs">Current</Badge>}
              </div>
              <ul className="space-y-0.5 text-xs">
                <li className="flex items-start gap-1.5 text-text-secondary">
                  <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" />
                  10 downloads/month
                </li>
                <li className="flex items-start gap-1.5 text-text-secondary">
                  <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" />
                  Starter-Advanced workflows
                </li>
                <li className="flex items-start gap-1.5 text-text-secondary opacity-50">
                  <span className="w-3 h-3 flex-shrink-0 mt-0.5 text-[10px]">✗</span>
                  Expert & Enterprise
                </li>
              </ul>
            </div>

            {/* Gold Tier */}
            <div className={`p-3 rounded-lg border ${currentTier === 'gold' ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-surface-secondary/50 bg-surface-secondary/20'}`}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-base">👑</span>
                <span className="text-sm font-semibold text-text-primary">Gold Tier</span>
                {currentTier === 'gold' && <Badge variant="outline" className="ml-auto text-xs">Current</Badge>}
                {requiredTier === 'gold' && currentTier === 'free' && (
                  <Badge className="ml-auto bg-neon-primary/20 text-neon-primary border-neon-primary/30 text-xs">
                    Upgrade
                  </Badge>
                )}
              </div>
              <ul className="space-y-0.5 text-xs">
                <li className="flex items-start gap-1.5 text-text-secondary">
                  <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" />
                  100 downloads/month
                </li>
                <li className="flex items-start gap-1.5 text-text-secondary">
                  <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" />
                  All Free Tier workflows
                </li>
                <li className="flex items-start gap-1.5 text-text-secondary">
                  <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" />
                  Expert workflows (51-70 nodes)
                </li>
                <li className="flex items-start gap-1.5 text-text-secondary opacity-50">
                  <span className="w-3 h-3 flex-shrink-0 mt-0.5 text-[10px]">✗</span>
                  Enterprise workflows
                </li>
              </ul>
            </div>

            {/* Platinum Tier */}
            <div className={`p-3 rounded-lg border ${currentTier === 'platinum' ? 'border-purple-500/50 bg-purple-500/5' : 'border-surface-secondary/50 bg-surface-secondary/20'}`}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-base">💎</span>
                <span className="text-sm font-semibold text-text-primary">Platinum Tier</span>
                {currentTier === 'platinum' && <Badge variant="outline" className="ml-auto text-xs">Current</Badge>}
                {requiredTier === 'platinum' && (
                  <Badge className="ml-auto bg-neon-primary/20 text-neon-primary border-neon-primary/30 text-xs">
                    Upgrade
                  </Badge>
                )}
              </div>
              <ul className="space-y-0.5 text-xs">
                <li className="flex items-start gap-1.5 text-text-secondary">
                  <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" />
                  Unlimited downloads
                </li>
                <li className="flex items-start gap-1.5 text-text-secondary">
                  <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" />
                  ALL workflow levels
                </li>
                <li className="flex items-start gap-1.5 text-text-secondary">
                  <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" />
                  Enterprise workflows (71+ nodes)
                </li>
                <li className="flex items-start gap-1.5 text-text-secondary">
                  <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" />
                  Priority support
                </li>
              </ul>
            </div>
          </div>

          {/* CTA */}
          <div className="space-y-2 pt-2">
            <Link to="/book" className="block">
              <Button variant="neon" className="w-full">
                <Calendar className="mr-2 h-4 w-4" />
                Book Free Consultation
              </Button>
            </Link>

            <Button onClick={onClose} variant="ghost" className="w-full text-sm">
              Browse Available Workflows
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
