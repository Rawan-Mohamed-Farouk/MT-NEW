import { useState, useEffect } from 'react';
import { Settings, Type, Contrast, Volume2, VolumeX } from 'lucide-react';

const AccessibilityControls = () => {
  const [fontSize, setFontSize] = useState(() => {
    return parseInt(localStorage.getItem('accessibility_fontSize') || '16');
  });
  const [highContrast, setHighContrast] = useState(() => {
    return localStorage.getItem('accessibility_highContrast') === 'true';
  });
  const [reducedMotion, setReducedMotion] = useState(() => {
    return localStorage.getItem('accessibility_reducedMotion') === 'true';
  });
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    // Apply font size
    document.documentElement.style.fontSize = `${fontSize}px`;
    localStorage.setItem('accessibility_fontSize', fontSize.toString());

    // Apply high contrast
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
    localStorage.setItem('accessibility_highContrast', highContrast.toString());

    // Apply reduced motion
    if (reducedMotion) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
    localStorage.setItem('accessibility_reducedMotion', reducedMotion.toString());
  }, [fontSize, highContrast, reducedMotion]);

  return (
    <>
      {/* Floating Accessibility Button */}
      <button
        onClick={() => setShowControls(!showControls)}
        className="fixed bottom-4 right-4 z-50 bg-accent text-white p-4 rounded-full shadow-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 transition-all"
        aria-label="Open accessibility controls"
        aria-expanded={showControls}
      >
        <Settings className="h-6 w-6" />
      </button>

      {/* Accessibility Panel */}
      {showControls && (
        <div
          className="fixed bottom-20 right-4 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-80 max-w-[90vw] border border-gray-200 dark:border-gray-700"
          role="dialog"
          aria-labelledby="accessibility-title"
          aria-modal="true"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 id="accessibility-title" className="text-lg font-bold text-gray-900 dark:text-white">
              Accessibility Settings
            </h2>
            <button
              onClick={() => setShowControls(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-accent rounded"
              aria-label="Close accessibility controls"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            {/* Font Size Control */}
            <div>
              <label className="flex items-center space-x-2 mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Type className="h-4 w-4" />
                <span>Font Size</span>
              </label>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setFontSize(Math.max(12, fontSize - 2))}
                  className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-accent"
                  aria-label="Decrease font size"
                >
                  A-
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[3rem] text-center">
                  {fontSize}px
                </span>
                <button
                  onClick={() => setFontSize(Math.min(24, fontSize + 2))}
                  className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-accent"
                  aria-label="Increase font size"
                >
                  A+
                </button>
              </div>
            </div>

            {/* High Contrast Toggle */}
            <div>
              <label className="flex items-center space-x-2 mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Contrast className="h-4 w-4" />
                <span>High Contrast</span>
              </label>
              <button
                onClick={() => setHighContrast(!highContrast)}
                className={`w-full px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-accent ${
                  highContrast
                    ? 'bg-accent text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
                aria-pressed={highContrast}
              >
                {highContrast ? 'On' : 'Off'}
              </button>
            </div>

            {/* Reduced Motion Toggle */}
            <div>
              <label className="flex items-center space-x-2 mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {reducedMotion ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                <span>Reduce Motion</span>
              </label>
              <button
                onClick={() => setReducedMotion(!reducedMotion)}
                className={`w-full px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-accent ${
                  reducedMotion
                    ? 'bg-accent text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
                aria-pressed={reducedMotion}
              >
                {reducedMotion ? 'On' : 'Off'}
              </button>
            </div>

            {/* Reset Button */}
            <button
              onClick={() => {
                setFontSize(16);
                setHighContrast(false);
                setReducedMotion(false);
              }}
              className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-accent"
            >
              Reset to Default
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AccessibilityControls;

