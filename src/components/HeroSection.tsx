import React from 'react';
import RotatingEarth from './RotatingEarth';

interface HeroSectionProps {
  className?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({ className = '' }) => {
  return (
    <section className={`min-h-screen text-white pt-20 relative overflow-x-hidden ${className}`}>
      <div className="container mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="space-y-8">
            {/* Watch Event Badge */}
            <div className="inline-flex items-center space-x-2 bg-gray-800 px-4 py-2 rounded-full text-sm">
              <span className="text-green-400">Watch our event</span>
              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                Build new products
              </h1>
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                for <span className="text-green-400">startups</span>
              </h1>
            </div>

            {/* Description */}
            <p className="text-xl text-gray-300 leading-relaxed max-w-lg">
              Our framework component is built to handle scaling demands with agility. Lightning-fast performance is our promise.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-gray-900 px-8 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105">
                GET STARTED
              </button>
              <button className="border border-gray-600 hover:border-gray-500 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 hover:bg-gray-800">
                LEARN MORE
              </button>
            </div>
          </div>

          {/* Right Column - Rotating Earth Globe */}
          <div className="lg:block">
            <div className="flex justify-center items-center h-[400px] sm:h-[500px] lg:h-[700px] w-full overflow-hidden">
              <div className="flex justify-center items-center max-w-full">
                <div className="w-[280px] h-[280px] sm:w-[350px] sm:h-[350px] lg:w-[600px] lg:h-[600px] max-w-full overflow-hidden">
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
      {/* Enhanced red radial glow at bottom - positioned lower with increased intensity and expanded area */}
      <div 
        className="absolute left-0 right-0 h-[500px] pointer-events-none overflow-hidden"
        style={{
          bottom: '-100px',
          background: 'radial-gradient(ellipse 1200px 600px at 50% 100%, rgba(239, 68, 68, 0.25) 0%, rgba(239, 68, 68, 0.15) 25%, rgba(239, 68, 68, 0.08) 50%, rgba(239, 68, 68, 0.04) 75%, transparent 100%)',
          filter: 'blur(50px)'
        }}
      ></div>
    </section>
  );
};

export default HeroSection;