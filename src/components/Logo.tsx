import { cn } from '../lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  variant?: 'full' | 'icon';
}

export default function Logo({ className, size = 'md', variant = 'icon' }: LogoProps) {
  const sizeMap = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24',
  };

  const sizeClass = typeof size === 'string' ? sizeMap[size] : '';
  const style = typeof size === 'number' ? { width: size, height: size } : {};

  return (
    <div className={cn("relative flex items-center justify-center", sizeClass, className)} style={style}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
      >
        <defs>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
            <feOffset dx="1" dy="1" result="offsetblur" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.5" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="maroonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#900000" />
            <stop offset="100%" stopColor="#600000" />
          </linearGradient>
        </defs>

        {/* Outer Maroon Circle with 3D effect */}
        <circle cx="50" cy="50" r="48" fill="url(#maroonGradient)" stroke="#500000" strokeWidth="0.5" />
        
        {/* White shape with shadows */}
        <g filter="url(#shadow)">
          {/* Top */}
          <circle cx="50" cy="30" r="20" fill="white" />
          {/* Bottom */}
          <circle cx="50" cy="70" r="20" fill="white" />
          {/* Left */}
          <circle cx="30" cy="50" r="20" fill="white" />
          {/* Right */}
          <circle cx="70" cy="50" r="20" fill="white" />
          {/* Center */}
          <circle cx="50" cy="50" r="20" fill="white" />
        </g>
      </svg>
    </div>
  );
}
