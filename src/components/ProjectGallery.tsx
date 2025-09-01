import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import InstagramEmbed from './InstagramEmbed';
import { Button } from './ui/button';

interface GalleryItem {
  type: 'image' | 'instagram';
  src: string;
  alt?: string;
  caption?: string;
}

interface ProjectGalleryProps {
  items: GalleryItem[];
  className?: string;
}

export default function ProjectGallery({ items, className = '' }: ProjectGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (!items || items.length === 0) return null;

  // Show single hero image if less than 5 items
  if (items.length < 5) {
    const heroItem = items[0];
    return (
      <div className={`space-y-6 ${className}`}>
        <h2 className="section-heading">Gallery</h2>
        {heroItem.type === 'instagram' ? (
          <InstagramEmbed url={heroItem.src} className="max-w-md mx-auto" />
        ) : (
          <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden">
            <img
              src={heroItem.src}
              alt={heroItem.alt || 'Gallery image'}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-card/80 to-transparent" />
            {heroItem.caption && (
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-text-primary font-medium">{heroItem.caption}</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Show masonry gallery for 5+ items
  const openLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const nextImage = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % items.length);
    }
  };

  const prevImage = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex(lightboxIndex === 0 ? items.length - 1 : lightboxIndex - 1);
    }
  };

  return (
    <>
      <div className={`space-y-6 ${className}`}>
        <h2 className="section-heading">Gallery</h2>
        
        {/* Masonry Grid */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {items.map((item, index) => (
            <div key={index} className="break-inside-avoid mb-6">
              {item.type === 'instagram' ? (
                <InstagramEmbed url={item.src} />
              ) : (
                <div
                  className="relative group cursor-pointer rounded-2xl overflow-hidden bg-surface-card"
                  onClick={() => openLightbox(index)}
                >
                  <img
                    src={item.src}
                    alt={item.alt || `Gallery image ${index + 1}`}
                    className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-surface/90 backdrop-blur-sm rounded-full p-3">
                      <ExternalLink className="h-5 w-5 text-text-primary" />
                    </div>
                  </div>
                  {item.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                      <p className="text-white text-sm">{item.caption}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm">
          <div className="absolute inset-0 flex items-center justify-center p-4">
            {/* Close button */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 z-10 bg-surface/20 backdrop-blur-sm"
              onClick={closeLightbox}
            >
              <X className="h-6 w-6" />
            </Button>

            {/* Navigation buttons */}
            {items.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute left-4 z-10 bg-surface/20 backdrop-blur-sm"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-4 z-10 bg-surface/20 backdrop-blur-sm"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}

            {/* Image container */}
            <div className="max-w-4xl max-h-full w-full h-full flex items-center justify-center">
              {items[lightboxIndex].type === 'instagram' ? (
                <div className="max-w-md w-full">
                  <InstagramEmbed url={items[lightboxIndex].src} />
                </div>
              ) : (
                <img
                  src={items[lightboxIndex].src}
                  alt={items[lightboxIndex].alt || `Gallery image ${lightboxIndex + 1}`}
                  className="max-w-full max-h-full object-contain rounded-lg"
                />
              )}
            </div>

            {/* Image counter */}
            {items.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-surface/20 backdrop-blur-sm rounded-full px-4 py-2">
                <span className="text-white text-sm">
                  {lightboxIndex + 1} / {items.length}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}