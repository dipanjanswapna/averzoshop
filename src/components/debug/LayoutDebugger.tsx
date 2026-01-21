"use client";
import { useEffect } from "react";

export default function LayoutDebugger() {
  useEffect(() => {
    // Only run in development
    if (process.env.NODE_ENV === "development") {
      const checkOverflow = () => {
        const docWidth = document.documentElement.offsetWidth;

        document.querySelectorAll('body *').forEach((el) => {
          if (!(el instanceof HTMLElement)) return;
          if (el.style.outline === '2px solid red') el.style.outline = '';

          const rect = el.getBoundingClientRect();
          if (rect.left >= 0 && rect.right <= docWidth) return;

          const style = window.getComputedStyle(el);
          if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0' || el.offsetParent === null) return;
          
          let parent = el.parentElement;
          let parentHidesOverflow = false;
          while(parent) {
            const parentStyle = window.getComputedStyle(parent);
            if (parentStyle.overflowX === 'hidden') {
              parentHidesOverflow = true;
              break;
            }
            parent = parent.parentElement;
          }

          if (!parentHidesOverflow) {
            el.style.outline = '2px solid red';
            console.warn('Layout Overflow Detected on:', el);
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

      const debouncedCheck = debounce(checkOverflow, 300);
      
      const observer = new MutationObserver(debouncedCheck);
      observer.observe(document.body, { childList: true, subtree: true, attributes: true });

      window.addEventListener('resize', debouncedCheck);
      
      // Initial check
      setTimeout(debouncedCheck, 500);

      return () => {
        observer.disconnect();
        window.removeEventListener('resize', debouncedCheck);
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
