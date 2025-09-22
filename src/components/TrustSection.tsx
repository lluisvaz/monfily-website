import React from 'react';

interface TrustSectionProps {
  className?: string;
}

const TrustSection: React.FC<TrustSectionProps> = ({ className = '' }) => {
  const companies = [
    {
      name: 'luminous',
      logo: 'luminous'
    },
    {
      name: 'delavere',
      logo: 'delavere'
    },
    {
      name: 'Amsterdam',
      logo: 'Amsterdam'
    },
    {
      name: 'monaco',
      logo: 'monaco'
    },
    {
      name: 'Springfield',
      logo: 'Springfield'
    }
  ];

  return (
    <div className={`bg-gray-900 ${className}`}>
      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-heading-sm text-white mb-2">
            TRUSTED BY THE BEST FRONTEND TEAMS
          </h2>
        </div>
        
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 lg:gap-16">
          {companies.map((company, index) => (
            <div
              key={index}
              className="flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity duration-300"
            >
              <div className="text-body text-gray-400 font-medium text-lg tracking-wide">
                {company.name === 'luminous' && (
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"></div>
                    <span>luminous</span>
                  </div>
                )}
                {company.name === 'delavere' && (
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-orange-500 rounded-sm"></div>
                    <span>delavere</span>
                  </div>
                )}
                {company.name === 'Amsterdam' && (
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">A</span>
                    </div>
                    <span>Amsterdam</span>
                  </div>
                )}
                {company.name === 'monaco' && (
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-red-500 rounded-sm flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                    <span>monaco</span>
                  </div>
                )}
                {company.name === 'Springfield' && (
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-blue-600 rounded-sm flex items-center justify-center">
                      <span className="text-white text-xs font-bold">S</span>
                    </div>
                    <span>Springfield</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrustSection;