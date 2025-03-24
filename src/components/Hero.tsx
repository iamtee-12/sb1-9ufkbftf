import React from 'react';
import { PawPrint as Paw } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Floating paws background animation */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <Paw
            key={i}
            className="absolute text-purple-100 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              opacity: 0.3,
            }}
            size={Math.random() * 30 + 20}
          />
        ))}
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-playfair text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
            Keep Their Memory Alive with Art That Speaks to Your Heart
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-8">
            Transform photos into animated portraits with voice tributes and QR keepsakes.
            <span className="block mt-2 text-purple-600">10% supports shelters.</span>
          </p>
          <button className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-lg px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
            Create Your Memorial Portrait – Start for Free
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;