import React from 'react';
import RotatingEarth from './RotatingEarth';

interface HeroSectionProps {
  className?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({ className = '' }) => {
  return (
    <section className={`min-h-screen text-white pt-8 relative overflow-hidden ${className}`}>
      <div className="container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="space-y-8">
            {/* Watch Event Badge */}
            <div className="inline-flex items-center space-x-2 bg-gray-800 px-4 py-2 rounded-full text-sm">
              <span className="text-red-500">Watch our event</span>
              <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>

            {/* Main Headline */}
            <div className="space-y-1">
              <h1 className="font-heading tracking-tighter text-[56px] md:text-[56px] lg:text-[80px] leading-none">
                Build new products
              </h1>
              <h1 className="font-heading tracking-tighter text-[56px] md:text-[56px] lg:text-[80px] leading-none">
                for <span className="text-red-500">startups</span>
              </h1>
            </div>

            {/* Description */}
            <p className="text-body text-[18px] text-gray-300 leading-tight max-w-lg">
              Our framework component is built to handle scaling demands with agility. Lightning-fast performance is our promise.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105">
                GET STARTED
              </button>
              <button className="border border-gray-600 hover:border-gray-500 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 hover:bg-gray-800">
                LEARN MORE
              </button>
            </div>
          </div>

          {/* Right Column - Rotating Earth Globe */}
          <div className="lg:block">
            <div className="flex justify-center items-center h-[450px] sm:h-[550px] lg:h-[700px] w-full overflow-hidden">
              <div className="flex justify-center items-center max-w-full">
                <div className="w-[350px] h-[350px] sm:w-[450px] sm:h-[450px] lg:w-[600px] lg:h-[600px] max-w-full overflow-hidden">
                  <RotatingEarth 
                    width={600} 
                    height={600} 
                    className="w-full h-full object-contain" 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Red glow effect */}
      <div 
        className="absolute h-[1200px] w-full bottom-[-10px] left-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 1600px 1000px at 50% 100%, rgba(239, 68, 68, 0.18) 0%, rgba(239, 68, 68, 0.12) 30%, rgba(239, 68, 68, 0.06) 60%, rgba(239, 68, 68, 0.02) 80%, transparent 100%)'
        }}
      />
    </section>
  );
};

export default HeroSection;