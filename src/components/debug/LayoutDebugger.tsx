
"use client";
import { useEffect } from "react";

export default function LayoutDebugger() {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      const checkOverflow = () => {
        const docWidth = document.documentElement.offsetWidth;
        document.querySelectorAll('*').forEach(function(el) {
          if (el instanceof HTMLElement) {
            const rect = el.getBoundingClientRect();
            // Check if element is overflowing horizontally
            if (rect.left < 0 || rect.right > docWidth) {
               // Only apply border if it's not already red to avoid excessive console logs
              if (el.style.outline !== '2px solid red') {
                el.style.outline = '2px solid red';
                console.warn('Layout Overflow Detected on:', el);
              }
            } else {
              // Optional: remove outline if it's no longer overflowing
              if (el.style.outline === '2px solid red') {
                el.style.outline = '';
              }
            }
          }
        });
      }

      // Run on mount and on resize
      checkOverflow();
      window.addEventListener('resize', checkOverflow);

      // Clean up the event listener
      return () => {
        window.removeEventListener('resize', checkOverflow);
        // Optional: clean up outlines when component unmounts
        document.querySelectorAll('*').forEach(function(el) {
          if (el instanceof HTMLElement && el.style.outline === '2px solid red') {
            el.style.outline = '';
          }
        });
      };
    }
  }, []);

  return null; // This component does not render anything
}
