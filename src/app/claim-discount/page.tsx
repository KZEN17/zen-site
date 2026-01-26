"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { siteConfig } from "@/data/siteData";
import ScratchCard from "@/components/ScratchCard";

export default function ClaimDiscountPage() {
  const [discountCode, setDiscountCode] = useState("");
  const [isRevealed, setIsRevealed] = useState(false);
  const [roomName, setRoomName] = useState<string | null>(null);

  useEffect(() => {
    // Get a random discount code
    const codes = siteConfig.discountCodes;
    const randomCode = codes[Math.floor(Math.random() * codes.length)];
    setDiscountCode(randomCode);

    // Get room name from URL params if provided
    const params = new URLSearchParams(window.location.search);
    const room = params.get("room");
    if (room) {
      setRoomName(room);
    }
  }, []);

  const handleReveal = () => {
    setIsRevealed(true);
  };

  const handleBookNow = () => {
    // Create the message with discount code
    const message = encodeURIComponent(
      `Hi! I'd like to book${roomName ? ` ${roomName}` : ""} at ZEN House Calayo.\n\nI have a 10% discount code from your website: ${discountCode}`
    );

    // Open Messenger with the pre-filled message
    window.open(
      `https://m.me/100075945187126?text=${message}`,
      "_blank"
    );
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(discountCode);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Back to home */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 mb-8 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to ZEN House
        </Link>

        {/* Main card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-6 text-center text-white">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="w-8 h-px bg-white/50" />
              <span className="text-sm uppercase tracking-wider opacity-90">
                Exclusive Offer
              </span>
              <span className="w-8 h-px bg-white/50" />
            </div>
            <h1 className="text-3xl font-serif font-bold">
              Claim Your Discount!
            </h1>
            <p className="text-white/90 mt-2">
              Book through our website and save {siteConfig.discountPercentage}%
            </p>
          </div>

          {/* Content */}
          <div className="p-6">
            {roomName && (
              <div className="text-center mb-6 pb-6 border-b border-gray-200">
                <p className="text-gray-600">You&apos;re booking:</p>
                <p className="text-xl font-serif font-bold text-gray-900">
                  {roomName}
                </p>
              </div>
            )}

            {/* Scratch card */}
            <div className="mb-6">
              <ScratchCard
                discountCode={discountCode}
                discountPercentage={siteConfig.discountPercentage}
                onReveal={handleReveal}
              />
            </div>

            {/* Instructions or action buttons */}
            {!isRevealed ? (
              <p className="text-center text-gray-500 text-sm">
                Use your finger or mouse to scratch and reveal your discount
                code!
              </p>
            ) : (
              <div className="space-y-4">
                {/* Copy code button */}
                <button
                  onClick={handleCopyCode}
                  className="w-full py-3 px-4 border-2 border-gray-200 rounded-xl text-gray-700 font-medium hover:border-amber-500 hover:text-amber-600 transition-colors flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  Copy Discount Code
                </button>

                {/* Book now button */}
                <button
                  onClick={handleBookNow}
                  className="w-full py-4 px-6 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-3 text-lg"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 1.78.46 3.45 1.27 4.9L2 22l5.18-1.36c1.4.74 2.98 1.16 4.67 1.16h.01c5.5 0 9.99-4.49 9.99-10.02S17.5 2.04 12 2.04zm5.85 13.97c-.25.71-1.48 1.32-2.04 1.4-.51.08-1.15.11-1.86-.12-.43-.14-.98-.33-1.69-.65-2.98-1.29-4.92-4.32-5.07-4.52-.15-.21-1.22-1.63-1.22-3.11 0-1.48.77-2.21 1.04-2.51.27-.3.59-.37.79-.37.2 0 .4 0 .57.01.18.01.43-.07.67.51.25.59.84 2.06.91 2.21.08.15.13.33.03.53-.1.2-.15.32-.3.5-.15.17-.31.38-.44.51-.15.15-.3.31-.13.61.18.3.79 1.31 1.7 2.12 1.17 1.04 2.15 1.37 2.46 1.52.3.15.48.13.66-.08.18-.21.76-.89.97-1.19.2-.3.4-.25.68-.15.27.1 1.74.82 2.04.97.3.15.5.22.57.35.08.12.08.71-.17 1.42z" />
                  </svg>
                  Book Now on Messenger
                </button>

                <p className="text-center text-gray-500 text-sm">
                  Your discount code will be automatically included in the
                  message
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 p-4 text-center">
            <p className="text-xs text-gray-500">
              Mention your code when booking to receive your {siteConfig.discountPercentage}% discount
            </p>
          </div>
        </div>

        {/* Terms */}
        <p className="text-center text-gray-500 text-xs mt-6">
          *Discount valid for direct bookings only. Cannot be combined with
          other offers.
        </p>
      </div>
    </div>
  );
}
