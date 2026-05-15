import React, { createContext, useState, useContext, useEffect } from 'react';

/**
 * ThemeContext.js
 * ────────────────
 * Three trauma-informed visual themes for UJRIS:
 * 1. Library (current: Cream/Navy/Gold - "High-End Law Library")
 * 2. Sanctuary (Soft blues/greens - Calming, therapeutic)
 * 3. Warrior (Bold navy + gold accents - Power, confidence)
 * 
 * Uses localStorage for persistence
 * Applies CSS variables to document root
 * Includes WCAG AA accessibility: auto contrast, reduced motion support
 */

const themes = {
  library: {
    id: 'library',
    name: 'Library',
    icon: '📚',
    description: 'High-End Law Library (Cream, Navy, Gold)',
    colors: {
      background: '#F8F1E9',
      surface: '#FFFFFF',
      text: '#0F2C4A',
      accent: '#D4AF37',
      secondary: '#5DB7AD',
      border: '#EDE4D9',
      info: '#3B82F6',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#DC2626',
    },
  },
  sanctuary: {
    id: 'sanctuary',
    name: 'Sanctuary',
    icon: '🌿',
    description: 'Soft & Calming (Blues, Greens, Earth tones)',
    colors: {
      background: '#E8F0F5',
      surface: '#F5FAFB',
      text: '#1F2937',
      accent: '#06B6D4',
      secondary: '#10B981',
      border: '#D1E5F0',
      info: '#0EA5E9',
      success: '#34D399',
      warning: '#FBBF24',
      error: '#F87171',
    },
  },
  warrior: {
    id: 'warrior',
    name: 'Warrior',
    icon: '⚔️',
    description: 'Bold & Empowering (Navy, Gold, Red accents)',
    colors: {
      background: '#1A2A3A',
      surface: '#2D3E50',
      text: '#F8F1E9',
      accent: '#D4AF37',
      secondary: '#F97316',
      border: '#3D5064',
      info: '#60A5FA',
      success: '#34D399',
      warning: '#FBBF24',
      error: '#EF4444',
    },
  },
};

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [currentThemeId, setCurrentThemeId] = useState(() => {
    // Load from localStorage or default to 'library'
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ujris_theme');
      return saved || 'library';
    }
    return 'library';
  });

  const currentTheme = themes[currentThemeId];

  // Apply theme to document on change
  useEffect(() => {
    if (typeof document === 'undefined') return;

    // Save preference
    localStorage.setItem('ujris_theme', currentThemeId);

    // Apply CSS variables to document root
    const root = document.documentElement;
    Object.entries(currentTheme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    // Apply theme class to body for additional styling
    document.body.setAttribute('data-theme', currentThemeId);

    // Update meta theme-color for mobile browsers
    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) {
      themeColor.setAttribute('content', currentTheme.colors.accent);
    }
  }, [currentThemeId, currentTheme]);

  const switchTheme = (themeName) => {
    if (themes[themeName]) {
      setCurrentThemeId(themeName);
    }
  };

  const value = {
    currentTheme,
    currentThemeId,
    switchTheme,
    themes,
    allThemes: Object.values(themes),
  };

  return (
    <ThemeContext.Provider value={value}>
      <ThemeProviderStyles>
        {children}
      </ThemeProviderStyles>
    </ThemeContext.Provider>
  );
};

// Global theme styles
const ThemeProviderStyles = ({ children }) => {
  const { currentTheme } = useTheme();

  return (
    <>
      <style>{`
        /* CSS Variables */
        :root {
          --color-background: ${currentTheme.colors.background};
          --color-surface: ${currentTheme.colors.surface};
          --color-text: ${currentTheme.colors.text};
          --color-accent: ${currentTheme.colors.accent};
          --color-secondary: ${currentTheme.colors.secondary};
          --color-border: ${currentTheme.colors.border};
          --color-info: ${currentTheme.colors.info};
          --color-success: ${currentTheme.colors.success};
          --color-warning: ${currentTheme.colors.warning};
          --color-error: ${currentTheme.colors.error};
        }

        /* Theme Transitions */
        [data-theme] {
          transition: background-color 0.3s ease, color 0.3s ease;
        }

        /* Accessibility: Respect prefers-reduced-motion */
        @media (prefers-reduced-motion: reduce) {
          [data-theme] {
            transition: none;
          }
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
          }
        }

        /* Light text on dark backgrounds */
        [data-theme="warrior"] {
          background-color: var(--color-background);
          color: var(--color-text);
        }

        [data-theme="warrior"] a {
          color: var(--color-accent);
        }

        /* Focus states for accessibility */
        [data-theme] *:focus-visible {
          outline: 2px solid var(--color-accent);
          outline-offset: 2px;
        }

        /* High contrast mode support */
        @media (prefers-contrast: more) {
          [data-theme] {
            --color-border: var(--color-text);
          }
        }
      `}</style>
      {children}
    </>
  );
};

export default ThemeContext;
