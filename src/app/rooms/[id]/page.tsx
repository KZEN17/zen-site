import Link from "next/link";
import { rooms, siteConfig } from "@/data/siteData";
import ImageCarousel from "@/components/ImageCarousel";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return rooms.map((room) => ({
    id: room.id,
  }));
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function RoomDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const room = rooms.find((r) => r.id === id);

  if (!room) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-900 text-white py-8 pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-serif font-bold">
            {room.name}
          </h1>
          <div className="flex items-center gap-2 mt-2 text-gray-300">
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
            <span>{room.capacity}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div>
            <div className="rounded-2xl overflow-hidden shadow-lg">
              <ImageCarousel
                images={room.images}
                alt={room.name}
                aspectRatio="video"
              />
            </div>
          </div>

          {/* Details */}
          <div>
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">
              Room Features
            </h2>
            <ul className="space-y-3 mb-8">
              {room.features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-3 text-gray-700">
                  <svg
                    className="w-5 h-5 text-amber-500 flex-shrink-0"
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

            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">
              Inclusions
            </h2>
            <ul className="space-y-3 mb-8">
              {room.inclusions.map((inclusion, idx) => (
                <li key={idx} className="flex items-center gap-3 text-gray-700">
                  <svg
                    className="w-5 h-5 text-amber-500 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {inclusion}
                </li>
              ))}
            </ul>

            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">
              Rates
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {room.rates.map((rate, idx) => (
                <div
                  key={idx}
                  className="bg-white border-2 border-amber-200 rounded-lg p-4"
                >
                  <p className="text-gray-600 text-sm mb-2">{rate.guests}</p>
                  <p className="text-2xl font-bold text-amber-600">
                    ₱{rate.price.toLocaleString()}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">per night</p>
                </div>
              ))}
            </div>

            {/* Contact CTA */}
            <div className="bg-amber-50 rounded-xl p-6">
              <h3 className="text-xl font-serif font-bold text-gray-900 mb-2">
                Interested in this room?
              </h3>
              <p className="text-gray-600 mb-4">
                Contact us for availability and rates.
              </p>
              <Link
                href={siteConfig.social.facebook}
                target="blank"
                className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white font-medium rounded hover:bg-amber-600 transition-colors"
              >
                Book Now
                <svg
                  className="w-4 h-4"
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
      </div>
    </div>
  );
}
