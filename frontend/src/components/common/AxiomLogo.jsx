// src/components/common/AxiomLogo.jsx
import React from 'react';

/**
 * AxiomIQ Official Brand Logo
 * Features the signature angled robot head emblem and bold geometric wordmark.
 */
export default function AxiomLogo({
  variant = 'full', // 'full' | 'mark' | 'text'
  size = 'md', // 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  theme = 'light', // 'light' (dark text/strokes for white bg) | 'dark' (white text/strokes for navy sidebar) | 'brand' (action blue)
  className = '',
  subtitle = null,
}) {
  // Dimensions map
  const markDimensions = {
    xs: { width: 22, height: 22 },
    sm: { width: 28, height: 28 },
    md: { width: 34, height: 34 },
    lg: { width: 44, height: 44 },
    xl: { width: 56, height: 56 },
  };

  const dim = markDimensions[size] || markDimensions.md;

  // Colors based on theme
  const strokeColor =
    theme === 'dark'
      ? '#FFFFFF'
      : theme === 'brand'
      ? '#356AE6'
      : '#1F1635'; // Deep obsidian navy from brand reference

  const fillColor =
    theme === 'dark'
      ? '#1E3A5F'
      : theme === 'brand'
      ? '#EFF4FF'
      : '#FFFFFF';

  const visorColor =
    theme === 'dark'
      ? '#FFFFFF'
      : theme === 'brand'
      ? '#356AE6'
      : '#1F1635';

  const eyeColor =
    theme === 'dark'
      ? '#101F33'
      : '#FFFFFF';

  const textColor =
    theme === 'dark'
      ? 'text-white'
      : theme === 'brand'
      ? 'text-action'
      : 'text-[#1F1635]';

  const subtitleColor =
    theme === 'dark'
      ? 'text-slate-300'
      : 'text-text-secondary';

  const textSizes = {
    xs: 'text-xs tracking-tight',
    sm: 'text-sm tracking-tight',
    md: 'text-base tracking-tight',
    lg: 'text-xl tracking-tight',
    xl: 'text-2xl tracking-tight',
  };

  // Standalone Vector Mark
  const MarkSVG = (
    <svg
      width={dim.width}
      height={dim.height}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="flex-shrink-0"
      aria-label="AxiomIQ Brandmark"
    >
      <g transform="rotate(-6 60 60)">
        {/* Antenna Stem & Ball */}
        <line
          x1="62"
          y1="22"
          x2="69"
          y2="6"
          stroke={strokeColor}
          strokeWidth="6"
          strokeLinecap="round"
        />
        <circle
          cx="72"
          cy="4"
          r="6.5"
          fill={strokeColor}
        />

        {/* Left Ear Disc */}
        <ellipse
          cx="28"
          cy="52"
          rx="7"
          ry="12"
          stroke={strokeColor}
          strokeWidth="6"
          fill={fillColor}
        />

        {/* Right Ear Disc - Concentric Dual Rings */}
        <ellipse
          cx="92"
          cy="58"
          rx="11"
          ry="14"
          stroke={strokeColor}
          strokeWidth="6"
          fill={fillColor}
        />
        <ellipse
          cx="92"
          cy="58"
          rx="5"
          ry="7"
          fill={strokeColor}
        />

        {/* Main Robot Head Bucket Shell */}
        <path
          d="M 33 40 
             C 33 32, 45 23, 62 23 
             C 79 23, 91 32, 91 40 
             L 87 75 
             C 87 90, 75 97, 60 97 
             C 45 97, 34 88, 33 75 
             Z"
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth="6.5"
          strokeLinejoin="round"
        />

        {/* Top Rim Curve */}
        <path
          d="M 33 40 C 42 49, 78 49, 91 40"
          stroke={strokeColor}
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
        />

        {/* Visor Area (Dark pill band) */}
        <path
          d="M 40 54 
             C 40 48, 47 45, 59 45 
             C 72 45, 80 48, 80 54 
             C 80 61, 72 65, 59 65 
             C 47 65, 40 61, 40 54 
             Z"
          fill={visorColor}
        />

        {/* Happy Curved Eyes (upside-down U arches inside visor) */}
        <path
          d="M 46 54 C 47 48, 51 48, 52 54"
          stroke={eyeColor}
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 66 54 C 67 48, 71 48, 72 54"
          stroke={eyeColor}
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Trapezoidal Chin Cutout / Neck Base */}
        <path
          d="M 50 83 L 53 72 L 67 72 L 70 83 Z"
          fill={strokeColor}
        />
      </g>
    </svg>
  );

  if (variant === 'mark') {
    return <div className={`inline-flex items-center justify-center ${className}`}>{MarkSVG}</div>;
  }

  if (variant === 'text') {
    return (
      <div className={`flex flex-col ${className}`}>
        <span className={`font-extrabold tracking-tight font-sans ${textSizes[size]} ${textColor}`}>
          AXIOMIQ
        </span>
        {subtitle && (
          <span className={`text-[10px] uppercase tracking-wider font-semibold ${subtitleColor}`}>
            {subtitle}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {MarkSVG}
      <div className="flex flex-col leading-none">
        <span
          className={`font-black tracking-tight uppercase font-sans ${textSizes[size]} ${textColor}`}
          style={{ letterSpacing: '-0.02em' }}
        >
          AXIOMIQ
        </span>
        {subtitle && (
          <span className={`text-[10px] uppercase tracking-wider font-semibold mt-0.5 ${subtitleColor}`}>
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}
