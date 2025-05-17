import { useEffect, useRef } from "react";
import { useTheme } from "../providers/ThemeProvider";

const AnimatedClouds = () => {
  const cloudsContainerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  
  // Only show clouds in light theme
  const isVisible = theme === "light";

  const createClouds = () => {
    if (!cloudsContainerRef.current) return;
    const container = cloudsContainerRef.current;
    container.innerHTML = '';
    
    // Only create clouds if we're in light theme
    if (!isVisible) return;
    
    // Determine cloud count based on screen width
    const count = window.innerWidth < 768 ? 6 : 12;
    
    // Create clouds
    for (let i = 0; i < count; i++) {
      const cloud = document.createElement('div');
      cloud.classList.add('cloud');
      
      // Random size between 40-140px for width
      const sizeMultiplier = Math.random() * 0.8 + 0.3;
      const width = sizeMultiplier * 140;
      const height = width * 0.6;
      
      cloud.style.width = `${width}px`;
      cloud.style.height = `${height}px`;
      
      // Distribute clouds across the sky
      // Some clouds at the top, some in the middle
      const topPosition = Math.random() * 40; // 0-40% from top
      cloud.style.top = `${topPosition}%`;
      
      // Set starting position to the left of the screen
      cloud.style.left = `-${width}px`;
      
      // Random opacity
      cloud.style.opacity = `${Math.random() * 0.3 + 0.4}`;
      
      // Create a z-index difference to add depth perception
      const zIndex = Math.floor(Math.random() * 5 - 2);
      cloud.style.zIndex = `${zIndex}`;
      
      // Smaller clouds move faster than larger ones
      const speed = (1 - sizeMultiplier + 0.3) * 100; // Inverse of size for more realistic movement
      const animationDuration = Math.max(60, 200 - speed); // 60-140s
      
      cloud.style.animationDuration = `${animationDuration}s`;
      cloud.style.animationDelay = `${Math.random() * -30}s`;
      
      cloud.classList.add('animate-floating-clouds');
      
      container.appendChild(cloud);
    }
  };

  useEffect(() => {
    // Create initial clouds when the component mounts or theme changes
    createClouds();
    
    // Recreate clouds on window resize
    const handleResize = () => createClouds();
    window.addEventListener('resize', handleResize);
    
    // Periodically add new clouds
    const intervalId = setInterval(() => {
      if (theme === "light" && cloudsContainerRef.current) {
        // Add a new cloud occasionally
        const cloud = document.createElement('div');
        cloud.classList.add('cloud');
        
        const sizeMultiplier = Math.random() * 0.8 + 0.3;
        const width = sizeMultiplier * 140;
        const height = width * 0.6;
        
        cloud.style.width = `${width}px`;
        cloud.style.height = `${height}px`;
        cloud.style.top = `${Math.random() * 40}%`;
        cloud.style.left = `-${width}px`;
        cloud.style.opacity = `${Math.random() * 0.3 + 0.4}`;
        
        const zIndex = Math.floor(Math.random() * 5 - 2);
        cloud.style.zIndex = `${zIndex}`;
        
        const speed = (1 - sizeMultiplier + 0.3) * 100;
        const animationDuration = Math.max(60, 200 - speed);
        cloud.style.animationDuration = `${animationDuration}s`;
        cloud.style.animationDelay = '0s';
        
        cloud.classList.add('animate-floating-clouds');
        
        cloudsContainerRef.current.appendChild(cloud);
        
        // Cleanup old clouds that have moved off screen
        const clouds = cloudsContainerRef.current.querySelectorAll('.cloud');
        if (clouds.length > 25) {
          cloudsContainerRef.current.removeChild(clouds[0]);
        }
      }
    }, 15000); // Add a new cloud every 15 seconds
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(intervalId);
    };
  }, [theme]);

  if (!isVisible) return null;

  return (
    <div 
      id="clouds-container" 
      ref={cloudsContainerRef} 
      className="absolute inset-0 overflow-hidden z-0 pointer-events-none"
    />
  );
};

export default AnimatedClouds;