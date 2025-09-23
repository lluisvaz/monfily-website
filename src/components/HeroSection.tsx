import React, { useState, useEffect } from 'react';
import RotatingEarth from './RotatingEarth';

interface HeroSectionProps {
  className?: string;
}

const words = ['a escala.', 'o resultado.', 'a eficiência.', 'o futuro.'];

const TypewriterText: React.FC = () => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [phase, setPhase] = useState<'typing' | 'waiting' | 'deleting'>('typing');
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const currentWord = words[currentWordIndex];
    let timeout: NodeJS.Timeout;

    if (phase === 'typing') {
      if (currentText.length < currentWord.length) {
        timeout = setTimeout(() => {
          setCurrentText(currentWord.slice(0, currentText.length + 1));
        }, 100);
      } else {
        // Palavra completa, aguardar
        timeout = setTimeout(() => {
          setPhase('waiting');
        }, 100);
      }
    } else if (phase === 'waiting') {
      // Aguardar antes de começar a apagar
      timeout = setTimeout(() => {
        setPhase('deleting');
      }, 3000);
    } else if (phase === 'deleting') {
      if (currentText.length > 0) {
        timeout = setTimeout(() => {
          setCurrentText(currentText.slice(0, -1));
        }, 50);
      } else {
        // Palavra completamente apagada, ir para próxima
        const nextIndex = (currentWordIndex + 1) % words.length;
        timeout = setTimeout(() => {
          setCurrentWordIndex(nextIndex);
          setCurrentText('');
          setPhase('typing');
        }, 200);
      }
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [currentText, phase, currentWordIndex]);

  // Cursor piscante
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <span className="text-red-500">
      {currentText}
      <span className={`text-white ${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity duration-100`}>|</span>
    </span>
  );
};

const HeroSection: React.FC<HeroSectionProps> = ({ className = '' }) => {
  return (
    <section className={`min-h-[100vh] text-white pt-8 relative overflow-hidden ${className}`}>
      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="space-y-8">
            {/* Watch Event Badge */}
            <div className="inline-flex items-center space-x-2 backdrop-blur-sm bg-white/10 px-4 py-2 rounded-full text-sm">
              <span className="text-white">Reduza seus custos operacionais</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-1">
              <h1 className="font-heading tracking-tighter text-[46px] md:text-[50px] lg:text-[60px] leading-none">
                Sua operação, nossa obsessão. Um código pensado para <TypewriterText />
              </h1>
            </div>

            {/* Description */}
            <p className="text-body text-[18px] text-gray-300 leading-tight max-w-lg">
              Produtos digitais de alta performance, testes de software abrangentes e entregas automatizadas.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 flex-1 sm:flex-none">
                Inicie seu Projeto
              </button>
              <button className="text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 hover:text-[#C02020] flex-none sm:flex-none flex items-center gap-2 justify-center sm:justify-start">
                Explore nossas Soluções
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Right Column - Rotating Earth Globe */}
          <div className="lg:block">
            <div className="flex justify-center items-center h-[450px] sm:h-[550px] lg:h-[700px] w-full overflow-hidden">
              <div className="flex justify-center items-center max-w-full">
                <div className="w-[350px] h-[350px] sm:w-[450px] sm:h-[450px] lg:w-[600px] lg:h-[600px] max-w-full overflow-hidden cursor-grab active:cursor-grabbing">
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