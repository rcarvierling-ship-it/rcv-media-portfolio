"use client";

import { useEffect, useRef } from "react";
import { logAnalyticsEvent } from "@/app/actions/analytics";

export function EngagementTracker({ 
  photoId, 
  albumId, 
  type 
}: { 
  photoId: string, 
  albumId?: string, 
  type: 'hover' | 'view' 
}) {
  const startTime = useRef<number>(0);
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (type === 'view') {
      startTime.current = Date.now();
      return () => {
        const duration = Date.now() - startTime.current;
        if (duration > 1000) { // Only log views longer than 1 second
          logAnalyticsEvent({
            event_type: 'engagement_duration',
            photo_id: photoId,
            album_id: albumId,
            metadata: { duration_ms: duration }
          });
        }
      };
    }
  }, [photoId, albumId, type]);

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (type === 'hover') {
      hoverTimeout.current = setTimeout(() => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        
        logAnalyticsEvent({
          event_type: 'photo_hover',
          photo_id: photoId,
          album_id: albumId,
          metadata: { x: Number(x.toFixed(3)), y: Number(y.toFixed(3)) }
        });
      }, 500); // Log hover if they stay for 500ms
    }
  };

  const handleMouseLeave = () => {
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current);
      hoverTimeout.current = null;
    }
  };

  return (
    <div 
      className="absolute inset-0 z-10" 
      onMouseEnter={handleMouseEnter} 
      onMouseLeave={handleMouseLeave} 
    />
  );
}
