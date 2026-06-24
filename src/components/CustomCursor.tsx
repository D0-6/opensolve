'use client';

import { useEffect, useState } from 'react';

export function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isClicked, setIsClicked] = useState(false);
  const [clickParticles, setClickParticles] = useState<Array<{id: number; x: number; y: number}>>([]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseDown = () => {
      setIsClicked(true);
      const newParticle = {
        id: Date.now(),
        x: position.x,
        y: position.y,
      };
      setClickParticles((prev) => [...prev, newParticle]);
      setTimeout(() => {
        setClickParticles((prev) => prev.filter((p) => p.id !== newParticle.id));
      }, 800);
    };

    const handleMouseUp = () => {
      setIsClicked(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [position]);

  return (
    <>
      <style>{`
        * {
          cursor: none !important;
        }

        @keyframes star-burst {
          0% {
            opacity: 1;
            transform: scale(1) rotate(0deg);
          }
          100% {
            opacity: 0;
            transform: scale(2) rotate(360deg);
          }
        }

        .star-particle {
          animation: star-burst 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>

      {/* Main cursor */}
      <div
        className="fixed pointer-events-none z-[9999]"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: `translate(-50%, -50%)`,
        }}
      >
        {isClicked ? (
          // Yellow 8-point star when clicked
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-yellow-400 drop-shadow-lg"
            style={{
              animation: 'star-burst 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            <path
              d="M12 2L14.5 8.5H21.5L16 12.5L18.5 19L12 15L5.5 19L8 12.5L2.5 8.5H9.5L12 2Z"
              fill="currentColor"
            />
          </svg>
        ) : (
          // White square when not clicking
          <div className="w-5 h-5 border-2 border-white bg-white/10 rounded-sm shadow-lg" />
        )}
      </div>

      {/* Click particles */}
      {clickParticles.map((particle) => (
        <div
          key={particle.id}
          className="fixed pointer-events-none z-[9998] star-particle"
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            transform: `translate(-50%, -50%)`,
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-yellow-300"
          >
            <path
              d="M12 2L14.5 8.5H21.5L16 12.5L18.5 19L12 15L5.5 19L8 12.5L2.5 8.5H9.5L12 2Z"
              fill="currentColor"
            />
          </svg>
        </div>
      ))}
    </>
  );
}
