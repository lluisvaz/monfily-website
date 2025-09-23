import React, { useState, useEffect } from 'react';
import monfilyIntroGif from '../assets/images/monfily-intro.gif';

interface LoadingScreenProps {
  onLoadingComplete: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onLoadingComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isSlidingOut, setIsSlidingOut] = useState(false);
  const [gifVisible, setGifVisible] = useState(false);

  useEffect(() => {
    // Inicia o fade-in do GIF após um pequeno delay
    const gifFadeInTimer = setTimeout(() => {
      setGifVisible(true);
    }, 200);

    // Após 4 segundos, inicia o slide-out
    const slideOutTimer = setTimeout(() => {
      setIsSlidingOut(true);
    }, 4000);

    // Após 5.5 segundos, remove completamente o loading screen
    const completeTimer = setTimeout(() => {
      setIsVisible(false);
      onLoadingComplete();
    }, 6000);

    return () => {
      clearTimeout(gifFadeInTimer);
      clearTimeout(slideOutTimer);
      clearTimeout(completeTimer);
    };
  }, [onLoadingComplete]);

  if (!isVisible) {
    return null;
  }

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center transition-transform duration-[1500ms] ease-in-out select-none pointer-events-none ${
        isSlidingOut ? '-translate-y-full' : 'translate-y-0'
      }`}
      style={{ backgroundColor: '#000000' }}
    >
      <div className="flex items-center justify-center select-none">
        <img 
          src={monfilyIntroGif} 
          alt="Monfily Loading Animation" 
          className={`w-64 h-64 object-contain transition-opacity duration-800 ease-in select-none pointer-events-none ${
            gifVisible ? 'opacity-100' : 'opacity-0'
          }`}
          draggable={false}
          style={{ userSelect: 'none', pointerEvents: 'none' }}
        />
      </div>
    </div>
  );
};

export default LoadingScreen;