"use client";

import { useState } from "react";
import ImageCarousel from "./ImageCarousel";
import { activityPackages, activities } from "@/data/siteData";

export default function Activities() {
  const [expandedImage, setExpandedImage] = useState<{
    images: string[];
    currentIndex: number;
  } | null>(null);

  const handleImageClick = (images: string[], index: number) => {
    setExpandedImage({ images, currentIndex: index });
  };

  const goPrevious = () => {
    if (!expandedImage) return;
    setExpandedImage({
      ...expandedImage,
      currentIndex:
        expandedImage.currentIndex === 0
          ? expandedImage.images.length - 1
          : expandedImage.currentIndex - 1,
    });
  };

  const goNext = () => {
    if (!expandedImage) return;
    setExpandedImage({
      ...expandedImage,
      currentIndex:
        expandedImage.currentIndex === expandedImage.images.length - 1
          ? 0
          : expandedImage.currentIndex + 1,
    });
  };

  return (
    <section
      id="activities"
      className="py-24 bg-gray-900 text-white relative overflow-visible"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="w-12 h-px bg-amber-500" />
            <span className="text-amber-500 uppercase tracking-[0.3em] text-sm font-medium">
              Adventures Await
            </span>
            <span className="w-12 h-px bg-amber-500" />
          </div>
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">
            Activities & Packages
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Explore the beautiful waters of Calayo with our curated activity
            packages. From snorkeling to cliff jumping, create unforgettable
            memories.
          </p>
        </div>

        {/* Packages */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {activityPackages.map((pkg) => (
            <div
              key={pkg.id}
              className="relative bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 hover:border-amber-500/50 transition-all duration-500 flex flex-col h-full"
            >
              {/* Carousel */}
              <div
                className="relative cursor-pointer"
                onClick={() => handleImageClick(pkg.images, 0)}
              >
                <ImageCarousel
                  images={pkg.images}
                  alt={pkg.name}
                  aspectRatio="video"
                />
                <div className="absolute top-4 left-4 bg-amber-500 text-white px-4 py-2 rounded-full font-bold text-sm uppercase tracking-wider pointer-events-none">
                  {pkg.name}
                </div>
                <div className="absolute top-4 right-4 bg-white text-gray-900 px-4 py-2 rounded-full font-bold pointer-events-none">
                  {pkg.price > 0 ? `₱${pkg.price.toLocaleString()}` : "Inquire"}
                </div>
              </div>

              {/* Content */}
              <div className="p-8 flex flex-col flex-grow">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-amber-500">
                    {pkg.price > 0
                      ? `₱${pkg.price.toLocaleString()}`
                      : "Inquire"}
                  </span>
                  <span className="text-gray-400 text-sm">{pkg.pax}</span>
                </div>

                <div className="mb-6 flex-grow">
                  <h4 className="text-sm uppercase tracking-wider text-amber-500 mb-3">
                    Included Activities
                  </h4>
                  <ul className="grid grid-cols-2 gap-3">
                    {pkg.activities.map((activity, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <svg
                          className="w-5 h-5 text-amber-500 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="text-gray-300">{activity}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <a
                  href="#contact"
                  className="inline-flex items-center justify-center w-full gap-2 px-6 py-4 bg-amber-500 text-white font-medium uppercase tracking-wider text-sm hover:bg-amber-600 transition-all duration-300 rounded mt-auto"
                >
                  Book This Package
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Individual Activities */}
        <div className="mt-16">
          <h3 className="text-2xl font-serif font-bold text-center mb-8">
            Individual Activities
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="relative bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 hover:border-amber-500/50 transition-all duration-500 cursor-pointer"
                onClick={() => handleImageClick(activity.images, 0)}
              >
                <ImageCarousel
                  images={activity.images}
                  alt={activity.name}
                  aspectRatio="video"
                />
                <div className="absolute top-4 right-4 bg-amber-500 text-white px-4 py-2 rounded-full font-bold pointer-events-none">
                  {activity.price > 0
                    ? `₱${activity.price.toLocaleString()}`
                    : "Inquire"}
                </div>
                <div className="p-6">
                  <h4 className="text-xl font-serif font-bold mb-2">
                    {activity.name}
                  </h4>
                  <p className="text-gray-400 text-sm mb-4">
                    <span className="text-amber-500">Duration:</span>{" "}
                    {activity.duration}
                  </p>
                  <a
                    href="#contact"
                    className="inline-flex items-center gap-2 text-amber-500 font-medium hover:text-amber-400 transition-colors"
                  >
                    Book Now
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fullscreen Lightbox */}
      {expandedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4"
          onClick={() => setExpandedImage(null)}
        >
          {/* Close Button */}
          <button
            className="absolute top-6 right-6 text-white hover:text-amber-500 z-50 p-2"
            onClick={() => setExpandedImage(null)}
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Previous */}
          {expandedImage.images.length > 1 && (
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-amber-500 z-50 p-2"
              onClick={(e) => {
                e.stopPropagation();
                goPrevious();
              }}
            >
              <svg
                className="w-12 h-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}

          {/* Next */}
          {expandedImage.images.length > 1 && (
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-amber-500 z-50 p-2"
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
            >
              <svg
                className="w-12 h-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}

          {/* Main Image */}
          <div
            className="relative w-full max-w-5xl h-[85vh] mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <ImageCarousel
              images={[expandedImage.images[expandedImage.currentIndex]]}
              alt={`Expanded image`}
              aspectRatio="video"
              className="!cursor-auto"
            />
          </div>

          {/* Counter */}
          {expandedImage.images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white text-sm">
              {expandedImage.currentIndex + 1} / {expandedImage.images.length}
            </div>
          )}

          {/* Thumbnail Strip */}
          {expandedImage.images.length > 1 && (
            <div className="absolute bottom-14 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto py-2 px-4">
              {expandedImage.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedImage({ ...expandedImage, currentIndex: idx });
                  }}
                  className={`relative w-16 h-16 flex-shrink-0 rounded overflow-hidden transition-all duration-300 ${
                    idx === expandedImage.currentIndex
                      ? "ring-2 ring-amber-500 opacity-100"
                      : "opacity-50 hover:opacity-80"
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    className="object-cover w-full h-full"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
