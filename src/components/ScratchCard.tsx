"use client";

import { useRef, useState, useEffect, useCallback } from "react";

interface ScratchCardProps {
  discountCode: string;
  discountPercentage: number;
  onReveal: () => void;
}

export default function ScratchCard({
  discountCode,
  discountPercentage,
  onReveal,
}: ScratchCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [scratchPercentage, setScratchPercentage] = useState(0);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Create gradient background for scratch layer
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#f59e0b");
    gradient.addColorStop(0.5, "#d97706");
    gradient.addColorStop(1, "#b45309");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add scratch pattern/texture
    ctx.fillStyle = "rgba(255,255,255,0.1)";
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const size = Math.random() * 30 + 10;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Add text
    ctx.fillStyle = "white";
    ctx.font = "bold 24px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("SCRATCH HERE!", canvas.width / 2, canvas.height / 2 - 15);

    ctx.font = "16px Arial";
    ctx.fillText("to reveal your discount", canvas.width / 2, canvas.height / 2 + 15);
  }, []);

  useEffect(() => {
    initCanvas();
  }, [initCanvas]);

  const calculateScratchPercentage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return 0;

    const ctx = canvas.getContext("2d");
    if (!ctx) return 0;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparentPixels = 0;

    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) {
        transparentPixels++;
      }
    }

    return (transparentPixels / (pixels.length / 4)) * 100;
  }, []);

  const scratch = useCallback((x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas || isRevealed) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 30, 0, Math.PI * 2);
    ctx.fill();

    const percentage = calculateScratchPercentage();
    setScratchPercentage(percentage);

    if (percentage > 50 && !isRevealed) {
      setIsRevealed(true);
      onReveal();
      // Clear the rest of the canvas with animation
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, [isRevealed, onReveal, calculateScratchPercentage]);

  const getPosition = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();

    if ("touches" in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }

    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsScratching(true);
    const pos = getPosition(e);
    scratch(pos.x, pos.y);
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isScratching) return;
    e.preventDefault();
    const pos = getPosition(e);
    scratch(pos.x, pos.y);
  };

  const handleEnd = () => {
    setIsScratching(false);
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Revealed content underneath */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex flex-col items-center justify-center p-8 text-white">
        <div className="text-6xl mb-4">🎉</div>
        <p className="text-lg font-medium mb-2">Congratulations!</p>
        <p className="text-4xl font-bold mb-2">{discountPercentage}% OFF</p>
        <p className="text-sm opacity-90 mb-4">Your exclusive discount code:</p>
        <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-lg border-2 border-dashed border-white/50">
          <span className="text-2xl font-mono font-bold tracking-wider">
            {discountCode}
          </span>
        </div>
      </div>

      {/* Scratch canvas overlay */}
      <canvas
        ref={canvasRef}
        className={`relative w-full h-64 rounded-2xl cursor-pointer touch-none ${
          isRevealed ? "opacity-0 pointer-events-none" : ""
        } transition-opacity duration-500`}
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
      />

      {/* Progress indicator */}
      {!isRevealed && scratchPercentage > 0 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
          {Math.round(scratchPercentage)}% scratched
        </div>
      )}
    </div>
  );
}
