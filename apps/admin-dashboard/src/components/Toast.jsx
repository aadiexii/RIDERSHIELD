import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

export default function Toast({ message, type = 'info', onClose }) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!message) return;
    
    // Progress bar animation
    const startTime = Date.now();
    const duration = 2000;
    let raf;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      
      if (elapsed < duration) {
        raf = requestAnimationFrame(animate);
      }
    };
    raf = requestAnimationFrame(animate);

    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [message, onClose]);

  if (!message) return null;

  const bgColors = {
    success: 'bg-green-500/20 border-green-500/30 text-green-400',
    error: 'bg-red-500/20 border-red-500/30 text-red-400',
    info: 'bg-blue-500/20 border-blue-500/30 text-blue-400'
  };

  const progressColors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500'
  };

  return (
    <div className="fixed top-6 right-6 z-[200] animate-slide-in">
      <div className={`px-5 py-3 rounded-t-xl text-sm font-semibold shadow-2xl border-l border-r border-t backdrop-blur-md ${bgColors[type] || bgColors.info}`}>
        {message}
      </div>
      <div className="h-1 w-full bg-[#111] rounded-b-xl overflow-hidden">
        <div 
          className={`h-full ${progressColors[type] || progressColors.info}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

Toast.propTypes = {
  message: PropTypes.string,
  type: PropTypes.oneOf(['success', 'error', 'info']),
  onClose: PropTypes.func.isRequired
};
