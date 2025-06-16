"use client";

import { useEffect, useRef, useState } from "react";

export const LazyLoad = ({ src }: { src: string }) => {
  const [isVisible, setIsVisible] = useState(false);
  const videoRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (videoRef.current) observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={videoRef}>
      {isVisible ? (
        <video
          src={src}
          controls
          preload="metadata"
          className="w-full rounded-lg border shadow-sm bg-black"
          poster=""
        >
            Your browser does not support the video tag.
        </video>
      ) : (
        <div style={{ height: 180, background: "#222" }} />
      )}
    </div>
  );
};
