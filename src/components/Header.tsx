import React from 'react';

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  const menuItems = [
    { label: 'SOLUÇÕES', href: '#menu' },
    { label: 'SOBRE NÓS', href: '#pages' },
    { label: 'BLOG', href: '#integrations' },
    { label: 'CONTATO', href: '#pricing' }
  ];

  return (
    <header className={`bg-transparent ${className}`}>
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="select-none cursor-pointer">
              <img 
                src="/src/assets/images/monfily-logo-header.png" 
                alt="Monfily Logo" 
                className="h-12 w-auto object-contain"
              />
            </a>
          </div>

          {/* Navigation Menu */}
          <nav className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-body text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* CTA Button */}
          <button className="hidden md:block bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105">
            Falar com um especialista
          </button>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-white">
            <div className="w-12 h-12 flex flex-col justify-center items-center space-y-3">
              <div className="w-9 h-0.5 bg-white rounded-full"></div>
              <div className="w-9 h-0.5 bg-white rounded-full"></div>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;