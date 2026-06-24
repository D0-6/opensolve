'use client';

import { useEffect, useState } from 'react';

export function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isClicked, setIsClicked] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseDown = () => {
      setIsClicked(true);
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
  }, []);

  // 8-point star SVG
  const StarIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <path
        d="M12 2L14.5 8.5H21.5L16 12.5L18.5 19L12 15L5.5 19L8 12.5L2.5 8.5H9.5L12 2Z"
        fill="currentColor"
      />
    </svg>
  );

  return (
    <>
      <style>{`
        * {
          cursor: none !important;
        }
      `}</style>

      {/* Main cursor */}
      <div
        className={`fixed pointer-events-none z-[9999] transition-all duration-100 ${
          isClicked ? 'scale-125' : 'scale-100'
        }`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: `translate(-50%, -50%)`,
        }}
      >
        {isClicked ? (
          // Yellow 8-point star when clicked
          <div className="animate-star-burst">
            <div className="w-6 h-6 text-yellow-400 drop-shadow-lg">
              <StarIcon />
            </div>
          </div>
        ) : (
          // White square when not clicking
          <div className="w-5 h-5 border-2 border-white bg-white/10 rounded-sm shadow-lg backdrop-blur-sm"></div>
        )}
      </div>

      {/* Cursor trail effect */}
      {isClicked && (
        <div
          className="fixed pointer-events-none w-4 h-4 text-yellow-300/60 opacity-0 animate-fade-out z-[9998]"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            transform: `translate(-50%, -50%)`,
          }}
        >
          <div className="w-full h-full">
            <StarIcon />
          </div>
        </div>
      )}

      {/* Add animations to globals */}
      <style>{`
        @keyframes star-burst {
          0% {
            transform: scale(1) rotate(0deg);
          }
          50% {
            transform: scale(1.2) rotate(45deg);
          }
          100% {
            transform: scale(1) rotate(360deg);
          }
        }

        @keyframes fade-out {
          0% {
            opacity: 0.8;
            transform: translate(-50%, -50%) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.5);
          }
        }

        .animate-star-burst {
          animation: star-burst 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .animate-fade-out {
          animation: fade-out 0.8s ease-out forwards;
        }
      `}</style>
    </>
  );
}
