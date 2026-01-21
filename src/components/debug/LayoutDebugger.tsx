"use client";
import { useEffect } from "react";

export default function LayoutDebugger() {
  useEffect(() => {
    // Only run in development
    if (process.env.NODE_ENV === "development") {
      const checkOverflow = () => {
        const docWidth = document.documentElement.offsetWidth;

        document.querySelectorAll('*').forEach((el) => {
          if (el instanceof HTMLElement) {
            const rect = el.getBoundingClientRect();

            const isOverflowing = rect.left < 0 || rect.right > docWidth;
            
            const isVisuallyHidden = (
              el.offsetParent === null ||
              window.getComputedStyle(el).visibility === 'hidden' ||
              window.getComputedStyle(el).display === 'none'
            );
            
            const style = window.getComputedStyle(el);

            if (isOverflowing && !isVisuallyHidden) {
              const transform = style.transform;
              if (transform && transform !== 'none') {
                const matrix = new DOMMatrix(transform);
                if (matrix.m41 < -docWidth || matrix.m41 > docWidth) {
                   if (el.style.outline === '2px solid red') {
                     el.style.outline = '';
                   }
                   return;
                }
              }

              if (el.style.outline !== '2px solid red') {
                el.style.outline = '2px solid red';
                console.warn('Layout Overflow Detected on:', el);
              }
            } else {
              if (el.style.outline === '2px solid red') {
                el.style.outline = '';
              }
            }
          }
        });
      };

      const debounce = (func: () => void, delay: number) => {
        let timeout: NodeJS.Timeout;
        return () => {
          clearTimeout(timeout);
          timeout = setTimeout(func, delay);
        };
      };

      const debouncedCheck = debounce(checkOverflow, 150);
      
      debouncedCheck();

      window.addEventListener('resize', debouncedCheck);
      document.addEventListener('scroll', debouncedCheck, true);

      // Clean up the event listener
      return () => {
        window.removeEventListener('resize', debouncedCheck);
        document.removeEventListener('scroll', debouncedCheck, true);
        document.querySelectorAll('*').forEach((el) => {
          if (el instanceof HTMLElement && el.style.outline === '2px solid red') {
            el.style.outline = '';
          }
        });
      };
    }
  }, []);

  return null;
}
