"use client";

import { useEffect, useState, useRef } from "react";

export default function Hero() {
  const [isLoaded, setIsLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setIsLoaded(true);

    // iOS Safari needs explicit play() call
    const video = videoRef.current;
    if (video) {
      video.play().catch(() => {
        // Autoplay was prevented, ignore silently
      });
    }
  }, []);

  return (
    <section id="home" className="relative h-screen w-full overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
          poster="/images/hero-poster.jpg"
        >
          {/* Replace with your actual video file */}
          <source src="/videos/hero-video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
        <div
          className={`transition-all duration-1000 ${
            isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          {/* Decorative element */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <span className="w-12 h-px bg-amber-500" />
            <span className="text-amber-500 uppercase tracking-[0.3em] text-sm font-medium">
              Welcome to Paradise
            </span>
            <span className="w-12 h-px bg-amber-500" />
          </div>

          {/* Main Title */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-white mb-4 tracking-wide">
            ZEN House
          </h1>

          {/* Subtitle */}
          <p className="text-2xl md:text-3xl text-amber-500 font-script mb-6">
            Calayo
          </p>

          <p className="text-xl md:text-2xl text-white/90 font-light tracking-wide mb-8">
            Beach Accommodation
          </p>

          {/* Description */}
          <p className="max-w-2xl mx-auto text-white/80 text-lg mb-12 leading-relaxed">
            Escape to tranquility at our beach paradise in Nasugbu, Batangas.
            Experience the beauty of Calayo&apos;s pristine waters and stunning
            sunsets.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#accommodations"
              className="px-8 py-4 bg-amber-500 text-white font-medium uppercase tracking-wider text-sm hover:bg-amber-600 transition-all duration-300 rounded"
            >
              View Rooms
            </a>
            <a
              href="#activities"
              className="px-8 py-4 border-2 border-white text-white font-medium uppercase tracking-wider text-sm hover:bg-white hover:text-gray-900 transition-all duration-300 rounded"
            >
              Explore Activities
            </a>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <a
            href="#accommodations"
            className="text-white/70 hover:text-white transition-colors"
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
