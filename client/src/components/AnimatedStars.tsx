import { useEffect, useRef } from "react";

const AnimatedStars = () => {
  const starsContainerRef = useRef<HTMLDivElement>(null);

  const createStars = () => {
    if (!starsContainerRef.current) return;
    const container = starsContainerRef.current;
    container.innerHTML = '';
    
    // Determine star count based on screen width
    const count = window.innerWidth < 768 ? 50 : 100;
    
    // Create regular stars
    for (let i = 0; i < count; i++) {
      const star = document.createElement('div');
      star.classList.add('star');
      
      // Random size between 1-3px
      const size = Math.random() * 2 + 1;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      
      // Random position
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      
      // Random opacity and animation delay
      star.style.opacity = `${Math.random() * 0.7 + 0.3}`;
      star.style.animationDelay = `${Math.random() * 4}s`;
      star.classList.add('animate-twinkle');
      
      container.appendChild(star);
    }
    
    // Add shooting stars
    for (let i = 0; i < 3; i++) {
      const shootingStar = document.createElement('div');
      shootingStar.classList.add('shooting-star');
      
      shootingStar.style.left = `${Math.random() * 70}%`;
      shootingStar.style.top = `${Math.random() * 50}%`;
      shootingStar.style.animationDelay = `${Math.random() * 15}s`;
      shootingStar.classList.add('animate-shooting');
      
      container.appendChild(shootingStar);
    }
  };

  useEffect(() => {
    // Create initial stars
    createStars();
    
    // Recreate stars on window resize
    const handleResize = () => createStars();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <div id="stars-container" ref={starsContainerRef} className="absolute inset-0 overflow-hidden z-0"></div>;
};

export default AnimatedStars;
