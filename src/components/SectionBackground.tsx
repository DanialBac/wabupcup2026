import React from 'react';
import { SectionBackgroundConfig } from '../types';

interface SectionBackgroundProps {
  config?: SectionBackgroundConfig;
  className?: string;
}

export const SectionBackground: React.FC<SectionBackgroundProps> = ({ config, className = '' }) => {
  if (!config) {
    return null;
  }

  const hasImage = Boolean(config.desktopImage?.trim() || config.mobileImage?.trim());
  const isImageMode = config.mode === 'IMAGE' || (config.mode !== 'COLOR' && hasImage);

  if (!isImageMode && (config.mode === 'DEFAULT' || !config.mode)) {
    return null;
  }

  if (config.mode === 'COLOR' && !hasImage) {
    return (
      <div
        className={`absolute inset-0 pointer-events-none transition-colors duration-300 ${className}`}
        style={{
          backgroundColor: config.bgColor || 'transparent',
        }}
      />
    );
  }

  if (isImageMode) {
    const desktopImg = config.desktopImage?.trim() || '';
    const mobileImg = config.mobileImage?.trim() || '';
    const overlayColor = config.overlayColor || '#000000';
    const overlayOpacity = Math.min(100, Math.max(0, config.overlayOpacity ?? 60)) / 100;

    const effectiveDesktop = desktopImg || mobileImg;
    const effectiveMobile = mobileImg || desktopImg;

    return (
      <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
        {/* DESKTOP BACKGROUND IMAGE */}
        {effectiveDesktop && (
          <div
            className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-300 ${
              mobileImg ? 'hidden md:block' : 'block'
            }`}
            style={{
              backgroundImage: `url("${effectiveDesktop}")`,
            }}
          />
        )}

        {/* MOBILE BACKGROUND IMAGE */}
        {effectiveMobile && mobileImg && (
          <div
            className="block md:hidden absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-300"
            style={{
              backgroundImage: `url("${effectiveMobile}")`,
            }}
          />
        )}

        {/* FALLBACK COLOR IF IMAGE IS LOADING OR MISSING */}
        {!effectiveDesktop && !effectiveMobile && config.bgColor && (
          <div
            className="absolute inset-0 transition-colors duration-300"
            style={{ backgroundColor: config.bgColor }}
          />
        )}

        {/* OVERLAY LAYER WITH CONFIGURABLE COLOR & OPACITY */}
        <div
          className={`absolute inset-0 pointer-events-none transition-all duration-300 ${
            config.overlayBlur ? 'backdrop-blur-[2px]' : ''
          }`}
          style={{
            backgroundColor: overlayColor,
            opacity: overlayOpacity,
          }}
        />
      </div>
    );
  }

  return null;
};

/**
 * Helper to get extra text style or class depending on background contrast
 */
export function getSectionTextClass(
  config?: SectionBackgroundConfig,
  defaultClass = 'text-slate-900 dark:text-white'
): string {
  if (!config || config.mode === 'DEFAULT') {
    return defaultClass;
  }

  if (config.textColorMode === 'LIGHT') {
    return 'text-white';
  }

  if (config.textColorMode === 'DARK') {
    return 'text-slate-900';
  }

  // AUTO mode:
  if (config.mode === 'IMAGE') {
    // If overlay is dark or opacity is significant, text should be white
    const hex = (config.overlayColor || '#000000').toLowerCase();
    const isLightOverlay = hex === '#ffffff' || hex === '#fff' || hex === '#f8fafc' || hex === '#f1f5f9';
    if (isLightOverlay && (config.overlayOpacity ?? 60) > 50) {
      return 'text-slate-900';
    }
    return 'text-white';
  }

  if (config.mode === 'COLOR' && config.bgColor) {
    const isDarkBg = isColorDark(config.bgColor);
    return isDarkBg ? 'text-white' : 'text-slate-900';
  }

  return defaultClass;
}

function isColorDark(hexColor: string): boolean {
  if (!hexColor.startsWith('#')) return true;
  let hex = hexColor.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;
  // Perceived brightness formula
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 128;
}
