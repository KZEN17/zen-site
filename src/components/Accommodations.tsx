"use client";

import Link from "next/link";
import ImageCarousel from "./ImageCarousel";
import { rooms } from "@/data/siteData";

export default function Accommodations() {
  return (
    <section id="accommodations" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="w-12 h-px bg-amber-500" />
            <span className="text-amber-500 uppercase tracking-[0.3em] text-sm font-medium">
              Stay With Us
            </span>
            <span className="w-12 h-px bg-amber-500" />
          </div>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">
            Our Accommodations
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Choose from our comfortable rooms, perfect for couples, families, or
            groups. Each room offers a peaceful retreat with beach access.
          </p>
        </div>

        {/* Rooms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="relative bg-gray-50 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500"
            >
              {/* Image Carousel */}
              <div className="relative">
                <ImageCarousel
                  images={room.images}
                  alt={room.name}
                  aspectRatio="video"
                />
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-2xl font-serif font-bold text-gray-900">
                    {room.name}
                  </h3>
                  <span className="flex items-center gap-2 text-gray-600">
                    <svg
                      className="w-5 h-5 text-amber-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    {room.capacity}
                  </span>
                </div>

                <ul className="space-y-2 mb-4">
                  {room.features.map((feature, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-2 text-gray-600"
                    >
                      <svg
                        className="w-4 h-4 text-amber-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="flex items-center justify-between gap-4">
                  <Link
                    href={`/claim-discount?room=${encodeURIComponent(room.name)}`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white font-medium rounded hover:bg-amber-600 transition-colors"
                  >
                    Book Now
                  </Link>
                  <Link
                    href={`/rooms/${room.id}`}
                    className="inline-flex items-center gap-2 text-amber-500 font-medium hover:text-amber-600 transition-colors group/link"
                  >
                    More Details
                    <svg
                      className="w-4 h-4 group-hover/link:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center p-8 bg-amber-50 rounded-2xl">
          <h3 className="text-2xl font-serif font-bold text-gray-900 mb-4">
            Need More Information?
          </h3>
          <p className="text-gray-600 mb-6">
            Contact us for availability, special rates for longer stays, or
            custom arrangements.
          </p>
          <a
            href="#contact"
            className="inline-block px-8 py-4 bg-amber-500 text-white font-medium uppercase tracking-wider text-sm hover:bg-amber-600 transition-all duration-300 rounded"
          >
            Get in Touch
          </a>
        </div>
      </div>
    </section>
  );
}
