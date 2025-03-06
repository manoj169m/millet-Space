'use client';
import React, { useEffect, useState } from "react";

const MilletSpaceLoader = () => {
  const [rotation, setRotation] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => (prev + 1) % 360);
    }, 20);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex justify-center items-center h-screen bg-amber-50 w-full">
      <div className="flex flex-col items-center">
        <div className="relative w-32 h-32">
          {/* Outer millet circle */}
          <div className="absolute inset-0 flex items-center justify-center">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute w-3 h-3 rounded-full bg-amber-600"
                style={{
                  transform: `rotate(${i * 30 + rotation}deg) translateY(-40px)`,
                  opacity: 0.6 + (i % 3) * 0.2,
                }}
              />
            ))}
          </div>
          
          {/* Inner millet grains */}
          <div className="absolute inset-0 flex items-center justify-center">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-4 rounded-full bg-yellow-500"
                style={{
                  transform: `rotate(${i * 45 - rotation * 0.7}deg) translateY(-20px)`,
                  opacity: 0.8 + (i % 2) * 0.2,
                }}
              />
            ))}
          </div>
          
          {/* Center seed */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-amber-400 animate-pulse"></div>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <div className="text-2xl text-amber-800 font-bold tracking-wider">Millet Space</div>
          <div className="text-sm text-amber-600 mt-1">Organic Goodness Loading...</div>
        </div>
      </div>
    </div>
  );
};

export default MilletSpaceLoader;