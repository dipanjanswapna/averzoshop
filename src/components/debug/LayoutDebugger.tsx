"use client";
import { useEffect } from "react";

export default function LayoutDebugger() {
  useEffect(() => {
    // This debugger is causing console noise with elements that are intentionally overflowing,
    // like carousels and off-screen menus. Disabling it for a cleaner console.
    // The core logic is kept here in case it's needed for targeted debugging later.
    const isDebuggingEnabled = false; 

    if (process.env.NODE_ENV === "development" && isDebuggingEnabled) {
      const checkOverflow = () => {
        const docWidth = document.documentElement.offsetWidth;
        document.querySelectorAll('body *').forEach(function(el) {
          if (el instanceof HTMLElement) {
            // Ignore elements that are part of a known carousel structure or off-screen menu
            if (el.closest('[data-vaul-drawer-visible="true"]') || el.closest('[role="dialog"]')) {
                return;
            }

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

      // Debounce the check to avoid performance issues
      let timeoutId: NodeJS.Timeout;
      const debounce = (func: () => void, delay: number) => {
        return () => {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(func, delay);
        };
      };

      const debouncedCheck = debounce(checkOverflow, 500);

      // Run on mount and on resize
      const observer = new MutationObserver(debouncedCheck);
      observer.observe(document.body, { childList: true, subtree: true, attributes: true });

      window.addEventListener('resize', debouncedCheck);

      // Clean up the event listener
      return () => {
        window.removeEventListener('resize', debouncedCheck);
        observer.disconnect();
        clearTimeout(timeoutId);
        document.querySelectorAll('*').forEach(function(el) {
          if (el instanceof HTMLElement && el.style.outline === '2px solid red') {
            el.style.outline = '';
          }
        });
      };
    }
  }, []);

  return null;
}
