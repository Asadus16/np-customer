'use client';

import { useState, useCallback, useRef } from 'react';
import { Heart } from 'lucide-react';

interface Particle {
  id: number;
  angle: number;
  distance: number;
  size: number;
  delay: number;
}

interface FavoriteButtonProps {
  isFavorite: boolean;
  isLoading?: boolean;
  onToggle: () => Promise<boolean>;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onError?: (message: string) => void;
}

export function FavoriteButton({
  isFavorite,
  isLoading = false,
  onToggle,
  size = 'md',
  className = '',
  onError,
}: FavoriteButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showBurst, setShowBurst] = useState(false);
  const [showError, setShowError] = useState(false);
  const particleIdRef = useRef(0);

  const sizeClasses = {
    sm: 'h-10 w-10',
    md: 'h-12 w-12',
    lg: 'h-14 w-14',
  };

  const iconSizes = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-7 w-7',
  };

  const createParticles = useCallback(() => {
    const newParticles: Particle[] = [];
    const particleCount = 8;

    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: particleIdRef.current++,
        angle: (360 / particleCount) * i,
        distance: 20 + Math.random() * 15,
        size: 4 + Math.random() * 4,
        delay: Math.random() * 50,
      });
    }

    setParticles(newParticles);
    setShowBurst(true);
    setIsAnimating(true);

    // Clear particles after animation
    setTimeout(() => {
      setShowBurst(false);
    }, 300);

    setTimeout(() => {
      setParticles([]);
      setIsAnimating(false);
    }, 600);
  }, []);

  const handleClick = async () => {
    if (isLoading || isAnimating) return;

    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 150);

    const wasFavorite = isFavorite;

    try {
      const success = await onToggle();

      // Only show particles when adding to favorites
      if (success && !wasFavorite) {
        createParticles();
      } else if (!success) {
        // Show shake animation on failure
        setShowError(true);
        setTimeout(() => setShowError(false), 500);
        onError?.('Please login to add favorites');
      }
    } catch {
      setShowError(true);
      setTimeout(() => setShowError(false), 500);
      onError?.('Failed to update favorite');
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`
        relative flex items-center justify-center
        border rounded-full
        hover:bg-gray-50
        active:scale-90
        ${sizeClasses[size]}
        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${showError ? 'border-red-400 animate-shake' : 'border-[#d1d1d1]'}
        ${className}
      `}
      style={{
        transform: isPressed ? 'scale(0.85)' : 'scale(1)',
        transition: 'transform 150ms cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Heart Icon */}
      <Heart
        className={`
          ${iconSizes[size]}
          transition-all duration-200
          ${isFavorite ? 'fill-red-500 text-red-500' : 'fill-transparent text-gray-700'}
        `}
        style={{
          transform: isAnimating ? 'scale(1.3)' : isFavorite ? 'scale(1.1)' : 'scale(1)',
          transition: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />

      {/* Particle burst */}
      {particles.map((particle) => {
        const rad = (particle.angle * Math.PI) / 180;
        const x = Math.cos(rad) * particle.distance;
        const y = Math.sin(rad) * particle.distance;

        return (
          <span
            key={particle.id}
            className="absolute rounded-full bg-red-500 pointer-events-none"
            style={{
              width: particle.size,
              height: particle.size,
              left: '50%',
              top: '50%',
              marginLeft: -particle.size / 2,
              marginTop: -particle.size / 2,
              transform: showBurst
                ? `translate(${x}px, ${y}px) scale(1)`
                : `translate(${x * 1.5}px, ${y * 1.5}px) scale(0)`,
              opacity: showBurst ? 1 : 0,
              transition: `all ${300 + particle.delay}ms cubic-bezier(0.4, 0, 0.2, 1)`,
            }}
          />
        );
      })}

      {/* Ring burst effect */}
      {isAnimating && (
        <span
          className="absolute inset-0 rounded-full border-2 border-red-400 pointer-events-none"
          style={{
            transform: showBurst ? 'scale(1)' : 'scale(1.5)',
            opacity: showBurst ? 0.6 : 0,
            transition: 'all 400ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      )}
    </button>
  );
}
