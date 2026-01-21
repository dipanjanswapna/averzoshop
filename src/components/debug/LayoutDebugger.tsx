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

            // Check for horizontal overflow
            const isOverflowing = rect.left < 0 || rect.right > docWidth;
            
            // Check if the element is visibly within the viewport at all.
            // This is to avoid flagging off-screen sidebars that are hidden using transforms.
            const isPartiallyVisible = rect.right > 0 && rect.left < docWidth;
            
            // Get computed styles to check for visibility and display properties
            const style = window.getComputedStyle(el);

            if (isOverflowing && isPartiallyVisible && style.display !== 'none' && style.visibility !== 'hidden') {
              // Only flag elements that are actually causing a visual overflow.
              if (el.style.outline !== '2px solid red') {
                el.style.outline = '2px solid red';
                console.warn('Layout Overflow Detected on:', el);
              }
            } else {
              // Remove outline if it's not overflowing or not visible
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

      // Initial check
      debouncedCheck();

      // Check on resize
      window.addEventListener('resize', debouncedCheck);
      // Also check on scroll, as some elements might become visible
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
