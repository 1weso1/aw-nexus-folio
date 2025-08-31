import { useState } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('subscribers')
        .insert([{ email }])
        .single();

      if (error && error.code === '23505') {
        // Email already exists
        toast({
          title: "Already subscribed!",
          description: "You're already on our newsletter list.",
        });
      } else if (error) {
        throw error;
      } else {
        toast({
          title: "You're subscribed. Welcome!",
          description: "Thanks for subscribing to our newsletter.",
        });
      }

      setEmail("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to subscribe. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
        className="flex-1 px-3 py-2 text-sm glass rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:border-neon-primary/50"
      />
      <Button 
        type="submit" 
        variant="neon" 
        size="sm"
        disabled={isSubmitting}
      >
        <Mail className="h-4 w-4" />
        {isSubmitting ? "..." : "Subscribe"}
      </Button>
    </form>
  );
}