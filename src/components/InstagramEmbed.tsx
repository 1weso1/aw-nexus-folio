import React, { useEffect, useRef, useState } from 'react';
import { ExternalLink } from 'lucide-react';

interface InstagramEmbedProps {
  url: string;
  className?: string;
}

declare global {
  interface Window {
    instgrm?: {
      Embeds: {
        process: () => void;
      };
    };
  }
}

export default function InstagramEmbed({ url, className = '' }: InstagramEmbedProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const embedRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Extract Instagram handle from URL
  const getInstagramHandle = (url: string) => {
    const match = url.match(/instagram\.com\/([^\/]+)/);
    return match ? `@${match[1]}` : '@instagram';
  };

  // Load Instagram embed script
  const loadInstagramScript = () => {
    if (isScriptLoaded || document.querySelector('script[src="//www.instagram.com/embed.js"]')) {
      setIsScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = '//www.instagram.com/embed.js';
    script.async = true;
    script.onload = () => {
      setIsScriptLoaded(true);
      if (window.instgrm) {
        window.instgrm.Embeds.process();
      }
    };
    document.head.appendChild(script);
  };

  // Process embed when script is ready
  const processEmbed = () => {
    if (window.instgrm && window.instgrm.Embeds) {
      window.instgrm.Embeds.process();
      setIsLoaded(true);
    }
  };

  // Setup intersection observer for lazy loading
  useEffect(() => {
    if (!embedRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadInstagramScript();
            if (observerRef.current) {
              observerRef.current.disconnect();
            }
          }
        });
      },
      { rootMargin: '100px' }
    );

    observerRef.current.observe(embedRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Process embed when script loads
  useEffect(() => {
    if (isScriptLoaded) {
      const timer = setTimeout(processEmbed, 100);
      return () => clearTimeout(timer);
    }
  }, [isScriptLoaded]);

  const embedUrl = `${url}embed/`;
  const handle = getInstagramHandle(url);

  if (hasError) {
    return (
      <div className={`bg-surface-card border border-border rounded-2xl p-6 text-center ${className}`}>
        <div className="space-y-3">
          <p className="text-text-secondary">Unable to load Instagram media</p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-neon-primary hover:text-neon-accent transition-colors"
          >
            View on Instagram
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div ref={embedRef} className={`bg-surface-card rounded-2xl overflow-hidden shadow-lg ${className}`}>
      {/* Embed container with dark theme wrapper */}
      <div className="relative">
        <blockquote
          className="instagram-media"
          data-instgrm-permalink={url}
          data-instgrm-version="14"
          style={{
            background: 'transparent',
            border: 0,
            borderRadius: '3px',
            margin: 0,
            padding: 0,
            width: '100%'
          }}
        >
          {/* Fallback content while loading */}
          <div className="bg-surface p-6 min-h-[400px] flex items-center justify-center">
            <div className="animate-pulse space-y-3 text-center">
              <div className="w-12 h-12 bg-surface-card rounded-full mx-auto"></div>
              <div className="h-4 bg-surface-card rounded w-32 mx-auto"></div>
              <div className="h-3 bg-surface-card rounded w-24 mx-auto"></div>
            </div>
          </div>
        </blockquote>

        {/* Error handler */}
        <iframe
          style={{ display: 'none' }}
          onError={() => setHasError(true)}
          src={embedUrl}
        />
      </div>

      {/* Caption and link */}
      <div className="p-4 bg-surface-card/50 border-t border-border/20">
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary">{handle}</span>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-neon-primary hover:text-neon-accent transition-colors"
          >
            Open on Instagram
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* NoScript fallback */}
      <noscript>
        <div className="p-6 text-center">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-neon-primary hover:text-neon-accent"
          >
            View this post on Instagram
          </a>
        </div>
      </noscript>
    </div>
  );
}