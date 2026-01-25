"use client";

import ImageCarousel from "./ImageCarousel";
import { activityPackages, activities } from "@/data/siteData";

export default function Activities() {
  return (
    <section
      id="activities"
      className="py-24 bg-gray-900 text-white relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
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

        {/* Packages Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {activityPackages.map((pkg) => (
            <div
              key={pkg.id}
              className="relative bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700 hover:border-amber-500/50 transition-all duration-500 flex flex-col h-full"
            >
              {/* Image Carousel */}
              <div className="relative cursor-pointer">
                <ImageCarousel
                  images={pkg.images}
                  alt={pkg.name}
                  aspectRatio="video"
                />
                {/* Package Name Badge */}
                <div className="absolute top-4 left-4 bg-amber-500 text-white px-4 py-2 rounded-full font-bold text-sm uppercase tracking-wider z-20 pointer-events-none">
                  {pkg.name}
                </div>
                {/* Price Badge */}
                <div className="absolute top-4 right-4 bg-white text-gray-900 px-4 py-2 rounded-full font-bold z-20 pointer-events-none">
                  {pkg.price > 0 ? `₱${pkg.price.toLocaleString()}` : "Inquire"}
                </div>
              </div>

              {/* Content */}
              <div className="p-8 flex flex-col flex-grow">
                {/* Price & Pax Info */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-amber-500">
                    {pkg.price > 0
                      ? `₱${pkg.price.toLocaleString()}`
                      : "Inquire"}
                  </span>
                  <span className="text-gray-400 text-sm">{pkg.pax}</span>
                </div>

                {/* Activities List */}
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

                {/* CTA */}
                <a
                  href="#contact"
                  className="inline-flex items-center justify-center w-full gap-2 px-6 py-4 bg-amber-500 text-white font-medium uppercase tracking-wider text-sm hover:bg-amber-600 transition-all duration-300 rounded group/btn mt-auto"
                >
                  Book This Package
                  <svg
                    className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform"
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
                className="relative bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700 hover:border-amber-500/50 transition-all duration-500"
              >
                {/* Image Carousel */}
                <div className="relative cursor-pointer">
                  <ImageCarousel
                    images={activity.images}
                    alt={activity.name}
                    aspectRatio="video"
                  />
                  {/* Price Badge */}
                  <div className="absolute top-4 right-4 bg-amber-500 text-white px-4 py-2 rounded-full font-bold z-20 pointer-events-none">
                    {activity.price > 0
                      ? `₱${activity.price.toLocaleString()}`
                      : "Inquire"}
                  </div>
                </div>

                {/* Content */}
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
                    className="inline-flex items-center gap-2 text-amber-500 font-medium hover:text-amber-400 transition-colors group/link"
                  >
                    Book Now
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
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
