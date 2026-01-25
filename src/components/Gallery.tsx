"use client";

import PlaceholderImage from "./PlaceholderImage";
import { useState } from "react";
import { galleryImages } from "@/data/siteData";

export default function Gallery() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  return (
    <section id="gallery" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="w-12 h-px bg-amber-500" />
            <span className="text-amber-500 uppercase tracking-[0.3em] text-sm font-medium">
              Visual Journey
            </span>
            <span className="w-12 h-px bg-amber-500" />
          </div>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">
            Gallery
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Take a glimpse of the beauty that awaits you at ZEN House Calayo.
            Crystal clear waters, stunning sunsets, and unforgettable experiences.
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {galleryImages.map((image, index) => (
            <div
              key={image.id}
              className={`relative cursor-pointer group overflow-hidden rounded-xl ${
                index === 0 ? "md:col-span-2 md:row-span-2" : ""
              }`}
              onClick={() => setSelectedImage(index)}
            >
              <div className={`relative ${index === 0 ? "h-[400px] md:h-[500px]" : "h-[200px] md:h-[240px]"}`}>
                <PlaceholderImage
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                  placeholderText={image.alt}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />

                {/* Hover Icon */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* More Photos CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">Want to see more?</p>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 text-amber-500 font-medium hover:text-amber-600 transition-colors"
          >
            Follow us on social media for more updates
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          {/* Close Button */}
          <button
            className="absolute top-4 right-4 text-white hover:text-amber-500 transition-colors"
            onClick={() => setSelectedImage(null)}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Navigation Buttons */}
          <button
            className="absolute left-4 text-white hover:text-amber-500 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImage(selectedImage === 0 ? galleryImages.length - 1 : selectedImage - 1);
            }}
          >
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            className="absolute right-4 text-white hover:text-amber-500 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImage(selectedImage === galleryImages.length - 1 ? 0 : selectedImage + 1);
            }}
          >
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Image */}
          <div className="relative w-full max-w-4xl h-[80vh]" onClick={(e) => e.stopPropagation()}>
            <PlaceholderImage
              src={galleryImages[selectedImage].src}
              alt={galleryImages[selectedImage].alt}
              fill
              className="object-contain"
              placeholderText={galleryImages[selectedImage].alt}
            />
          </div>
        </div>
      )}
    </section>
  );
}
